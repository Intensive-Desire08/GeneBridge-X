from typing import List, Union, Optional
from pydantic import BaseModel

class Difference(BaseModel):
    position: int
    human_residue: str
    ortholog_residue: str

class EvidenceItem(BaseModel):
    type: str
    value: Union[float, str]
    unit: Optional[str] = None
    source: str
    confidence_tag: str

class AlignmentPreview(BaseModel):
    human_segment: str
    ortholog_segment: str
    binding_site_positions: List[int]
    differences: List[Difference]

class SpeciesScore(BaseModel):
    species: str
    global_identity: float
    binding_site_conservation: float
    final_score: float
    confidence: str
    evidence_breakdown: List[EvidenceItem]
    alignment_preview: AlignmentPreview

class SpeciesRankingResult(BaseModel):
    target_uniprot_id: str
    target_gene_name: str
    ranked_species: List[SpeciesScore]
    best_model: str
    dropped_species: List[str]
    overall_confidence: str
