---
name: Sovereign Clinical & Civil Infrastructure
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#44474d'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#74777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#4b5f7f'
  primary: '#000d21'
  on-primary: '#ffffff'
  primary-container: '#0c2340'
  on-primary-container: '#778bad'
  inverse-primary: '#b3c7ec'
  secondary: '#0061a5'
  on-secondary: '#ffffff'
  secondary-container: '#57aafe'
  on-secondary-container: '#003d6b'
  tertiary: '#715c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cba700'
  on-tertiary-container: '#4d3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#b3c7ec'
  on-primary-fixed: '#031c38'
  on-primary-fixed-variant: '#334766'
  secondary-fixed: '#d2e4ff'
  secondary-fixed-dim: '#9fcaff'
  on-secondary-fixed: '#001d36'
  on-secondary-fixed-variant: '#00497e'
  tertiary-fixed: '#ffe17b'
  tertiary-fixed-dim: '#ecc300'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#554500'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.04em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
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

This design system delivers a mission-critical, sovereign operational interface engineered for high-stakes governmental deployments across the 145 territories of the Democratic Republic of the Congo. The brand environment bridges public registry authority with immediate medical triage. The aesthetic balance merges **Institutional Utility** with **Humanitarian Robustness**: unadorned, dependable, hyper-legible, and stripped of ornamental latency.

### Core Character
- **Institutional Authority:** Sovereign visual presence conveying national trust, official validation, and permanent record durability.
- **Surgical Lucidity:** High visual contrast, generous touch targets, and unambiguous status signaling built explicitly for healthcare workers operating under low ambient lighting, rural clinic constraints, or intense solar glare.
- **Fail-Safe Orientation:** Clear step-by-step progressions ("Suivant / Précédent") that eliminate operator cognitive fatigue during field data collection and patient intake.
- **Tactile Dependability:** Substantial surfaces, thick borders, and distinct states designed for ruggedized touch tablets and field devices operated with gloves or single-handed grips.

## Colors

The color palette grounds the sovereign authority of the state while adhering strictly to WCAG 2.1 AAA accessibility metrics for clinical and civil records under variable lighting conditions.

### Primary Spectrum
- **Deep Sovereign Navy (`#0C2340`):** Anchors headers, primary command bars, and dominant action surfaces. Evokes governance and solemn stability.
- **Congo Azure (`#0077C8`):** Operates as the active dynamic color for primary forward actions, focal selection outlines, interactive state tags, and vital health record links.

### Republic & Clinical Indicators
- **Official Golden Yellow (`#FCD116`):** Dedicated to attention-demanding states, pending national sync notices, caution warnings, and high-priority civil review banners.
- **Republican Crimson (`#CE1126`):** Reserved strictly for critical medical alerts, biological discrepancies, unrecoverable data deletion warnings, and mandatory emergency overrides.
- **Validation Jade (`#0E8A54`):** Represents certified civil identity status, successfully synchronized biometric records, and positive clinical test findings.

