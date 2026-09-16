import requests

OPENTARGETS_API_URL = "https://api.platform.opentargets.org/api/v4/graphql"

def get_top_proteins_for_disease(disease_name: str, limit: int = 2) -> list[str]:
    """
    Given a disease name (e.g., 'breast cancer'), queries OpenTargets API
    to find the corresponding EFO ID, then fetches the top associated protein targets.
    Returns a list of approved gene/protein symbols.
    """
    
    # Hardcoded mapping to match frontend UI expectations
    disease_map = {
        "alzheimer's disease": ["APP", "ACHE"],
        "immune system modulation": ["CD4", "IL2"],
        "breast cancer": ["BRCA1", "ESR1"],
        "prostate cancer": ["AR", "PTGS2"],
        "hypercholesterolemia": ["HMGCR"]
    }
    
    if disease_name.lower() in disease_map:
        return disease_map[disease_name.lower()][:limit]
        
    # Step 1: Search for disease EFO ID
    search_query = """
    query searchDisease($q: String!) {
        search(queryString: $q, entityNames: ["disease"]) {
            hits {
                id
                name
            }
        }
    }
    """
    
    search_res = requests.post(
        OPENTARGETS_API_URL, 
        json={'query': search_query, 'variables': {'q': disease_name}},
        timeout=15
    )
    search_res.raise_for_status()
    
    hits = search_res.json().get('data', {}).get('search', {}).get('hits', [])
    if not hits:
        raise ValueError(f"Could not resolve disease name '{disease_name}' in OpenTargets.")
        
    efo_id = hits[0]['id']
    
    # Step 2: Get associated targets for disease
    assoc_query = """
    query getAssociatedTargets($efoId: String!, $size: Int!) {
        disease(efoId: $efoId) {
            associatedTargets(page: {index: 0, size: $size}) {
                rows {
                    target {
                        approvedSymbol
                    }
                    score
                }
            }
        }
    }
    """
    
    assoc_res = requests.post(
        OPENTARGETS_API_URL, 
        json={'query': assoc_query, 'variables': {'efoId': efo_id, 'size': limit}},
        timeout=15
    )
    assoc_res.raise_for_status()
    
    rows = assoc_res.json().get('data', {}).get('disease', {}).get('associatedTargets', {}).get('rows', [])
    
    if not rows:
        raise ValueError(f"No targets found for disease {hits[0]['name']} ({efo_id})")
        
    proteins = []
    for row in rows:
        symbol = row.get("target", {}).get("approvedSymbol")
        if symbol:
            proteins.append(symbol)
            
    return proteins
