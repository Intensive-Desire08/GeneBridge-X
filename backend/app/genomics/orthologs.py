import requests
from typing import List, Dict
from .models import OrthologCandidate

UNIPROT_SEARCH_URL = "https://rest.uniprot.org/uniprotkb/search"

SPECIES_TAXONOMY_MAP = {
    "chicken": "Gallus gallus",
    "zebrafish": "Danio rerio",
    "fruit_fly": "Drosophila melanogaster",
    "fruit fly": "Drosophila melanogaster"
}

def find_orthologs(uniprot_id: str, gene_name: str, species_list: List[str]) -> Dict[str, OrthologCandidate]:
    """
    Finds orthologs for a given human gene name in the specified species.
    For this build, we use UniProt gene name + organism search which yields 'low' confidence
    (gene-name match) as per Section 5.4.2 fallback.
    """
    results = {}
    
    for species in species_list:
        org_name = SPECIES_TAXONOMY_MAP.get(species.lower(), species)
        
        # Search UniProt by gene name and organism
        query = f"(gene:{gene_name}) AND (organism_name:\"{org_name}\")"
        params = {
            "query": query,
            "format": "json",
            "size": 1
        }
        
        try:
            response = requests.get(UNIPROT_SEARCH_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("results") and len(data["results"]) > 0:
                best_match = data["results"][0]
                ortholog_uniprot_id = best_match["primaryAccession"]
                
                match_gene_name = gene_name
                if best_match.get("genes"):
                    match_gene_name = best_match["genes"][0].get("geneName", {}).get("value", gene_name)
                    
                results[species] = OrthologCandidate(
                    species=species,
                    ortholog_uniprot_id=ortholog_uniprot_id,
                    gene_name=match_gene_name,
                    # We default to medium/low for gene-name homology search
                    confidence="low"
                )
        except Exception as e:
            print(f"Failed to find ortholog for {species}: {e}")
            
    return results
