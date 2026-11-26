# SEB-001-PFD-001 — Process Flow Diagrams

**Revision:** 0.1 | **Date:** 2026-11-26 | **Status:** Conceptual PFD narrative / review

## 1. Purpose and limits
This document defines the process blocks and interfaces for drawing controlled PFDs. The text diagrams are conceptual and do not establish equipment sizes, operating conditions, chemical recipes, pressure ratings, safety interlocks or construction details. Detailed PFD sheets and stream tables follow only after feedstock testing and route selection.

## 2. Overall block flow
```text
Hemp stalk receipt / weigh / sample
              |
       conditioning / size reduction
              |
         decortication
          /        \
       BAST        HURD + FINES
        |              |
 fiber grading       screening / assay
        |              |
 paper / pulp /       continuous multistage
 composites           cross-current fractionation
                       /       |        \
               cellulose   C5 liquor   lignin-rich
                 solids      |          stream
                  |       hydrolysis /  characterization
             pulp / fiber  purification /     |
             / composite   conditioning     resin / materials
                  \         |          /
                   product qualification
                            |
                  residual streams / wash water
                            |
             recovery / wastewater treatment
                            |
         eligible clean residual biomass only
                            |
                 controlled thermal R&D
                            |
                char / vapors / off-gas
                   /             \
           tested biochar      gas/condensate
            allocation         treatment / recovery
             /       \
       soil trials   carbon-material feed (exclusive allocation)
                         |
                  separate upgrading R&D
                         |
               enclosed capture / recovery
                         |
               graphene-like carbon assay
                         |
                 composite R&D / qualification
```

## 3. PFD sheets to be developed
- PFD-001-01: Feedstock receiving, conditioning and decortication.
- PFD-001-02: Bast fiber grading and product allocation.
- PFD-001-03: Hurd fractionation, solid/liquid separation and wash/recycle.
- PFD-001-04: C5 liquor conditioning, purification and product interface.
- PFD-001-05: Cellulose-rich solids, pulp/reinforcement and alternate hydrolysis interface.
- PFD-001-06: Lignin recovery, conditioning and product qualification.
- PFD-001-07: Residual biomass thermal conversion, gas treatment and char handling.
- PFD-001-08: Graphene/carbon upgrading R&D enclosure and material recovery.
- PFD-001-09: Water, reagent/solvent recovery, wastewater and utilities.
- PFD-001-10: Product packaging, storage and dispatch.

## 4. Stream numbering and data requirements
Assign unique stream IDs by area (e.g., 100-series receiving, 200-series decortication, 300-series fractionation, 400-series product conditioning, 500-series thermal conversion, 600-series carbon R&D, 700-series utilities/effluent). Every stream table shall state: mass flow (wet and dry), moisture, temperature, pressure, phase, composition, source/destination, analytical basis, design/normal/minimum/maximum flow where known, and uncertainty. Unknown values remain TBD; do not insert synthetic yields.

## 5. Key process alternatives
Cross-current extraction with fresh solvent/reagent at each stage is the selected concept to evaluate. Countercurrent extraction remains a comparison case only, not a silent substitution. The phrase “reduction machine” must be clarified as mechanical size reduction versus chemical reduction/fractionation. Evaluate solids handling, stage efficiency, liquor concentration, solvent/reagent demand, filtration, plugging, corrosion, washing, recycle and wastewater burden.

## 6. Material allocation safeguards
- Bast retained as fiber is not simultaneously hydrolyzed into sugar.
- Cellulose sold as pulp/reinforcement is not simultaneously converted to glucose.
- Hemicellulose polymer mass is not equal to recovered xylose mass; hydrolysis adds water and losses/inhibitor formation occur.
- Lignin-rich stream is not pure lignin until assay confirms purity.
- Char allocated to soil use is not also available as graphene feed.
- Pyrolysis gas/condensate are not credited as usable energy or saleable product until composition, treatment, emissions and equipment compatibility are established.

## 7. PFD review acceptance
Each PFD issue shall include a stream table, battery limits, recycle/purge loops, waste/emissions outlets, normal/start-up/shutdown boundaries, instrument/control concept, hazard annotations and cross-document references. Independent process engineering review is required before use for equipment sizing or procurement.
