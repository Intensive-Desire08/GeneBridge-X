import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from typing import List
from app.core.schemas import SpeciesRankingResult
from app.genomics.target_api import fetch_human_target, fetch_ortholog_sequence
from app.genomics.orthologs import find_orthologs
from app.proteins.alignment import align_sequences
from app.proteins.binding import map_binding_site
from app.proteins.scoring import score_species

def rank_species_for_target(uniprot_id: str, species_list: List[str] = ["chicken", "zebrafish", "fruit_fly"]) -> SpeciesRankingResult:
    try:
        human_target = fetch_human_target(uniprot_id)
    except Exception as e:
        # Here we would normally plug in fallback.py, but for the demo we assume it either works 
        # or we throw a structured error to the API layer as per the spec.
        raise RuntimeError(f"TARGET_NOT_FOUND: Failed to fetch human target {uniprot_id}: {str(e)}")
        
    ortholog_candidates = find_orthologs(uniprot_id, human_target.gene_name, species_list)
    
    ranked_scores = []
    dropped_species = []
    
    for species in species_list:
        candidate = ortholog_candidates.get(species)
        if not candidate:
            dropped_species.append(species)
            continue
            
        try:
            ortholog_seq = fetch_ortholog_sequence(candidate.ortholog_uniprot_id)
            alignment = align_sequences(human_target.sequence, ortholog_seq.sequence)
            
            binding_comp = map_binding_site(
                human_binding_site_residues=human_target.binding_site_residues,
                position_map=alignment.position_map,
                aligned_human=alignment.aligned_human,
                aligned_ortholog=alignment.aligned_ortholog
            )
            
            score = score_species(
                species_name=species,
                ortholog_candidate=candidate,
                alignment_result=alignment,
                binding_site_comparison=binding_comp,
                human_binding_site_residues=human_target.binding_site_residues
            )
            ranked_scores.append(score)
            
        except Exception as e:
            print(f"Failed to process species {species}: {e}")
            dropped_species.append(species)
            
    # Sort descending by final score
    ranked_scores.sort(key=lambda x: x.final_score, reverse=True)
    
    best_model = ranked_scores[0].species if ranked_scores else "none"
    
    # Calculate overall confidence (conservative: lowest confidence across all ranked species)
    confidence_priority = {"low": 1, "medium": 2, "high": 3}
    overall_confidence = "high"
    for s in ranked_scores:
        if confidence_priority.get(s.confidence, 1) < confidence_priority.get(overall_confidence, 1):
            overall_confidence = s.confidence
            
    # Also if any dropped species, we might consider lowering overall confidence
    if dropped_species and overall_confidence == "high":
        overall_confidence = "medium"

    return SpeciesRankingResult(
        target_uniprot_id=human_target.uniprot_id,
        target_gene_name=human_target.gene_name,
        ranked_species=ranked_scores,
        best_model=best_model,
        dropped_species=dropped_species,
        overall_confidence=overall_confidence
    )
