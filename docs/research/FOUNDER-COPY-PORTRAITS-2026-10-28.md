# Founder copy and EO portrait refresh — 28 October 2026

## Public copy

Reviewed all three founder catalogs (172 records), their backend mirrors, public cards and the startup-directory seed. Rewrote the 100 biographies in the 16 October expansion in both languages and removed the source-process sentence from Swarm Robotics in the base catalog and startup seed.

- Generic entries now use the existing entrepreneur classification and sector, e.g. `رائد أعمال في تقنيات التعليم — كلاسيرا.` / `Entrepreneur in education technology — Classera.`
- Previously supported founder/co-founder titles remain explicit. No generic entrepreneur was promoted to founder or CEO. Corrected feminine Arabic titles where applicable.
- Company descriptions remain separate. Source links, evidence dates, business facts, profile identifiers and membership states are unchanged.
- `founder-copy-refresh-2026-10-28.json` freezes exact before/after fields for the migration. Old wording remains there only for matching historical imports.
- Migration `2026_10_28_180000_refresh_founder_directory_copy.php` updates only exact old field values on unowned, unclaimed records; custom biographies, other translations, account-owned profiles and claimed records are preserved. Company-link roles change only on the matching company and old role. Re-running the importer remains non-destructive. Rollback preserves corrected content.

## Portrait sources

Original files are stored without face generation, retouching or upscaling. `eoa-board-portraits.json` prefers them when the roster still points to the original poster crop; custom editorial portraits and the existing fallback behavior are preserved.

| Member | Native dimensions | Source and identity evidence | Result |
| --- | --- | --- | --- |
| Faisal Alqarni | 3937 × 3937 | [Author's own biography](https://itsalqarni.substack.com/about), which names Malaa and EO Riyadh. Its avatar resolves to [the original image](https://substack-post-media.s3.amazonaws.com/public/images/0260f7d7-d939-4f9a-ab41-460f45520d25_3937x3937.jpeg). | Saved as `frontend/public/eoa/board/faisal-alqarni-original.jpeg`. |
| Mazin Alrukayani / Mazen Rukayni | 800 × 800 | Owner explicitly confirmed the board member is the person from Labayh on 28 October. [Health2Tech's named speaker profile](https://health2tech.com/health2tech-riyadh-november-3-2025/) links his professional profile and labels [this original image](https://health2tech.com/wp-content/uploads/2025/10/1756032116581.jpeg) `Mazen Rukayni`. | Saved as `frontend/public/eoa/board/mazin-alrukayani-original.jpeg`. |
| Abdulaziz Alothaim | 100 × 100 available; existing crop 130 × 130 | [RAAF's employee card](https://www.linkedin.com/company/raaf-holding) links the exact [EO Riyadh member profile](https://sa.linkedin.com/in/abdulaziz-alothaim-6ba514a9) and supplies a 100 px avatar. [EO Riyadh's testimonial](https://www.eoriyadh.org/) confirms RAAF but contains no portrait for him. | No verified larger original obtained. Preserve the existing crop. |

Search covered English and Arabic name variants, official chapter sites, company pages, public professional profiles, speaker/event pages and image search. EO Jeddah's named Mazen speaker image is 500 × 500, below the selected 800 px original. The World Economic Forum biography was indexed but its page returned 404 during direct retrieval. Image results for the AlOthaim Markets executive are a different professional identity and were excluded. Larger-size variations of Abdulaziz's public avatar URL returned 403; they were not used.

The board term, poster names and roles are unchanged. No identity was inferred by comparing faces.

## Validation and release

- All 17 targeted founder-discovery, spotlight, board and leadership tests pass; TypeScript and the production build (92 routes) pass. PHP migration and test syntax checks pass.
- Frontend/backend founder snapshots match, and all 101 changed records preserve their source URLs and review dates.
- The full content check reports a pre-existing duplicate news source URL in baseline `fc2b22e903fe79616ac1d663d597fe0b12f432fe`: `echelon-investor-backing-october-2026` and `echelon-ai-investors-october-2026`. Neither news catalog is changed here.
- Both database-preservation tests pass in CI on PHP 8.3.36, 8.4.27 and 8.5.12. Each backend matrix job reports 263 passed and 16 failures caused by the existing duplicate news source URL. The frontend suite has one failure from the same duplicate; production guardrails and the pnpm standalone build pass. See [CI run 40736205779](https://github.com/king4arabs/wosool/actions/runs/40736205779).
- Local image-optimization requests return HTTP 200 and 384 × 384 images for both new originals. Local PHP is 8.3.6, so database tests were validated by the supported CI matrix rather than the local runtime.
- Publish frontend/backend together and run the normal migration step for existing database records. A GitHub branch or passing test is not a live deployment or completed migration.
