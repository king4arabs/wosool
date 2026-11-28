# Database assurance — 28 November 2026

## Acceptance slice

This record covers the first local-observed database slice under the project-manager verification playbook: source inspection, a deterministic feature map, a narrowly scoped non-production Agent correction workflow, synthetic fixtures, and explicit promotion blockers. It does not grant production access, create an account, apply a live migration, import content, or establish a deployment.

The separately referenced `/user_notes/long_form/database_assurance_2026_11_27.md` was not present in this execution environment. This record therefore uses the acceptance criteria supplied in the owner direction and the repository's existing security, deployment and administration guides.

## Source-inspected architecture

| Criterion | Observed evidence | Status |
| --- | --- | --- |
| Application/database framework | Laravel 13; connection definitions for SQLite, MySQL/MariaDB, PostgreSQL and SQL Server in `backend/config/database.php` | Verified in source |
| Local/test engine | `backend/.env.example` selects SQLite; test fixtures use `RefreshDatabase` | Verified in source |
| Production engine and version | Production reads `DB_CONNECTION`/`DB_URL`; no authorized host metadata was available | **Unverified** |
| Environment isolation | Local/test correction service rejects every environment except `local` and `testing`; deployment guide requires a separate staging database | Verified in source; staging/production topology unverified |
| Schema/index evidence | Versioned migrations; founder identity, scorecard uniqueness and the new audit indexes are source-visible | Verified in source; live migration state unverified |
| Secrets | Database credentials and identities are environment-only; `APP_KEY` must be preserved; no secret is committed by this slice | Verified in source; host secret-store configuration unverified |
| Encryption | Sensitive application fields use Laravel encrypted casts. Transport/at-rest database encryption depends on the configured provider/engine | Application field encryption verified; provider encryption unverified |
| Recovery | Deployment procedure requires a pre-release backup, separate staging rehearsal and guarded restore | Procedure verified; backup permissions and successful restore evidence unavailable |
| Roles | Platform `admin` and member roles exist. The readiness probe additionally requires one named, verified admin ID. The new Agent identity is a separate expiring CLI configuration value, not a platform user or administrator | Verified in source |

No read-only production database route or hosting session was available, so no engine/version, extension list, database identifier, schema version, storage encryption setting, backup timestamp, restore result or privilege metadata was collected. The missing scope is authenticated read-only access to the existing backend hosting/database metadata plus an approved, privately authenticated human administrator identity.

## Bounded implementation

`wosool:agent-correct-founder` is disabled by default and is restricted to local/testing. It requires an exact configured Agent identity, exact `wosool` project, unexpired authorization, one exact unclaimed founder slug, an optimistic-lock timestamp, a verification source, and a 20–500 character reason. Preview is the default. `--apply` can update only one of `linkedin_url`, `twitter_url`, or `website_url`, with the 255-character database bound and credential-free HTTPS validation.

The update and audit insert share one transaction. Audit rows retain request, actor, project, operation, status, target, field, source, reason and before/after SHA-256 values; the corrected values themselves are not copied into the audit. Role/grant fields, publication state, export-like fields, deletion fields, claimed founders, other projects, other identities, expired identities and stale previews are denied. There is no generic query, export, bulk update, delete, grant or production mode.

## Synthetic acceptance matrix

| Scenario | Fixture/assertion | Local status |
| --- | --- | --- |
| Human Super Admin positive readiness | Existing `DataReadinessTest`: named verified platform admin receives only `{status: ready}` | Source inspected; hosted PHP test required |
| Human adjacent/unverified deny | Different admin, member and unverified admin receive forbidden | Source inspected; hosted PHP test required |
| Agent routine preview/apply | One unclaimed disposable founder URL; preview unchanged, apply changes exactly one row | Source inspected; hosted PHP test required |
| Adjacent project/identity deny | Wrong project and wrong Agent identity fail before audit | Source inspected; hosted PHP test required |
| Sensitive/export/grant/destructive deny | `is_public`, `export`, `role`, and `deleted_at` are outside the allowlist | Source inspected; hosted PHP test required |
| Expiry and stale preview | Expired configuration and changed `updated_at` fail | Source inspected; hosted PHP test required |
| Independent audit | Preview and apply have separate UUID audit rows containing hashes, not target values | Source inspected; hosted PHP test required |
| Rollback | Removing the synthetic audit table makes apply fail and preserves the original founder URL | Source inspected; hosted PHP test required |

Node-side deterministic checks passed locally on 28 November: 14/14 content and feature-map tests, `content:check` at 445 founders / 237 companies / 162 stories with zero integrity problems, and `content:review` with 280 profiles due. PHP and Composer are unavailable locally, so the Laravel acceptance matrix is not represented as passed until hosted CI completes.

## Human administrator design and promotion gates

The human Super Admin remains an individual platform account, never an Agent identity. The source readiness route requires a verified admin plus an exact configured user ID and returns status only, but the repository explicitly states that MFA is not implemented by this route. Keep `WOSOOL_DATA_OPERATOR_USER_ID` unset until the existing hosting scope confirms a private entry point, individual identity, MFA, time-limited elevation procedure, audit retention and revocation test. Do not create a shared password or disclose credentials.

Promotion remains phased:

1. **Source/read-only:** this record and the feature map; no live write.
2. **Isolated validation:** hosted Laravel matrix on disposable SQLite fixtures; no production data.
3. **Cloud evaluation:** two approved different-model evaluations and a 10/10 holdout are unavailable in this environment and remain unverified.
4. **Staging rehearsal:** separate database, backup proof, migration status, scoped identity, apply/rollback/audit checks.
5. **Production acceptance:** independent human approval, exact reviewed SHA, green required checks, verified engine/version/support, MFA/private entry, backup/restore evidence, least-privilege grant and revocation. No production correction command exists in this slice.

Rollback for source is a normal reviewed revert. The migration is additive and its `down()` removes only the new audit table, but it has not been applied to staging or production. A deployed rollback must preserve any audit evidence according to the approved retention plan rather than dropping it automatically.

## Feature-map and release state

The initial machine-checked map is [`feature-map.json`](feature-map.json). It covers only the two database-operation entry points, not the full public bilingual product. The drift test rejects duplicate feature IDs, missing evidence files and entry-point drift. This slice must not advance to protected auto-merge until hosted tests, independent review and the playbook's model/holdout gates are satisfied. Source merge, migration, deployment, production access and production data mutation remain distinct.
