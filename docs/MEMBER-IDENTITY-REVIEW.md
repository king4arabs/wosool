# Registration, founder matching and administrator verification

## Default journey

1. A member registers and proves control of their email using the existing one-time code.
2. The system privately searches unclaimed, public, active directory records. It repeats the search when verified registration details are submitted and when an incomplete community registration resumes.
3. `/admin/users` lists both actual accounts and unclaimed founder records. Account registration determines the **Registered member data / بيانات عضو مسجل** marker; records without an account are **Invited member data / بيانات عضو مدعو**. These labels and matching evidence are administrator-only.
4. An administrator compares the application with the suggested founder identities, explicitly selects a canonical profile, or confirms that none belongs to the applicant. Name similarity alone never transfers ownership.
5. Approval binds the account to that existing profile or publishes one new profile when no match applies, grants membership, and marks **Verified / تم التحقق**. Email verification and administrator verification remain separate indicators in the owner and administrator views.

## Matching and canonical data

- Evidence includes normalized Arabic/English names and published aliases, exact personal LinkedIn URLs, company website/name, and administrator-reviewed contact or invitation email. Company overlap alone cannot identify one of several co-founders. Suggestions are not proof of identity or an account-claim credential.
- Normalization folds Arabic alef variants, diacritics, tatweel, punctuation and whitespace. LinkedIn comparisons require an actual `linkedin.com` host and `/in/` profile path; lookalike domains are rejected.
- `founder_identity_reviews` records the proposed identities, administrator decision, canonical profile, reviewer and decision time. Matching details are never returned by public directory endpoints.
- A successful link keeps the existing profile ID, immutable founder UID, slug, directory key, source links, company relationships and scorecard. Reviewed owner name/profile data becomes the canonical display data; old imported translations cannot override it. The account name follows its profile name.
- A sole founder's reviewed company details can be unified; a shared company's existing data and other founders' relationships remain intact. Reuse is limited to company relationships already held by the administrator-reviewed canonical founder. Public company names and websites alone never grant a new applicant access to an existing company.
- Existing active owner edits survive repeated approval and login. Deleted or suspended identities are not restored by matching, invitation activation or application approval. Account and selected-profile locks, current email checks and final ownership checks reject stale or conflicting decisions.
- New details submitted against an old invitation/preapproval always return for review. An invitation code verifies the recipient email; it does not bypass registration details, consent, identity review or administrator approval.
- Community chat/help aliases and broadcast authorization enforce the same membership boundary as the member endpoints. Changing an account email requires the current password, clears email verification, old codes, unresolved matching evidence and the administrator verification badge. The member verifies the new address with OTP; an existing approved member does not have to submit a second application.
- Membership writers lock the account before its application and founder rows, and retry transient database deadlocks. Manual administrator verification checks the resulting profile status; moving a profile out of active status clears its badge.

## Administrator controls

| Control | Behavior |
| --- | --- |
| `GET /api/v1/admin/users` | Paginated list of registered accounts and unclaimed founder records, including accounts without a founder profile. Search by name/email; filter by record origin. |
| `GET /api/v1/admin/users/{user}/identity` | Current application, linked profile and private matching suggestions for review. |
| `POST /api/v1/admin/users/{user}/verify` | Requires verified account email and explicit administrator identity confirmation. Completes the existing application approval transaction. |
| Membership application review | Links to the account's identity-review panel. Approving an ambiguous identity without a decision returns a conflict rather than creating a duplicate. |
| Invite selected / invite all | Reviews selection, then uses the existing audited outreach queue and individually addressed activation invitations. |

Matched approval accepts `matched_founder_id` and `identity_verified=true`; choosing a separate identity uses `create_new_profile=true` with the same confirmation. Existing profile owners cannot be reassigned through this endpoint. Approval data and public-profile consent must be complete.

Invitations require administrator-reviewed recipient addresses and evidence. Missing addresses, current accounts, valid invitations, revoked invitations and in-progress work are skipped according to the existing outreach policy. Sending is an administrator action; deployment and account matching do not send bulk invitations automatically. The existing scheduler/queue worker, real delivery transport, OTP protections, expiry, cancellation and audit trail remain in use. Email research remains available through `/admin/founders`.

## Release and verification

Run the additive migration `2026_11_15_120000_add_founder_identity_review` before enabling the new backend and frontend. It creates the review table and adds administrator verification timestamps/reviewer to founder profiles; it does not merge, delete, invite or publish any production records. Preserve the existing Hostinger deployment baseline and perform the normal authenticated smoke checks after release.

API tests cover unmatched publication, Arabic aliases, ambiguous identities, changed ownership, deleted/suspended records, immutable UID/scorecard preservation, private origin/evidence, verified-email requirements and legacy preapproval. The invitation tests now assert that email activation defers ownership and community access until administrator review. The browser check `frontend/scripts/check-member-identity.mjs` covers Arabic/English and mobile/desktop administrator selection, explicit verification and reviewed bulk invitations with isolated fixtures.
