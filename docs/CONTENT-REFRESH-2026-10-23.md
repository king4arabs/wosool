# Content refresh — 23 October 2026

## Reviewed additions

| Record | Evidence | Publication date |
| --- | --- | --- |
| INVE funding; Abdulrahman Alabdulkarim, founder and CEO | https://www.wamda.com/2026/10/inve-raises-300000-outliers-vc-scale-eventtech-platform-gcc ; https://inve.sa/ ; https://sa.linkedin.com/in/abdulrahman-ak | 22 October 2026 |
| Ziina payment and exchange authorisations | https://www.wamda.com/2026/10/uaes-ziina-secures-central-bank-approvals-retail-payments-exchange-services | 22 October 2026 |
| theQA funding; Ahmad Al Ebrahim, co-founder/CEO; Hussain Al-Nashabah, co-founder/CTO | https://www.wamda.com/2026/10/theqa-raises-550000-scale-ai-driven-consumer-research-kuwait ; https://www.linkedin.com/company/theqaio ; https://theqa.io/ | 21 October 2026 |

Three original short bilingual briefs and three profiles were added. Publication dates retain the source day without inventing a publication time. New portraits/logos are null and news images are empty because no reusable assets were verified; existing initials/brand fallbacks apply. These are directory profiles, not claimed accounts or verified community members. No revenue amount is inferred from investment.

Totals: 153 founders, 85 distinct companies, 45 briefs. New profiles extend the existing October 22 discovery batch with their actual October 23 review dates. Each backend catalog matches its frontend counterpart. No existing editorial record is overwritten.

## Daily research

The existing Wosool Founder Refresh automation (`6ad2307f43f881918d932f1ff87a09f3`) is now Wosool daily news and founders, scheduled daily around 08:00 Asia/Shanghai from October 24. It searches, verifies, deduplicates, updates mirrored catalogs, validates, pushes and reports actual delivery. It preserves the Hostinger baseline and public-copy rule. The existing broader development task remains separate.

Laravel already schedules `news:sync` daily. That command imports drafts for review and does not replace this source verification or prove the server scheduler is running.

## Publication

Follow DEPLOYMENT.md and preserve the working Hostinger configuration. Repository push, frontend activation and database import are separate states. With authorized production shell/application access and the existing database backup procedure, run:

```bash
cd backend
php artisan wosool:import-founders
php artisan wosool:import-news --dry-run
php artisan wosool:import-news
```

Verify public API totals, Arabic/English records, the new news/profile routes, website health and assets. Importers preserve existing admin edits and deleted news. Do not create accounts, send invitations, run destructive seeders or change runtime settings for this content release. No production database access or import was performed in this work session.

## Validation

Content integrity: 153 founders, 85 companies, 45 stories, no parity/validation problems. All 12 content-review tests and 171 frontend tests pass. Full frontend lint and type check pass, followed by lint of the final changed frontend files and a successful production webpack build of the final source. PHP/Composer are unavailable locally, so the adjusted backend import/contract tests require the existing CI PHP matrix.

The local production runtime smoke check passed for `/health`, `/` and `/eoa`, including 51 JavaScript/stylesheet references with valid responses. This is local verification, not proof of a Hostinger release or production database import.
