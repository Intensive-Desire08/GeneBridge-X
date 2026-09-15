# PhyloTargetX

## Technical Specification — VMedithon 2026-27

---

## Section 1 — Overview

### 1.1 Introduction

PhyloTargetX is a computational platform that ranks model organisms and candidate drugs for a given human drug target. It answers a question that current preclinical workflows handle by experience and literature precedent rather than systematic computation: for this target, which animal is the most reliable model, and which compounds are most worth testing first?

The platform is software-only, fully virtual, and demoable on a laptop. It does not perform wet-lab work, does not predict clinical outcomes, and does not claim to discover cures. It produces explainable research priorities.

### 1.2 Project

**One-liner:** PhyloTargetX ranks the best model organism and the best candidate drugs for a given human drug target — and scales to diseases involving multiple proteins.

**Direction:** Human target → species ranking + drug ranking → lab shortlist. Disease → multiple proteins → per-protein results → disease-level summary.

**Demo target:** EGFR (UniProt P00533), the target of approved drugs Gefitinib and Erlotinib.

**Species set:** Human (reference), Chicken, Zebrafish, Fruit fly. Four species, not five. Spider is excluded because spider genomes are poorly annotated and ortholog lookup is unreliable within the build window.

**Two modules:**

- **Module 1 — Species Ranking Engine:** compares the human target protein across species, weights binding-site conservation over global identity, ranks species.
- **Module 2 — Drug Ranking Engine (DrugTarget AI):** trains a Random Forest on ChEMBL bioactivity for the target, scores candidate compounds, ranks drugs.

**Shared infrastructure:** FastAPI backend, /analyze orchestrator, /retrain endpoint, evidence confidence tagging, JSON schema lock.

### 1.3 Multi-Protein Disease Support

A disease may map to one or more proteins. The system supports analyzing diseases that involve multiple drug targets:

- A disease may map to one or more proteins. The disease-to-protein mapping is stored in a static reference file.
- The orchestrator runs Module 1 and Module 2 for each protein in the disease.
- Results are returned per protein and displayed progressively. Each protein's result is a complete FullAnalysisResult.
- If a disease has one major protein, only that protein is analyzed.
- If a disease has two, three, or more proteins, all are analyzed.
- The final output is a list of per-protein results, one per protein.

### 1.4 Project Scope

**In scope:**

- Protein sequence retrieval from UniProt
- Ortholog retrieval from UniProt/Ensembl
- Pairwise sequence alignment with binding-site weighting
- Species ranking with confidence tags
- ChEMBL bioactivity retrieval for the target
- Random Forest training on molecular fingerprints
- Drug ranking with activity probability
- Retraining on a new target in under 90 seconds
- Heat map visualization of conservation across species
- 3D molecular visualization of top-ranked drugs
- Evidence breakdown panels for every score

**Out of scope:**

- Virtual mutation lab
- Full structural biology / PDB integration
- Bioactive molecule registry (animal-derived peptides)
- Snake venom, cone snail toxin, Gila monster saliva
- Multi-target generic model trained once on everything
- Clinical claims of any kind
- Wet-lab validation

**Boundary rule:** If a feature is not listed in scope, it does not get built. No exceptions for the hackathon window.

### 1.5 Research Gap

Approximately 95% of drugs that pass preclinical animal testing fail in Phase 1 human trials. One documented cause is that the animal's version of the drug target differs from the human version in ways that matter for drug binding.

Current industry practice for selecting animal models relies on historical precedent and literature, not systematic computation. Sequence alignment tools exist, but they score global identity — which underestimates model reliability because ligand-binding pockets are often more conserved than the rest of the protein. Published comparative work on zebrafish, fathead minnow, pufferfish, and Xenopus found that binding-pocket conservation is significantly higher than whole-protein conservation across 28 human side-effect targets.

No widely used tool takes a human target, weights binding-site conservation, and outputs a ranked list of model organisms with explainable confidence tags, then pairs that with a ranked list of candidate drugs trained on that specific target.

That gap is what PhyloTargetX fills.

### 1.6 Final Project Statement

PhyloTargetX is an explainable computational platform that evaluates cross-species conservation of drug targets and integrates sequence, structural, and functional evidence to prioritize suitable model organisms and candidate drug-target interactions for further biomedical research. It supports both single-protein targets and multi-protein diseases.

---

## Section 2 — Overall Architecture

### 2.1 Three-Level View

The system has three levels: Frontend, API layer, and Engine layer. Each level talks only to the level directly below it. Engines do not call each other except through the API layer's orchestrator.

```text
                    FRONTEND
                       |
              +--------+--------+
              |                 |
         Module 1 Page     Module 2 Page
         (Species)         (Drugs)
              |                 |
              +--------+--------+
                       |
                  Dashboard
                       |
                       v
                    API LAYER
                       |
              +--------+--------+
              |                 |
       /analyze           /retrain
       /species           /drugs
       /health            /targets
       /analyze-disease
              |
              v
                  ENGINE LAYER
                       |
              +--------+--------+
              |                 |
    Module 1 Engine     Module 2 Engine
    (Species Ranking)   (Drug Ranking)
              |                 |
              +--------+--------+
                       |
              +--------+--------+
              |                 |
         UniProt API      ChEMBL API
         Ensembl API      RDKit
         Biopython        scikit-learn
```

### 2.2 Data Flow

**Full analysis flow (single /analyze call):**

1. User submits a target identifier (UniProt ID) from the frontend.
2. API orchestrator calls Module 1 Engine.
3. Module 1 fetches human sequence + binding-site annotations, fetches orthologs, aligns, scores, ranks species, returns JSON.
4. Orchestrator calls Module 2 Engine with the same target ID.
5. Module 2 fetches ChEMBL bioactivity, trains Random Forest, scores candidate drugs, ranks, returns JSON.
6. Orchestrator merges both outputs into a single response with a final recommendation block.
7. Frontend renders Module 1 page and Module 2 page from the merged response.

**Retrain flow (single /retrain call):**

1. User submits a new target identifier.
2. API orchestrator clears cached results for the previous target.
3. Orchestrator re-runs the full analysis flow.
4. Response returns with the new target's species ranking and drug ranking.

### 2.3 Disease-Level Orchestration

A disease-level orchestrator wraps the existing single-protein orchestrator:

- The disease-level orchestrator accepts a `disease_id`, resolves it to a list of UniProt IDs via the static mapping file (`data/reference/disease_map.json`), and calls the single-protein orchestrator for each protein.
- Results stream back progressively. The frontend can display each protein's result as it completes.
- The existing single-protein pipeline is unchanged. The disease-level orchestrator is a wrapper, not a replacement.

### 2.4 Level Responsibilities

**Frontend level:**

- Render species ranking with heat map and alignment view
- Render drug ranking with 3D molecules and activity bars
- Display confidence tags next to every score
- Display evidence breakdown panels
- Call only API layer endpoints — never external APIs directly

**API level:**

- Expose /analyze, /retrain, /species, /drugs, /targets, /health, /analyze-disease
- Validate input with Pydantic
- Route calls to Module 1 and Module 2 engines
- Merge engine outputs into the frozen final schema
- Manage caching (so repeated /analyze for the same target is fast)
- Handle errors uniformly (missing target, API timeout, empty ChEMBL result)
- Never contain domain logic — domain logic belongs to engines

**Engine level:**

- Module 1 Engine: all cross-species sequence work
- Module 2 Engine (DrugTarget AI): all drug-target ML work
- Each engine is folder-isolated and exposes a single entry function
- Engines do not import each other
- Engines return Pydantic-validated objects matching the locked schemas

### 2.5 Integration Boundaries

Three boundaries matter, and each is frozen:

- **Frontend <-> API:** JSON over HTTP. Frontend consumes only the frozen response schemas described in Section 10.
- **API <-> Module 1 Engine:** The engine exposes one entry function that accepts a target identifier and returns a SpeciesRankingResult. The API never inspects internal engine state.
- **API <-> Module 2 Engine:** The engine exposes one entry function that accepts a target identifier and a list of candidate compounds (or defaults to ChEMBL actives), and returns a DrugRankingResult. The API never inspects internal engine state.

No other boundaries exist. No shared mutable state. No direct calls between engines.

---

## Section 3 — Technology Stack

### 3.1 Stack Table

| Layer | Technology | Frozen |
|---|---|---|
| Language | Python 3.12 | Yes |
| API framework | FastAPI | Yes |
| ASGI server | Uvicorn | Yes |
| Data validation | Pydantic v2 | Yes |
| Bioinformatics | Biopython | Yes |
| Numerical | NumPy / SciPy | Yes |
| Data processing | Pandas | Yes |
| Machine learning | scikit-learn (Random Forest) | Yes |
| Chemistry | RDKit | Yes |
| HTTP client | Requests | Yes |
| Target data | UniProt REST API | Yes |
| Orthology data | Ensembl REST API / NCBI | Yes |
| Drug data | ChEMBL REST API | Yes |
| DNA visualization | JBrowse 2 | Yes |
| 3D molecule visualization | 3Dmol.js | Yes |
| Charts and heat maps | Plotly | Yes |
| Frontend framework | React / Next.js | Yes |
| Version control | Git | Yes |

### 3.2 Stack Rules

- No substitutions without team consensus. If a tool is listed, use it.
- No deep learning frameworks. PyTorch, TensorFlow, and Transformers are explicitly excluded — Random Forest is the ML ceiling for this build.
- No 3D structure parsing. RDKit generates 3D coordinates from SMILES; no PDB parsing.
- No database. Persistence is JSON files on disk and in-memory caching.
- No authentication, no user accounts, no sessions.
- No Docker. Runs directly in a Python virtual environment.
- No message queues, no background workers. Synchronous request/response only.

---

## Section 4 — Directory Structure

### 4.1 Top-Level Tree

```text
PhyloTargetX/
|
+-- backend/
|   +-- app/
|   |   +-- api/
|   |   +-- core/
|   |   +-- genomics/
|   |   +-- proteins/
|   |   +-- drug_targets/
|   |   +-- scoring/
|   |   +-- main.py
|   +-- requirements.txt
|
+-- frontend/
|   +-- pages/
|       +-- disease.jsx
|
+-- data/
|   +-- raw/
|   |   +-- chembl/
|   |   |   +-- egfr_bioactivity.csv
|   |   |   +-- kras_bioactivity.csv
|   |   |   +-- alk_bioactivity.csv
|   |   +-- uniprot/
|   |       +-- egfr.json
|   |       +-- kras.json
|   |       +-- alk.json
|   +-- processed/
|   +-- reference/
|       +-- disease_map.json
|       +-- nsclc_cache/
|
+-- models/
|
+-- simulations/
|
+-- tests/
|
+-- docs/
|
+-- .gitignore
+-- README.md
```

### 4.2 Folder Ownership

Each agent owns exactly one folder. No agent edits another agent's folder. Cross-folder integration happens only through the frozen schemas in Section 10.

### 4.3 Module Ownership Map

| Folder | Owner workstream | Contents |
|---|---|---|
| backend/app/api/ | Workstream 3 | FastAPI routes, orchestrator, request/response models |
| backend/app/core/ | Workstream 3 | Config, caching, error handling, shared utilities |
| backend/app/genomics/ | Workstream 1 | Module 1 sequence fetching, ortholog lookup, alignment |
| backend/app/proteins/ | Workstream 1 | Module 1 binding-site mapping, scoring |
| backend/app/drug_targets/ | Workstream 2 | Module 2 ChEMBL fetch, RDKit fingerprints, Random Forest |
| backend/app/scoring/ | Workstream 2 | Module 2 drug scoring, ranking, drug-likeness |
| frontend/ | Workstream 4 + 5 | All UI, dashboard, heat map, 3D viewer |
| data/raw/ | All (read-only after write) | Downloaded ChEMBL CSV, UniProt FASTA snapshots |
| data/processed/ | All (read-only after write) | Cleaned intermediate data |
| data/reference/ | Workstream 1 | Short DNA segments for alignment visualization |
| models/ | Workstream 2 | Saved Random Forest .pkl files per target |
| simulations/ | -- | Empty in this build; reserved for future work |
| tests/ | All | One test file per engine entry function |
| docs/ | All | This report and any agent-facing documentation |

| Module | Folder(s) | Workstream |
|---|---|---|
| Module 1 -- Species Ranking | backend/app/genomics/, backend/app/proteins/ | 1 |
| Module 2 -- Drug Ranking | backend/app/drug_targets/, backend/app/scoring/ | 2 |
| Shared Backend | backend/app/api/, backend/app/core/ | 3 |
| Frontend Module 1 | frontend/ (species page) | 4 |
| Frontend Module 2 + Dashboard | frontend/ (drugs page + shell) | 5 |

