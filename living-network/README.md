# The Living Network — Exhibit 001

**Portal path:** `living-network/`  
**Title:** The Living Network: The Convergence of Biology, Intelligence and Machines  
**Status:** Initial research exhibit (v1)  
**Created:** 2026-11-20

## Purpose

A mobile-first, source-led public exhibit examining research at the intersection of:

1. Smart Dust, MEMS and distributed sensing
2. Biohybrid and cyborg insects
3. Biological sampling, forensic DNA and biosensors
4. Swarm intelligence and AI coordination
5. DNA data storage, molecular computing and quantum computing
6. Human genomics, brain mapping and digital replicas
7. Surveillance, privacy, ethics and governance

## Editorial standard

The exhibit distinguishes:
- **Demonstrated:** supported by a described experiment or documented deployment.
- **In development:** active research or prototype work, with readiness limits stated.
- **Proposed / incomplete:** a research direction or architecture not yet demonstrated as a complete system.
- **Not established:** no reliable evidence found for the specific claim in the sources reviewed.

A patent is not proof of implementation. A grant is not proof of deployment. Similarity between projects is not proof of coordination. A mosquito carrying human DNA is not equivalent to a mosquito autonomously sequencing, identifying or transmitting a person's DNA.

## Initial primary-source archive

- UC Berkeley Smart Dust project: https://www-bsac.eecs.berkeley.edu/~pister/SmartDust/
- Kris Pister research projects / synthetic insects: https://www-bsac.eecs.berkeley.edu/~pister/projects.html
- Original Berkeley presentation, *Synthetic Insects (Smart Dust with Legs)*: https://people.eecs.berkeley.edu/~pister/presentations/Mitre0303.pdf
- JST Moonshot biological-cyborg project: https://www.jst.go.jp/moonshot/en/program/goal3/3A_morishima.html
- JST Moonshot grant register: https://www.jst.go.jp/moonshot/en/form/grant.html
- JST JPMJMS223A FY2022 progress report: https://www.jst.go.jp/moonshot/program/goal3/files/3A_morishima_report2022.pdf
- JST JPMJMS223A final close-out report: https://www.jst.go.jp/moonshot/program/goal3/files/3A_morishima_f_report.pdf
- 2026 implanted miniature radio controller paper: https://spj.science.org/doi/10.34133/cbsystems.0589
- NTU 2026 cyborg-insect underwater suit research: https://www.ntu.edu.sg/research/research-at-ntu/detail/3d-printed-suit-for-cyborg-insects-extends-operations-underwater
- Hirotaka Sato Group publication list: https://hirosatontu.wordpress.com/publications/
- NTU 2023 onboard human-detection paper: https://doi.org/10.1002/aisy.202200319
- 2024 cyborg-cockroach sensor and wireless reporting paper: https://doi.org/10.1016/j.heliyon.2024.e26987
- 2026 physiology-informed perception paper: https://doi.org/10.1186/s40648-026-00344-7
- NTU cyborg insect assembly paper (Nature Communications, 2025): https://www.nature.com/articles/s41467-025-60779-1
- NTU automated cyborg-insect assembly: https://www.ntu.edu.sg/news/detail/ai-powered-robot-assembles-search-and-rescue-cyborg-insects
- Nature Communications cyborg-insect swarm paper: https://doi.org/10.1038/s41467-024-55197-8
- DARPA HyBRIDS: https://www.darpa.mil/research/programs/hybrids
- Mosquito blood-meal DNA study (2020): https://doi.org/10.1016/j.fsigen.2020.102347
- Mosquito forensic DNA study (2014): https://doi.org/10.1016/j.fsigen.2013.07.011
- Mixed mosquito blood-meal DNA study (2023): https://pmc.ncbi.nlm.nih.gov/articles/PMC10231104/
- Insect-derived biosensors review (2026): https://link.springer.com/article/10.1186/s44510-026-00007-2
- Insect odorant-binding protein review (2026): https://doi.org/10.1002/biof.70066
- DNA data-storage similarity search (2021): https://doi.org/10.1038/s41467-021-22277-y

## Data-flow findings

