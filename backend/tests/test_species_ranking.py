import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.genomics.species_ranking import rank_species_for_target

def test_module1_end_to_end():
    print("Starting Module 1 End-to-End Test on EGFR (P00533)...")
    
    result = rank_species_for_target("P00533")
    
    print("\n--- RESULTS ---")
    print(f"Target: {result.target_uniprot_id} ({result.target_gene_name})")
    print(f"Best Model: {result.best_model}")
    print(f"Overall Confidence: {result.overall_confidence}")
    print(f"Dropped Species: {result.dropped_species}")
    
    print("\nRanked Species:")
    for rs in result.ranked_species:
        print(f"  {rs.species.upper()}: Score {rs.final_score}% (Confidence: {rs.confidence})")
        print(f"    - Global Identity: {rs.global_identity}%")
        print(f"    - Binding Conservation: {rs.binding_site_conservation}%")
        print(f"    - Evidence Items: {len(rs.evidence_breakdown)}")
        
    print("\nTest passed successfully!")

if __name__ == "__main__":
    test_module1_end_to_end()
