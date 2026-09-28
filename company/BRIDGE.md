# MINT Public State Bridge

Portal attempts to read the canonical public snapshot from MINT's **main** branch.

If the snapshot is unavailable, invalid, or the schema/read-only assertion fails, Portal uses its bundled local snapshot and labels it LOCAL FALLBACK. If a remote snapshot is older than 24 hours, Portal labels it STALE.

Portal intentionally does not read an unmerged MINT feature branch. This prevents an experimental branch from being presented as canonical operating state.

This is a one-way telemetry bridge. There is no command, approval, payment, messaging, deployment or permission endpoint in Portal.
