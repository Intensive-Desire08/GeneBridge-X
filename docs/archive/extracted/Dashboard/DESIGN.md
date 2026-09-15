---
name: Clinical Ethereal
colors:
  surface: '#f7f9ff'
  surface-dim: '#c9dcf3'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4ff'
  surface-container: '#e3efff'
  surface-container-high: '#d9eaff'
  surface-container-highest: '#d1e4fb'
  on-surface: '#091d2e'
  on-surface-variant: '#424842'
  inverse-surface: '#203243'
  inverse-on-surface: '#e8f2ff'
  outline: '#727971'
  outline-variant: '#c2c8bf'
  surface-tint: '#44664b'
  primary: '#44664b'
  on-primary: '#ffffff'
  primary-container: '#a3c9a8'
  on-primary-container: '#33553b'
  inverse-primary: '#aad0af'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#406748'
  on-tertiary: '#ffffff'
  tertiary-container: '#9fcaa4'
  on-tertiary-container: '#305638'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c5ecca'
  primary-fixed-dim: '#aad0af'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#2c4e35'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#c2edc5'
  tertiary-fixed-dim: '#a6d1ab'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#294f31'
  background: '#f7f9ff'
  on-background: '#091d2e'
  surface-variant: '#d1e4fb'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-precision, serene digital environment tailored for molecular biologists, structural biochemists, and pharmaceutical researchers navigating complex protein target landscapes. It replaces dense, visually fatiguing scientific legacy tools with an ethereal, quiet laboratory aesthetic that balances computational rigor with sensory clarity.

The visual style synthesizes clinical minimalism with refined glassmorphic dimensionality. Light diffuses softly through translucent panels, emulating pristine cleanrooms, crystal diffraction patterns, and quartz optical instruments. The mood is analytical, poised, and luminous—delivering immediate confidence and cognitive decompression during long, demanding analytical sessions.

## Colors

The palette relies on high-key luminosity, muted clinical botanicals, and deep structural slates to prioritize legibility and focus.

- **Background Mesh**: The foundation spans a subtle atmospheric linear-gradient (135deg) from Soft Alabaster (`#FAFAFA`) to Pale Clinical Blue (`#F0F4F8`), avoiding dead white while preserving optical sterility.
- **Primary & Accent States**: Soft Sage Green (`#A3C9A8`) denotes confirmed targets, successful validations, and primary calls to action. Its interaction hover state transitions smoothly to `#8EB893`, supported by a diffuse ambient glow (`rgba(163, 201, 168, 0.35)`).
- **Typography & Hierarchy**: Primary labels and structural headlines render in Deep Slate Blue (`#2C3E50`) for contrast without the harshness of pitch black. Body and analytical notes utilize Charcoal (`#333333`), while secondary metrics, inactive states, and unit dimensions use Muted Slate (`#64748B`).
- **Surface Foundations**: Frosted layers utilize calibrated translucent white values (`rgba(255, 255, 255, 0.70)` to `rgba(255, 255, 255, 0.80)`) overlaid with pure translucent borders (`rgba(255, 255, 255, 0.60)`).

## Typography

The typographic hierarchy combines geometric clarity with computational discipline.

- **Primary Typeface**: Plus Jakarta Sans provides clean geometric curves, wide aperture counters, and friendly precision for all conversational text, section titles, and macro-metrics.
- **Data & Scientific Typeface**: JetBrains Mono serves strictly for protein residues, sequence chains, confidence scores (pLDDT), spatial angstrom units (Å), and laboratory identifiers.
- **Reading Comfort**: Headings maintain tight letter-spacing for crispness, while data labels leverage expanded tracking to preserve distinct character identification across dense biochemical tables.

## Layout & Spacing

The design system uses a flexible 12-column layout scaled for data-intensive research monitors, collapsing gracefully into 8-column tablet and 4-column mobile workspaces.

