from typing import List, Dict, Union
from pydantic import BaseModel

class HumanTarget(BaseModel):
    uniprot_id: str
    gene_name: str
    protein_name: str
    sequence: str
    sequence_length: int
    binding_site_residues: List[int]
    domain_annotations: List[Dict[str, Union[str, int]]]

class OrthologCandidate(BaseModel):
    species: str
    ortholog_uniprot_id: str
    gene_name: str
    confidence: str  # "high", "medium", "low"

class OrthologSequence(BaseModel):
    uniprot_id: str
    sequence: str
    sequence_length: int
    binding_site_residues: List[int]
