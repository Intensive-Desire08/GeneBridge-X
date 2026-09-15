import pandas as pd
import numpy as np

from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors, Crippen, Lipinski, QED

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


def rank_egfr_drugs():

    df = pd.read_csv("EGFR_compounds_clean.csv")

    df = df[
        ["molecule_chembl_id", "IC50", "units", "smiles", "pIC50"]
    ].copy()

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

    df["mol"] = df["smiles"].apply(Chem.MolFromSmiles)
    df = df.dropna(subset=["mol"]).copy()

    def generate_fingerprint(mol):
        fingerprint = AllChem.GetMorganFingerprintAsBitVect(
            mol, radius=2, nBits=2048
        )
        return np.array(fingerprint)

    df["fingerprint"] = df["mol"].apply(generate_fingerprint)

    X = np.array(df["fingerprint"].tolist())
    y = df["activity"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    report = classification_report(
        y_test, y_pred, output_dict=True
    )

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

    df = df.sort_values(
        by="activity_probability", ascending=False
    ).reset_index(drop=True)

    df["rank"] = np.arange(1, len(df) + 1)

    ranking = df[
        [
            "rank", "molecule_chembl_id", "smiles", "IC50", "pIC50",
            "activity", "activity_probability", "QED", "Lipinski_pass",
            "molecular_weight", "logP", "HBA", "HBD", "rotatable_bonds"
        ]
    ].copy()

    ranking["activity"] = ranking["activity"].map({
        1: "Active",
        0: "Inactive"
    })

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

    best = drug_results[0]

    return {
        "target": "EGFR",
        "model": {
            "name": "Random Forest",
            "n_estimators": 300,
            "accuracy": float(accuracy),
            "confidence": model_confidence,
            "classification_report": report
        },
        "dataset": {
            "total_compounds_used": int(len(df)),
            "active_compounds": int((df["activity"] == 1).sum()),
            "inactive_compounds": int((df["activity"] == 0).sum())
        },
        "top_candidates": drug_results,
        "final_recommendation": {
            "molecule_chembl_id": best["molecule_chembl_id"],
            "rank": best["rank"],
            "activity_probability": best["activity_probability"],
            "reason": "Highest predicted EGFR activity among ranked candidates"
        }
    }
