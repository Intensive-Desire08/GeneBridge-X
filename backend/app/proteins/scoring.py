import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from .models import AlignmentResult, BindingSiteComparison
from app.core.schemas import SpeciesScore, EvidenceItem, AlignmentPreview
from app.genomics.models import OrthologCandidate
from typing import List

def score_species(species_name: str, 
                  ortholog_candidate: OrthologCandidate,
                  alignment_result: AlignmentResult, 
                  binding_site_comparison: BindingSiteComparison,
                  human_binding_site_residues: List[int]) -> SpeciesScore:
    
    global_identity = alignment_result.identity_percent
    binding_site_conservation = binding_site_comparison.conservation_percent
    
    final_score = (0.3 * global_identity) + (0.7 * binding_site_conservation)
    
    has_binding_site_annotation = binding_site_comparison.total_count > 0
    curated_ortholog = ortholog_candidate.confidence == "high"
    
    human_len = len(alignment_result.aligned_human.replace('-', ''))
    coverage = (len(alignment_result.aligned_ortholog.replace('-', '')) / human_len) if human_len else 0
    
    if has_binding_site_annotation and curated_ortholog and coverage > 0.8:
        confidence = "high"
    elif not has_binding_site_annotation or ortholog_candidate.confidence == "low" or coverage < 0.6:
        confidence = "low"
    else:
        confidence = "medium"
        
    evidence_breakdown = [
        EvidenceItem(
            type="binding_site_conservation",
            value=round(binding_site_conservation, 1),
            unit="percent",
            source="alignment",
            confidence_tag="computational" if not has_binding_site_annotation else "experimental" 
        ),
        EvidenceItem(
            type="global_identity",
            value=round(global_identity, 1),
            unit="percent",
            source="alignment",
            confidence_tag="computational"
        ),
        EvidenceItem(
            type="ortholog_source",
            value=ortholog_candidate.confidence,
            unit=None,
            source="uniprot",
            confidence_tag="literature" if curated_ortholog else "computational"
        )
    ]
    
    alignment_preview = AlignmentPreview(
        human_segment=alignment_result.aligned_human,
        ortholog_segment=alignment_result.aligned_ortholog,
        binding_site_positions=human_binding_site_residues,
        differences=binding_site_comparison.differences
    )
    
    return SpeciesScore(
        species=species_name,
        global_identity=round(global_identity, 1),
        binding_site_conservation=round(binding_site_conservation, 1),
        final_score=round(final_score, 1),
        confidence=confidence,
        evidence_breakdown=evidence_breakdown,
        alignment_preview=alignment_preview
    )
