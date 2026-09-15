from fastapi import FastAPI
from app.genomics.species_ranking import rank_species_for_target
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

@app.get("/api/genomics/rank-species/{uniprot_id}", response_model=SpeciesRankingResult)
def get_species_ranking(uniprot_id: str):
    """
    Ranks species orthologs for a given human target UniProt ID.
    """
    return rank_species_for_target(uniprot_id)

@app.get("/api/drug-targets/rank-egfr")
def get_egfr_drugs():
    """
    Ranks a list of EGFR compounds based on their predicted activity.
    """
    return rank_egfr_drugs()
