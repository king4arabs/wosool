# Roadmap

## Current execution plan — 17 October 2026

Use [Continuous development](docs/CONTINUOUS-DEVELOPMENT.md) as the current phased plan and acceptance gates. The older release tables below are historical planning context, not evidence of current completion. Founder/company record-specific metadata and noindex-on-unavailability are implemented and locally tested. Next: verify live profile metadata and production release/imports/cron, complete API field schemas, and make newsroom filtering cover the full database. Source publication is not evidence of production deployment or import.

16 October checkpoint: founder/company-specific metadata and missing-profile noindex were observed on Wosool.org; the hosting source SHA and prior imports remain unverified. The next bounded fix protects public collection snapshot fallback from denial/withdrawal responses, with state tests and a required isolated-browser CI gate. After release verification, continue field-level OpenAPI work, whole-database news filtering and remaining homepage/detail fallback review.

17 October checkpoint: fixed the content commands' omission of the already-merged 100-profile expansion. All 144 founders / 79 company groups / 42 stories now enter integrity checks and freshness reporting, without advancing review dates or implying production import. Added regression/CI coverage and a guard against future unregistered founder catalogs. Live `/founders` initial HTML now includes the loading placeholder and omits saved founder links; readiness responds `ready`, but the deployed SHA and full browser withdrawal behavior remain unverified. Next: deployment/import verification, then field-level OpenAPI contracts; preserve concurrent Arabic/API/news work in PR #70.

## Roadmap Framing

17 October API checkpoint: news list/detail now have field-level OpenAPI schemas and real-response Laravel contract tests. The schema/document change requires frontend deployment; it adds no backend runtime behavior or database import. Next contract slice: founder/company/scorecard serialization, then the revenue-evidenced startup directory. Hosting revision/import validation remains external; the public founder API still reports 29 visible records. Track the inherited, currently unpatched dev-only `braces` advisory in the lint dependency chain separately from the clean production dependency audit.

Wosool should mature through **sequenced execution**, not uncontrolled feature expansion. The roadmap is organized to first strengthen delivery foundations, then unlock real product workflows, then scale regionally with production discipline.

| Phase | Focus | Status |
|---|---|---|
| `0.3.x` | CI/CD, tests, docs, governance, release discipline | Complete |
| `0.4.x` | Authentication, RBAC, public-page API integration | Complete |
| `0.5.x` | Member profile/company CRUD, event RSVP, program applications | Complete |
| `0.6.x` | Arabic/English localization, RTL, Saudi readiness rollout | Next |
| `0.7.x` | Analytics, monitoring, support tooling, growth instrumentation | Planned |
| `0.8.x` | AI-enabled workflows, matching, scorecards | Future |

---

## Immediate Priorities

### Release `0.3.0`

| Priority | Outcome |
|---|---|
| Establish CI/CD | Reliable validation on push and pull request |
| Add backend API tests | Protect current public contract |
| Upgrade repository OS | Improve execution quality and auditability |
| Align testing and security docs | Reduce delivery ambiguity |

### Release `0.4.0`

| Priority | Outcome |
|---|---|
| Implement authentication | Real member access and protected flows |
| Activate role boundaries | Safer admin and dashboard separation |
| Replace mock data on priority public pages | Operational realism and easier iteration |
| Start monitoring and analytics | Better product and operational visibility |

### Release `0.5.0`

| Priority | Outcome |
|---|---|
| Founder/company CRUD | Members can create and manage their profile and companies through `/api/v1/member/*` |
| Event RSVP workflow | Members can RSVP and cancel; capacity triggers waitlisting |
| Program application workflow | Members can apply to open programs with deadline and duplicate guards |
| Test coverage growth | 25 new backend feature tests, 43 total passing |

---

## Regional Scaling Track

Saudi Arabia remains the reference market. GCC expansion should happen only after the platform supports bilingual content strategy, RTL layout readiness, operational compliance review, and appropriate payments, support, and data policies.
