from Bio import Align
from Bio.Align import substitution_matrices
from .models import AlignmentResult

def align_sequences(human_sequence: str, ortholog_sequence: str) -> AlignmentResult:
    aligner = Align.PairwiseAligner()
    aligner.substitution_matrix = substitution_matrices.load("BLOSUM62")
    aligner.mode = "global"
    aligner.open_gap_score = -10
    aligner.extend_gap_score = -0.5
    
    alignments = aligner.align(human_sequence, ortholog_sequence)
    if not alignments:
        raise ValueError("Failed to align sequences")
        
    best_alignment = alignments[0]
    
    # Extract the full aligned strings with gaps
    aligned_human = best_alignment[0]
    aligned_ortholog = best_alignment[1]
    
    alignment_score = best_alignment.score
    
    identical = 0
    similar = 0
    length = len(aligned_human)
    position_map = {}
    
    human_pos = 1  # 1-indexed position in human sequence
    ortholog_pos = 1 # 1-indexed position in ortholog sequence
    
    for i in range(length):
        h_char = aligned_human[i]
        o_char = aligned_ortholog[i]
        
        if h_char == o_char and h_char != '-':
            identical += 1
            similar += 1
        elif h_char != '-' and o_char != '-':
            if aligner.substitution_matrix.get((h_char, o_char), -1) > 0:
                similar += 1
                
        if h_char != '-':
            if o_char != '-':
                position_map[human_pos] = ortholog_pos
                
        if h_char != '-':
            human_pos += 1
        if o_char != '-':
            ortholog_pos += 1
            
    human_len = len(human_sequence)
    identity_percent = (identical / human_len) * 100 if human_len > 0 else 0
    similarity_percent = (similar / human_len) * 100 if human_len > 0 else 0
    
    return AlignmentResult(
        aligned_human=aligned_human,
        aligned_ortholog=aligned_ortholog,
        identity_percent=identity_percent,
        similarity_percent=similarity_percent,
        alignment_score=alignment_score,
        position_map=position_map
    )
