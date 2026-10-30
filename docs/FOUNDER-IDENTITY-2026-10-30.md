# Founder identity and scorecard integrity — 30 October 2026

## Identity model

- **founder_profiles.id** stays the internal numeric primary key used by invitations, company relationships, introductions, chats, scorecards and moderation. Existing foreign keys and slugs are unchanged.
- **founder_profiles.founder_uid** is a permanent, opaque UUIDv4 unique to each founder record, including sourced founders, approved members, new member-created profiles and soft-deleted records. It is generated server-side, not accepted from user input, and cannot be reassigned through the model.
- **founder_profiles.user_id** is optional account ownership; an unclaimed researched founder is not a Wosool member. A registration applicant receives a founder ID only upon verified, approved profile creation. Do not automatically match profiles by name, email guess or company alone.
- **directory_key** identifies a sourced import record, while **slug** remains the public URL. Neither proves account ownership. The founder UID is a reference identifier, never an authentication or activation token.
- **scorecards.founder_profile_id** remains the numeric foreign key. A unique constraint protects the one-to-one relationship. Scorecard responses derive their founder UID directly from the linked founder, avoiding an inconsistent duplicated field.

The public directory can return an opaque founder UID alongside sourced profile facts, without private account emails, invitations or scorecard details. The owner dashboard and protected administrator views display that same UID for support and reconciliation. Static editorial catalogue records do not embed environment-specific UUIDs.

## Safe migration and release procedure

1. Verify a recoverable database backup, record currently deployed backend and frontend SHAs, and stage a matching database copy. Preserve APP_KEY and the established a7be830 Hostinger frontend packaging, separate API service, queue, and storage.
2. Before production migrations, inspect historical scorecard duplicates using SQL:

    SELECT founder_profile_id, COUNT(*) FROM scorecards GROUP BY founder_profile_id HAVING COUNT(*) > 1;

   Any result must be reconciled manually with a backup and explicit editorial/ownership review. Never automatically merge, delete, reassign or invent historical performance metrics.
3. Deploy compatible backend code and run **php artisan migrate --force** from the actual backend root. The UUID migration fills only NULL/empty founder UID values (including soft-deleted rows) without touching editorial fields or updated timestamps; it validates UUIDs before establishing a unique index. The scorecard migration refuses to apply a unique constraint when duplicates exist, without deleting any rows. Both migrations retain their new columns/indexes during an application rollback.
4. Run **php artisan wosool:check-founder-identity --json**. This is read-only and emits aggregate counts only: invalid/missing/duplicate UUIDs, multiple live profiles per account, duplicate or orphan scorecards, and active member profiles missing their private scorecard. Missing historical scorecards are a warning requiring review; no fake scores are generated.
5. Verify founder directory list/detail in Arabic and English, owner profile/scorecard and admin founder/scorecard views display consistent identities. Public APIs must not expose emails, account associations, private messages or scorecard history. Exercise controlled registration, OTP, application approval and separate authenticated founder invitation claim.
6. Deploy the matching frontend after backend verification, then run the documented production smoke tests and verify both serving source SHAs. A successful pull request, CI check or preview deployment is not evidence that the production database or Hostinger services changed.

## Ownership and security guardrails

- UUIDs remain stable through name/slug changes, verification, invitation claim, suspension, company edits and deletion. Soft-deleted records retain their UUID and cannot be silently re-imported.
- The importer remains idempotent, preserves member/editor revisions and deletions, and never creates users, sends mail or implies membership. No sourced founder gets an invented private scorecard.
- Approved member profiles created in the workspace get an initial private, unscored scorecard. A suspended founder is not silently reactivated by replaying application approval.
- Both member and administrator APIs continue to enforce roles, privacy settings, OTP/password proof, and moderation gates; a UUID alone never authorizes writes.
- A duplicate owner or legacy scorecard conflict triggers an audit or migration blocker, not automatic deletion. Handle each case through a separate backed-up reviewed data correction.

Changes merged to the repository are distinct from a migrated production database, founder imports and verified live deployment.
