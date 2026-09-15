import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.genomics.target_api import fetch_human_target

def test_fetch_human_target():
    print("Fetching EGFR (P00533)...")
    target = fetch_human_target("P00533")
    print(f"Target Uniprot ID: {target.uniprot_id}")
    print(f"Gene Name: {target.gene_name}")
    print(f"Protein Name: {target.protein_name}")
    print(f"Sequence Length: {target.sequence_length}")
    print(f"Binding Site Residues Count: {len(target.binding_site_residues)}")
    print(f"Domain Annotations Count: {len(target.domain_annotations)}")
    print("\nSuccessfully executed fetch_human_target!")

if __name__ == "__main__":
    test_fetch_human_target()