### 4.4 File Naming Rules

- Python modules: snake_case.py
- React components: PascalCase.jsx
- Data files: kebab-case.csv or kebab-case.json
- Test files: test_<module_name>.py
- No spaces in any filename
- No version suffixes like _v2 or _final — Git handles versioning

### 4.5 Additional Files

- `data/reference/disease_map.json` — static mapping of disease IDs to protein lists.
- `data/reference/nsclc_cache/` — pre-cached results for the NSCLC disease (used for demo backup).
- `frontend/pages/disease.jsx` — the disease page.

### 4.6 Merge Rules

- Each workstream commits to Git every 2 hours minimum
- No agent edits outside its owned folder
- No agent changes the JSON schemas in Section 10 after hour 2
- If an agent needs a change to a schema, it raises it to the team; the team either approves and everyone updates, or the change is rejected
- Integration is verified by running tests/ against the frozen schemas — not by inspecting each other's code

---

## Section 5 — Module 1: Species Ranking Engine

### 5.1 Purpose

Given a human drug target, determine which species (chicken, zebrafish, fruit fly) has the most human-like version of that target — weighting binding-site conservation over global sequence identity — and return a ranked list with confidence tags.

### 5.2 Folder Ownership

backend/app/genomics/ and backend/app/proteins/ — Workstream 1.

### 5.3 Entry Function

**Name:** `rank_species_for_target`

**Inputs:**

- `uniprot_id` (string) — the human target identifier, e.g. "P00533" for EGFR
- `species_list` (list of strings) — fixed to ["chicken", "zebrafish", "fruit_fly"] for this build

**Returns:** SpeciesRankingResult (Pydantic model, schema frozen in Section 10)

**Does:** Orchestrates the full Module 1 pipeline. Calls the internal functions below in order. Catches per-species failures and marks them as low-confidence rather than failing the whole call.

### 5.4 Internal Functions

#### 5.4.1 fetch_human_target

**Inputs:** uniprot_id (string)

**Returns:** HumanTarget object containing:

- uniprot_id
- gene_name
- protein_name
- sequence (amino acid string)
- sequence_length (int)
- binding_site_residues (list of ints — amino acid positions)
- domain_annotations (list of dicts with name, start, end)

**Does:** Calls UniProt REST API for the reviewed entry. Extracts sequence and feature annotations. Filters features for type == "binding site" and type == "domain".

**Dependencies:** UniProt REST API, Requests.

**Failure behavior:** If UniProt returns no binding-site annotations, the function returns the target with an empty list and a low_confidence flag. Module 1 still runs but binding-site scoring falls back to domain-level scoring.

#### 5.4.2 find_orthologs

**Inputs:** uniprot_id (string), species_list (list of strings)

**Returns:** dict mapping species name -> OrthologCandidate object containing:

- species
- ortholog_uniprot_id
- gene_name
- confidence (one of "high", "medium", "low")

**Does:** Uses UniProt's ID mapping endpoint or Ensembl's homology endpoint to find the orthologous protein in each species. Records confidence based on whether the match came from a curated ortholog source (high), a homology prediction (medium), or a gene-name match (low).

**Dependencies:** UniProt REST API, Ensembl REST API, Requests.

**Failure behavior:** If no ortholog is found for a species, that species is marked "missing" and excluded from ranking. The final result includes a note explaining which species were dropped.

#### 5.4.3 fetch_ortholog_sequence

**Inputs:** ortholog_uniprot_id (string)

**Returns:** OrthologSequence object containing:

- uniprot_id
- sequence (amino acid string)
- sequence_length (int)
- binding_site_residues (list of ints, may be empty)

**Does:** Calls UniProt REST API for the ortholog entry. Extracts sequence and binding-site annotations if present. If the ortholog has no binding-site annotation, the function returns an empty list — the mapping step will handle this.

**Dependencies:** UniProt REST API, Requests.

#### 5.4.4 align_sequences

**Inputs:** human_sequence (string), ortholog_sequence (string)

**Returns:** AlignmentResult object containing:

- aligned_human (string with gaps)
- aligned_ortholog (string with gaps)
- identity_percent (float)
- similarity_percent (float)
- alignment_score (float)
- position_map (dict mapping human position -> ortholog position, accounting for gaps)

**Does:** Runs pairwise global alignment using Biopython's PairwiseAligner with the BLOSUM62 substitution matrix. Computes identity and similarity from the alignment. Builds a position map so binding-site residues can be projected from human to ortholog coordinates.

**Dependencies:** Biopython.

#### 5.4.5 map_binding_site

**Inputs:** human_binding_site_residues (list of ints), position_map (dict), aligned_human (string), aligned_ortholog (string)

**Returns:** BindingSiteComparison object containing:

- human_residues (list of strings — one-letter amino acid codes)
- ortholog_residues (list of strings)
- conserved_count (int)
- total_count (int)
- conservation_percent (float)
- differences (list of dicts with position, human_residue, ortholog_residue)

**Does:** Projects each human binding-site residue to its ortholog position via the position map. Compares amino acids. Counts identical matches as conserved. Records every mismatch for the frontend's difference view.

**Dependencies:** None beyond the inputs.

#### 5.4.6 score_species

**Inputs:** alignment_result (AlignmentResult), binding_site_comparison (BindingSiteComparison)

**Returns:** SpeciesScore object containing:

- global_identity (float)
- binding_site_conservation (float)
- final_score (float, 0-100)
- confidence (string — one of "high", "medium", "low")
- evidence_breakdown (list of dicts with type, value, confidence_tag)

**Does:** Computes the weighted score: 30% global identity + 70% binding-site conservation. Assigns a confidence tag based on data quality:

- High: binding-site annotations present, curated ortholog, alignment coverage > 80%
- Medium: one of the above is weaker
- Low: binding-site annotation missing, homology-based ortholog, or alignment coverage < 60%

**Dependencies:** None beyond the inputs.

#### 5.4.7 rank_species

**Inputs:** list_of_species_scores (list of SpeciesScore)

**Returns:** SpeciesRankingResult (the final Module 1 output)

**Does:** Sorts species by final_score descending. Builds the final result object including:

- target_uniprot_id
- target_gene_name
- ranked_species (list of SpeciesScore, ordered)
- best_model (species name with highest score)
- dropped_species (list of species with no ortholog)
- overall_confidence (string — lowest confidence across all ranked species)

**Dependencies:** None beyond the inputs.

### 5.5 Module 1 Output Schema (Summary)

The SpeciesRankingResult returned by Module 1 contains:

| Field | Type | Description |
|---|---|---|
| target_uniprot_id | string | Human target identifier |
| target_gene_name | string | e.g. "EGFR" |
| ranked_species | list | Ordered list of SpeciesScore objects |
| best_model | string | Species name with highest final_score |
| dropped_species | list | Species excluded due to missing ortholog |
| overall_confidence | string | Lowest confidence across ranked species |

Each SpeciesScore in ranked_species contains:

| Field | Type | Description |
|---|---|---|
| species | string | e.g. "zebrafish" |
| global_identity | float | Percentage |
| binding_site_conservation | float | Percentage |
| final_score | float | Weighted score 0-100 |
| confidence | string | "high" / "medium" / "low" |
| evidence_breakdown | list | Per-evidence detail with tags |

### 5.6 Module 1 Dependencies

| Dependency | Purpose |
|---|---|
| UniProt REST API | Human target sequence, ortholog lookup, ortholog sequences, binding-site annotations |
| Ensembl REST API | Backup ortholog lookup |
| Biopython | Pairwise alignment |
| Requests | HTTP calls |
| Pydantic | Output validation |
| NumPy | Score computation |

### 5.7 Module 1 Failure Modes

| Failure | Handling |
|---|---|
| Target not found in UniProt | Return structured error; do not proceed |
| No binding-site annotation for target | Fall back to domain-level scoring; mark confidence low |
| No ortholog for a species | Drop species; note in dropped_species |
| Ortholog has no binding-site annotation | Use position map to project human residues; mark confidence medium |
| Alignment coverage < 60% | Mark species confidence low |
| UniProt API timeout | Retry once; on second failure, use cached snapshot if available |

---

## Section 6 — Module 2: Drug Ranking Engine (DrugTarget AI)

### 6.1 Purpose

Given a human drug target and a list of candidate compounds, train a Random Forest on ChEMBL bioactivity for that target and rank the compounds by predicted activity probability. Add drug-likeness and Lipinski compliance as secondary scores.

### 6.2 Folder Ownership

backend/app/drug_targets/ and backend/app/scoring/ — Workstream 2.

### 6.3 Entry Function

**Name:** `rank_drugs_for_target`

**Inputs:**

- `target_chembl_id` (string) — ChEMBL target identifier, e.g. "CHEMBL203" for EGFR
- `candidate_smiles` (list of strings, optional) — if not provided, the engine uses ChEMBL's known actives as candidates

**Returns:** DrugRankingResult (Pydantic model, schema frozen in Section 10)

**Does:** Orchestrates the full Module 2 pipeline. Checks for a cached trained model for this target. If found, loads it and skips training. If not, runs the training pipeline. Then scores all candidate compounds and ranks them.

### 6.4 Internal Functions

#### 6.4.1 fetch_bioactivity_data

**Inputs:** target_chembl_id (string)

**Returns:** BioactivityDataset object containing:

- target_chembl_id
- compounds (list of dicts with smiles, chembl_id, ic50_nm, label)
- active_count (int)
- inactive_count (int)
- retrieval_timestamp (string)

**Does:** Calls ChEMBL REST API for all bioactivity records where the target matches. Filters for IC50 measurements. Labels compounds as active if IC50 < 100 nM, inactive if IC50 > 10,000 nM. Compounds in the ambiguous middle range are excluded.

**Dependencies:** ChEMBL REST API, Pandas, Requests.

**Failure behavior:** If fewer than 50 active compounds are returned, training is not reliable. The function returns the dataset but flags insufficient_data: true. The entry function then falls back to similarity-based ranking against known actives.

#### 6.4.2 generate_fingerprints

**Inputs:** smiles_list (list of strings)

**Returns:** FingerprintMatrix object containing:

- fingerprints (2D array — rows = compounds, columns = 2048 bits)
- valid_indices (list of ints — which input SMILES were valid)
- invalid_smiles (list of strings — which were dropped)

**Does:** Uses RDKit to convert each SMILES string into a Morgan fingerprint (radius 2, 2048 bits). Invalid SMILES are dropped and recorded.

**Dependencies:** RDKit, NumPy.

#### 6.4.3 train_random_forest

**Inputs:** fingerprints (2D array), labels (list of ints — 0 or 1)

**Returns:** TrainedModel object containing:

- model (the trained Random Forest)
- training_accuracy (float)
- training_size (int)
- feature_count (int)
- trained_at (timestamp)

**Does:** Trains a scikit-learn Random Forest classifier with default hyperparameters. Records training accuracy as a sanity check. Does not perform hyperparameter tuning — default settings are sufficient for this build.

**Dependencies:** scikit-learn.

**Failure behavior:** If training accuracy is below 70%, the model is flagged as unreliable. The entry function still proceeds but marks all output scores with confidence low.

#### 6.4.4 cache_model

**Inputs:** target_chembl_id (string), trained_model (TrainedModel)

**Returns:** model_path (string)

**Does:** Serializes the trained model to models/<target_chembl_id>.pkl. On subsequent calls for the same target, load_cached_model retrieves it instead of retraining.

**Dependencies:** Python pickle or joblib.

#### 6.4.5 load_cached_model

**Inputs:** target_chembl_id (string)

**Returns:** TrainedModel or None

**Does:** Checks models/<target_chembl_id>.pkl. If it exists and is less than 24 hours old, loads and returns it. Otherwise returns None.

**Dependencies:** Python pickle or joblib, os.

#### 6.4.6 score_candidate_drugs

**Inputs:** candidate_smiles (list of strings), trained_model (TrainedModel)

**Returns:** DrugScoreList object containing a list of DrugScore objects, each with:

- smiles (string)
- chembl_id (string, if known)
- activity_probability (float, 0-1)
- drug_likeness_qed (float, 0-1)
- lipinski_pass (boolean)
- molecular_weight (float)
- confidence (string)
- evidence_breakdown (list of dicts)

