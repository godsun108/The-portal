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

### Range, operating time and data-access disclosures

- The 2026 fully implanted controller paper reports a **26 m** communication distance between the implanted controller and its central board, and actual operation of **32.05 ± 1.00 minutes (N = 4)**. The 9-mAh battery's theoretical estimate was 38.14 minutes. These are controlled test measurements, not a general-purpose coverage guarantee.
- The 2024 Osaka study uses an nRF24L01 radio module; a related 2023 paper from the same research line identifies the nRF24L01 SMD module as a **2.4 GHz** transceiver. The 2024 backpack reports approximately 25 minutes of continuous battery operation.
- The 2023 NTU paper specifies Bluetooth 5.1 at 2.4 GHz and a 120-mAh LiPo battery. Its measured motion-capture feedback packets were sent at 30-ms intervals in the described setup. It does not report a production network's range or security policy.
- The reviewed publications do not provide a complete radio-security specification: encryption, device authentication, key management and a production access-control model are not fully disclosed. This is an evidence gap, not proof that encryption or security controls were absent.
- Data availability differs by publication. The 2025 assembly paper says supporting data and code are available within the article and supplementary files. The 2026 implanted-controller paper says supporting data are available from the corresponding author upon reasonable request. The JST close-out report says the Moonshot project's task leads maintained private repositories and experimental data were non-public due to confidentiality.
- These publication-level statements do not reveal all institutional access permissions, retention periods, onward sharing agreements or operational deployments.

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

## Institutional and funding map (research update, 2026-11-20)

### Directly documented Japanese project structure

JST's official Goal 3 page identifies **JPMJMS223A, “New World of Inspiration by Co-evolution of Humans, AI Robots, and Biological Cyborgs,”** as a FY2022–FY2023 project managed by **Keisuke Morishima (Osaka University)**. The official project roster names **Hirotaka Sato (Nanyang Technological University)** and **Naoki Wakamiya (Osaka University)** among the project leaders. Its stated research direction explicitly includes biological cyborgs, miniature sensors, communication devices, behavior-control units and AI-driven self-organization.

JST's official FY2023 evaluation says the team developed a miniature backpack board and achieved coordinated movement of multiple biological cyborgs. The same evaluation records that the stage-gate review found the longer-term goal was not yet sufficiently assured. This is an important qualification: the project achieved meaningful prototypes and group movement, but the official evaluation does not describe a mature, fully autonomous operational network.

Primary records:
- JST project page: https://www.jst.go.jp/moonshot/en/program/goal3/3A_morishima.html
- JST project evaluation: https://www.jst.go.jp/moonshot/program/pdf/ms3_r5_jigo_pj.pdf
- JST project roster/overview PDF: https://www.jst.go.jp/moonshot/en/program/goal3/files/3A_morishima_ap.pdf

### Funding links and publication acknowledgements

- NTU's 2025 cyborg-insect assembly paper acknowledges JST Moonshot grant **JPMJMS223A** and identifies Hirotaka Sato in the funding statement. This is a direct funding acknowledgement connecting the NTU paper to the JST project.
- The 2026 implanted-controller paper also acknowledges **JPMJMS223A**, alongside **JPMJMS2238**. A later publication acknowledgement does not change the official end date of the FY2022–FY2023 JPMJMS223A project and does not prove that all later work is part of that original project.
- JST's final project report says the project chose not to file patents for its own results after considering cost-effectiveness and confidentiality. This statement is limited to the Moonshot project's reported outputs; it does not mean no related patents exist in other projects.

### DARPA HyBRIDS: public award trail

DARPA describes HyBRIDS as a separate program addressing the engineering barriers to biohybrid systems that combine biological and synthetic components. Its official program page cautions that many existing biohybrid systems remain laboratory proof-of-concepts with limited real-world applicability.

