# Wosool and EOA guided journeys — 9 October 2026

## Implemented

- Wosool dashboard: actionable founder/company/connection cards, real completion values when available, and direct events/messages/EOA destinations. Removed the nonfunctional assistant prompt panel. Failed reads show retry and unavailable primary metrics instead of invented zero completion. Appointment dates use the Riyadh timezone and selected language.
- EOA account: five-stage journey with distinct next actions for verification, draft, information requests, review, interview, waitlist, rejection, local acceptance, onboarding and enrollment. Local acceptance is not presented as enrollment. Account retrieval failures offer retry without displaying a false new-application state. Unverified users are guided to email verification before protected application reads.
- EOA application: restore a saved draft at its first incomplete step; navigate directly between sections; validate before continuing and before submission; focus an accessible error summary with links to affected fields; protect unsaved edits before link navigation or draft replacement. Draft saving remains available without requiring completion. The backend remains the authority for eligibility, document requirements, program availability and authorization.
- Arabic/English and mobile layouts are supported throughout, using the existing Cairo typography.

## Verification

17 frontend regression tests; lint; TypeScript; production build. Chromium fixture workflows pass in Arabic and English: missing-field validation/focus, cancelled navigation with unsaved edits, draft persistence, account outage recovery, member next-action links, EOA team roles, track creation and acceptance. Mobile screenshots reviewed. Browser fixtures do not constitute a production deployment or live email test.

## Resume checkpoint

Continue from the repository main branch after this change is merged. Keep committing and pushing completed changes as requested. The previous additive EOA migration and installation command still need deployment with matching frontend/backend versions. See `WOSOOL-RELIABILITY-EOA-2026-10-09.md` for hosting rollout steps. No hosting access or production deployment is claimed in this iteration.