- **Rhythm**: Layout intervals derive from an 8pt base grid with a 4pt sub-unit for tight data alignments and atomic metadata clusters.
- **Form Factor Adaptations**: 
  - **Desktop (>=1280px)**: 12-column layout with 2rem global margins and 1.5rem gutters, allowing multi-pane sequence docking alongside 3D structural viewer canvases.
  - **Tablet (768px - 1279px)**: 8 columns with 1.5rem margins; side inspection rails fold into dismissible glass sheets.
  - **Mobile (<768px)**: 4 columns with 1rem margin and 0.75rem gutters; tables switch to horizontally scrolling data-strips or stacked micro-cards.

## Elevation & Depth

Visual depth is achieved through translucent planar layering rather than traditional heavy opaque drop shadows.

- **Glassmorphic Planes**: Surfaces sit upon the soft alabaster mesh using backdrop-blur (16px to 24px) combined with an ultra-fine perimeter line: `1px solid rgba(255, 255, 255, 0.60)`.
- **Shadow Profile**: Depth utilizes multi-stop, tinted ambient diffusion. Cards and flyouts float using `box-shadow: 0 12px 32px -4px rgba(44, 62, 80, 0.04), 0 4px 12px -2px rgba(100, 116, 139, 0.03)`.
- **Ethereal Accents**: Active interactive states or selected target indicators cast a localized sage aura using `box-shadow: 0 0 20px -2px rgba(163, 201, 168, 0.45)`.
- **Z-Index Layering**: Base structural canvas at `z-0`, docked auxiliary control panels at `z-10`, sticky laboratory filtration headers at `z-20`, and popover structural telemetry inspects at `z-30`.

## Shapes

The interface balances soft human touch with geometric scientific precision. Core panels, floating toolbars, and containers adhere to a 0.5rem (8px) radius, while larger interactive workbenches and modal inspectors expand to 1rem (16px) for an organic, curved profile. Badges, pill metrics, and primary action controls utilize fully rounded capsules to contrast against rectangular spatial visualization windows.

## Components

- **Buttons**:
  - *Primary*: Background tinted in Soft Sage (`#A3C9A8`), Deep Slate Blue text (`#2C3E50`), 0.5rem border radius, with a delicate internal gradient highlight `inset 0 1px 0 rgba(255, 255, 255, 0.4)`. Transitions on hover to `#8EB893` with an ethereal glow.
  - *Secondary / Glass*: Background `rgba(255, 255, 255, 0.70)`, border `1px solid rgba(255, 255, 255, 0.80)`, text `#2C3E50`. Hover triggers subtle elevation lift and background shift to `rgba(255, 255, 255, 0.90)`.
- **Input Fields**:
  - Recessed translucent surfaces (`rgba(255, 255, 255, 0.60)`) with a `1px solid rgba(100, 116, 139, 0.15)` perimeter.
  - Focus state transitions to a crisp `#A3C9A8` border accompanied by an outer soft halo (`box-shadow: 0 0 0 3px rgba(163, 201, 168, 0.25)`).
- **Cards & Data Panels**:
  - Built with frosted glass backing (`bg-white/75 backdrop-blur-xl`), hairline light borders (`border-white/60`), and gentle slate tint shadows.
  - Structured into clean header, body, and metric footer sections with light hairline dividers (`rgba(100, 116, 139, 0.08)`).
- **Chips & Tags**:
  - Capsule-shaped with monospaced metadata labels (`label-md`).
  - Active states feature soft green tint fills (`rgba(163, 201, 168, 0.20)`) and Deep Slate text; neutral tags use muted slate backgrounds (`rgba(100, 116, 139, 0.08)`).
- **Checkboxes & Radios**:
  - Geometric squares with subtle rounding (3px) or circles, bordered in `rgba(100, 116, 139, 0.30)`.
  - Checked state smoothly fills with `#A3C9A8` displaying an off-white optical tick or pip mark.
- **Domain-Specific Components**:
  - *Target Residue Inspector*: A split-cell sequence viewer with JetBrains Mono amino acid tiles, highlighting confidence tiers via luminous translucent overlays.
  - *Affinity Score Indicators*: Low-profile progress tracks using subtle track grooves (`rgba(100, 116, 139, 0.10)`) filled with soft sage glowing gradients.