Public USAspending records located in this pass identify at least three HyBRIDS-related award records:
- **Cornell University, FAIN HR00112530227:** award summary lists $233,586.12 obligated; period Aug 19, 2025–Aug 18, 2026. https://www.usaspending.gov/award/ASST_NON_HR00112530227_097
- **Cornell University, FAIN HR00112530231:** award summary lists $280,784 obligated; period Aug 13, 2025–Aug 12, 2026. The detailed federal-account section displays a conflicting negative amount, so this figure should not be treated as a reconciled final expenditure. https://www.usaspending.gov/award/ASST_NON_HR00112530231_097
- **BlueHalo LLC, FAIN HR00112530201:** award summary lists $231,134.19 obligated; period Jun 20, 2025–Jun 19, 2026. https://www.usaspending.gov/award/ASST_NON_HR00112530201_097

These are individual public award records, not a complete program-wide award inventory. The records identify recipients, dates and program descriptions; they do not, by themselves, identify each recipient's exact insect species, technical payload, communication architecture or field deployment. Do not infer those details.

### Relationship assessment

| Proposed connection | Evidence status | Interpretation |
|---|---|---|
| Berkeley Smart Dust → Berkeley synthetic insects | **Direct conceptual connection** | Kris Pister explicitly described synthetic insects as “Smart Dust with legs.” This is within the same researcher's Berkeley work. |
| JST Moonshot JPMJMS223A → Osaka University / NTU | **Direct project relationship** | Official JST roster and project documentation identify Morishima, Sato and Wakamiya. |
| JST JPMJMS223A → NTU assembly research | **Direct grant acknowledgement** | The 2025 paper acknowledges the grant and identifies Sato in the funding statement. |
| DARPA → Cornell / BlueHalo HyBRIDS awards | **Direct public award relationship** | USAspending records explicitly identify the DARPA HyBRIDS opportunity. |
| Berkeley Smart Dust → JST Moonshot | **Not established** | No direct shared personnel, grant, project transfer or citation chain was identified in this public-source pass. |
| DARPA HyBRIDS → JST Moonshot | **Not established** | The programs share a broad biohybrid-robotics theme, but no direct joint funding, personnel or project relationship was established. |

**Bottom line:** there are genuine, separately documented research and funding programs in this field. The evidence supports a conceptual lineage inside Berkeley, a clearly defined Japanese JST/Osaka/NTU biological-cyborg project, and separate US DARPA HyBRIDS awards. It does not currently support treating them as one coordinated international program or a single operational network.

## Patents, autonomy and oversight (research update, 2026-11-20)

### 2026 Insect Synergy Circuit (ISC): important advance, still a laboratory system

The May 12, 2026 ROBOMECH Journal paper, *Perception-driven control strategy for bio-intelligent cyborg insect*, is by a University of Osaka team led by Keisuke Morishima. It acknowledges JST Moonshot grant **JPMJMS223A** and JSPS KAKENHI grant 22H04951.

The system used a Madagascar hissing cockroach with a 5 g Bluetooth 5.0 backpack (40 mAh LiPo), low-frequency neural amplitude measurements, heartbeat sensing and an IMU. The sensor stream was used by a pre-trained machine-learning model to infer environment-associated internal state; outputs gated UV-A or vibration stimulation. The authors call the broader concept the Insect Synergy Circuit. Its aspirational figure describes insects as possible connectors among organisms and AI, but the demonstrated work is a cockroach in a controlled multi-chamber maze—not a multi-species or ecosystem-wide communications network.

Important measured constraints:
- Closed-loop evaluation: **4 insects, 40 trials**; baseline natural behavior: 8 insects, 80 trials.
- Offline classification accuracy: **93.0%**; real-time classification accuracy: **65.22%**.
- The motion-capture system was used for post-experiment trajectory analysis, not the real-time control loop; online control used onboard sensing and wireless transmission.
- The authors identify small sample size, structured test environment, motion artifacts, signal drift and limited neural signal resolution as limitations.
- The paper's data-availability statement says: “No datasets were generated or analysed during the current study.” This is unusual beside the reported experimental analysis; the statement should be quoted as published rather than interpreted as proof that no measurements were collected.

