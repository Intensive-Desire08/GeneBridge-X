import requests
from typing import List, Dict, Union
from .models import HumanTarget, OrthologSequence

UNIPROT_BASE_URL = "https://rest.uniprot.org/uniprotkb"

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
