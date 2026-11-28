---
name: project-glass-verification
description: Verify an authorized project change through its real user entry point, capture reproducible evidence, and validate an ordinary functional bug fix before code review.
---

1. Open the project's `docs/verification/PROJECT_MANAGER_PLAYBOOK.md` and `docs/verification/feature-map.json`. If the map is absent or unverified, inspect launch documentation and actual runtime, then use project-feature-map-maintenance before relying on it.
2. Start the documented local or isolated environment and synthetic fixtures. Use Playwright/CDP for web, app-dev Electron harness with loopback CDP for desktop, macOS Simulator/XCTest for iOS, or the documented CLI. Record exact revision, platform, commands and capabilities unavailable.
3. Reproduce the failure on the control or create a failing regression for the stated behavior. After a scoped fix, run the same test, nearby affected journeys, documented assertions for loading/empty/error/success, and keyboard/accessibility requirements where applicable. Do not substitute source inspection for app execution.
4. Attach sanitized screenshots, console and network observations when relevant. Capture CPU/heap evidence only when justified and only with isolated synthetic data. No secrets, customer records, real messages or transactions.
5. Report PASS/FAIL/NOT RUN per assertion, base/head SHA, artifact links, and next blocker. Never approve your own PR as the independent reviewer or infer deployment from merge. This skill does not authorize release or merge.