Primary paper: https://link.springer.com/article/10.1186/s40648-026-00344-7

### Patent trail associated with Hirotaka Sato's group

1. **US20260283111A1 — Device for Insect Stimulation Using Electrodes.** US application 19/477,068, filed April 19, 2024, published September 24, 2026. Inventors include Hirotaka Sato and the NTU cyborg-insect research team. The disclosed system covers detachable, mechanically coupled fixtures, electrodes, insect-computer hybrid systems, controllers, optional communications modules, localization, data collection and neurostimulation. This is a hardware/attachment and stimulation patent application—not evidence of a deployed insect mesh or human surveillance network. Google Patents: https://patents.google.com/patent/US20260283111A1/en
2. **WO2024220038A1 — Device for Insect Stimulation Using Electrodes.** Related PCT publication, priority date April 21, 2023; inventors include Sato and collaborators; listed applicants include NTU and KLASS Engineering & Solutions. https://patents.google.com/patent/WO2024220038A1/en
3. **US12420090B2 — Method of controlling movement of hybrid robot and animal locomotion stimulation system thereof.** Granted September 23, 2025; assigned to NTU and KLASS Engineering & Solutions. The abstract describes position/orientation-based stimulation, motion monitoring and stopping stimulation under a specified movement condition. It is a control method, not proof of peer-to-peer insect communications. https://patents.google.com/patent/US12420090B2/en

The 2026 NTU–Waseda underwater cyborg-insect suit is a separate project and has its own patent filing; it should not be conflated with the Moonshot grant or the electrode patent family.

### Is the insect swarm actually decentralized?

The 2025 Nature Communications paper *Swarm navigation of cyborg-insects in unknown obstructed soft terrain* tested a leader/follower swarm of 20 Madagascar hissing cockroaches. Its authors explicitly state that the algorithm was theoretically decentralized, but the experiment supplied position data from a centralized VICON motion-capture system. They proposed future hybrid IMU + UWB localization so insects could estimate their positions without external motion capture.

This is a real multi-agent swarm-control demonstration, but it is not yet a demonstrated autonomous radio mesh. Local neighbor sensing in the algorithm and independent peer-to-peer network routing are different things.

Paper: https://www.nature.com/articles/s41467-024-55197-8

### DARPA HyBRIDS: what award records do and do not show

The DARPA public program page describes a broad effort to integrate biological and synthetic components. DARPA itself says many biohybrid systems remain laboratory proof-of-concepts with limited practical applicability and that real-world feasibility, characterization and scaling remain difficult. The solicitation closed April 7, 2025, and the topic remains within its period of performance.

USAspending confirms HyBRIDS award records to Cornell University and BlueHalo LLC. However, the public award summaries accessible in this review expose recipient, dates, obligated amounts and broad program descriptions—not detailed statements of work, named biological platforms, sensor payloads, radio topology, or field deployment. Therefore, it is not responsible to infer what each recipient is building from award summaries alone.

Sources:
- DARPA HyBRIDS: https://www.darpa.mil/research/programs/hybrids
- Cornell FAIN HR00112530227: https://www.usaspending.gov/award/ASST_NON_HR00112530227_097
- Cornell FAIN HR00112530231: https://www.usaspending.gov/award/ASST_NON_HR00112530231_097
- BlueHalo FAIN HR00112530201: https://www.usaspending.gov/award/ASST_NON_HR00112530201_097

### Animal ethics, privacy and governance

The 2026 ISC paper reports approval by the University of Osaka animal experimental committee (approval **2023-5-0**). JST's project outline explicitly says the team seeks to quantify a proxy for “living vitality,” taking assumed pleasure and discomfort into account, while acknowledging that researchers cannot know organisms' true emotions. This is a real animal-welfare consideration in the program's design.

