# Founder directory and activation

The reviewed catalogue contains 15 founders across Unifonic, Swarm Robotics, Jahez, Foodics, Salla, Tamara, Rasan and Kitopi. Each record carries bilingual text, public company links, source URLs and the review date (2026-10-11). Unsupported photographs, social accounts, contact addresses, revenue and scores remain empty. Rasan's Moayad Alfallaj is listed as co-founder and chairman based on the current company leadership page; historical founder evidence is retained separately.

## Database import

Deploy the Laravel source and run `php artisan migrate --force`, then `php artisan wosool:import-founders`. Alternatively, after migration an administrator can select **Import researched profiles** at `/admin/founders`.

Automatic schema rollback is refused to retain claimed profiles and invitation history; application code can be rolled back while retaining these additive columns.

The importer creates unclaimed public founder/company records and links co-founders to shared companies. It creates no user accounts and sends no email. Repeated imports preserve existing profiles and member edits. Matching uses stable catalogue keys and existing name/company-site relationships; it never takes ownership of an existing member profile. Slug collisions receive a suffix. Both catalogue copies are checked for equality in the frontend tests.

`status` controls directory moderation, while `activation_status` distinguishes unclaimed records from active members. A researched entry is not an assertion of Wosool membership, endorsement or a verified growth score. Admin dashboard member counts exclude unclaimed catalogue records. Public cards link to `/founders/{slug}`. During an API outage, the public pages can show labelled source snapshots; account operations always require the API. A definitive 404 never falls back to a snapshot on the profile page.

## Invitations

Administrators select a founder, enter an independently confirmed recipient email, record the verification evidence, and send an invitation. General support mailboxes and guessed email patterns are not imported as founder addresses. Emails are encrypted in the database and visible only to administrators. An audit record tracks import, send, failure, revoke and moderation actions.

The token has 64 random characters; only its SHA-256 hash is stored. It expires after seven days, is passed in a URL fragment (not server access-log query parameters), is checked via POST, and is consumed transactionally once. Resending revokes previous links; a one-minute cooldown and route throttles limit abuse. GET/preview requests do not activate an account, so email scanners cannot consume the invitation.

A new recipient sets a password with at least 12 characters, mixed case and numbers, and accepts the privacy notice. A recipient with an existing account must prove ownership with that account's existing password; activation never resets that password. An account already owning a founder profile cannot claim another. Activation links the record, verifies the invited email, grants the member role and preserves other existing roles. The founder then signs in to edit the profile/company, change visibility and use private community messages. Activation does not grant EO membership or Accelerator access.

The application sends synchronously and marks `sent` only after the configured mail transport accepts the message. Log/array mailers, including fallback chains that contain them, are rejected. A transport error leaves `failed`; accepted mail is not proof of inbox delivery. Configure a real mail transport and sender and validate delivery with a controlled address before inviting founders. No real founder invitations were sent during development.

## Profiles and communication

Members can edit display name, position, biography, portrait URL, location, country, skills, needs, offers and social links, and choose public visibility. Existing directory asset paths are accepted for portraits. Imported translations stop overriding fields once an owner edits them. Companies remain available to other co-founders if one founder removes their association.

The public **Message founder** action opens an idempotent private room with precisely the two participants. Unclaimed and suspended profiles cannot start community communication; unauthorized users cannot read room history. Activation creates a private, initially unscored scorecard for the claimed founder profile without implying a verified growth rating. Admins can hide, publish, feature, suspend and resume profiles, and review invitation state. Community introduction and admin matching selectors include only member-owned profiles, and the server rejects unclaimed match participants. A hidden profile returns 404 publicly; a suspended member is denied community endpoints.

## Release checks

- Back up the production database and retain `APP_KEY` before deployment.
- Run migrations and the import command; confirm 15 source records/8 companies on a fresh database or the expected preserved-record totals on an existing one.
- Confirm `/api/v1/founders` and a founder detail return JSON through the frontend proxy.
- Verify invitation delivery to a controlled account, one-time activation, sign-in, profile save, visibility and a private conversation.
- Confirm admin-only email visibility, expired/revoked links, matching existing-account password and a failed mail transport.

Local validation: 151 backend tests passed, followed by 12 targeted activation/matching regression tests (100 assertions). All 45 frontend tests, lint, type checking, entrepreneur-data validation and the production webpack build passed. Browser checks covered directory-card navigation, activation, sign-in, profile saving, private message creation, mobile/desktop admin controls and Arabic at 320px. The migration and import were executed on an isolated development database: 15 founders/8 companies created, followed by a repeat import preserving all 15 records. Production API health and founder endpoints returned HTTP 500 on October 11, 2026; production migrations, database import and email delivery could not be run without the unavailable hosting controls. Do not treat a frontend deployment or successful GitHub push as production backend completion.
