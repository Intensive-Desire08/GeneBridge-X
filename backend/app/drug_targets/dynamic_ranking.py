import os
import requests
import pandas as pd
import numpy as np

from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors, Crippen, Lipinski, QED

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

from app.genomics.target_api import resolve_human_gene_to_uniprot

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)

def get_chembl_target_id(uniprot_id: str) -> str:
    url = f"https://www.ebi.ac.uk/chembl/api/data/target.json?target_components__accession={uniprot_id}"
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    data = response.json()
    targets = data.get("targets", [])
    if not targets:
        raise ValueError(f"No ChEMBL target found for UniProt ID: {uniprot_id}")
    # Prioritize single protein targets if multiple are returned
    for target in targets:
        if target.get("target_type") == "SINGLE PROTEIN":
            return target["target_chembl_id"]
    return targets[0]["target_chembl_id"]

def fetch_and_prepare_chembl_data(chembl_target_id: str, csv_path: str):
    """Fetches activity data from ChEMBL for a target and saves it to a CSV."""
    url = f"https://www.ebi.ac.uk/chembl/api/data/activity.json?target_chembl_id={chembl_target_id}&standard_type=IC50&limit=1000"
    
    compounds = []
    
    # Just fetch the first 1000 for speed in this demo
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    data = response.json()
    
    activities = data.get("activities", [])
    if not activities:
        raise ValueError(f"No IC50 activity data found for ChEMBL target {chembl_target_id}")
        
    for act in activities:
        smiles = act.get("canonical_smiles")
        ic50_val = act.get("standard_value")
        units = act.get("standard_units")
        mol_id = act.get("molecule_chembl_id")
        
        if smiles and ic50_val and units == "nM":
            try:
                ic50_float = float(ic50_val)
                # Calculate pIC50: -log10(IC50 in M). 1 nM = 10^-9 M
                pic50 = -np.log10(ic50_float * 1e-9) if ic50_float > 0 else np.nan
                compounds.append({
                    "molecule_chembl_id": mol_id,
                    "IC50": ic50_float,
                    "units": units,
                    "smiles": smiles,
                    "pIC50": pic50
                })
            except (ValueError, TypeError):
                continue
                
    df = pd.DataFrame(compounds)
    if len(df) == 0:
        raise ValueError("No valid compound data retrieved from ChEMBL.")
        
    df.to_csv(csv_path, index=False)
    return df

def rank_drugs_for_target(protein_name: str):
    """
    Dynamically ranks compounds based on their predicted activity for a given protein.
    """
    uniprot_id = resolve_human_gene_to_uniprot(protein_name)
    chembl_target_id = get_chembl_target_id(uniprot_id)
    
    csv_path = os.path.join(DATA_DIR, f"{chembl_target_id}_compounds_clean.csv")
    
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
    else:
        df = fetch_and_prepare_chembl_data(chembl_target_id, csv_path)

    df = df[["molecule_chembl_id", "IC50", "units", "smiles", "pIC50"]].copy()
    df["IC50"] = pd.to_numeric(df["IC50"], errors="coerce")
    df = df.dropna(subset=["IC50", "smiles"]).copy()

    def classify_activity(ic50):
        if ic50 < 100:
            return 1
        elif ic50 > 10000:
            return 0
        else:
            return np.nan

    df["activity"] = df["IC50"].apply(classify_activity)
    df = df.dropna(subset=["activity"]).copy()
    df["activity"] = df["activity"].astype(int)

    if len(df["activity"].unique()) < 2:
        raise ValueError("Not enough diverse data (need both active and inactive compounds) to train the model.")

    df["mol"] = df["smiles"].apply(Chem.MolFromSmiles)
    df = df.dropna(subset=["mol"]).copy()

    def generate_fingerprint(mol):
        fingerprint = AllChem.GetMorganFingerprintAsBitVect(mol, radius=2, nBits=2048)
        return np.array(fingerprint)

    df["fingerprint"] = df["mol"].apply(generate_fingerprint)
    X = np.array(df["fingerprint"].tolist())
    y = df["activity"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=100, 
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    model_confidence = "high" if accuracy >= 0.70 else "low"

    df["activity_probability"] = model.predict_proba(X)[:, 1]

    df["molecular_weight"] = df["mol"].apply(Descriptors.MolWt)
    df["logP"] = df["mol"].apply(Crippen.MolLogP)
    df["HBA"] = df["mol"].apply(Lipinski.NumHAcceptors)
    df["HBD"] = df["mol"].apply(Lipinski.NumHDonors)
    df["rotatable_bonds"] = df["mol"].apply(Lipinski.NumRotatableBonds)
    df["QED"] = df["mol"].apply(QED.qed)

    def lipinski_check(row):
        return (
            row["molecular_weight"] <= 500
            and row["HBD"] <= 5
            and row["HBA"] <= 10
            and row["logP"] <= 5
        )

    df["Lipinski_pass"] = df.apply(lipinski_check, axis=1)
    df = df.sort_values(by="activity_probability", ascending=False).reset_index(drop=True)
    df["rank"] = np.arange(1, len(df) + 1)

    ranking = df[
        [
            "rank", "molecule_chembl_id", "smiles", "IC50", "pIC50",
            "activity", "activity_probability", "QED", "Lipinski_pass",
            "molecular_weight", "logP", "HBA", "HBD", "rotatable_bonds"
        ]
    ].copy()

    ranking["activity"] = ranking["activity"].map({1: "Active", 0: "Inactive"})
    top_candidates = ranking.head(20)
    drug_results = []

    for _, row in top_candidates.iterrows():
        drug_results.append({
            "rank": int(row["rank"]),
            "molecule_chembl_id": row["molecule_chembl_id"],
            "smiles": row["smiles"],
            "IC50": float(row["IC50"]),
            "pIC50": float(row["pIC50"]),
            "activity": row["activity"],
            "activity_probability": float(row["activity_probability"]),
            "QED": float(row["QED"]),
            "Lipinski_pass": bool(row["Lipinski_pass"]),
            "molecular_weight": float(row["molecular_weight"]),
            "logP": float(row["logP"]),
            "HBA": int(row["HBA"]),
            "HBD": int(row["HBD"]),
            "rotatable_bonds": int(row["rotatable_bonds"])
        })

    best = drug_results[0] if drug_results else None

    return {
        "target": protein_name,
        "chembl_target_id": chembl_target_id,
        "model": {
            "name": "Random Forest",
            "n_estimators": 100,
            "accuracy": float(accuracy),
            "confidence": model_confidence,
            "classification_report": report
        },
        "dataset": {
            "total_compounds_used": int(len(df)),
            "active_compounds": int((df["activity"] == "Active").sum()),
            "inactive_compounds": int((df["activity"] == "Inactive").sum())
        },
        "top_candidates": drug_results,
        "final_recommendation": {
            "molecule_chembl_id": best["molecule_chembl_id"] if best else None,
            "rank": best["rank"] if best else None,
            "activity_probability": best["activity_probability"] if best else None,
            "reason": "Highest predicted activity among ranked candidates" if best else "None"
        }
    }