That approval is not a comprehensive governance framework for privacy, cybersecurity, field release, or human biological data. The reviewed cyborg-insect papers describe animal physiological/behavioral signals and environmental sensing; they do not demonstrate collection of human DNA, personal identity matching, or a human surveillance database. Equally, publication-level disclosure is not a complete audit of all project data practices.

### Evidence status update

| Question | Current finding |
|---|---|
| Does the research use living insects with electronic systems? | **Yes — demonstrated.** |
| Can internal physiological signals influence AI-assisted insect control? | **Yes — laboratory demonstration, small sample and modest online accuracy.** |
| Has a group of cyborg insects been coordinated as a swarm? | **Yes — 20-insect experiment.** |
| Has a fully decentralized insect-to-insect radio mesh been demonstrated? | **Not in the reviewed experiments.** Centralized VICON localization remained in the 2025 swarm experiment. |
| Do patents cover insect electrode fixtures and locomotion control? | **Yes.** |
| Do these records establish global deployment, human DNA sampling, or a human surveillance network? | **No.** |
| Are animal ethics approvals documented? | **Yes, for the 2026 ISC study.** A comprehensive public privacy/security governance audit was not found. |

## Next research tasks

1. Continue tracing citations, personnel, patent inventors and technical work packages; initial institutional/funding map is now documented above.
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


## Cross-program technical comparison (research update, 2026-11-20)

This comparison separates adjacent technical directions. They may be composable in principle, but the sources reviewed do not establish one deployed system combining them.

### 1. Smart Dust: miniature electronic nodes

Berkeley's DARPA/MTO-supported Smart Dust project explored autonomous sensing and communication at very small scales. The project page reports working “macro motes” in a cubic-inch package with sensors, a bidirectional radio, processor and battery, and a 20-metre communication range. The cubic-millimeter complete system was the science/engineering goal; the project page distinguishes that target from the larger demonstrated devices. Patrick Pannuto's 2020 Berkeley dissertation says millimeter-scale self-contained sensing/computing/communication devices had become realizable, but most were one-off systems rather than a ubiquitous population numbering millions.

Sources:
- Berkeley Smart Dust project: https://www-bsac.eecs.berkeley.edu/~pister/SmartDust/
- Pannuto, *The Design & Implementation of Modular Smart Dust* (2020): https://www2.eecs.berkeley.edu/Pubs/TechRpts/2020/EECS-2020-208.html

### 2. Unattended ground sensors: event-driven low-power electronics

DARPA's completed Near Zero Power RF and Sensor Operations (N-ZERO) program pursued sensors that remain dormant or consume near-zero power until an external trigger or selected signature activates a conventional sensor suite. The stated motivation was to extend unattended sensor lifetime from weeks or months toward years while reducing maintenance and redeployment. A separate Department of Defense topic sought very small, inexpensive RF sensors distributable in quantity to observe the cyber-electromagnetic environment. These are electronic unattended-sensor architectures, not biological platforms.

Sources:
- DARPA N-ZERO: https://www.darpa.mil/research/programs/near-zero-rf-and-sensor-operations
- DoD topic A20-118: https://media.defense.gov/2022/Mar/25/2002963824/-1/-1/0/DOD_20.2_FULL.PDF

### 3. Cyborg insects: mobile biohybrid platforms

A 2025 *npj Robotics* study proposed an IMU-based localization and exploration strategy for an insect-machine hybrid search-and-rescue platform. The authors reported two-dimensional position error of 1 metre or less (about 5%) in their indoor and outdoor arenas. This is a meaningful step toward onboard localization without external motion capture in those experiments. It does not establish insect-to-insect radio routing, a large-scale autonomous mesh, or covert population deployment.

Source:
- https://www.nature.com/articles/s44182-025-00037-0

A different 2025 20-insect swarm experiment used centralized VICON positions despite a theoretically decentralized movement algorithm. The two studies represent different autonomy milestones and should not be collapsed into one result.

### 4. DARPA Convergence: engineered microbial sensing