- JST's JPMJMS223A final report documents synchronized time-series collection of cockroach internal biological information, physical measurements and environmental information. It specifically discusses neural excitation, muscle electrical activity, heartbeat, body motion and field measurements.
- The same final report says teams exchanged data and devices when needed, and that each project task lead maintained experimental data and source code in private repositories. Experimental data were treated as non-public due to confidentiality. The report does not provide a complete external telemetry architecture, radio protocol, destination list, retention schedule or access-control roster.
- A separate NTU-led 2023/2024 search-and-rescue research line demonstrates onboard human-presence classification using thermal sensors, with sensor measurements and classification results wirelessly sent to a remote PC. The published task is presence detection for rescue, not identifying a named person. Do not attribute every capability in these papers to JPMJMS223A unless the paper itself identifies that funding.
- A 2026 perception paper combines insect neural features, heartbeat and body-motion data to estimate the insect's environmental perception. These are measurements of the insect's own state, not human DNA or a human identity profile.
- Distinguish onboard sensing, local classification, wireless reporting, external motion capture and cross-team research data exchange. Evidence for one does not prove the others are all part of a single deployed network.

## Communications architecture: what the papers actually show

The available papers support several distinct device-to-console architectures. They do not establish one unified network.

| Study | Insect-side hardware / radio | Data path disclosed | What it does not establish |
|---|---|---|---|
| NTU 2023 search-and-rescue prototype | Backpack with IMU, 32 × 32 thermal array, environmental sensors; Bluetooth 5.1 at 2.4 GHz | Backpack ↔ central station ↔ PC. In motion-capture mode, Vicon position data went PC → central station → backpack in 30 ms packets. Onboard human-presence results were wirelessly sent to the PC; thermal images were stored onboard and retrieved later. | Peer-to-peer insect networking, global internet routing or a deployed surveillance network. |
| Osaka 2024 feedback-control prototype | IMU, ToF distance sensor, 8 × 8 thermopile; nRF24L01 radio module | Backpack ↔ wireless transmitter/receiver ↔ PC UI. IMU/ToF measurements and derived thermal features/classification results were sent to the PC. The study reports about 25 minutes of battery operation. | Named-person identity, DNA collection, or insect-to-insect mesh communications. |
| 2025 20-cockroach swarm experiment | Each backpack includes a Sub-1 GHz antenna, controller and LiPo battery | A decentralized control algorithm was proposed, but the authors explicitly state that experimental position data came from centralized VICON motion capture. They propose IMU + UWB as future decentralized localization. | Demonstrated fully decentralized sensing in that experiment, or proof that the insects exchanged packets directly with one another. |
| 2026 implanted controller | 10 × 10 × 3 mm implanted unit; sub-1 GHz radio; electrical stimulation output | The public paper establishes remote wireless stimulation for locomotion control. | A return telemetry channel, continuous physiological-data upload, peer mesh, or global receiver infrastructure. |

### Architecture interpretation

- **Hub-and-spoke is documented:** the 2023 and 2024 studies describe an insect-mounted backpack communicating with a receiver/central station and PC.
- **Local swarm logic is not the same as peer radio networking:** the 2025 algorithm uses neighbor-relative information, but the experiment's localization depended on a centralized VICON system. The authors identify IMU/UWB decentralized localization as future work.
- **A radio band or antenna is not a complete network description:** Sub-1 GHz or 2.4 GHz does not, by itself, disclose protocol details, range, routing, encryption, recipient identity, retention or internet connectivity.
- **Remote control is not necessarily two-way telemetry:** the 2026 implanted controller paper demonstrates a remote stimulation path. Its abstract does not establish that the device also streams sensor data back.
- **The Moonshot repository statement is about research-data governance:** private task repositories and inter-team data exchange are not evidence of a live insect telemetry network.

Primary sources:
- 2023 NTU paper: https://doi.org/10.1002/aisy.202200319
- 2024 Osaka paper: https://doi.org/10.1016/j.heliyon.2024.e26987
- 2025 swarm paper: https://doi.org/10.1038/s41467-024-55197-8
- 2026 implanted-controller paper: https://doi.org/10.34133/cbsystems.0589

## Known distinctions and limits