### Neutral & Environmental Values
- **Canvas Base (`#F8FAFC`):** Low eye-strain clinical neutral that avoids the glare of pure white.
- **Surface Elevation (`#FFFFFF`):** High-opacity white for legible card containers and triage data sheets.
- **Surface Dark Alternate (`#06111E`):** Field mode backdrop for battery conservation and twilight field operation.
- **Ink Primary (`#0F172A`):** Maximum-contrast slate black for all primary diagnostic text, NIN (Numéro d'Identification Nationale), and field inputs.
- **Border Structural (`#CBD5E1`):** High-definition separation lines that maintain UI boundaries on low-tier IPS screens.

## Typography

The type system prioritizes structural stability and immediate character distinction under high-stress triage situations.

- **Primary Interface (Inter):** Deployed for all human-readable headlines, clinical questions, form labels, and patient histories. Font weights are elevated (minimum `500` for body text in field-entry contexts) to ensure readability on dusty or scratched tablet glass.
- **Data Engine (JetBrains Mono):** Monospaced utility font applied rigorously to official identity keys, national health insurance numbers (NNI), biometric hash signatures, geolocation coordinates, and offline queue sequence counters. The fixed width prevents character alignment confusion during quick verification runs.

## Layout & Spacing

The layout is built around an explicit tactile target system designed for industrial and field healthcare usage. Touch target zones must never fall below **52px** in physical height on tablets and phones.

### Grid Architecture
- **Desktop / Clinical Dashboard:** 12-column grid, fluid within a maximum width of `1440px`, with `1.25rem` gutters and `2rem` outer margins.
- **Rugged Field Tablet (7" - 10"):** 6-column fluid structure. Fixed bottom action dock anchored to the lower viewport for continuous thumbnail access.
- **Handheld Mobile:** Single-column stacked workflow, prioritizing rapid vertical linear scrolling with `1rem` margins and `0.75rem` internal gutters.

### Stepper Flow Model
Form workflows follow strict linear partitioning: one identity group or health parameter set per screen. The layout reserves a fixed bottom operational zone (`76px` height minimum) separating the **"Suivant"** and **"Précédent"** commands to prevent input mistakes during emergency entries.

## Elevation & Depth

To remain usable on low-cost TN/IPS screens and in clinical settings with direct sunlight or minimal night illumination, visual depth is communicated through **structural boundaries and tonal contrast** rather than soft ambient blurs.

### Surface Tiers
- **Tier 0 (Canvas):** Ground layer (`#F8FAFC`), passive and non-interactive.
- **Tier 1 (Record Cards & Modals):** Crisp `#FFFFFF` surface enclosed by a `1.5px` border of `#CBD5E1`.
- **Tier 2 (Active Focus & Sticky Headers):** Pure `#FFFFFF` anchored with a subtle bottom-line accent in Sovereign Navy (`#0C2340`) and an offset edge line (`0 2px 0 0 #0C2340`).
- **Tier 3 (Persistent System Strip):** Highly visible, continuous offline/online connectivity bar pinned across the topmost display edge using a distinct inset status border.

No translucent glass or blurred backdrops are permitted, ensuring deterministic rendering speed on resource-constrained hardware.

## Shapes

The design uses a **Soft (Level 1)** geometric silhouette. Corner rounding is capped at conservative thresholds (`4px` to `8px`) to maximize data density, respect paper-based government archive metaphors, and deliver a serious, official silhouette.

- **Buttons & Control Surfaces:** `4px` radius (`0.25rem`). Maintains structural firmness.
- **Cards, Enclosures & Data Tables:** `8px` radius (`0.5rem`). Delivers clear separation without soft, consumer-oriented pill aesthetic.
- **Status Pills & Metric Tokens:** Strictly bounded tags with `4px` radius to maintain legible alignment with monospaced reference data.

## Components

### 1. Offline & Connectivity Banner (Bandeau d'état réseau)
A persistent, full-width status anchor locked directly above the main system header.
- **Offline State:** Background `#CE1126` (Republican Crimson), text white, bold uppercase with an un-synced queue metric: `MODE HORS-LIGNE — 14 REGISTRES EN ATTENTE DE SYNCHRONISATION`.
- **Syncing State:** Background `#FCD116` (Official Golden Yellow), text `#0C2340`, animated rotation icon.
- **Online / Cloud Certified:** Background `#0E8A54`, text white, quiet icon indicator with last timestamp: `SYNCHRONISÉ — KINSHASA SERVEUR CENTRAL`.

### 2. Dual Navigation Dock ("Précédent" / "Suivant")
Fixed dual-button system pinned to the bottom of multi-step civil and medical forms:
- **Bouton Suivant (Forward Action):** Occupies 65% of horizontal docking space. Solid `#0077C8` (Congo Azure) background with white text, `56px` touch height, heavy bold weight (`600`), and a right-facing directional glyph.
- **Bouton Précédent (Back Action):** Occupies 35% of horizontal space. Ghost-bordered design: `#FFFFFF` fill with `2px` solid `#0C2340` border and `#0C2340` text. Never uses icons alone; always labeled clearly to prevent accidental record cancellation.

### 3. Identity & Clinical Input Fields
- Form controls must feature a minimum physical height of `52px`.
- Inactive border: `1.5px` solid `#CBD5E1`.
- Active focus state: `2.5px` solid `#0077C8` with an interior `2px` white padding buffer.
- Mandatory field identification features a discrete sovereign flag accent dot instead of an unobtrusive red asterisk.
- Monospaced formatting automatically applied to identity numbers (`NNI: XXXX-XXXX-XXXX`).

### 4. Patient Triage & Civil Ledger Cards
- Rectangular containers rendered in `#FFFFFF` with a left border strip (`4px` width) coded by status:
  - **Vert (#0E8A54):** Dossier validé et enregistré.
  - **Jaune (#FCD116):** Données incomplètes / En attente de biométrie.
  - **Rouge (#CE1126):** Urgence clinique / Conflit d'identité territoriale.
- Padding inside cards is locked to `space-md` (`1rem`).

### 5. Selection Controls (Checkboxes & Radios)
- Checkboxes and radio targets measure `24x24px` within a minimum touch bounding box of `48x48px`.
- High-contrast states: Checked checkboxes use a solid `#0C2340` fill with a high-visibility white checkmark (`3px` stroke).