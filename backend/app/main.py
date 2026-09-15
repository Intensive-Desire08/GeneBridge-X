from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.genomics.species_ranking import rank_species_for_target
from app.genomics.target_api import resolve_human_gene_to_uniprot
from app.drug_targets.dynamic_ranking import rank_drugs_for_target
from app.core.orchestrator import orchestrate_protein, orchestrate_disease
from app.core.schemas import SpeciesRankingResult

app = FastAPI(
    title="GeneBridge-X API",
    description="API for GeneBridge-X modules (Species Ranking and Drug Target Ranking)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.get("/api/drug-targets/rank/{protein_name}")
def get_dynamic_drugs(protein_name: str):
    """
    Dynamically fetches compound data, trains a model, and ranks drugs for any given protein target.
    """
    try:
        return rank_drugs_for_target(protein_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/api/orchestrator/{protein_name}")
def run_orchestrator(protein_name: str):
    """
    Orchestrates the entire pipeline for a given protein.
    Returns recommendations for both species and drugs.
    """
    try:
        return orchestrate_protein(protein_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/api/orchestrator/disease/{disease_name}")
def run_disease_orchestrator(disease_name: str):
    """
    Orchestrates the entire pipeline for a given disease.
    Maps the disease to top proteins, then orchestrates each protein.
    """
    try:
        return orchestrate_disease(disease_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