**Does:** For each candidate SMILES: generates fingerprint, predicts activity probability, computes QED and Lipinski compliance via RDKit. Assigns confidence tags based on prediction probability margin.

**Dependencies:** RDKit, scikit-learn.

#### 6.4.7 rank_drugs

**Inputs:** drug_score_list (DrugScoreList)

**Returns:** DrugRankingResult (the final Module 2 output)

**Does:** Sorts compounds by activity_probability descending. Builds the final result object including:

- target_chembl_id
- target_gene_name
- ranked_drugs (list of DrugScore, ordered)
- top_recommendation (SMILES + ChEMBL ID of highest-scored drug)
- model_metadata (training accuracy, training size, trained_at)
- overall_confidence (string)

**Dependencies:** None beyond inputs.

### 6.5 Module 2 Output Schema (Summary)

The DrugRankingResult returned by Module 2 contains:

| Field | Type | Description |
|---|---|---|
| target_chembl_id | string | ChEMBL target identifier |
| target_gene_name | string | e.g. "EGFR" |
| ranked_drugs | list | Ordered list of DrugScore objects |
| top_recommendation | object | Best drug's SMILES + ChEMBL ID |
| model_metadata | object | Training accuracy, size, timestamp |
| overall_confidence | string | Lowest confidence across ranked drugs |

Each DrugScore in ranked_drugs contains:

| Field | Type | Description |
|---|---|---|
| smiles | string | Molecular structure |
| chembl_id | string | ChEMBL identifier if known |
| activity_probability | float | Predicted probability 0-1 |
| drug_likeness_qed | float | QED score 0-1 |
| lipinski_pass | boolean | Pass/fail drug-likeness rules |
| molecular_weight | float | Daltons |
| confidence | string | "high" / "medium" / "low" |
| evidence_breakdown | list | Per-evidence detail with tags |

### 6.6 Module 2 Dependencies

| Dependency | Purpose |
|---|---|
| ChEMBL REST API | Bioactivity data (IC50 values) |
| RDKit | SMILES -> Morgan fingerprints, QED, Lipinski |
| scikit-learn | Random Forest training and prediction |
| NumPy | Array operations |
| Pandas | Data cleaning and filtering |
| Requests | HTTP calls |
| Pydantic | Output validation |

### 6.7 Module 2 Failure Modes

| Failure | Handling |
|---|---|
| ChEMBL returns < 50 actives | Fall back to similarity-based ranking against known actives; mark confidence low |
| ChEMBL API timeout | Retry once; on second failure, use cached bioactivity snapshot if available |
| Invalid SMILES in candidate list | Drop compound; record in response metadata |
| Random Forest accuracy < 70% | Proceed but mark all scores confidence low |
| Model file corrupted | Retrain from scratch |
| No candidate SMILES provided | Use ChEMBL's top 10 known actives as candidates |

### 6.8 Retraining Behavior

Module 2 caches trained models per target. When the user submits a new target via /retrain:

1. Orchestrator calls rank_drugs_for_target with the new target_chembl_id.
2. load_cached_model returns None (no cache for new target).
3. fetch_bioactivity_data pulls ChEMBL data for the new target.
4. train_random_forest trains a fresh model.
5. cache_model saves it to models/<new_target_chembl_id>.pkl.
6. Full pipeline proceeds normally.

Retraining takes 30-90 seconds depending on ChEMBL response size and Random Forest training time.

---

## Section 7 — Shared Backend: Orchestrator & API

### 7.1 Purpose

The shared backend exposes HTTP endpoints that the frontend calls. It routes requests to the two engines, merges their outputs, caches results, and returns a single unified response. It contains no domain logic — all biological and chemical computation lives in the engines.

### 7.2 Folder Ownership

backend/app/api/ and backend/app/core/ — Workstream 3.

### 7.3 API Endpoints

#### 7.3.1 POST /analyze

**Accepts:**

- uniprot_id (string, required) — human target identifier
- chembl_id (string, optional) — if omitted, resolved from UniProt ID
- candidate_smiles (list of strings, optional) — if omitted, Module 2 uses ChEMBL actives

**Returns:** FullAnalysisResult (frozen schema in Section 10) containing both species_ranking and drug_ranking blocks plus a merged recommendation block.

**Does:**

1. Validates input with Pydantic.
2. Checks cache for this uniprot_id.
3. If cached and less than 1 hour old, returns cached result.
4. Otherwise calls rank_species_for_target (Module 1 entry).
5. Calls rank_drugs_for_target (Module 2 entry).
6. Merges both results into FullAnalysisResult.
7. Caches the merged result.
8. Returns response.

**Failure behavior:** If Module 1 fails entirely, returns a partial response with species_ranking: null and an error note. Same for Module 2. A single engine failure does not fail the whole request.

#### 7.3.2 POST /retrain

**Accepts:**

- uniprot_id (string, required)
- chembl_id (string, required)

**Returns:** FullAnalysisResult for the new target.

**Does:**

1. Clears cached results for the previous target (if any).
2. Deletes cached model file for the previous target (if any).
3. Calls rank_drugs_for_target with the new target — this forces retraining.
4. Returns the full merged result.

**Failure behavior:** If retraining fails (insufficient ChEMBL data), returns a structured error with retrain_status: "failed" and the reason.

#### 7.3.3 GET /species/{uniprot_id}

**Returns:** SpeciesRankingResult only (Module 1 output).

**Does:** Runs Module 1 alone. Useful for frontend Module 1 page to render without waiting for Module 2.

#### 7.3.4 GET /drugs/{chembl_id}

**Returns:** DrugRankingResult only (Module 2 output).

**Does:** Runs Module 2 alone. Useful for frontend Module 2 page.

#### 7.3.5 GET /targets

**Returns:** A static list of pre-validated targets the demo supports.

**Does:** Returns a small list containing at least:

- EGFR (P00533 / CHEMBL203)
- One backup target (to be confirmed: e.g. a kinase with clean ChEMBL data)

The frontend uses this list to populate the target selector.

#### 7.3.6 GET /health

**Returns:** Status of each engine and each external API.

**Does:** Pings UniProt, Ensembl, ChEMBL with lightweight requests. Returns a small status object:

- module_1_engine: "ok" / "degraded"
- module_2_engine: "ok" / "degraded"
- uniprot_api: "reachable" / "unreachable"
- chembl_api: "reachable" / "unreachable"
- cache_status: "warm" / "cold"

Used during the demo to check if APIs are live before triggering a run.

#### 7.3.7 POST /analyze-disease

**Accepts:**

- `disease_id` (string, required) — identifier matching an entry in `data/reference/disease_map.json`
- `protein_ids` (list of strings, optional) — if provided, overrides the default disease-to-protein mapping

**Returns:** DiseaseAnalysisResult (schema defined in Section 10) containing a list of FullAnalysisResult objects, one per protein.

**Behavior:**

1. Resolves `disease_id` to a list of UniProt IDs via `data/reference/disease_map.json`. If `protein_ids` is provided, uses that list instead.
2. Starts processing protein 1, returns **202 Accepted** with a `job_id`.
3. Frontend polls `GET /analyze-disease/{job_id}` for progressive results.
4. The orchestrator runs the single-protein pipeline (Module 1 + Module 2) for each protein sequentially.
5. Each completed protein result is appended to the job's result list.

#### 7.3.8 GET /analyze-disease/{job_id}

**Returns:** Partial DiseaseAnalysisResult with `completed_count` and the list of finished protein results so far.

**Does:** Used for progressive display. Frontend polls this endpoint to check which proteins have completed. When `completed_count == protein_count`, the analysis is finished.

### 7.4 Disease Map Resolution

The `disease_id` resolves to proteins via a static mapping file at `data/reference/disease_map.json`.

**Demo entries:**

| Disease ID | Disease Name | Proteins |
|---|---|---|
| NSCLC | Non-small cell lung cancer | EGFR (P00533), KRAS (P01116), ALK (Q9UM73) |
| EGFR_single | EGFR-driven cancer (single protein) | EGFR (P00533) |

Existing single-protein endpoints remain unchanged.

### 7.5 Orchestrator Function

**Name:** `run_full_analysis`

**Inputs:** uniprot_id, chembl_id (optional), candidate_smiles (optional)

**Returns:** FullAnalysisResult

**Does:**

1. Resolves ChEMBL ID from UniProt ID if not provided (uses UniProt cross-reference field).
2. Calls Module 1 entry function. Captures result or error.
3. Calls Module 2 entry function. Captures result or error.
4. Builds the recommendation block by combining Module 1's best_model and Module 2's top_recommendation.
5. Assembles FullAnalysisResult.
6. Writes to cache.
7. Returns result.

**Dependencies:** Module 1 entry, Module 2 entry, cache layer.

**Failure behavior:** Each engine call is wrapped in try/except. Engine failures become structured error blocks in the merged response, not exceptions.

### 7.6 Cache Layer

**Location:** backend/app/core/cache.py

**Storage:** In-memory dictionary for the current process, plus optional JSON file persistence in data/processed/cache/.

**Cache keys:**

- Analysis cache: `analysis:<uniprot_id>`
- Model cache: `model:<chembl_id>` (file path reference)

**Cache TTL:**

- Analysis results: 1 hour
- Trained models: 24 hours

**Functions:**

- `get_cached_analysis(uniprot_id)` -> FullAnalysisResult or None
- `set_cached_analysis(uniprot_id, result)` -> writes to cache
- `clear_cached_analysis(uniprot_id)` -> removes entry
- `clear_all_cache()` -> wipes cache (used in testing)

**Dependencies:** Python datetime, json, os.

### 7.7 Error Handling

Uniform error schema (applies to all endpoints):

| Field | Type | Description |
|---|---|---|
| error | boolean | Always true for errors |
| error_code | string | Short code, e.g. "TARGET_NOT_FOUND", "CHEMBL_TIMEOUT", "INSUFFICIENT_DATA" |
| error_message | string | Human-readable description |
| partial_result | object or null | Any partial data that succeeded before the error |

Error codes:

| Code | Meaning |
|---|---|
| TARGET_NOT_FOUND | UniProt ID does not resolve |
| NO_ORTHOLOGS | Module 1 found no orthologs in any species |
| CHEMBL_TIMEOUT | ChEMBL API did not respond in time |
| CHEMBL_EMPTY | ChEMBL returned zero bioactivity records for the target |
| INSUFFICIENT_DATA | Fewer than 50 actives; Random Forest training unreliable |
| MODEL_TRAINING_FAILED | Random Forest training threw an exception |
| INVALID_SMILES | All candidate SMILES strings were invalid |
| INTERNAL_ERROR | Catch-all for unhandled exceptions |

### 7.8 Configuration

**Location:** backend/app/core/config.py

**Contents:**

- API base URLs for UniProt, Ensembl, ChEMBL
- Cache TTL values
- Retry counts and timeouts for each external API
- Active/inactive IC50 thresholds (100 nM / 10,000 nM)
- Minimum active compound count for reliable training (50)
- Random Forest default hyperparameters
- Model storage directory path

**Rule:** No hardcoded constants anywhere else in the codebase. All thresholds and URLs come from config.

---

## Section 8 — Evidence Confidence System

### 8.1 Purpose

Every score produced by either module carries a confidence tag. The tag tells the frontend — and the judges — how trustworthy that score is and where it came from. This is the traceability layer that makes the whole system explainable.

### 8.2 The Four Tags

| Tag | Symbol | Meaning | Applied When |
|---|---|---|---|
| Experimental | Green | Backed by direct experimental measurement | ChEMBL IC50 value; curated binding-site annotation; curated ortholog relationship |
| Literature | Yellow | Backed by published research or curated database | Domain annotation from UniProt; homology-based ortholog; alignment coverage 60-80% |
| Computational | Blue | Inferred from sequence or structure | Position-mapped binding-site conservation; alignment coverage < 60%; prediction from model with accuracy < 80% |
| AI-prioritized | Orange | Produced by the ML model | Random Forest activity probability; any output derived from the trained model |

### 8.3 Where Tags Appear

Every evidence_breakdown entry in both modules includes a confidence_tag field. The overall confidence field on each species score or drug score is the lowest tag present in its evidence breakdown (conservative aggregation).

### 8.4 Aggregation Rule

When multiple evidence types contribute to a single score:

- If any contributing evidence is AI-prioritized (orange), the overall tag is at most AI-prioritized unless all others are Experimental (green).
- If any contributing evidence is Computational (blue), the overall tag cannot be Experimental (green).
- The overall tag is the minimum of all contributing tags, with one exception: a green experimental score combined with orange AI-prioritized score yields yellow overall (not orange), because the experimental anchor lifts confidence.

