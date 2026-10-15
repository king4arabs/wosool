# Profile SEO: evidence and release boundaries

Review date: 15 October 2026. Bounded cycle based on main `3d46c43`; concurrent PR #70's startup Arabic-label work was left untouched.

## Source verification

- [Unifonic's official about page](https://www.unifonic.com/en/about) was retrieved and read. It identifies Ahmed Hamdan as CEO/co-founder and Hassan Hamdan as co-founder, consistent with existing founder records. Funding, enterprise counts and annual transactions on this page are not earned revenue. This check does not reverify the separate directory's revenue evidence.
- [SiFi's Money20/20 announcement](https://www.sifi.app/en/resources/news/sifi-and-idemia-secure-transactions-expand-partnership-and-with-launch-of-tap-to-activate-at-money20-20-middle-east/) was retrieved and read. It identifies Rami Panayoti as co-founder/Chief Business Officer and reports 7,000+ businesses. This is company-reported customer count, not revenue or audited results. The page date remains 13 September 2026 and body dateline 14 September 2026. The existing news brief already preserves this distinction; no duplicate was added.
- The revenue-directory source registry and current research queue remain unchanged. This is a targeted primary-source spot-check, not a fresh verification of every program, social link, image, company or revenue statement. No review dates were advanced, no candidates promoted, no inferred membership/partnership and no new imagery copied.

## Implementation and checks

Both detail routes now use `publicProfileMetadata`, with fresh anonymous API requests, default Arabic locale and explicit canonical/share paths. Only name and public biography/description (or founder tagline) are used. They do not export email, nested account, scorecard or activation data. Titles do not imply membership, claims, approval or audit. An invalid, hidden, inactive, denied, missing or unreachable record gets generic `noindex` metadata; existing client rendering is unchanged. A missing page may still return HTTP 200, intentionally with noindex rather than an asserted 404.

- Frontend lint, type-check, 109 unit tests and production build passed.
- Ten HTTP checks against the production Next build and an isolated mock public API passed: public → private → missing → outage → public for each route. These checked title, canonical, description, robots/Googlebot, fresh visibility on every request and absence of forwarded browser credentials/private fields. The server was bound to loopback explicitly because this environment cannot enumerate network interfaces.
- Entrepreneur data validation passed (62 records in that separate dataset).
- `content:check` and `content:review`: 44 founders, 33 companies, 42 stories; zero integrity problems and zero founder reviews due. These are snapshot counts, not production counts.
- No PHP or Composer executable is available locally. Backend tests and the full release gate must pass in CI; no local backend test success is asserted.

## Release gate

Publish through a review branch; fetch main again before publication, preserve concurrent work, and merge only after frontend/backend CI and existing deployment checks pass. Inspect the new revision on Wosool.org separately. Branch/preview deployment does not prove production frontend delivery, backend release or database imports.

This change needs no database migration/import and modifies no moderation flags, claims, source records or editor-owned content. Existing production import/admin-correction and cron verification work from 14 October remains outstanding until verified on the configured host. No hosting resources, credentials, invitations or outreach are changed.
