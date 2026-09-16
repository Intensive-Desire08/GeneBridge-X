import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.genomics.species_ranking import rank_species_for_target

targets = {
    "CD4": "P01730",
    "IL2": "P60568",
    "BRCA1": "P38398"
}

for name, uid in targets.items():
    print(f"\n--- Ranking species for {name} ({uid}) ---")
    try:
        result = rank_species_for_target(uid)
        print(f"Best Model: {result.best_model}")
        for r in result.ranked_species:
            print(f"  {r.species}: Identity={r.global_identity}%, BindingSite={r.binding_site_conservation}%, Final={r.final_score}%")
    except Exception as e:
        print(f"Error: {e}")