**Rationale:** Conservative. If we are not sure, we say so.

### 8.5 Frontend Display

Tags appear as colored dots next to every numeric score. Hovering a dot shows a tooltip with the evidence type and source. The evidence breakdown panel lists every contributing evidence item with its tag, value, and source.

### 8.6 Module 1 Tag Assignment

| Evidence | Default Tag |
|---|---|
| UniProt curated binding-site annotation | Experimental (green) |
| UniProt domain annotation | Literature (yellow) |
| Curated ortholog (Ensembl homology) | Experimental (green) |
| Homology-based ortholog | Literature (yellow) |
| Alignment identity percentage | Computational (blue) |
| Binding-site conservation percentage (direct annotation) | Experimental (green) |
| Binding-site conservation percentage (position-mapped) | Computational (blue) |
| Final weighted score | Lowest of contributing tags |

### 8.7 Module 2 Tag Assignment

| Evidence | Default Tag |
|---|---|
| ChEMBL IC50 experimental value | Experimental (green) |
| ChEMBL assay description (literature) | Literature (yellow) |
| Random Forest activity probability | AI-prioritized (orange) |
| Drug-likeness QED | Computational (blue) |
| Lipinski compliance | Computational (blue) |
| Training accuracy > 85% | Model outputs can be AI-prioritized (orange) |
| Training accuracy 70-85% | Model outputs become Computational (blue) |
| Training accuracy < 70% | All outputs Computational (blue), overall confidence low |
| Final weighted score | Lowest of contributing tags |

---

## Section 9 — Data Sources & External APIs

### 9.1 UniProt REST API

**Base URL:** https://rest.uniprot.org

**Endpoints used:**

- GET /uniprotkb/{uniprot_id} — fetch a single protein entry
- GET /uniprotkb/search?query=... — search by gene name + organism
- GET /idmapping/run + GET /idmapping/status/{job_id} — ortholog mapping

**Fields extracted:**

- primaryAccession — UniProt ID
- genes[].geneName.value — gene name
- proteinDescription.recommendedName.fullName.value — protein name
- sequence.value — amino acid sequence
- sequence.length — sequence length
- features[] where type == "Binding site" — binding-site residues
- features[] where type == "Domain" — domain boundaries
- uniProtKBCrossReferences[] where database == "ChEMBL" — ChEMBL target ID

**Authentication:** None required.

**Rate limits:** 100 requests/second for the REST API. No API key needed for moderate usage.

**Fallback:** Cache the full UniProt response in data/raw/uniprot/ for the demo targets. If the API is unreachable during the demo, load from cache.

### 9.2 Ensembl REST API

**Base URL:** https://rest.ensembl.org

**Endpoints used:**

- GET /homology/id/{species}/{gene_id} — ortholog lookup
- GET /sequence/id/{gene_id} — sequence retrieval (backup)

**Fields extracted:**

- homologies[].target.id — ortholog gene ID
- homologies[].target.species — species name
- homologies[].type — "ortholog_one2one" or "ortholog_one2many"
- homologies[].target.protein_id — ortholog protein ID

**Authentication:** None required.

**Rate limits:** 15 requests/second. 55,000 requests/hour.

**Fallback:** Cache ortholog mappings for demo targets.

### 9.3 ChEMBL REST API

**Base URL:** https://www.ebi.ac.uk/chembl/api/data

**Endpoints used:**

- GET /activity?target_chembl_id={id}&standard_type=IC50 — bioactivity records
- GET /molecule/{chembl_id} — molecule metadata
- GET /target/{chembl_id} — target metadata

**Fields extracted:**

- activities[].standard_value — IC50 in nM
- activities[].standard_units — should be "nM"
- activities[].canonical_smiles — molecule SMILES
- activities[].molecule_chembl_id — ChEMBL molecule ID
- activities[].assay_description — assay context

**Authentication:** None required.

**Rate limits:** 1,000 requests/day per IP for unauthenticated access. For higher limits, register for a free API key.

**Pagination:** ChEMBL returns results in pages of 20 by default. The engine must paginate using limit=1000 and offset parameters to retrieve all records for a target. EGFR has thousands of records, so pagination is mandatory.

**Fallback:** Download the full EGFR bioactivity dataset once and store in data/raw/chembl/egfr_bioactivity.csv. The engine loads from this file if the API is unreachable.

### 9.4 Data Snapshot Strategy

Before the hackathon starts, download and store:

| File | Contents | Purpose |
|---|---|---|
| data/raw/uniprot/egfr.json | Full UniProt entry for P00533 | Module 1 fallback |
| data/raw/uniprot/orthologs.json | Ortholog entries for chicken, zebrafish, fruit fly | Module 1 fallback |
| data/raw/chembl/egfr_bioactivity.csv | All EGFR IC50 records | Module 2 fallback |
| data/reference/human_egfr_segment.fasta | Short segment around EGFR kinase domain | DNA visualization |
| data/reference/zebrafish_egfr_segment.fasta | Corresponding zebrafish segment | DNA visualization |
| data/reference/chicken_egfr_segment.fasta | Corresponding chicken segment | DNA visualization |
| data/reference/fruit_fly_egfr_segment.fasta | Corresponding fruit fly segment | DNA visualization |

These snapshots are read-only during the demo. The engines prefer live API calls but fall back to snapshots on failure.

### 9.5 Multi-Protein Disease Data Snapshots

Pre-download bioactivity data for all proteins in the demo disease (EGFR, KRAS, ALK) before the hackathon:

- Store in `data/raw/chembl/{protein_name}_bioactivity.csv`:
  - `data/raw/chembl/egfr_bioactivity.csv`
  - `data/raw/chembl/kras_bioactivity.csv`
  - `data/raw/chembl/alk_bioactivity.csv`
- Pre-download UniProt entries for all demo disease proteins:
  - `data/raw/uniprot/egfr.json`
  - `data/raw/uniprot/kras.json`
  - `data/raw/uniprot/alk.json`
- Pre-warm the cache for all demo disease proteins so the multi-protein backup runs in under 10 seconds.

### 9.6 Cross-Reference Resolution

**UniProt ID -> ChEMBL target ID mapping:**

UniProt entries include cross-references to ChEMBL in the uniProtKBCrossReferences array.

For EGFR (P00533), the ChEMBL target is CHEMBL203.

The orchestrator resolves this automatically. If the cross-reference is missing, the orchestrator falls back to searching ChEMBL by gene name.

---

## Section 10 — JSON Schemas & Integration Contracts

### 10.1 Purpose

This section defines the exact JSON shapes that flow between engines, the API layer, and the frontend. No agent may change these schemas after hour 2 without team approval. These schemas are the merge contract.

### 10.2 FullAnalysisResult (top-level response)

| Field | Type | Required | Description |
|---|---|---|---|
| target_uniprot_id | string | yes | Human target identifier |
| target_chembl_id | string | yes | Resolved ChEMBL target |
| target_gene_name | string | yes | e.g. "EGFR" |
| species_ranking | SpeciesRankingResult or null | yes | Module 1 output; null if Module 1 failed |
| drug_ranking | DrugRankingResult or null | yes | Module 2 output; null if Module 2 failed |
| recommendation | Recommendation | yes | Merged final recommendation |
| analysis_timestamp | string (ISO 8601) | yes | When the analysis ran |
| errors | list of ErrorBlock | yes | Empty if no errors |

### 10.3 SpeciesRankingResult (Module 1 output)

| Field | Type | Required | Description |
|---|---|---|---|
| target_uniprot_id | string | yes | Human target |
| target_gene_name | string | yes | Gene name |
| ranked_species | list of SpeciesScore | yes | Ordered descending by final_score |
| best_model | string | yes | Species name with highest score |
| dropped_species | list of string | yes | Species excluded due to missing ortholog |
| overall_confidence | string | yes | "high" / "medium" / "low" |

### 10.4 SpeciesScore

| Field | Type | Required | Description |
|---|---|---|---|
| species | string | yes | "chicken" / "zebrafish" / "fruit_fly" |
| global_identity | float | yes | Percentage 0-100 |
| binding_site_conservation | float | yes | Percentage 0-100 |
| final_score | float | yes | Weighted score 0-100 |
| confidence | string | yes | "high" / "medium" / "low" |
| evidence_breakdown | list of EvidenceItem | yes | Per-evidence detail |
| alignment_preview | AlignmentPreview | yes | Short alignment for UI |

### 10.5 AlignmentPreview

| Field | Type | Required | Description |
|---|---|---|---|
| human_segment | string | yes | Short segment of human sequence |
| ortholog_segment | string | yes | Corresponding ortholog segment |
| binding_site_positions | list of int | yes | Positions within the segment |
| differences | list of Difference | yes | Positions where residues differ |

### 10.6 Difference

| Field | Type | Required | Description |
|---|---|---|---|
| position | int | yes | Position within the segment |
| human_residue | string | yes | One-letter code |
| ortholog_residue | string | yes | One-letter code |

### 10.7 DrugRankingResult (Module 2 output)

| Field | Type | Required | Description |
|---|---|---|---|
| target_chembl_id | string | yes | ChEMBL target |
| target_gene_name | string | yes | Gene name |
| ranked_drugs | list of DrugScore | yes | Ordered descending by activity_probability |
| top_recommendation | TopDrug | yes | Highest-scored drug |
| model_metadata | ModelMetadata | yes | Training info |
| overall_confidence | string | yes | "high" / "medium" / "low" |

### 10.8 DrugScore

| Field | Type | Required | Description |
|---|---|---|---|
| smiles | string | yes | Molecular structure |
| chembl_id | string or null | yes | ChEMBL molecule ID if known |
| activity_probability | float | yes | 0-1 |
| drug_likeness_qed | float | yes | 0-1 |
| lipinski_pass | boolean | yes | Pass/fail |
| molecular_weight | float | yes | Daltons |
| confidence | string | yes | "high" / "medium" / "low" |
| evidence_breakdown | list of EvidenceItem | yes | Per-evidence detail |
| structure_format | string | yes | "smiles" (frontend converts to 3D) |

### 10.9 TopDrug

| Field | Type | Required | Description |
|---|---|---|---|
| smiles | string | yes | Best drug SMILES |
| chembl_id | string or null | yes | ChEMBL ID |
| activity_probability | float | yes | 0-1 |

### 10.10 ModelMetadata

| Field | Type | Required | Description |
|---|---|---|---|
| training_accuracy | float | yes | 0-1 |
| training_size | int | yes | Number of compounds |
| active_count | int | yes | Actives in training set |
| inactive_count | int | yes | Inactives in training set |
| trained_at | string (ISO 8601) | yes | Timestamp |
| model_cached | boolean | yes | Whether loaded from cache |

### 10.11 EvidenceItem

| Field | Type | Required | Description |
|---|---|---|---|
| type | string | yes | e.g. "binding_site_annotation", "sequence_alignment", "chembl_ic50", "random_forest_prediction" |
| value | float or string | yes | The measured or computed value |
| unit | string or null | yes | e.g. "percent", "nM", "probability" |
| source | string | yes | e.g. "uniprot", "chembl", "alignment", "random_forest" |
| confidence_tag | string | yes | "experimental" / "literature" / "computational" / "ai_prioritized" |

### 10.12 Recommendation (merged block)

| Field | Type | Required | Description |
|---|---|---|---|
| best_species | string or null | yes | From Module 1 best_model |
| best_drug_smiles | string or null | yes | From Module 2 top_recommendation.smiles |
| best_drug_chembl_id | string or null | yes | From Module 2 |
| combined_confidence | string | yes | Lowest confidence across both modules |
| summary_text | string | yes | Human-readable recommendation, e.g. "Test Drug C in chicken cells first." |

### 10.13 ErrorBlock

| Field | Type | Required | Description |
|---|---|---|---|
| error_code | string | yes | From Section 7.7 |
| error_message | string | yes | Human-readable |
| module | string | yes | "module_1" / "module_2" / "orchestrator" |

### 10.14 DiseaseAnalysisResult (NEW)

| Field | Type | Required | Description |
|---|---|---|---|
| disease_id | string | yes | Identifier matching disease_map.json |
| disease_name | string | yes | Human-readable disease name |
| protein_count | int | yes | Number of proteins in this disease |
| protein_results | list of FullAnalysisResult | yes | One per protein, in processing order |
| completed_count | int | yes | How many proteins have finished processing |
| aggregation | AggregationResult or null | yes | Disease-level aggregation; null if not built |
| analysis_timestamp | string (ISO 8601) | yes | When the analysis started |
| errors | list of ErrorBlock | yes | Empty if no errors |

