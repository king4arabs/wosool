# EOA leadership and LAMARKA profile — 12 October 2026

## Approved content

The owner explicitly requested Mohammed Alsolami as EO Riyadh Membership & Accelerator Chair leading the accelerator and LAMARKA as its operating partner. These designations appear on `/eoa/leadership` with a visual explanation of the chapter board, program lead and operating partner.

## Board

All 11 published 2026/27 board members from the previously supplied board poster appear as a responsive grid of portrait cards. Existing company and verified social links are preserved. The term remains visible. The frontend snapshot is derived from `backend/database/data/eoa-board-2026-27.json`, excluding research metadata and using negative IDs to distinguish it from persisted records. When updating the source roster, regenerate this snapshot in `frontend/src/data/eoa-board-2026-27.json`.

The public API roster takes precedence, including an empty list or removed/unpublished members. During loading or API failure, the bundled poster snapshot keeps the page useful. Mohammed's legacy “Membership” label is upgraded to the owner-confirmed chair title; subsequent custom editorial titles survive. The backend reference JSON carries the updated title and its source note; this does not claim that production database records have been migrated.

## LAMARKA source and treatment

Source: owner-supplied **Lamarka Ventures.pdf**, 25 pages, uploaded 8 October 2026. The page summarizes:

- Page 3: Applied Intelligence, Venture Creation, Capital & Growth.
- Pages 5–10: InspireU by STC, Saudi Unicorns, Multiverse by CODE, Sedrah by MEWA, Global Exposure, Entrepreneurs Community.
- Page 5: more than 70 InspireU startup graduates (in the program description).
- Page 11: supporting startups since 2015 and more than 500 supported through programs.
- Page 12: 20 portfolio startups.
- Page 7: Multiverse exposure to Silicon Valley, London, South Korea and Singapore.

The page attributes company-reported figures to the profile supplied in October 2026. It does not publish the source PDF, fundraising terms, financial forecasts, return multiples, unverifiable awards, or direct personal contact details. Program examples describe LAMARKA's experience, not EO partnerships or promised benefits for EOA participants. The supplied operator designation is specific to this leadership page; existing admin partner publication controls and database relationship records remain intact.

The retained transparent white LAMARKA wordmark is displayed on navy. The company LinkedIn page is used as the external contact destination because the company website was previously unavailable.

## Verification

Passed TypeScript, targeted ESLint, all 57 frontend tests, and the production webpack build (81 routes). Chromium review covered Arabic/English at 320, 390, 768 and 1440 px; final changes were rechecked at 390 and 1440 px. All 11 portraits load, card widths match, headings/page have no horizontal overflow, in-page navigation works, Arabic grid order starts on the right, and an authoritative empty roster remains empty. Deployment is checked separately from the GitHub commit.
