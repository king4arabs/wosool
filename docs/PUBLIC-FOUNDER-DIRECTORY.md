# Public founder directory

## Where each list gets its records

| Surface | Read path |
| --- | --- |
| Homepage: Meet the founders | One anonymous GET to `/api/v1/founders/discover/cards?start={uuid}`. Up to 24 cards; a per-visit UUID selects an indexed slice of the entire published pool. Changing language reuses that slice. The carousel mixes regions and can be shuffled. |
| Founder directory and profile | The existing paginated `/founders` and exact `/founders/{slug}` API routes. The full directory retains bilingual search, region/sector filters, and deep links. |
| Founders on company profiles | The moderated many-to-many `founder_company_links` relationship. |
| News articles | Up to ten exact company names/slugs, matched against public linked companies in either language. No match means no founder links. The news grid makes no per-card founder requests. |

A listing is not an account or an endorsement. Only the existing activation rules allow a member indicator or messaging. Empty lists, access denials and outages do not restore identities from the source catalog. If an older Laravel router explicitly reports that the discovery route does not exist, the homepage can still read one bounded page from the existing public founder API. Generic 404s and access errors do not trigger this compatibility path. News stories and revenue evidence retain their own publication policies.

## Database and operations

`FounderProfile::publiclyListed()` combines active status, public visibility, soft-delete handling and geographic eligibility before querying or serializing relationships. Discovery reads two non-overlapping ordered ranges of the immutable random founder UUID, wrapping at the end without random-sorting or downloading the entire directory. An additive index on `(status, is_public, deleted_at, founder_uid)` supports this lookup. No row is inserted or rewritten by the migration.

Release the API using the existing backend process, apply the index migration through the normal backed-up migration process, then release the frontend. Verify both serving revisions, a live unclaimed profile, a known public member, a company link and the homepage rotation. An empty production directory calls for checking the published database rows; do not repopulate it automatically. The existing `wosool:import-founders` command is a separate operator action and must respect editor changes, claims and deletion tombstones.

Rollback: deploy the prior application revisions through the existing process. If necessary, reverse the isolated index migration after checking migration order; its down method drops only the index. Do not roll back the permanent UUID migration or delete directory records.

The frontend public-copy/accessibility check visits public pages in both languages at mobile and desktop sizes, with representative dynamic routes. Admin-only research notes remain available to editors; evidence, credits, eligibility and recovery instructions stay available to visitors.