DARPA's 2026 Convergence program describes non-pathogenic microbial consortia as biological platforms for remote, distributed detection of environmental hazards, including chemical analytes and pharmaceutical agents. The public program architecture moves from component design to integrated payloads and a proposed deployable platform subject to safety and regulatory testing. This is a separate microbial-sensor program; it does not describe cyborg insects, mosquito DNA collection or human identity matching.

Source:
- https://www.darpa.mil/research/programs/convergence

### 5. One Health: integrated sensing as a proposed architecture

A 2026 *Nature Sensors* perspective proposes connecting sensing platforms across human, animal and environmental domains, from wearable and ingestible devices to remote and environmental sensors. It explicitly identifies interoperable infrastructure, privacy, security, governance and stakeholder engagement as requirements. This is a research perspective and architecture proposal, not evidence that one global operational network already exists.

Source:
- https://www.nature.com/articles/s44460-026-00075-7

### Comparative conclusion

| Research direction | Primary capability | Key limitation in the reviewed evidence |
|---|---|---|
| Smart Dust | Miniature electronic sensing, computation and communication | Cubic-millimeter ubiquitous deployment remains distinct from early macro-mote demonstrations |
| Unattended ground sensors | Persistent, low-power event detection | Electronic sensor network, not biological sensing |
| Cyborg insects | Mobile living platform with electronic sensing/control | Autonomy and networking vary by study; swarm coordination is not automatically peer-to-peer routing |
| Microbial biosensors | Biological recognition of selected environmental analytes | Convergence remains a program development path with safety/regulatory gates |
| One Health integration | Conceptual framework linking human, animal and environmental observations | Governance and interoperability remain explicit prerequisites |

**Evidence boundary:** the sources support several real research programs with adjacent capabilities. They do not establish a single system combining Smart Dust, insect swarms, microbial biosensors, human DNA collection and identity surveillance. A unified architecture would require demonstrated interfaces, power, localization, communications, routing, access controls, data governance and field validation—not merely the existence of each separate component.


## Data lifecycle, privacy and governance (research update, 2026-11-20)

### Integrated sensing as a proposal, not an established global network

Ding et al., “Integrated sensing networks for One Health monitoring,” *Nature Sensors* 1, 485–493 (published May 18, 2026), proposes connecting observations across human, animal, plant and environmental domains. It describes multimodal data archives, AI-driven processing and integrated sensing/communications, and explicitly identifies secure interoperable infrastructure, privacy, governance, data sovereignty and public engagement as prerequisites. It is a perspective and proposed roadmap—not evidence that a global operational network already exists.

Source: https://www.nature.com/articles/s44460-026-00075-7

### Data lifecycle and risk boundaries

A useful review model separates six stages:

1. **Collection:** raw physiological, movement, acoustic, chemical, biological or environmental observations.
2. **Edge processing:** local filtering or feature extraction; local processing may reduce transmission but does not automatically anonymize the output.
3. **Transport:** device authentication, access control, encryption and integrity protection for data in transit and at rest.
4. **Aggregation:** joining datasets can create new inferences and re-identification risks even when individual inputs appear innocuous.
5. **Analysis:** AI outputs require provenance, uncertainty, validation context, model-version tracking and safeguards against treating predictions as direct observations.
6. **Action:** an alert should not itself confer authority to intervene; decision rights, proportionality, review and challenge mechanisms must be explicit.

### NIST IoT cybersecurity guidance

NIST published IR 8259 Revision 1 in April 2026, superseding the earlier IR 8259. The revision describes manufacturer cybersecurity activities spanning pre-market design and post-market support. It is guidance, not certification that a particular device or network is secure.

Sources:
- NIST IR 8259 Rev. 1: https://csrc.nist.gov/pubs/ir/8259/r1/final
- NIST IoT technical capabilities catalog: https://pages.nist.gov/IoT-Device-Cybersecurity-Requirement-Catalogs/technical/
- NISTIR 8259A: https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8259a.pdf

