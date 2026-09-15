from backend.app.genomics.target_api import fetch_human_target, fetch_ortholog_sequence
from backend.app.genomics.orthologs import find_orthologs

ht = fetch_human_target("P00533")
print("Human seq length:", len(ht.sequence))
print("Human binding sites count:", len(ht.binding_site_residues))
print("Human gene name:", ht.gene_name)

orthologs = find_orthologs("P00533", ht.gene_name, ["chicken", "zebrafish"])
for sp, o in orthologs.items():
    print(f"\n{sp} ortholog UNIPROT:", o.ortholog_uniprot_id)
    print(f"{sp} confidence:", o.confidence)
    osq = fetch_ortholog_sequence(o.ortholog_uniprot_id)
    print(f"{sp} seq length:", len(osq.sequence))
