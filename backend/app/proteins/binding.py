from typing import List, Dict
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from app.core.schemas import Difference
from .models import BindingSiteComparison

def map_binding_site(human_binding_site_residues: List[int], position_map: Dict[int, int], 
                     aligned_human: str, aligned_ortholog: str) -> BindingSiteComparison:
    human_residues = []
    ortholog_residues = []
    differences = []
    conserved_count = 0
    total_count = len(human_binding_site_residues)
    
    human_pos_to_align_idx = {}
    current_human_pos = 1
    for i, char in enumerate(aligned_human):
        if char != '-':
            human_pos_to_align_idx[current_human_pos] = i
            current_human_pos += 1

    for h_pos in human_binding_site_residues:
        align_idx = human_pos_to_align_idx.get(h_pos)
        
        if align_idx is None:
            continue
            
        h_char = aligned_human[align_idx]
        o_char = aligned_ortholog[align_idx]
        
        human_residues.append(h_char)
        ortholog_residues.append(o_char)
        
        if h_char == o_char and h_char != '-':
            conserved_count += 1
        else:
            differences.append(Difference(
                position=h_pos,
                human_residue=h_char,
                ortholog_residue=o_char
            ))
            
    conservation_percent = (conserved_count / total_count) * 100 if total_count > 0 else 0.0
    
    return BindingSiteComparison(
        human_residues=human_residues,
        ortholog_residues=ortholog_residues,
        conserved_count=conserved_count,
        total_count=total_count,
        conservation_percent=conservation_percent,
        differences=differences
    )