This schema nests the existing FullAnalysisResult schema. No existing schema changes.

### 10.15 AggregationResult (NEW — Stretch Goal)

**Stretch — build only if time allows.**

| Field | Type | Required | Description |
|---|---|---|---|
| method | string | yes | Always "vote_top3" |
| ranked_drugs | list of AggregatedDrug | yes | Drugs ranked by appearance count |
| ranked_species | list of AggregatedSpecies | yes | Species ranked by appearance count |
| disclaimer | string | yes | Fixed disclaimer text (see below) |

**AggregatedDrug fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| chembl_id | string | yes | ChEMBL molecule identifier |
| appearance_count | int | yes | How many proteins this drug appears in the top 3 for |
| proteins_matched | list of string | yes | Which proteins (gene names) |

**AggregatedSpecies fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| species | string | yes | Species name |
| appearance_count | int | yes | How many proteins this species appears in the top 3 for |
| proteins_matched | list of string | yes | Which proteins (gene names) |

**Disclaimer text (fixed, verbatim):**

> "This aggregation is a prioritization heuristic. It does not claim that any drug will cure the disease or that any species is a universal model. It identifies compounds and species that rank consistently across the disease's proteins."

**Aggregation method — vote-based:**

1. Collect all `ranked_drugs[].chembl_id` from all proteins in the disease.
2. Count how many proteins each drug appears in the top 3 for.
3. Rank drugs by appearance count descending.
4. Return the top 3 as "golden drugs."

The aggregation does NOT claim polypharmacology. It claims only that these drugs are consistently ranked highly across the disease's proteins.

If aggregation is not built, the `aggregation` field in DiseaseAnalysisResult is `null`.

### 10.16 Integration Contract Rules

These rules are non-negotiable:

- Module 1 output schema is SpeciesRankingResult. Module 1 must not emit any other top-level shape.
- Module 2 output schema is DrugRankingResult. Module 2 must not emit any other top-level shape.
- The orchestrator merges both into FullAnalysisResult. No other merging path exists.
- The frontend consumes only FullAnalysisResult. Individual module endpoints (/species, /drugs) return the module schemas directly for standalone use.
- Field names are exact. No synonyms, no abbreviations, no casing changes. activity_probability is not activityProbability or prob.
- confidence_tag values are exactly: "experimental", "literature", "computational", "ai_prioritized". Not "high", not "green".
- confidence values on scores are exactly: "high", "medium", "low". Not "experimental".
- Timestamps are ISO 8601 strings in UTC. Not Unix epoch, not local time.
- Null vs. missing: Optional fields that are unavailable are set to null, not omitted. This keeps the frontend predictable.
- Lists are never null. Empty lists are [], not null.

### 10.17 Module 1 <-> Module 2 Shared Keys

The two modules never call each other, but they share three identifiers that must match exactly:

| Key | Source | Used By |
|---|---|---|
| target_uniprot_id | Human target | Module 1, orchestrator, frontend |
| target_chembl_id | Resolved from UniProt cross-reference | Module 2, orchestrator, frontend |
| target_gene_name | From UniProt | Module 1, Module 2, orchestrator, frontend |

The orchestrator is responsible for resolving target_chembl_id from target_uniprot_id before calling Module 2. Neither module resolves the other's identifier.

### 10.18 Frontend Consumption Rules

The frontend must:

- Read only FullAnalysisResult from /analyze.
- Render species_ranking.ranked_species in the heat map and species table.
- Render drug_ranking.ranked_drugs in the drug table and 3D viewer.
- Use recommendation.summary_text as the headline on the dashboard.
- Use evidence_breakdown[].confidence_tag to color every score badge.
- Never compute scores independently — all scores come from the backend.
- Never call external APIs directly — only the backend API.

### 10.19 Schema Freeze Rule

After hour 2 of the hackathon:

- No field may be renamed.
- No field may be removed.
- No field type may change.
- New optional fields may be added only if all five workstreams agree.
- The schema files in backend/app/core/schemas/ are the single source of truth.

Any violation causes integration failure. The freeze exists to prevent exactly that.

---

## Section 11 — Frontend: Visualization Layer

### 11.1 Purpose

The frontend is the judge-facing surface. It consumes only FullAnalysisResult from the backend and renders species ranking, drug ranking, and the merged recommendation. It never calls external APIs directly and never computes biological scores — every number it displays comes from the backend.

### 11.2 Folder Ownership

frontend/ — Workstreams 4 and 5.

Workstream 4 owns the Module 1 page (species ranking, heat map, alignment view).

Workstream 5 owns the Module 2 page (drug ranking, 3D molecules) and the dashboard shell that links both pages.

Both workstreams share the same Next.js project. They do not edit each other's page components.

### 11.3 Pages and Routes

| Route | Owner | Purpose |
|---|---|---|
| / | Workstream 5 | Dashboard shell with target selector, headline recommendation, links to both module pages |
| /species | Workstream 4 | Module 1 page — species ranking, heat map, alignment view |
| /drugs | Workstream 5 | Module 2 page — drug ranking, 3D molecule viewer |
| /targets | Workstream 5 | Target selector (static list from GET /targets) |
| /disease | Workstream 5 | Disease page — multi-protein progressive display |

### 11.4 Shared Layout Components

These are owned by Workstream 5 and used by both module pages.

| Component | Purpose |
|---|---|
| AppShell | Top navigation, page container, shared styling |
| TargetSelector | Dropdown that loads targets from GET /targets; triggers /analyze on change |
| ConfidenceBadge | Renders a colored dot with tooltip showing evidence type |
| EvidenceBreakdownPanel | Expandable panel listing every EvidenceItem for a score |
| LoadingOverlay | Full-page overlay while /analyze is running |
| ErrorBanner | Displays ErrorBlock entries from the response |
| RetrainButton | Triggers /retrain when a new target is selected |

### 11.5 Module 1 Page — Species Ranking

#### 11.5.1 Layout

Three sections stacked vertically:

1. **Headline block** — target name, gene name, best model species, overall confidence badge.
2. **Species ranking table** — one row per species with columns: species, global identity, binding-site conservation, final score, confidence badge, expand button.
3. **Visualization block** — heat map on the left, alignment view on the right.

#### 11.5.2 Heat Map

**Library:** Plotly.

**Data source:** species_ranking.ranked_species[].alignment_preview.binding_site_positions and the corresponding residues.

**What it shows:** A 2D grid where:

- Rows = species (human first, then ranked species descending).
- Columns = binding-site residue positions (from binding_site_positions).
- Cell color = conservation level (green for identical to human, yellow for similar, red for different).
- Cell text = one-letter amino acid code.

**Interaction:** Hovering a cell shows a tooltip with position, human residue, ortholog residue, and confidence tag.

**Fallback:** If alignment_preview is missing for a species, that row is greyed out with a "no alignment data" note.

#### 11.5.3 Alignment View

**Library:** Custom React component with monospace rendering (no external library needed).

**Data source:** species_ranking.ranked_species[].alignment_preview.human_segment and .ortholog_segment, plus .differences.

**What it shows:** Two aligned sequences stacked vertically, one character per position. Positions listed in differences are highlighted in red. Binding-site positions are underlined.

**Interaction:** Scrollable horizontally. A legend explains the highlighting.

#### 11.5.4 Species Ranking Table

**Data source:** species_ranking.ranked_species.

**Columns:**

- Species name
- Global identity (global_identity + %)
- Binding-site conservation (binding_site_conservation + %)
- Final score (final_score + /100)
- Confidence badge (from confidence)
- Expand button -> opens EvidenceBreakdownPanel for that species

**Sorting:** Fixed — backend already returns species in ranked order. Frontend does not re-sort.

### 11.6 Module 2 Page — Drug Ranking

#### 11.6.1 Layout

Three sections stacked vertically:

1. **Headline block** — target name, top recommendation SMILES preview, model metadata (training accuracy, training size), overall confidence badge.
2. **Drug ranking table** — one row per drug with columns: rank, ChEMBL ID, activity probability, QED, Lipinski pass, molecular weight, confidence badge, expand button.
3. **Visualization block** — 3D molecule viewer on the left, evidence breakdown panel on the right.

#### 11.6.2 3D Molecule Viewer

**Library:** 3Dmol.js.

**Data source:** drug_ranking.ranked_drugs[].smiles.

**What it does:**

- Takes the SMILES string for the selected drug.
- Uses 3Dmol.js to generate 3D coordinates.
- Renders a ball-and-stick model in an interactive canvas.

**Interaction:**

- Rotate: drag.
- Zoom: scroll.
- Reset view: button.
- Switch drug: click a row in the drug ranking table -> viewer reloads with that drug's SMILES.

**Fallback:** If 3Dmol.js fails to generate coordinates (rare, but possible for unusual molecules), the viewer shows a 2D structure image fetched from ChEMBL's image endpoint (https://www.ebi.ac.uk/chembl/api/data/image/{chembl_id}.svg).

#### 11.6.3 Drug Ranking Table

**Data source:** drug_ranking.ranked_drugs.

**Columns:**

- Rank (1, 2, 3, ...)
- ChEMBL ID (or "unknown" if null)
- Activity probability (rendered as a horizontal bar + number)
- QED (number 0-1)
- Lipinski pass (green check / red X)
- Molecular weight (number + "Da")
- Confidence badge
- Expand button -> opens EvidenceBreakdownPanel for that drug

**Sorting:** Fixed — backend returns drugs in ranked order.

#### 11.6.4 Model Metadata Block

**Data source:** drug_ranking.model_metadata.

**Shows:**

- Training accuracy (percentage)
- Training set size (number of compounds)
- Active count / inactive count
- Trained at (timestamp)
- Whether loaded from cache (model_cached)

This block is important for judges — it makes the ML transparent.

### 11.7 Dashboard Shell

**Route:** /

**Data source:** FullAnalysisResult from /analyze.

**What it shows:**

- TargetSelector at the top.
- recommendation.summary_text as the headline.
- Two large cards linking to /species and /drugs, each showing a preview:
  - Species card: best model name + final score + confidence badge.
  - Drug card: top drug ChEMBL ID + activity probability + confidence badge.
- combined_confidence badge.
- RetrainButton to run a new target.

**Interaction:** Clicking a card navigates to that module's page with the same analysis data already loaded (no refetch).

### 11.8 Disease Page — Multi-Protein Progressive Display

**Route:** /disease

**Data source:** DiseaseAnalysisResult from GET /analyze-disease/{job_id}.

**Layout:**

- **Disease header** — shows the disease name at the top.
- **Protein card list** — shows a list of proteins in the disease, each with its own result card.
- As each protein's analysis completes, its card populates in place. The remaining cards show a loading state (skeleton / spinner).

**Each protein card shows:**

- Protein name (gene name)
- Best model species (from species_ranking.best_model)
- Top drug (ChEMBL ID + activity probability)
- Confidence badge (combined_confidence)
- Link to full species page (/species) for that protein
- Link to full drug page (/drugs) for that protein

**Single-protein behavior:** If the disease has only one protein, the page shows a single card (same layout as dashboard).

**Click-through:** The user can click into any protein card to see the full Module 1 and Module 2 results for that protein.

### 11.9 Golden Drugs Block (Stretch Goal)

**Stretch — build only if time allows.**

**Location:** Optional block at the bottom of the /disease page.

**Header:** "Golden Drugs"

**Data source:** DiseaseAnalysisResult.aggregation (AggregationResult).

**What it shows:**

- A ranked list of drugs that appear in the top 3 for multiple proteins.
- Each entry shows: ChEMBL ID, appearance count, which proteins matched.
- A species agreement panel showing which species rank consistently across proteins.
- The disclaimer text (verbatim from Section 10.15).

**If aggregation is not built:** This block does not render. The `aggregation` field is `null`.

### 11.10 State Management

**Approach:** React Context for the current FullAnalysisResult.

**Flow:**

1. User selects a target -> TargetSelector calls POST /analyze.
2. Response stored in context.
3. All pages read from context.
4. Selecting a new target or clicking RetrainButton replaces the context value.

No global state library (no Redux, no Zustand). React Context is sufficient for this scope.

### 11.11 Loading and Error States

#### 11.11.1 Loading

While /analyze or /retrain is in flight, LoadingOverlay covers the screen.

During loading, the overlay shows:

