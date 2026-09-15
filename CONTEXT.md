# CONTEXT.md — PhyloTargetX

This file is the first reference for all future work. It is a living document. It will be updated as work progresses. It is not a replacement for the full technical specification — it is a scratchpad that tells you what to build right now and what state the project is in.

---

## Section 1: Project Identity

- **Project name:** PhyloTargetX
- **One-liner:** PhyloTargetX ranks the best model organism and the best candidate drugs for a given human drug target — and scales to diseases involving multiple proteins.
- **Full spec location:** docs/PhyloTargetX_Spec.md
- **This file is the first reference.** If something is not here, check the full spec.

---

## Section 2: Current Work Status

- **My current workstream:** Workstream 1
- **Module I am building:** Module 1 — Species Ranking Engine
- **Folder I own:** backend/app/genomics/, backend/app/proteins/, data/reference/
- **Entry function I must expose:** rank_species_for_target(uniprot_id, species_list) -> SpeciesRankingResult
- **Schema I must return:** SpeciesRankingResult (see Section 10 of the spec)
- **Status:** Not started

---

## Section 3: What Module 1 Is

Module 1 takes a human drug target (UniProt ID) and determines which species — chicken, zebrafish, or fruit fly — has the most human-like version of that target, weighting binding-site conservation over global sequence identity. It fetches the human protein sequence and binding-site annotations from UniProt, finds the orthologous protein in each species, aligns them pairwise, computes a weighted score (30% global identity + 70% binding-site conservation), and returns a ranked list of species with confidence tags and evidence breakdowns.

Reference: Section 5 of the full spec for full detail.

---

## Section 4: What Module 1 Is Not

- It does not train any ML model. That is Module 2.
- It does not call ChEMBL. That is Module 2.
- It does not rank drugs. That is Module 2.
- It does not handle diseases with multiple proteins. That is the disease orchestrator (Tier 2).
- It does not build the frontend. That is Workstreams 4 and 5.

If asked to do any of the above, refuse and reference the full spec.

---

## Section 5: My Module 1 Functions

These are the internal functions I must implement. Signatures and one-line descriptions only. Full detail in Section 5.4 of the spec.

- **fetch_human_target(uniprot_id) -> HumanTarget** — Fetches the human protein entry from UniProt, extracts sequence, binding-site residues, and domain annotations.
- **find_orthologs(uniprot_id, species_list) -> dict of species -> OrthologCandidate** — Looks up the orthologous protein in each species via UniProt ID mapping or Ensembl homology.
- **fetch_ortholog_sequence(ortholog_uniprot_id) -> OrthologSequence** — Fetches the ortholog protein sequence and any binding-site annotations from UniProt.
- **align_sequences(human_sequence, ortholog_sequence) -> AlignmentResult** — Runs pairwise global alignment using Biopython with BLOSUM62 and builds a position map.
- **map_binding_site(human_binding_site_residues, position_map, aligned_human, aligned_ortholog) -> BindingSiteComparison** — Projects human binding-site residues onto the ortholog via the position map and counts conserved matches.
- **score_species(alignment_result, binding_site_comparison) -> SpeciesScore** — Computes the weighted score (30% global identity + 70% binding-site conservation) and assigns a confidence tag.
- **rank_species(list_of_species_scores) -> SpeciesRankingResult** — Sorts species by final_score descending and assembles the final Module 1 output.

---

## Section 6: Dependencies I May Call

- **UniProt REST API** — human target, ortholog lookup, ortholog sequences, binding-site annotations
- **Ensembl REST API** — backup ortholog lookup
- **Biopython** — pairwise alignment
- **Requests** — HTTP calls
- **Pydantic** — output validation
- **NumPy** — score computation

### Dependencies I Must NOT Call

- ChEMBL REST API
- RDKit
- scikit-learn
- Any Module 2 folder (backend/app/drug_targets/, backend/app/scoring/)

---

## Section 7: Folders I Must Not Touch

- backend/app/drug_targets/
- backend/app/scoring/
- backend/app/api/
- backend/app/core/
- frontend/
- models/

If a change is needed in any of these, raise it in the team chat. Do not edit them.

---

## Section 8: Schema Contract

The output of Module 1 is SpeciesRankingResult. Its schema is frozen. I must return exactly this shape:

### SpeciesRankingResult

- target_uniprot_id (string)
- target_gene_name (string)
- ranked_species (list of SpeciesScore)
- best_model (string)
- dropped_species (list of string)
- overall_confidence (string — "high", "medium", or "low")

### SpeciesScore

- species (string)
- global_identity (float)
- binding_site_conservation (float)
- final_score (float, 0-100)
- confidence (string — "high", "medium", or "low")
- evidence_breakdown (list of EvidenceItem)
- alignment_preview (AlignmentPreview)

Reference: Section 10 of the full spec for the complete schema including nested types (EvidenceItem, AlignmentPreview, Difference).

Field names are exact. No synonyms. No abbreviations. No casing changes.

---

## Section 9: Features I Am Deferring

I am building Module 1 first. The following are explicitly deferred. Do not build them unless the status changes.

- Module 2 (Drug Ranking) — Workstream 2
- Shared backend endpoints (/analyze, /retrain, etc.) — Workstream 3
- Frontend species page — Workstream 4
- Frontend drug page and dashboard — Workstream 5
- Multi-protein disease orchestrator — Tier 2
- Golden drug aggregation — Tier 3

If asked to build any of these, refuse and reference the full spec.

---

## Section 10: Features I Have Postponed Within Module 1

- Heat map visualization — frontend concern, not Module 1
- Alignment preview rendering — frontend concern, but Module 1 must return the raw data in alignment_preview
- Actual DNA sequence snippets — frontend concern, but Module 1 provides the position map

---

## Section 11: Known Failure Modes for Module 1

Pull from Section 5.7 of the spec:

- **Target not found in UniProt** — return structured error, do not proceed
- **No binding-site annotation for target** — fall back to domain-level scoring, mark confidence low
- **No ortholog for a species** — drop species, note in dropped_species
- **Ortholog has no binding-site annotation** — use position map to project human residues, mark confidence medium
- **Alignment coverage < 60%** — mark species confidence low
- **UniProt API timeout** — retry once, on second failure use cached snapshot if available

---

## Section 12: Validation Checkpoints for Module 1

- EGFR (P00533) must return a valid SpeciesRankingResult
- Zebrafish must rank in the top 2 species by final_score
- Chicken must have the highest global_identity among the three non-human species
- Demo run must be reproducible three times in a row with identical top species

Reference: Section 14 of the full spec.

---

## Section 13: When to Reference the Full Spec

Use this CONTEXT.md file as the first reference for anything related to Module 1.

If a request is out of scope — anything not covered in Sections 2 through 12 above — check the full spec at docs/PhyloTargetX_Spec.md. Do not guess. Do not invent. Do not build outside your module.

If the request is still unclear after checking the spec, raise it in the team chat.

---

## Section 14: Last Updated

- **Date:** 2026-09-15
- **Updated by:** Workstream 1
- **Reason:** Initial creation