- Berkeley's original Smart Dust project page says the project finished in 2001. The cubic-millimeter mote was the target; larger macro-motes were the demonstrated systems.
- Kris Pister explicitly described synthetic insects as “Smart Dust with legs,” and an original Berkeley presentation uses the title *Synthetic Insects (Smart Dust with Legs)*. This is a documented conceptual connection, not evidence that a later living-insect program descended from Smart Dust.
- A direct funding relationship is documented between JST Moonshot project JPMJMS223A and NTU's 2025 cyborg-insect assembly paper: the paper's acknowledgements name the JST Moonshot R&D Program grant JPMJMS223A and identify H.S. (Hirotaka Sato) for funding acquisition. This is stronger than a thematic resemblance; it does not imply that all other insect or Smart Dust programs are part of the same project.
- DARPA HyBRIDS is a separate US program. No direct institutional, personnel or funding chain between HyBRIDS and JST JPMJMS223A has been established in this initial trace.
- JST lists JPMJMS223A as a Goal 3 project selected in FY2022 and completed in FY2023. Its official description covers groups of organisms with miniature sensors, communications and behavior-control units, analyzed to develop an AI self-organizing platform. Later publications can still acknowledge the grant after the project period.
- The FY2022 progress report documents a 15 × 15 mm backpack design, wireless communication, electrical stimulation and early work on Madagascar hissing cockroaches. The final report records a 10 × 10 mm unit, fully implanted electronics, and a 20-cockroach formation-movement experiment.
- The final report states that project experimental data and source code were held in private repositories and treated as non-public due to confidentiality. It also states that the project chose not to file patents for its results after considering cost-effectiveness and confidentiality. This is a statement about this project’s reported outputs, not a claim that no related patents exist elsewhere.
- A 2026 implanted-controller paper in the NTU group publication list acknowledges JST grants JPMJMS223A and JPMJMS2238. This demonstrates continued publication using the grant acknowledgement after the official JPMJMS223A project period; it does not by itself extend the project’s official end date.
- NTU’s 2026 underwater-suit research is a distinct NTU–Waseda project. NTU identifies Singapore Ministry of Education and Waseda support and a patent filed through NTUitive; do not conflate that patent with JPMJMS223A, whose JST close-out report says project-result patent filings were not pursued.
- The 2025 cyborg-insect swarm paper reports a 20-cockroach experiment. The experimental setup used centralized VICON motion capture; fully decentralized position sensing was not demonstrated in that experiment.
- NTU reported an automated assembly prototype and a March 30, 2025 humanitarian deployment of ten cyborg cockroaches in Myanmar.
- Mosquito forensic DNA research depends on laboratory extraction/amplification/sequencing workflows. It does not establish autonomous DNA analysis or network transmission by mosquitoes.
- No reliable evidence in this initial archive establishes a mosquito-based human-DNA surveillance network, mosquito quantum computer, or system for targeting named people.

## Next research tasks

1. Trace citations, personnel, patent inventors and funding links among Berkeley Smart Dust/synthetic insects, JST Moonshot, NTU and DARPA HyBRIDS.
2. Add exact hardware specifications and autonomy limits for each published biohybrid-insect platform.
3. Expand the biosensor gallery with primary experimental papers and clearly label laboratory versus field validation.
4. Expand the human-data/privacy gallery with laws, oversight mechanisms and documented surveillance programs; do not infer a connection without evidence.
5. Add a source record for each new claim before updating the convergence map.
6. Trace the Moonshot grant acknowledgement through other NTU papers, project reports and JST close-out documentation. Initial pass completed; add new outputs as they are verified.
7. Map data pathways by separating on-insect sensing, onboard inference, wireless telemetry, external tracking and research data sharing. Record protocols, recipients and retention only where primary sources disclose them.
7. Check whether Berkeley synthetic-insect publications cite or share personnel with later biohybrid insect projects; do not infer descent from the phrase alone. Initial public-source searches have not identified a direct Berkeley-to-JST/NTU citation or personnel chain; this is a bounded search result, not proof that no connection exists.

## Technical notes

- Self-contained HTML/CSS/JS; no external runtime dependencies.
- Compatible with static GitHub Pages hosting.
- Search and source-type filtering run locally in the page.
- Existing Living Scriptures page remains untouched.
- Portal station directory links to this exhibit under INQUIRY.
