# SEB-001-MB-001 — Mass Balance Workbook Basis

**Revision:** 0.1 | **Date:** 2026-11-26 | **Status:** Model specification / unverified inputs

## 1. Workbook structure
The editable calculation model is represented in `SEB-001-MB-001-inputs.csv` in this directory. Import it into Excel, LibreOffice or Google Sheets. This CSV is the initial controlled input ledger, not a validated process simulation. Future workbook tabs should be: Read-Me & Revision; Design Basis; Feedstock Assays; Decortication Split; Fractionation Stages; Product Allocation; Water & Reagents; Energy; Residuals & Emissions; Reconciliation; Sensitivity; Data Register.

## 2. Fixed design-basis calculations
Initial whole-stalk dry feed = 1,000 kg/day. Operating hours = 16 h/day. Operating days = 250 day/year.
- Dry feed rate = 1,000 / 16 = **62.5 kg/h**.
- Annual dry feed = 1,000 × 250 = **250,000 kg/year**.
- 5 dry t/day module = 1,250 dry t/year at 250 days/year.
- 10 dry t/day module = 2,500 dry t/year.
- 25 dry t/day module = 6,250 dry t/year.
These are capacity arithmetic, not guaranteed plant throughput or uptime.

## 3. Composition benchmark — strict limitation
One published hemp hurd sample reported 45.66 wt% cellulose, 24.57 wt% hemicellulose, 21.67 wt% lignin, and 8.10 wt% other constituents by difference. This benchmark may be used only as an illustrative composition check on a **1,000 kg dry hurd sample basis**: 456.6 kg cellulose, 245.7 kg hemicellulose, 216.7 kg lignin and 81.0 kg other. It is not whole-stalk composition, not the assumed decortication split, not a process yield, and not a product guarantee. The source and assay method must be recorded in the workbook.

## 4. Required calculation logic
- Moisture correction: dry mass = as-received mass × (1 − wet-basis moisture fraction).
- Component mass = dry feed to unit × measured component mass fraction.
- Stage recovery = component mass in target outlet / component mass entering stage.
- Overall yield = saleable product dry mass / whole-stalk dry feed mass, with product moisture and purity reported separately.
- Mass closure = (sum of all measured output masses, on a consistent boundary and basis) / (sum of input masses including feed, water and reagents where applicable). For chemical conversion, account for stoichiometric water addition, reagent incorporation, gas and dissolved products.
- Closure acceptance target for pilot data: 95–105% total mass closure; investigate and document any deviation. Component closure target should be set per analytical method and uncertainty; do not force closure by assigning unknowns to saleable products.

## 5. No-double-counting rules
Maintain separate allocation fractions for bast, hurd, fines, cellulose, hemicellulose, lignin, char and gases. Every feed component can enter only one primary product path at a time. Recycles are internal flows and are not counted as new feed. Separate soil-grade biochar and graphene feed allocation.

## 6. Acceptance criteria
A model revision is accepted when: all inputs are source-tagged; wet/dry basis is explicit; no stream is double-counted; equations are visible; uncertainty ranges are recorded; total and component closures are reported; mass-balance residuals are explained; and independent review is complete. Until actual feed assays and pilot data exist, all process yields and utility coefficients remain blank/TBD.
