# PhyloTargetX — Frontend UI/UX Specification

This document defines the visual style, user journey, and specific webpage functionalities for the PhyloTargetX frontend.

---

## 1. Design System & Theme: "Clinical Ethereal"

The aesthetic is designed to feel like a high-end, premium biotech tool. It avoids bright neons and harsh dark modes in favor of soft, trustworthy, and clinical visuals.

### 1.1 Color Palette
- **Backgrounds:** Soft Alabaster (`#FAFAFA`) and Pale Clinical Blue (`#F0F4F8`).
- **Primary Accent (High Compatibility):** Soft Sage Green (`#A3C9A8`). Used to represent high sequence matches, strong AI confidence, and positive progress.
- **Secondary Accent (Low Compatibility/Warning):** Soft Coral/Salmon (`#FFA69E`). Used to draw attention to sequence mismatches or low AI confidence without being aggressive.
- **Text:** Deep Slate Blue (`#2C3E50`) for primary text and headings, Charcoal (`#333333`) for secondary text. No pure black (`#000000`).

### 1.2 UI Materials & Aesthetics
- **Glassmorphism:** UI panels, cards, and floating elements use a frosted glass effect (backdrop-filter: blur) with subtle semi-transparent white borders.
- **Typography:** Clean, geometric sans-serif (e.g., `Inter` or `Outfit`).
- **CSS Strategy:** Vanilla CSS / CSS Modules (TailwindCSS is avoided).

### 1.3 3D & Interactive Elements
- **Library:** `react-three-fiber` and `Three.js`.
- **Materials:** Physical materials with transmission (glass-like refraction) for 3D UI elements to match the glassmorphism theme.

---

## 2. The User Journey (Sequential Flow)

Unlike a standard static dashboard, the application follows a guided, narrative "wizard" flow. For a multi-protein disease, the user is guided through the analysis of each protein sequentially before arriving at a final conclusive report.

**Flow:** Dashboard -> Select Disease -> Protein 1 (Animals -> Drugs) -> Protein 2 (Animals -> Drugs) -> Final Report.

---

## 3. Webpages and Functionalities

The application consists of 3 primary route structures.

### Page 1: Dashboard / Landing (`/`)
The entry point of the application designed for immediate visual impact.
- **Visuals:** A full-screen, interactive, scrollable 3D background featuring a glowing DNA double helix constructed from thousands of slowly drifting particles.
- **Functionality:** 
  - Welcomes the user.
  - Presents a clean, frosted-glass dropdown to select a Disease or Target (e.g., "Non-small cell lung cancer (NSCLC)").
  - A prominent "Start Analysis" button that triggers the transition. As the user clicks, the DNA particles seamlessly dissolve and transition into the analysis phase.

### Page 2: The Analysis Wizard (`/analysis`)
This is a dynamic, stateful page that loops through each protein associated with the selected disease. It has distinct phases for Animals and Drugs.

#### Phase 2A: Animal Model Ranking
- **Loading State:** 
  - Displays premium frosted-glass spheres orbiting each other in 3D space. Each sphere contains a minimalist, pastel-colored abstract icon or silhouette representing the model organisms (Chicken, Zebrafish, Fruit Fly).
- **Results Display:**
  - **Layout:** The highest-ranked (most compatible) animal is displayed prominently at the top/center. The lower-ranked animals are listed below it.
  - **3D Visualization:** Next to each animal is a spinning 3D DNA molecule representing sequence conservation.
    - **100% Match:** The DNA ladder is completely Soft Sage Green.
    - **Partial Match (e.g., 80%):** The DNA ladder is mostly green, but a proportionate number of rungs/strands are colored Soft Coral to visually indicate mismatches in the binding site.
  - **Action:** A "Proceed to Drug Discovery" button.

#### Phase 2B: Drug Candidate Ranking
- **Loading State:**
  - 3D molecular structures assembling, loading, and circling on screen.
- **Results Display:**
  - **Layout:** Displays the top-ranked ChEMBL drugs.
  - **3D Visualization:** Displays the 3D molecular structure (ball-and-stick) for the top candidates.
  - **AI Confidence indicator:** Instead of specific atoms turning red (since this is an ML probability score, not a structural alignment), the bonds of the molecule or a subtle aura around the molecule pulses. 
    - High probability pulses calming Sage Green.
    - Low probability/uncertainty pulses with a Coral hue.
  - **Action:** "Next Protein" (if more proteins remain in the disease) or "View Final Report" (if all proteins are processed).

### Page 3: The Final Report (`/report`)
The conclusive summary of the entire journey.
- **Visuals:** Styled to look like a premium physical lab report or a sleek medical receipt.
- **Functionality:**
  - Summarizes all proteins analyzed.
  - Lists the top recommended animal model and top drug candidates for each protein.
  - Displays the "Golden Drugs" (drugs that ranked highly across multiple proteins in the disease, if applicable).
  - **Action:** "Download Report" button to export the receipt as a formatted PDF.
  - **Action:** "Start New Analysis" to return to the Dashboard.

---

## 4. Animation and Transitions
- **Framer Motion** will be used to handle page transitions and UI staggering.
- The transition between loading states and results should feel seamless, with 3D elements morphing or snapping into their UI containers.
