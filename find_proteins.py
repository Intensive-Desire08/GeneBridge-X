import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.genomics.species_ranking import rank_species_for_target

targets = {
    "PTGS2 (COX-2)": "P35354",
    "MAOA": "P21397",
    "ACHE": "P22303",
    "HTR2A": "P28223",
    "DRD2": "P14416",
    "GABRA1": "P14867",
    "ESR1": "P03372",
    "AR": "P10275",
    "HMGCR": "P04035",
    "APP": "P05067"
}

print("Searching for proteins where Zebrafish or Fruit Fly wins with >40% compatibility...\n")

for name, uid in targets.items():
    try:
        result = rank_species_for_target(uid)
        best = result.best_model
        best_score = result.ranked_species[0].final_score if result.ranked_species else 0
        
        if best_score > 40:
            print(f"--- {name} ({uid}) ---")
            print(f"Best Model: {best}")
            for r in result.ranked_species:
                print(f"  {r.species}: Identity={r.global_identity}%, BindingSite={r.binding_site_conservation}%, Final={r.final_score}%")
            print("")
    except Exception as e:
        pass
