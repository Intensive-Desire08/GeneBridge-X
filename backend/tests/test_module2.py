import json
from module2 import rank_egfr_drugs

result = rank_egfr_drugs()

print(json.dumps(result, indent=4))
