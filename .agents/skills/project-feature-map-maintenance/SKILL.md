---
name: project-feature-map-maintenance
description: Create or maintain the project's verified user journey map when routes, UI selectors, roles, or visible states change.
---

1. Read the playbook and inspect the changed routes, components and tests. Launch the exact candidate, discover steps through the actual interface, and use semantic roles/names first or stable scoped test IDs when needed. Do not discover production secrets or rely on guessed selectors.
2. Preserve stable IDs. Keep `docs/verification/feature-map.json` authoritative for navigation: display name/goal, platform/locale/role, prerequisites and test fixtures, entry, ordered steps and shortcuts, selectors, loading/empty/error/success behavior, test references and exact last verified SHA. Identify unverified and not applicable with an explanation.
3. Change tests and map in the same PR. Compare mapped routes/IDs to discovered code metadata, check scoped selector uniqueness by running real smoke tests, and fail the drift check on missing impact evidence or mismatch. Add a negative control proving broken navigation/selector wiring is caught. A touched map or a passing JSON parser does not prove freshness.
4. Publish evidence in the PR and report missing runtime coverage. Do not edit existing exemptions or skip required tests.
