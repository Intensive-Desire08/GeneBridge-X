import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import json
from app.drug_targets.egfr_ranking import rank_egfr_drugs

result = rank_egfr_drugs()

print(json.dumps(result, indent=4))