The NIST catalog's seven technical capability areas are:
- Device identification
- Device configuration
- Data protection
- Logical access to interfaces
- Software update
- Cybersecurity state awareness
- Device security

These capabilities help protect devices and their data. They do not establish that a data-collection purpose is lawful, proportionate or ethically justified. Security, privacy and legitimate authority are distinct layers.

### Governance checklist for any distributed sensing system

Before deployment or data integration, document:
- Specific purpose and legal authority for collection.
- Data minimization and why each sensor field is necessary.
- Responsible data steward and affected people/communities.
- Access roles for raw observations, derived features and identity-linking keys.
- Encryption, authentication, secure updates and audit logging.
- Retention periods, deletion rules and limits on secondary use.
- Provenance, model uncertainty, validation limits and human review.
- Incident reporting, correction and challenge processes.
- Explicit decision authority and proportionality constraints for any intervention.
- Independent oversight and public transparency appropriate to the use case.

### Core analytical warning

Data sensitivity can increase as information moves through the pipeline: an isolated reading may become a persistent pattern; a pattern may become identity-linked; and an inferred risk score may trigger a consequential action. A privacy review must therefore assess not only what each sensor collects, but also what can be inferred after data are retained and combined.

**Evidence boundary:** the One Health article proposes a broad integrated architecture; NIST provides device cybersecurity guidance. Neither source demonstrates that every proposed sensor type is deployed, that the systems share a common database, or that a particular government or company can access all such data.


## Institutional data access and legal framework (research update, 2026-11-20)

This section distinguishes documented data-access rules from speculation about whether particular agencies receive data from the research programs described elsewhere in this exhibit. A sensor's technical ability to collect or transmit information does not establish that an institution owns the resulting data, has legal authority to obtain it, or may reuse it for a different purpose.

### 1. Federal health information: HIPAA public-health pathway

The HHS HIPAA Privacy Rule summary states that covered entities may disclose protected health information to public-health authorities legally authorized to receive it for disease prevention and control. This is a purpose- and recipient-specific permission, not blanket access for any government agency, contractor, laboratory or research team. Other HIPAA pathways, state confidentiality laws and the facts of the disclosure also matter.

Source: https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html

The CDC Field Epidemiology Manual explains that states generally have broader public-health authority within their jurisdictions, while federal public-health activity must fit within federal constitutional and statutory powers. Both levels remain subject to constitutional constraints, including Fourth Amendment and due-process protections. The manual also explains that HIPAA's public-health disclosure provision is permissive and that state law and data-sharing agreements may matter.

Source: https://www.cdc.gov/field-epi-manual/php/chapters/legal.html

### 2. CDC-funded program data stewardship

CDC's Data Sharing and Collection Principles and Standards for NCHHSTP-funded programs call for:
- A legitimate and clearly specified public-health purpose.
- Collection of the minimum personally identifiable information needed.
- Named responsible data stewards and defined access roles.
- Secure storage and transmission.
- Sharing identifiable information only with a justifiable public-health need.
- Risk/benefit review before sharing identifiable data for a purpose beyond the original one.
- Equivalent safeguards at recipient programs and procedures for breach reporting.

These are published standards for the identified CDC program context; they should not be generalized into a claim that every CDC dataset or every sensor network follows the same procedure.

Source: https://www.cdc.gov/program-collaboration-service-integration/php/data-security/principles.html

### 3. Defense Health Agency: documented Data Sharing Agreement process

The Military Health System's Research Streamlining Initiative describes a formal DHA Data Sharing Agreement (DSA) application and review process for researchers, contractors and non-DOD public-health officials seeking access to DHA-managed data. The FAQ says an MOU or MOA cannot substitute for the DSA. It describes review for HIPAA, Privacy Act and DOD privacy/security requirements, with additional review when DHA data would be stored on a non-federal information system.

This is a concrete example of institutional data access being mediated by a data steward, sponsor, privacy office and documented approval. It concerns DHA-managed health data; it is not evidence that DHA receives data from cyborg-insect, mosquito, Smart Dust or One Health research.