- A rotating 3D decorative molecule (preloaded from data/reference/decorative_molecules/).
- A cycling text line: "Fetching sequences... Aligning... Scoring... Training model... Ranking..."

**Rationale:** A 30-90 second wait feels long. Showing activity prevents judges from thinking the app is frozen.

#### 11.11.2 Error Handling

If /analyze returns errors: [] but one module is null, the corresponding page shows a degraded state:

- The working module renders normally.
- The failed module shows an ErrorBanner with the error_code and error_message.
- The dashboard shows a partial recommendation with a note.

If /analyze itself fails (network error), the frontend falls back to a cached analysis stored in localStorage from the last successful run. If no cache exists, it shows a full-page error with a retry button.

### 11.12 Static Fallback Data

For demo safety, the frontend includes a bundled fallback-analysis.json file containing a complete FullAnalysisResult for EGFR. If all API calls fail during the demo, the user can load this file via a hidden button in the dashboard (e.g., pressing a keyboard shortcut).

This ensures the demo never fully breaks.

### 11.13 Frontend Constraints

- No direct calls to UniProt, Ensembl, or ChEMBL.
- No score computation in the frontend. All numbers come from the backend.
- No re-sorting of backend-ranked lists.
- No mutation of the response object — read-only.
- No external visualization libraries beyond Plotly and 3Dmol.js.
- No authentication, no login screen, no user accounts.

---

## Section 12 — Demo Flow & Fallback Strategy

### 12.1 Demo Objective

In 3-4 minutes, show the judges that the system:

1. Takes a real human target.
2. Ranks real model organisms using real biological data.
3. Ranks real candidate drugs using a real trained model.
4. Produces an explainable, confidence-tagged recommendation.
5. Can retrain on a new target in under 90 seconds.

### 12.2 Demo Strategy

- The live demo uses a single-protein disease (EGFR) for time.
- The multi-protein capability is mentioned verbally, not shown live.
- If a judge asks to see multi-protein, a pre-cached 2-protein disease can be shown as backup (from `data/reference/nsclc_cache/`).

### 12.3 Demo Roles

| Role | Responsibility |
|---|---|
| Narrator | Talks through the demo, does not click |
| Driver | Clicks, navigates, rotates molecules |
| Backup | Ready to load fallback file if anything breaks |
| Timekeeper | Watches the clock, signals at 3:00 and 3:30 |

**Rule:** The narrator must not be the driver. Splitting these roles is mandatory.

**Rule:** Every explanation line corresponds to something visible on screen. Never explain what isn't being shown. Never show what isn't being explained.

### 12.4 Pre-Demo Checklist (Run 15 Minutes Before)

| Check | Command / Action | Expected Result |
|---|---|---|
| Backend running | uvicorn app.main:app --reload | Server starts on port 8000 |
| Frontend running | npm run dev | Next.js starts on port 3000 |
| Health check | Open /health endpoint | All engines ok, all APIs reachable |
| Cache warm | Trigger /analyze once for EGFR | Response returns in under 5 seconds |
| Model cached | Confirm models/CHEMBL203.pkl exists | File present |
| Fallback loaded | Confirm fallback-analysis.json present in frontend | File bundled |
| Browser tabs ready | Tab 1: dashboard, Tab 2: species page, Tab 3: drugs page | All load without errors |

### 12.5 Demo Script (Minute by Minute)

**Minute 0:00 — Setup Line**

"95% of drugs that pass animal testing fail in human trials. One reason is that the animal's version of the drug target isn't the same as the human's. We built a system that ranks which animal is the best model for a given target, and which drugs are most worth testing first."

**Minute 0:20 — Dashboard**

- Open the dashboard.
- Point to the target selector. EGFR is pre-selected.
- Point to the headline: recommendation.summary_text.
- Point to the two cards: species preview and drug preview.

**Minute 0:40 — Module 1 Page**

- Navigate to /species.
- Point to the species ranking table: Chicken 94%, Zebrafish 88%, Fruit fly 71%.
- Point to the confidence badges: green for chicken and zebrafish, yellow for fruit fly.
- Point to the heat map: green cells where residues match, red where they differ.
- Point to the alignment view: highlight the binding-site positions.
- **Key line:** "Zebrafish is only 63% identical to human overall, but 90% identical in the binding site. Our system catches that because we weight binding-site conservation at 70%."

**Minute 1:40 — Module 2 Page**

- Navigate to /drugs.
- Point to the model metadata block: training accuracy, training size.
- Point to the drug ranking table: Drug C 91%, Drug A 87%, Drug F 74%.
- Click Drug C -> 3D viewer loads the molecule.
- Rotate the molecule with the mouse.
- Expand the evidence breakdown for Drug C.
- **Key line:** "The model was trained on real ChEMBL bioactivity data for EGFR in under 60 seconds. Every score is traceable."

**Minute 2:40 — Dashboard Recommendation**

- Return to dashboard.
- Point to the final recommendation: "Test Drug C in chicken cells first."
- Point to the combined_confidence badge.

**Minute 3:00 — Multi-Protein Explanation + Retrain Demo**

- **Explanation line:** "We're demoing one protein, but the same pipeline scales. If a disease involves three proteins, the orchestrator runs all three in sequence and returns progressive results. We're keeping the demo to EGFR for time."
- Click RetrainButton.
- Select the backup target.
- Optional: If time allows, wait for the new analysis (~60-90 seconds). If not, mention that retraining runs in under 90 seconds and that the same pipeline applies.

**Minute 3:30 — Closing Line**

"This is not a drug discovery tool. It's a prioritization tool. It tells labs where to start. Every score is explainable, every source is traceable, and the whole pipeline runs on a laptop."

### 12.6 Fallback Triggers and Responses

| Trigger | Response |
|---|---|
| /analyze takes longer than 90 seconds | Switch to the cached analysis from the pre-demo warm-up |
| ChEMBL API unreachable | Engine loads data/raw/chembl/egfr_bioactivity.csv and continues |
| UniProt API unreachable | Engine loads data/raw/uniprot/egfr.json and continues |
| Module 2 fails entirely | Dashboard shows Module 1 results and an ErrorBanner for Module 2 |
| Module 1 fails entirely | Dashboard shows Module 2 results and an ErrorBanner for Module 1 |
| Both modules fail | Load fallback-analysis.json via keyboard shortcut |
| Frontend crashes | Restart with npm run dev; state is lost but re-analysis takes under 10 seconds with warm cache |
| Wi-Fi down entirely | Use the fallback file; the demo still shows the full interface and results |

### 12.7 Preloaded Fallback Data

Bundled with the frontend:

| File | Contents |
|---|---|
| fallback-analysis.json | Complete FullAnalysisResult for EGFR, generated during pre-demo warm-up |
| decorative_molecules/ | 5-10 preloaded 3D molecule files for the loading overlay |
| reference_segments/ | Short FASTA segments for human, chicken, zebrafish, fruit fly EGFR binding sites |

### 12.8 What Not to Do During the Demo

- Do not claim the system discovers drugs.
- Do not claim clinical relevance.
- Do not claim the ML model is novel.
- Do not apologize for missing features.
- Do not go into implementation details unless asked.
- Do not scroll through code.
- Do not run /analyze live for a new target unless the cache is warm and the backup target has been tested.

### 12.9 Answering Likely Judge Questions

| Question | Answer |
|---|---|
| "Why these four species?" | "They cover an evolutionary gradient from close (chicken) to far (fruit fly). Zebrafish is the primary screening model. Fruit fly stress-tests extreme distance." |
| "Why EGFR?" | "It has approved drugs, a well-characterized binding site, and validated cross-species conservation in zebrafish. It's the cleanest validation case." |
| "Is the ML model novel?" | "No. Random Forest on Morgan fingerprints is the standard baseline in cheminformatics. The novelty is the cross-species binding-site weighting, not the ML." |
| "What if I want a different target?" | "The system retrains on that target's ChEMBL data in under 90 seconds. Same pipeline, different data." |
| "Does this replace animal testing?" | "No. It helps researchers choose which animal to test in, so fewer animals are used and fewer experiments fail." |
| "How do you know it works?" | "Our ranking for EGFR matches published biology: zebrafish is 63% identical overall but 90% identical in the kinase domain. Our system catches that." |
| "What's the confidence tag system?" | "Every score is tagged by evidence quality: experimental, literature, computational, or AI-prioritized. Conservative aggregation means if we're unsure, we say so." |

### 12.10 Demo Timing Budget

| Segment | Target Duration |
|---|---|
| Setup and framing | 20 seconds |
| Dashboard overview | 20 seconds |
| Module 1 walkthrough | 60 seconds |
| Module 2 walkthrough | 60 seconds |
| Recommendation + multi-protein explanation + retrain | 40 seconds |
| Closing line | 20 seconds |
| **Total** | **3 minutes 40 seconds** |

Leaves ~20 seconds of buffer for questions or delays.

### 12.11 Post-Demo State

After the demo:

- Do not modify the codebase.
- Do not run additional analyses unless requested.
- Keep the backend and frontend running in case judges ask follow-up questions.
- Keep the fallback file accessible.
- Keep the health endpoint open in a browser tab.

---

## Section 13 — Build Plan: 5-Person Parallel Workstreams

### 13.1 Purpose

This section defines who builds what, in which folder, in what order, and how the five workstreams merge without conflicts. The plan assumes a 24-hour window and five people working in parallel with agentic coding tools.

### 13.2 Build Tier System

| Tier | Priority | Contents |
|---|---|---|
| **Tier 1** (must build) | Mandatory — never cut | Single-protein pipeline, Module 1, Module 2, /analyze endpoint, confidence tags, fallback analysis file |
| **Tier 2** (should build) | Expected — cut only if Tier 1 incomplete | Multi-protein orchestrator, /analyze-disease endpoint, /disease frontend page with progressive display |
| **Tier 3** (stretch) | Stretch — build only if time allows | Golden drug aggregation, species agreement panel |

**Rules:**

- Do not start Tier 2 until Tier 1 is fully working and demo-tested three times.
- Do not start Tier 3 until Tier 2 is fully working.
- If time runs out, Tier 3 is cut first. Then Tier 2. Tier 1 is never cut.

### 13.3 Workstream Ownership

| Workstream | Owner Folder(s) | Module |
|---|---|---|
| 1 | backend/app/genomics/, backend/app/proteins/, data/reference/ | Module 1 — Species Ranking |
| 2 | backend/app/drug_targets/, backend/app/scoring/, models/ | Module 2 — Drug Ranking |
| 3 | backend/app/api/, backend/app/core/ | Shared Backend — Orchestrator & API |
| 4 | frontend/ (species page) | Frontend Module 1 |
| 5 | frontend/ (drugs page + dashboard shell) | Frontend Module 2 + Shell |

### 13.4 Workstream Dependencies

| Workstream | Depends On | Depended On By |
|---|---|---|
| 1 | Section 10 schemas | Workstream 3 (merge), Workstream 4 (render) |
| 2 | Section 10 schemas | Workstream 3 (merge), Workstream 5 (render) |
| 3 | Workstreams 1 + 2 entry function signatures | Workstreams 4 + 5 |
| 4 | Workstream 3 (working /species and /analyze endpoints) | -- |
| 5 | Workstream 3 (working /drugs and /analyze endpoints) | -- |

### 13.5 Hour-by-Hour Plan

**Hour 0-1: Alignment and Setup**

All five workstreams:

- Confirm Python 3.12 environment, activate .venv.
- Confirm Node.js environment for frontend.
- Clone the repository.
- Read Sections 1-10 of this report.
- Confirm folder ownership — no cross-folder edits.

Deliverable: All five environments running. No code written yet.

**Hour 1-2: Schema Lock and Mock Endpoints**

Workstream 3:

- Implement Pydantic models for all schemas in Section 10.
- Build stub /analyze, /species, /drugs, /targets, /health endpoints.
- Return hardcoded mock FullAnalysisResult for EGFR.

Workstreams 4 and 5:

- Wait for the mock endpoints.
- Begin frontend scaffolding while endpoints come online.

Deliverable: Mock endpoints returning valid schema-shaped responses. Schema locked.

**Critical checkpoint:** After hour 2, no schema changes without team agreement.

**Hour 2-6: Core Engine Implementation**

Workstream 1:

- Implement fetch_human_target, find_orthologs, fetch_ortholog_sequence.
- Implement align_sequences with Biopython.
- Implement map_binding_site and score_species.
- Implement rank_species entry function.
- Test against EGFR (P00533) end-to-end.

Workstream 2:

