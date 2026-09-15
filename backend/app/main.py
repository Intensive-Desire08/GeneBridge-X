from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import time
import logging
from app.genomics.species_ranking import rank_species_for_target
from app.genomics.target_api import resolve_human_gene_to_uniprot
from app.drug_targets.dynamic_ranking import rank_drugs_for_target
from app.core.orchestrator import orchestrate_protein, orchestrate_disease
from app.core.schemas import SpeciesRankingResult
import sys
import os
import importlib.util

# Dynamically import backend_logger from the root logging folder
logging_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'logging'))
logger_path = os.path.join(logging_dir, 'backend_logger.py')

spec = importlib.util.spec_from_file_location("backend_logger", logger_path)
if spec and spec.loader:
    backend_logger = importlib.util.module_from_spec(spec)
    sys.modules["backend_logger"] = backend_logger
    spec.loader.exec_module(backend_logger)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="GeneBridge-X API",
    description="API for GeneBridge-X modules (Species Ranking and Drug Target Ranking)",
    version="1.0.0"
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Path: {request.url.path} Method: {request.method} Status: {response.status_code} Process Time: {process_time:.4f}s")
    return response

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
