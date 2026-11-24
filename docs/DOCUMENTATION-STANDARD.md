# Documentation and release evidence standard

Every material product, engineering, content, operations or security change must be discoverable from the root [README](../README.md). Keep the README concise; put detailed records in the relevant linked guide, [CHANGELOG](../CHANGELOG.md), and dated reports when appropriate.

## Required update record

For each substantive PR, include the following in its description and changelog or linked report:

| Field | Required detail |
| --- | --- |
| Context | Problem, objective, affected users and scope |
| Implementation | Features, routes, components, services and files changed |
| Compatibility | API/schema changes, migration order, environment variables and existing-data handling |
| Security and privacy | Authorization, approval boundaries, consent and data exposure |
| UX | Arabic/English, responsive layouts, accessibility, loading/error/empty states |
| Verification | Exact commands, CI links and actual pass/fail/not-run results |
| Release | Source commit, PR, version if applicable, deployment status, serving revisions |
| Operations | Required configuration, monitoring, migration/rollback procedures |
| Follow-up | Known limitations, external dependencies and remaining acceptance criteria |

Use explicit dates and durable repository-relative links. Do not commit private data, OTPs, credentials, screenshots of protected records or unredacted logs.

## Where to write

- [README](../README.md): stable overview, onboarding and index; update when entry points, architecture, setup or documentation links change. Do not prepend routine daily reports.
- [CHANGELOG](../CHANGELOG.md): dated, concise summary with evidence links, including documentation-only changes.
- [VERSION](../VERSION.md): semantic releases; keep package manifests and lockfiles aligned when an actual version changes. A documentation refresh alone need not change the application release number.
- [ROADMAP](../ROADMAP.md): future work; do not describe planned work as delivered.
- [Architecture](../ARCHITECTURE.md), [API](API.md), [Decisions](../DECISIONS.md), [ADRs](ADR/): interface and architectural changes.
- [Testing](../TESTING.md), [Deployment](../DEPLOYMENT.md), [Security](../SECURITY.md): durable operational guidance.
- [Administration](ADMIN-OPERATIONS.md), [Registration QA](REGISTRATION-QA.md), [EOA](EOA.md), [Identity review](MEMBER-IDENTITY-REVIEW.md): feature workflows.
- [Research](research/): dated primary-source evidence, review queue and catalog updates.
- [Historical README archive](history/README-UPDATES-2026-11-24.md): previous updates retained for traceability.

## Release evidence

Distinguish implementation, source commit, merge, CI, migration/import, deployment and live verification. Do not mark an unrun test as passed. Never claim email inbox delivery from a mail-fake test or a successful transport call alone. Never infer membership from a founder record or event RSVP. External ticket approval remains independent.

## Pull request checklist

- [ ] Relevant code and regression tests updated.
- [ ] Changelog entry and detailed documentation linked from the README's existing index or a new index entry.
- [ ] API/configuration/migration and security effects recorded, or explicitly none.
- [ ] Version policy followed, where applicable.
- [ ] CI evidence and known limitations recorded.
- [ ] Production deployment and serving revisions recorded only after verification.
- [ ] No secrets, private data or internal AI notes exposed in public UI.

See [AGENTS](../AGENTS.md) for repository-specific development constraints.