- Implement fetch_bioactivity_data with ChEMBL pagination.
- Implement generate_fingerprints with RDKit.
- Implement train_random_forest.
- Implement score_candidate_drugs and rank_drugs.
- Test against EGFR (CHEMBL203) end-to-end.

Workstream 3:

- Wire /analyze to call both engines once they return real data.
- Implement cache layer.
- Implement error handling.

Workstreams 4 and 5:

- Build page shells, layout components, and confidence badge component.
- Render mock data from Workstream 3's endpoints.

Deliverable: Both engines return real schema-shaped data for EGFR.

**Hour 6-10: Integration and First Working Demo**

Workstream 3:

- Replace mock endpoints with real engine calls.
- Implement run_full_analysis orchestrator.
- Implement /retrain.

Workstreams 4 and 5:

- Replace mock rendering with real data rendering.
- Implement heat map (Workstream 4).
- Implement 3D molecule viewer (Workstream 5).
- Implement evidence breakdown panels.

Deliverable: Full pipeline running end-to-end for EGFR. First demo attempt.

**Hour 10-14: Visualization Polish and Fallback Data**

Workstream 1:

- Prepare data/reference/*.fasta segments for all four species.
- Refine binding-site mapping logic.

Workstream 2:

- Cache trained model for EGFR.
- Verify retraining works for backup target.

Workstreams 4 and 5:

- Polish heat map interactivity.
- Polish 3D viewer controls.
- Add loading overlay with decorative molecule.
- Add error states.

Workstream 3:

- Add /health endpoint with real API pings.
- Add fallback data loading.

Deliverable: Polished UI. Fallback data ready.

**Hour 14-18: Testing and Bug Fixes (Tier 1 Complete)**

All workstreams:

- Run integration tests.
- Test each failure mode listed in Sections 5.7 and 6.7.
- Test the demo flow end-to-end.
- Verify cache behavior.
- Verify retrain behavior.
- **Demo-test Tier 1 three times. All three must pass before proceeding to Tier 2.**

Deliverable: Demo runs cleanly three times in a row. Tier 1 confirmed.

**Hour 18-21: Tier 2 — Multi-Protein Support (if Tier 1 passes)**

Workstream 3:

- Implement /analyze-disease endpoint and disease-level orchestrator.
- Implement GET /analyze-disease/{job_id} for polling.

Workstream 5:

- Build /disease page with progressive protein card display.

All workstreams:

- Run the full demo script from Section 12.5.
- Time each segment.
- Practice answering judge questions from Section 12.9.
- Verify fallback triggers work.

Deliverable: Demo runs in under 4 minutes. Multi-protein pipeline functional.

**Hour 21-23: Buffer and Final Prep (Tier 3 if time allows)**

All workstreams:

- If Tier 2 is fully working: attempt Tier 3 (golden drug aggregation).
- Fix any last-minute bugs.
- Pre-warm cache.
- Confirm fallback-analysis.json is bundled.
- Confirm /health returns all green.

Deliverable: System is demo-ready.

**Hour 23-24: Freeze**

All workstreams:

- No code changes.
- No feature additions.
- Backend and frontend running.
- Browser tabs open.

Deliverable: Frozen, running system.

### 13.6 Merge Rules

| Rule | Reason |
|---|---|
| No agent edits outside its owned folder | Prevents merge conflicts |
| Commit every 2 hours minimum | Limits conflict size |
| Pull before push | Standard Git hygiene |
| No force pushes | Preserves history |
| No rebase after hour 12 | Freezes history for the demo |
| Schema changes require all five owners to agree | Protects integration |
| New fields must be optional | Backward compatibility |
| Test files live in tests/ with test_<module>.py naming | Uniform discovery |

### 13.7 Integration Checkpoints

| Hour | Checkpoint | Pass Condition |
|---|---|---|
| 2 | Schema locked | All five workstreams agree on Section 10 schemas |
| 6 | Module 1 returns real data | /species/P00533 returns valid SpeciesRankingResult |
| 6 | Module 2 returns real data | /drugs/CHEMBL203 returns valid DrugRankingResult |
| 10 | /analyze merges both | Returns valid FullAnalysisResult |
| 14 | Frontend renders real data | Both pages display live analysis |
| 18 | Demo runs cleanly | Three consecutive successful runs |
| 22 | Fallback verified | Simulated API failure triggers fallback |

### 13.8 Communication Protocol

- One shared chat channel for the team.
- One pinned message with the schema (Section 10) and folder ownership.
- Any agent blocked for more than 30 minutes raises it in chat.
- Any schema ambiguity is resolved by Workstream 3, who owns the orchestrator.
- Any engine output ambiguity is resolved by the owning workstream.

### 13.9 What Each Workstream Must Not Do

| Workstream | Must Not |
|---|---|
| 1 | Edit Module 2 folders, edit schemas, call ChEMBL |
| 2 | Edit Module 1 folders, edit schemas, call UniProt |
| 3 | Implement domain logic, edit engine folders, edit frontend |
| 4 | Edit Module 2 frontend components, call external APIs |
| 5 | Edit Module 1 frontend components, call external APIs |

### 13.10 Agent Prompt Template

Each workstream's agent is given:

- This entire report.
- The folder path it owns.
- The entry function signature it must expose.
- The schema it must return.
- The list of dependencies it may call.
- The list of folders it must not touch.

No agent is given freedom to redesign the schema. The schema is the merge contract.

---

## Section 14 — Validation Strategy

### 14.1 Purpose

This section defines how we prove the system works. Validation is not a formality — it is the answer to the judge question "how do you know this is right?" Every claim in the demo must trace to a validation point.

### 14.2 Validation Claims

| Claim | Validation Method |
|---|---|
| Module 1 ranks species using real biological data | Run on EGFR; confirm sequences fetched from UniProt match published entries |
| Module 1 correctly weights binding-site conservation | Confirm zebrafish EGFR is ranked as a strong model, matching published literature |
| Module 2 trains on real ChEMBL data | Confirm EGFR bioactivity dataset contains thousands of IC50 measurements |
| Module 2 produces stable rankings | Retrain twice on same target; verify rankings match |
| Retraining works | Run /retrain on a second target; verify new model trains in under 90 seconds |
| Confidence tags are accurate | Manually verify a sample of evidence tags against their sources |
| Demo is reproducible | Run the full demo three times; results match each run |

### 14.3 Primary Validation: EGFR + Zebrafish

**Claim:** Zebrafish is a good model organism for EGFR drug testing.

**Published evidence:**

- Zebrafish EGFR shares approximately 63% overall sequence identity with human EGFR.
- Zebrafish EGFR kinase domain (where Gefitinib and Erlotinib bind) shares approximately 90% identity with human.
- Zebrafish has been used experimentally in EGFR-related research, including glioma and hematopoiesis studies.

**How we validate:**

1. Module 1 runs on EGFR (P00533).
2. Zebrafish ortholog is fetched from UniProt/Ensembl.
3. Alignment scores are computed.
4. Binding-site conservation is computed.
5. If our system ranks zebrafish highly (top 2 species), the validation passes.

**Pass condition:** Zebrafish ranks in the top 2 species by final_score.

**Fail condition:** Zebrafish ranks below fruit fly. If this happens, either the ortholog was wrong or the scoring weights need adjustment.

### 14.4 Secondary Validation: Chicken as Close Relative

**Claim:** Chicken, being an amniote, should show higher global identity to human than zebrafish or fruit fly.

**Published evidence:**

- Chicken shares a more recent common ancestor with humans than zebrafish or fruit fly.
- Global sequence identity for conserved proteins is typically higher in chicken than in zebrafish.

**How we validate:**

- Compare global_identity values across species.
- Chicken should have the highest global_identity.
- This may or may not correlate with final_score — binding-site conservation is weighted higher.

**Pass condition:** Chicken has the highest global_identity among the three non-human species.

**Note:** If chicken scores lower than zebrafish in final_score but higher in global_identity, this is expected and correct — it demonstrates that the binding-site weighting matters.

### 14.5 Module 2 Validation: ChEMBL Data Integrity

**Claim:** Module 2 trains on real ChEMBL bioactivity data.

**How we validate:**

1. Fetch bioactivity for EGFR (CHEMBL203).
2. Confirm the dataset has at least 500 active compounds (IC50 < 100 nM).
3. Confirm the dataset has at least 500 inactive compounds (IC50 > 10,000 nM).
4. Confirm training accuracy is at least 80% on the training set.

**Pass condition:** All four numbers meet the thresholds.

**Fail condition:** Fewer than 500 actives. If this happens, the target has insufficient data and a backup target must be used.

### 14.6 Ranking Stability Validation

**Claim:** Module 2 produces stable rankings.

**How we validate:**

1. Train Random Forest on EGFR.
2. Score a fixed set of 10 candidate drugs.
3. Retrain with the same data.
4. Score the same 10 drugs again.
5. Compare rankings.

**Pass condition:** Top 3 drugs are identical across both runs.

**Fail condition:** Top 3 differ. If this happens, fix the Random Forest random seed and retrain.

### 14.7 Retrain Validation

**Claim:** The system can retrain on a new target in under 90 seconds.

**How we validate:**

1. Pick a backup target with clean ChEMBL data.
2. Trigger /retrain.
3. Time the full pipeline.
4. Confirm the response returns with a new DrugRankingResult.

**Pass condition:** Response time under 90 seconds. New model file exists in models/.

**Fail condition:** Response time over 90 seconds. If this happens, reduce the training set or cache more aggressively.

### 14.8 Confidence Tag Validation

**Claim:** Confidence tags reflect evidence quality.

**How we validate:**

1. Sample 5 evidence items from Module 1 and 5 from Module 2.
2. Manually check each against its source.
3. Verify the tag matches the source quality.

**Pass condition:** All 10 sample tags are correct.

**Fail condition:** Any tag is wrong. Fix the tag assignment logic and re-run.

### 14.9 Demo Reproducibility Validation

**Claim:** The demo produces consistent results.

**How we validate:**

1. Run the full demo script three times in a row.
2. Record the top species and top drug each time.
3. Confirm they match across all three runs.

**Pass condition:** Top species and top drug identical across all three runs.

**Fail condition:** Results differ. If this happens, cache the analysis and freeze the model before the demo.

### 14.10 What Validation Does Not Claim

The system does not claim:

- Clinical efficacy.
- That top-ranked drugs will work in humans.
- That top-ranked species will produce successful animal studies.
- That the ML model is more accurate than existing tools.
- That the binding-site conservation score is biologically definitive.

Validation claims only that the system correctly computes what it says it computes and produces consistent results on the demo target.

---

## Section 15 — Constraints, Risks & Non-Goals

### 15.1 Purpose

This section defines what we are explicitly not building, what can go wrong, and how we handle it. It exists to prevent scope creep and to make failure modes explicit before the demo.

### 15.2 Explicit Non-Goals

The following are permanently out of scope for this build:

| Non-Goal | Reason |
|---|---|
| Virtual mutation lab | Would require structural modeling, out of time budget |
| Full structural biology / PDB integration | Out of time budget |
| Bioactive molecule registry (snake venom, cone snail, Gila monster) | Wrong direction of the bridge |
| Animal-derived peptide analysis | Different ML pipeline; not compatible with Random Forest |
| Multi-target generic model | Target-specific design is intentional |
| Deep learning (PyTorch, Transformers) | Overkill; Random Forest is sufficient |
| 3D protein structure visualization | 3D molecules yes; 3D proteins no |
| User accounts, authentication | No users; hackathon demo only |
| Database | JSON files on disk only |
| Docker, Kubernetes, cloud deployment | Runs locally |
| Mobile app | Desktop browser only |
| Real-time collaboration | Single-user demo |
| Clinical claims of any kind | Research-prioritization only |
| **Polypharmacology claims** | **The system does not claim that any single drug hits multiple proteins in a disease. The aggregation is a prioritization heuristic, not evidence of multi-target activity.** |
| **Cure claims** | **The aggregation is a prioritization heuristic, not a treatment recommendation. No drug is claimed to cure a disease.** |

### 15.3 Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ChEMBL API slow or unreachable during demo | Medium | High | Pre-download EGFR bioactivity; fallback to local CSV |
| UniProt API slow or unreachable | Medium | High | Pre-download UniProt entries for demo targets |
| Zebrafish ortholog not found | Low | High | Pre-verify ortholog exists before hackathon |
| Random Forest training takes too long | Low | Medium | Cache trained model for EGFR; verify retrain timing |
| Frontend crash during demo | Medium | High | Bundled fallback JSON; restart with warm cache |
| Integration failure between modules | Medium | High | Schema locked by hour 2; integration checkpoints |
| Wi-Fi down entirely | Medium | High | Full fallback analysis file bundled with frontend |
| Agent edits outside its folder | Medium | Medium | Git rules; folder ownership in prompt |
| Schema changed after hour 2 | Low | High | Freeze rule; team approval required |
| Demo overruns 4 minutes | Medium | Low | Time each segment; rehearse |
| Judge asks about a feature we dropped | High | Low | Pre-written answer: "That's the roadmap, not the build" |
| Team member unavailable during demo | Low | High | Every workstream documents its entry point; any teammate can run the demo |
| Browser runs out of memory with 3D molecule viewer | Low | Medium | Limit viewer to one molecule at a time; dispose resources on switch |

### 15.4 Known Limitations

| Limitation | Impact | Acceptable? |
|---|---|---|
| Only 4 species supported | Cannot test arbitrary species | Yes — demo is EGFR-specific |
| Only target-specific ML | Retrain required for new target | Yes — 90-second retrain is fast enough |
| Random Forest only | No deep learning | Yes — standard cheminformatics baseline |
| No structural validation | Binding-site inference is sequence-based | Yes — sequence conservation is a valid proxy |
| No wet-lab validation | Predictions are computational | Yes — research-prioritization tool, not clinical |
| No literature mining | Evidence comes from ChEMBL/UniProt only | Yes — sufficient for demo |
| No user input for custom compounds | Default to ChEMBL actives | Yes — accept optional SMILES in API |
| **Aggregation is vote-based only** | **Does not use structural or chemical similarity across targets. If a drug appears in the top 3 for multiple proteins, it may be coincidence or may reflect broad-spectrum activity. The system does not distinguish these cases.** | **Yes — clearly labeled as heuristic** |

### 15.5 Assumptions

| Assumption | If Wrong |
|---|---|
| ChEMBL has > 500 actives for EGFR | Use backup target with more data |
| UniProt has binding-site annotations for EGFR | Fall back to domain-level scoring |
| Zebrafish has a curated ortholog for EGFR | Use Ensembl homology; if missing, drop zebrafish |
| Demo laptop can run Python + Node + browser simultaneously | Reduce frontend to single-page layout |
| Wi-Fi available during demo | Use fallback analysis file |
| All five team members available for the full 24 hours | Redistribute workstreams |

### 15.6 Kill Criteria

The following conditions would require dropping a feature:

| Feature | Kill If |
|---|---|
| Fruit fly species | Ortholog lookup fails or sequence too divergent to align |
| 3D molecule viewer | 3Dmol.js fails on demo molecules; fall back to static ChEMBL images |
| Heat map | Plotly integration too slow; fall back to alignment view only |
| Retrain demo | Retraining takes over 120 seconds; skip live retrain and mention it verbally |
| Chicken species | Chicken ortholog not found; drop to 3 species |

Each kill criterion has a fallback already defined. No feature is load-bearing for the demo.

### 15.7 Non-Negotiable Features

The following cannot be dropped:

| Feature | Reason |
|---|---|
| Module 1 species ranking | Core of the demo |
| Module 2 drug ranking | Core of the demo |
| Confidence tags | Key differentiator vs. black-box tools |
| /analyze endpoint | Demo trigger |
| Fallback analysis file | Demo safety net |
| Schema freeze | Integration guarantee |

### 15.8 Time Budget Risk

If the team falls behind schedule:

| Hour | If Behind |
|---|---|
| Hour 6 | Cut Module 2 to similarity-based ranking instead of Random Forest |
| Hour 10 | Cut heat map; use alignment view only |
| Hour 14 | Cut retrain demo; mention verbally |
| Hour 18 | Cut 3D molecule viewer; use 2D ChEMBL images |
| Hour 20 | Cut one species (fruit fly); run with three species |
| Hour 22 | Run demo from fallback file only |

Each cut preserves the core demo.

---

## Section 16 — Glossary of Frozen Terms

### 16.1 Purpose

This section locks vocabulary so agents and team members use identical terms. Synonyms cause integration bugs. These definitions are authoritative.

### 16.2 Core Terms

| Term | Frozen Definition |
|---|---|
| Target | The human protein a drug acts on. Identified by a UniProt ID. |
| Human target | The reference protein. All species are compared against this. |
| Ortholog | The version of the target protein in another species. |
| Species | One of: human, chicken, zebrafish, fruit fly. |
| Binding site | The residues in the target protein where the drug attaches. Identified from UniProt feature annotations. |
| Conservation | How similar the target protein (or its binding site) is between species. Expressed as a percentage. |
| Global identity | Percentage of the full protein sequence that matches between human and ortholog. |
| Binding-site conservation | Percentage of binding-site residues that match between human and ortholog. |
| Final score | Weighted score combining global identity (30%) and binding-site conservation (70%). 0-100. |
| Model organism | The species chosen for lab testing. Recommended by the system, decided by the researcher. |
| Candidate drug | A compound submitted to Module 2 for scoring. Can be SMILES string or ChEMBL ID. |
| Activity probability | Module 2's prediction of whether a compound is active against the target. 0-1. |
| QED | Quantitative Estimate of Drug-likeness. 0-1. Higher is more drug-like. |
| Lipinski pass | Whether the compound satisfies Lipinski's rule of five. Boolean. |
| Confidence tag | The quality label attached to every score. One of: experimental, literature, computational, ai_prioritized. |
| Evidence breakdown | The list of contributing evidence items behind a score. |
| Retrain | Rebuilding the Random Forest for a new target. |
| Cache | Stored results from a previous analysis. Used to speed up repeat queries. |
| Fallback | Pre-downloaded data used when an API is unreachable. |
| Orchestrator | The backend component that calls Module 1 and Module 2 and merges their outputs. |
| **Disease** | **A medical condition that may involve one or more proteins.** |
| **Disease map** | **A static file mapping a disease ID to a list of UniProt IDs.** |
| **Progressive display** | **Rendering each protein's result as it completes, without waiting for all proteins to finish.** |
| **Golden drug** | **A compound that ranks in the top 3 for multiple proteins in a disease, identified by vote-based aggregation.** |
| **Aggregation** | **The process of combining per-protein results into a disease-level summary. Vote-based only. Does not claim polypharmacology.** |
| **Tier 1 / Tier 2 / Tier 3** | **Build priority levels. Tier 1 is mandatory. Tier 2 is expected. Tier 3 is stretch.** |

### 16.3 Terms With Specific Meanings

These terms look generic but have frozen meanings in this project:

| Term | Frozen Meaning | Not This |
|---|---|---|
| Score | Always a 0-100 value with an attached confidence tag | Not a raw probability |
| Probability | Always a 0-1 value from the ML model | Not the same as "score" |
| Ranking | Descending order by score, assigned by the backend | Not re-sorted by frontend |
| Confidence | A categorical label: high / medium / low | Not a percentage |
| Tag | Always refers to the confidence tag system | Not a Git tag |
| Module | Module 1 or Module 2 | Not a Python module |
| Engine | The implementation of a module inside its folder | Not a search engine |
| Snapshot | A pre-downloaded dataset for fallback | Not a screen capture |
| Full analysis | The merged result from both modules | Not just Module 1 |

### 16.4 Abbreviations

| Abbreviation | Meaning |
|---|---|
| EGFR | Epidermal Growth Factor Receptor (the demo target) |
| UniProt | Universal Protein Resource (target data source) |
| ChEMBL | Chemical database of bioactive molecules |
| Ensembl | Genome and orthology database |
| IC50 | Half-maximal inhibitory concentration (activity measure) |
| nM | Nanomolar |
| QED | Quantitative Estimate of Drug-likeness |
| RF | Random Forest |
| API | Application Programming Interface |
| JSON | JavaScript Object Notation (data interchange format) |
| UI | User Interface |
| TTL | Time To Live (cache expiration) |
| PDB | Protein Data Bank (not used in this build) |

### 16.5 Forbidden Synonyms

These pairs must not be used interchangeably. The left column is canonical.

| Use This | Not This |
|---|---|
| target | protein, gene, marker |
| species | organism, animal |
| confidence tag | confidence label, confidence color |
| activity probability | activity score, binding probability |
| final score | overall score, total score |
| evidence breakdown | evidence list, evidence detail |
| retrain | retraining, rebuild model |
| fallback | backup data, cached data |
| cache | memory, store |
| orchestrator | coordinator, controller, manager |
| ranked_species | species_list, species_array |
| ranked_drugs | drugs_list, drug_array |
| **disease** | **condition, indication** |
| **golden drug** | **best drug, universal drug, cure** |
| **aggregation** | **fusion, merge, combination** |

### 16.6 Field Name Reference

These field names appear in the JSON schemas. They must not be renamed.

| Field Name | Used In |
|---|---|
| target_uniprot_id | FullAnalysisResult, SpeciesRankingResult |
| target_chembl_id | FullAnalysisResult, DrugRankingResult |
| target_gene_name | All results |
| ranked_species | SpeciesRankingResult |
| ranked_drugs | DrugRankingResult |
| best_model | SpeciesRankingResult |
| top_recommendation | DrugRankingResult |
| final_score | SpeciesScore |
| activity_probability | DrugScore |
| confidence | SpeciesScore, DrugScore |
| confidence_tag | EvidenceItem |
| evidence_breakdown | SpeciesScore, DrugScore |
| alignment_preview | SpeciesScore |
| model_metadata | DrugRankingResult |
| combined_confidence | Recommendation |
| summary_text | Recommendation |

### 16.7 Version Control Terms

| Term | Meaning |
|---|---|
| Frozen | Cannot be changed after the freeze hour |
| Locked | Same as frozen, used for schemas |
| Checkpoint | A time-based integration milestone |
| Workstream | One of the five parallel build tracks |
| Owner | The workstream that owns a folder |

### 16.8 Rule

If a term is not in this glossary, ask the Workstream 3 owner. Do not invent new terms. Do not use synonyms. The glossary exists to keep five parallel agents building compatible code.

---

## Changelog

| Section | Change | Change ID |
|---|---|---|
| **Section 1** | Renamed all occurrences of "GeneBridge-X + DrugTarget AI" / "GeneBridge-X" to "PhyloTargetX". Updated one-liner, direction, final project statement. Added Section 1.3 (Multi-Protein Disease Support) and Section 1.6 (Final Project Statement). | 1, 2, 12, 13 |
| **Section 2** | Added Section 2.3 (Disease-Level Orchestration). Added /analyze-disease to API layer diagram. Renamed "DrugTarget AI" references to "DrugTarget AI" only where it refers to the ML module specifically. | 2 |
| **Section 4** | Renamed top-level directory to PhyloTargetX. Added Section 4.5 (Additional Files) for disease_map.json, nsclc_cache/, disease.jsx. Expanded directory tree with multi-protein data files. | 10 |
| **Section 6** | Added "(DrugTarget AI)" to section title to preserve ML module name. | 1 |
| **Section 7** | Added Sections 7.3.7 (POST /analyze-disease), 7.3.8 (GET /analyze-disease/{job_id}), 7.4 (Disease Map Resolution) with demo disease entries. | 2 |
| **Section 9** | Added Section 9.5 (Multi-Protein Disease Data Snapshots) for EGFR, KRAS, ALK pre-downloads. | 11 |
| **Section 10** | Added Section 10.14 (DiseaseAnalysisResult schema), Section 10.15 (AggregationResult schema with stretch-goal marking, vote-based method, disclaimer text). | 4, 5 |
| **Section 11** | Added /disease route to Pages table. Added Section 11.8 (Disease Page — Multi-Protein Progressive Display), Section 11.9 (Golden Drugs Block — Stretch Goal). | 3, 4 |
| **Section 12** | Added Section 12.2 (Demo Strategy), Section 12.3 (Demo Roles table). Updated demo script minute 3:00 with multi-protein explanation line. Added "never explain / never show" rule. | 6 |
| **Section 13** | Added Section 13.2 (Build Tier System) with Tier 1/2/3 and rules. Restructured hour-by-hour plan to gate Tier 2 on Tier 1 passing three demo tests. | 7 |
| **Section 15** | Added polypharmacology claims and cure claims to Explicit Non-Goals table. Added vote-based aggregation limitation to Known Limitations table. | 8 |
| **Section 16** | Added 6 new glossary terms (Disease, Disease map, Progressive display, Golden drug, Aggregation, Tier 1/2/3). Added 3 forbidden synonym pairs (disease, golden drug, aggregation). | 9 |
