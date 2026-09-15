import json
import os
from typing import Dict, Any, Optional

def load_fallback_json(file_path: str) -> Optional[Dict[str, Any]]:
    # Project root is likely 3 levels up from this file (backend/app/genomics/)
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
    full_path = os.path.join(project_root, file_path)
    
    if os.path.exists(full_path):
        try:
            with open(full_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading fallback {full_path}: {e}")
    return None

def get_egfr_fallback() -> Optional[Dict[str, Any]]:
    return load_fallback_json('data/raw/uniprot/egfr.json')

def get_orthologs_fallback() -> Optional[Dict[str, Any]]:
    return load_fallback_json('data/raw/uniprot/orthologs.json')
