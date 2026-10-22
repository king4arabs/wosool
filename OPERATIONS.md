# Operations

## Operating Model

Wosool should be run through a **daily enhancement loop** that begins with audit, prioritizes the highest-value change, implements carefully, validates the result, documents the decision, and releases semantically.

| Step | Operating expectation |
|---|---|
| Audit | Review code, docs, quality posture, and gaps first |
| Prioritize | Choose the highest-leverage improvement |
| Implement | Preserve existing work and improve iteratively |
| Validate | Run local and CI checks appropriate to the change |
| Document | Update core docs, SKILLS, changelog, and version metadata |
| Release | Commit with clear intent and push through GitHub |

---

## Release Discipline

Every release cycle should update:

| File | Purpose |
|---|---|
| `CHANGELOG.md` | Release history |
| `VERSION.md` | Current version state |
| `PROJECT_STATUS.md` | Delivery posture |
| `TODO.md` | Next priorities |
| Relevant `SKILLS/*.md` | Execution memory and standards |

---

## Near-Term Operational Priorities

The operational focus before launch is to make the repository easier to trust, easier to hand over, and easier to scale. That means standardizing validation, documenting decisions, and preparing the system for staged rollout across Saudi Arabia and the GCC.