Source: https://www.health.mil/Military-Health-Topics/Privacy-and-Civil-Liberties/Research-Streamlining-Initiative?type=FAQs

### 4. Florida: Department of Health records and public access

Florida Statutes §119.0712(1) makes personally identifying information in records held by the Florida Department of Health relating to an individual's personal health or eligibility for health-related services confidential and exempt from general public-records disclosure, subject to specified exceptions. The statute identifies exceptions including express written consent, a medical emergency, court order, and disclosure to a health research entity under an approved research protocol and a purchase/data-use agreement. Such agreements must restrict identifying disclosures and limit use to the approved protocol.

Florida's general public-records policy in §119.01 favors public access to state and local government records, but the statute expressly preserves records that are confidential or exempt by law. Therefore, public-records access, agency collection authority and research data access are separate legal questions.

Sources:
- Florida Statutes, Chapter 119, especially §§119.01 and 119.0712: https://www.flsenate.gov/Laws/Statutes/2026/Chapter119/All

### 5. Florida Digital Bill of Rights: important scope limits

The Florida Digital Bill of Rights (FDBR), Part V of Chapter 501, is not a universal privacy law covering every organization or government data system. Section 501.703 excludes state agencies and political subdivisions, nonprofits, postsecondary education institutions, and HIPAA-regulated covered entities/business associates, among others. The statute's definition of a covered controller also sets a $1 billion global-revenue threshold plus at least one specified business-model criterion (such as certain advertising, smart-speaker or app-store activity). Section 501.704 separately exempts categories including health records, qualifying identifiable human-subject research information and information used only for authorized public-health activities.

The FDBR's definitions include genetic or biometric data processed for unique identification within its sensitive-data category, but the law's scope and exclusions must be checked before applying it to a particular institution or dataset. Exclusion from the FDBR does not mean that no other privacy, confidentiality, research or constitutional rule applies.

Sources:
- §501.703, applicability: https://www.flsenate.gov/Laws/Statutes/2026/501.703
- §501.704, exemptions: https://www.flsenate.gov/Laws/Statutes/2026/501.704
- §501.702, definitions: https://www.flsenate.gov/Laws/Statutes/2026/501.702

### 6. Evidence required to establish an actual data-sharing relationship

To establish that a specific agency receives, can access or reuses a specific sensor dataset, seek primary documentation such as:
- A named dataset, system or system-of-records notice.
- A data-use or data-sharing agreement identifying the recipient and purpose.
- A contract, grant work plan or statement of work identifying the data flow.
- A privacy impact assessment, protocol or agency authorization.
- Procurement records identifying the platform, data custodian and service provider.
- Retention, deletion, onward-sharing and audit provisions.

A grant award, institutional collaboration, patent, technical radio capability or general public-health authority is not, by itself, proof of a data-sharing relationship.

### Current findings and boundaries

| Question | Finding |
|---|---|
| Are there lawful pathways for public-health authorities to receive certain health information? | Yes, including HIPAA's authorized public-health disclosure pathway, subject to scope and applicable law. |
| Does CDC publish data stewardship and secondary-use standards? | Yes, for the specified NCHHSTP-funded program context. |
| Does DHA document a formal approval process for access to DHA-managed data? | Yes, including a DSA process. |
| Does Florida protect identifying personal-health information held by its Department of Health? | Yes, subject to statutory exceptions. |
| Does the Florida Digital Bill of Rights apply to state agencies or local governments? | No; §501.703 expressly excludes them. |
| Do these authorities prove that CDC, DHA or Florida receives insect telemetry, mosquito-derived human DNA or Smart Dust data? | No such connection has been established in the reviewed sources. |

**Research conclusion:** documented institutions have different legal authorities, custodianship rules and data-sharing procedures. The next proof step is to identify named systems, agreements, contracts and actual data recipients—not infer access from technical capability or institutional proximity.
