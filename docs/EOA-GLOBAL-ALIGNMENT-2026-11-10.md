# EO Riyadh Accelerator alignment

Version 1.0 — 10 November 2026

## Behavior

- Replaces six-month completion claims with the two-year EO curriculum and annual participation. Retains optional twice-yearly intake. Corrects metadata, homepage, FAQ, program, alumni, wiki and directory descriptions.
- Keeps the annual US$4,000 package and US$2,000 sponsor contribution; shows global/local breakdown, confirmation status and fee-period guidance.
- Publishes a Riyadh-time global calendar with original registration destinations, audience labels and 48-hour cutoffs, without copying source PDFs online.
- Adds dedicated EOA Board roles, confirmed coach information and clearer application availability. No appointments, approvals, participants or partner commitments are fabricated.
- Adds versioned leadership readiness and protected financial controls, preserves existing roles and program histories, and enforces capacity and activation boundaries.
- Removes the unconfirmed partner-logo fallback on EOA pages; the independently labeled ecosystem directory remains available.

## Compatibility

No dependency, lockfile, hosting configuration or destructive schema change. Existing program settings, cohort dates, participant records, uploads and encryption keys are preserved. Updated source defaults apply to newly created cohorts. Existing EOA public program records serialize the current curriculum duration without silently rewriting their database fields.

The new APIs are additive and use existing verified-session and private-response middleware. A frontend served before the new API shows a clear unavailable state for the new administrative features. Deploy the matching Laravel and Next.js revisions together.

## Required production checks

- Run the established production smoke checks against both services and verify deployed revision identifiers.
- Review approved notice/controller/retention information, participation terms, sponsorship coverage and dates with leadership.
- Verify one controlled inbox and the existing application/participant/coach/lead boundaries.
- Test Arabic and English on mobile and desktop, including calendar cutoffs and closed-intake messages.
- Confirm anonymous, applicant, participant, reviewer and coach requests cannot read protected financial controls.

Until completed, keep intake and privacy approvals in their existing state. A source push or successful CI run is not a Hostinger deployment.
