# Hemp Biorefinery — Modular Process Architecture
2026-10-12 | Conceptual block flow only. **Not a detailed engineering package or instructions for running hazardous process equipment.**

```text
Industrial hemp stalks
  |-- dry, inspect, size-reduce -> decorticate
  |        |-- BAST FIBERS -> paper/pulp, long-fiber composites [or alternate cellulose hydrolysis]
  |        '-- HURD + FINES -> measured feedstock composition / drying
  |                            '-- pretreatment / multi-stage fractionation
  |                                 |-- C5-rich LIQUOR -> hydrolysis/conditioning
  |                                 |                      -> xylose-rich industrial stream
  |                                 |                      -> optional high-purity sugar / fermentation
  |                                 |-- CELLULOSE-RICH SOLID -> paper / molded fiber / reinforcement
  |                                 |                       OR -> enzymatic hydrolysis to C6 glucose
  |                                 |-- LIGNIN-RICH LIQUOR / SOLID -> isolate + characterize
  |                                 |                               -> resin/carbon/chemical/energy candidates
  |                                 '-- wash water/reagents -> recovery + wastewater treatment
  '-- dust/fines and residuals -> industrial waste / qualified heat recovery

C5/C6 sugars -- [future module] fermentation to intermediates / catalytic upgrading
             -- [future module] hydrocarbon finishing + quality certification
             --> potentially gasoline/diesel/jet-range renewable blendstocks
```

## Cross-current vs countercurrent ambiguity
- Cross-current contact: staged fresh solvent/catalyst solution meets solids in successive contact operations; may use more solvent but simpler process behavior.
- Countercurrent contact: solvent and solids move in opposite directions across staged contact zones; can increase concentration/reduce reagent consumption for some cases, but hardware, solids flow, plugging and corrosion matter.
- "Reduction machine": could refer to particle-size reduction or a separate reduction chemistry step. **Don't assume those are the same machine.** Confirm user/vendor terminology before specifying or procuring.
- Screening technology options: screw press/solid-liquid extraction, multistage washers, hydrothermal reactor, dilute-acid pretreatment, steam explosion, organosolv fractionation, alkaline pulping, enzymatic hydrolysis, filtration/membranes and solvent recovery.
- Critically: acid hydrolysis can recover C5 sugars but degrade them to furfural; harsh pretreatment may chemically alter lignin and reduce high-value usability. Product specs must govern severity and conditions, not a fixed general recipe.

## Decision matrix
| Main product focus | Prefer exploring | Tradeoff |
|---|---|---|
| Paper / pulp | Bast preservation, low-damage delignification | Fiber quality may degrade under sugar-focused pretreatment |
| Xylose / C5 sugar | Hemicellulose-oriented selective pretreatment and hydrolysate clean-up | Food purity vs industrial grade, inhibitors, water and concentration |
| Cellulose chemicals | Characterized cellulose and controlled depolymerization | Diverts solids from paper and fiber sales |
| Bioplastics | Reinforcement using fibers/cellulose; industrial fermentative polymer pathways from sugars | Reinforcement is not chemically identical to an all-hemp biodegradable plastic |
| Lignin materials | Lignin-preserving extraction and separation | Purity, odor, polymer performance, solvent/reagent removal |
| Gasoline/diesel-range fuel | Sugar fermentation/upgrading or thermochemical platform with downstream catalytic refining | Capex, scale, catalysts, hydrogen, utilities, environmental permits, fuel specifications |

## Working engineering hazards
Acids/alkalis, solvent vapors and flammability, hot/pressurized streams, solids-handling ignition/dust explosion, hydrogen hazards in future fuel plants, wastewater COD/salts, hemp feedstock impurities, solvent recovery and occupational exposure. All experimental conditions require qualified process engineering and hazardous-operations review.

## Scientific grounding
Hemp hurd composition varies with crop and processing. One characterized sample reported 45.66% cellulose, 24.57% hemicellulose and 21.67% lignin: **sample literature reference only, not guaranteed recoverable product yields**. DOI/source: https://www.sciencedirect.com/science/article/pii/S0926669021005823 .
NREL/DOE pathway studies use other lignocellulosic feeds; they're useful as route precedents, NOT hemp performance proofs:
https://research-hub.nlr.gov/en/publications/process-design-and-economics-for-the-conversion-of-lignocellulosi-3/
https://www.nrel.gov/news/program/2024/biorefinery-model-points-to-a-better-method-at-producing-co-products.html
