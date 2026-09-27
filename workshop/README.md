# THE WORKSHOP

The Workshop is the first Portal room where the traveler becomes an operator-builder rather than merely a player. Direct access requires the genuine `operator` artifact.

The first interface is intentionally small: a 7×5 construction bench. The operator toggles cells, names the construction, and commits it. The committed object is stored locally under `portal-workshop-object-v1` using schema `portal.workshop.object.v1`, including its name, cell pattern, and real local commit timestamp. A first successful construction grants `first-construction`.

This is persistent local state, not a simulated network object. Future Portal systems can react to the committed construction without pretending it exists outside this browser.
