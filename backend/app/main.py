from fastapi import FastAPI, HTTPException
from app.genomics.species_ranking import rank_species_for_target
from app.genomics.target_api import resolve_human_gene_to_uniprot
from app.drug_targets.egfr_ranking import rank_egfr_drugs
from app.core.schemas import SpeciesRankingResult

app = FastAPI(
    title="GeneBridge-X API",
    description="API for GeneBridge-X modules (Species Ranking and Drug Target Ranking)",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the GeneBridge-X API"}

@app.get("/api/genomics/rank-species/{protein_name}", response_model=SpeciesRankingResult)
def get_species_ranking(protein_name: str):
    """
    Ranks species orthologs for a given human protein target name (e.g., KRAS, EGFR).
    """
    try:
        uniprot_id = resolve_human_gene_to_uniprot(protein_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
        
    return rank_species_for_target(uniprot_id)

@app.get("/api/drug-targets/rank-egfr")
def get_egfr_drugs():
    """
    Ranks a list of EGFR compounds based on their predicted activity.
    """
    return rank_egfr_drugs()
