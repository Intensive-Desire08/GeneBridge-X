import requests
from typing import List, Dict, Union
from .models import HumanTarget, OrthologSequence

UNIPROT_BASE_URL = "https://rest.uniprot.org/uniprotkb"

# Hardcoded targets requested for GeneBridge-X Module 1
TARGET_MAPPING = {
    "EGFR": "P00533",
    "KRAS": "P01116",
    "ALK": "Q9UM73",
    "HER2": "P04626", # ERBB2
    "ERBB2": "P04626",
    "ESR1": "P03372",
    "BRAF": "P15056",
    "NRAS": "P01111",
    "KIT": "P10721",
    "BCR": "P11274",
    "ABL1": "P00519"
}

def resolve_human_gene_to_uniprot(gene_name: str) -> str:
    """Resolves a human gene symbol to its UniProt ID. Uses hardcoded map first, then falls back to search."""
    gene_upper = gene_name.upper()
    if gene_upper in TARGET_MAPPING:
        return TARGET_MAPPING[gene_upper]
    
    # Fallback to UniProt search API
    url = f"{UNIPROT_BASE_URL}/search"
    query = f"(gene:{gene_upper}) AND (organism_id:9606) AND (reviewed:true)"
    params = {"query": query, "format": "json", "size": 1}
    
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()
    
    if data.get("results"):
        return data["results"][0].get("primaryAccession")
        
    raise ValueError(f"Could not resolve gene '{gene_name}' to a reviewed Human UniProt ID.")

def fetch_human_target(uniprot_id: str) -> HumanTarget:
    url = f"{UNIPROT_BASE_URL}/{uniprot_id}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()

    # Extract basic info
    primary_accession = data.get("primaryAccession", uniprot_id)
    
    gene_name = ""
    if data.get("genes") and len(data["genes"]) > 0:
        gene_name = data["genes"][0].get("geneName", {}).get("value", "")

    protein_name = ""
    try:
        protein_name = data["proteinDescription"]["recommendedName"]["fullName"]["value"]
    except KeyError:
        pass

    sequence = data.get("sequence", {}).get("value", "")
    sequence_length = data.get("sequence", {}).get("length", 0)

    # Extract features
    features = data.get("features", [])
    binding_site_residues = set()
    domain_annotations = []

    for feature in features:
        f_type = feature.get("type", "")
        if f_type == "Binding site":
            location = feature.get("location", {})
            start = location.get("start", {}).get("value")
            end = location.get("end", {}).get("value")
            if start and end:
                # Add all residues in the range (usually start == end for binding sites)
                for pos in range(int(start), int(end) + 1):
                    binding_site_residues.add(pos)
        
        elif f_type == "Domain":
            location = feature.get("location", {})
            start = location.get("start", {}).get("value")
            end = location.get("end", {}).get("value")
            desc = feature.get("description", "")
            if start and end:
                domain_annotations.append({
                    "name": desc,
                    "start": int(start),
                    "end": int(end)
                })

    return HumanTarget(
        uniprot_id=primary_accession,
        gene_name=gene_name,
        protein_name=protein_name,
        sequence=sequence,
        sequence_length=sequence_length,
        binding_site_residues=sorted(list(binding_site_residues)),
        domain_annotations=domain_annotations
    )

def fetch_ortholog_sequence(ortholog_uniprot_id: str) -> OrthologSequence:
    url = f"{UNIPROT_BASE_URL}/{ortholog_uniprot_id}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()

    primary_accession = data.get("primaryAccession", ortholog_uniprot_id)
    sequence = data.get("sequence", {}).get("value", "")
    sequence_length = data.get("sequence", {}).get("length", 0)

    features = data.get("features", [])
    binding_site_residues = set()

    for feature in features:
        if feature.get("type") == "Binding site":
            location = feature.get("location", {})
            start = location.get("start", {}).get("value")
            end = location.get("end", {}).get("value")
            if start and end:
                for pos in range(int(start), int(end) + 1):
                    binding_site_residues.add(pos)

    return OrthologSequence(
        uniprot_id=primary_accession,
        sequence=sequence,
        sequence_length=sequence_length,
        binding_site_residues=sorted(list(binding_site_residues))
    )
