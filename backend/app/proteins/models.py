from pydantic import BaseModel
from typing import Dict, List
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from app.core.schemas import Difference

class AlignmentResult(BaseModel):
    aligned_human: str
    aligned_ortholog: str
    identity_percent: float
    similarity_percent: float
    alignment_score: float
    position_map: Dict[int, int]

class BindingSiteComparison(BaseModel):
    human_residues: List[str]
    ortholog_residues: List[str]
    conserved_count: int
    total_count: int
    conservation_percent: float
    differences: List[Difference]
