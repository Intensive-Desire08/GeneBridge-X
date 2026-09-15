from typing import Dict, Any
from app.genomics.species_ranking import rank_species_for_target
from app.genomics.target_api import resolve_human_gene_to_uniprot
from app.drug_targets.dynamic_ranking import rank_drugs_for_target
from app.disease_targets.disease_api import get_top_proteins_for_disease

def orchestrate_protein(protein_name: str) -> Dict[str, Any]:
    """
    Orchestrates the GeneBridge-X pipeline for a given protein.
    Calls Module 1 (Species Ranking) and Module 2 (Drug Ranking)
    and aggregates the results.
    """
    # 1. Resolve UniProt ID
    uniprot_id = resolve_human_gene_to_uniprot(protein_name)
    
    # 2. Run Module 1: Species Ranking
    # Assuming rank_species_for_target returns a Pydantic model or dict
    try:
        species_ranking = rank_species_for_target(uniprot_id)
        # Convert to dict if it's a Pydantic model
        if hasattr(species_ranking, "dict"):
            species_ranking = species_ranking.dict()
        elif hasattr(species_ranking, "model_dump"):
            species_ranking = species_ranking.model_dump()
    except Exception as e:
        species_ranking = {"error": f"Failed to rank species: {str(e)}"}
        
    # 3. Run Module 2: Drug Ranking
    try:
        drug_ranking = rank_drugs_for_target(protein_name)
    except Exception as e:
        drug_ranking = {"error": f"Failed to rank drugs: {str(e)}"}
        
    return {
        "protein_target": protein_name,
        "uniprot_id": uniprot_id,
        "species_recommendations": species_ranking,
        "drug_recommendations": drug_ranking
    }

def orchestrate_disease(disease_name: str) -> Dict[str, Any]:
    """
    Orchestrates the GeneBridge-X pipeline for a given disease.
    Retrieves the top protein targets for the disease and runs the
    protein orchestrator for each.
    """
    proteins = get_top_proteins_for_disease(disease_name, limit=2)
    
    results = []
    for protein in proteins:
        try:
            protein_result = orchestrate_protein(protein)
            results.append(protein_result)
        except Exception as e:
            results.append({
                "protein_target": protein,
                "error": f"Failed to orchestrate protein {protein}: {str(e)}"
            })
            
    return {
        "disease": disease_name,
        "top_targets_evaluated": proteins,
        "protein_results": results
    }
