# EO Riyadh board 2026/27 — source and verification record

Reviewed: **2026-10-11**. This internal record supports the board section at `/eoa`. The board term is always displayed explicitly as **2026/27**.

## Authority and extraction

- Primary source: user-supplied `EO Riyadh Board Members(1).jpeg`, headed `Board Members 26/27`. The exact source is retained at `frontend/public/eoa/board/source-poster-2026-27.jpeg`.
- The source is 1170 × 805 pixels. Eleven portraits were mapped using their adjacent labels: six left-to-right in the top row, five left-to-right in the bottom row. No identity was inferred from facial resemblance.
- Each 130 × 130 portrait is a deterministic crop from the source, with a 96 × 96 thumbnail. No generative processing, retouching, face reconstruction, or upscaling was used. Native source detail is limited; replace through admin if higher-resolution original headshots become available.
- `frontend/public/eoa/board/asset-manifest.json` records crop coordinates and the original SHA-256. Crops were visually inspected against the source; no neighboring names, role labels, or people appear inside them.
- English poster names and role text are preserved, with title capitalization normalized. The Arabic role fields are translations. Arabic personal-name fields remain empty except where supported by a public profile or user identity; the interface must fall back to English.

## Board-term discrepancy

The current [EO Riyadh board webpage](https://www.eoriyadh.org/board-member) still lists Khaled Almadi as president and different roles for several people. It does not identify the board term. It corroborates some memberships but is **not** authority for these 2026/27 roles. The user-supplied dated poster governs this import. [Musaad Alkadi’s professional profile](https://sa.linkedin.com/in/musaadalkadi) also contains his presidency statement and the chapter’s 2026–2027 board announcement.

## Published fields

| Poster order | Name | Poster role | Company / company role | Published professional links |
| --- | --- | --- | --- | --- |
| 1 | Musaad Alkadi | President | Graphene Ventures / Senior Principal | [Company](https://graphenevc.com/) · [LinkedIn](https://www.linkedin.com/in/musaadalkadi) |
| 2 | Mohammed Alsolami | Membership | RABEH / Founder & CEO | [Company](https://rabeh.sa/) · [LinkedIn](https://www.linkedin.com/in/mohammedalsolami) · [X/Twitter](https://twitter.com/king4arabs) |
| 3 | Mohamed Balsharaf | Partnership | Nawel / Founder & CEO | [Company](https://nawel.sa/) · [LinkedIn](https://www.linkedin.com/in/mohammedbalsharaf) |
| 4 | Gilbert Rustom | MarCom | Apogee Consulting | [LinkedIn](https://www.linkedin.com/in/gilbertrustom) |
| 5 | Faisal Alqarni | Finance | Malaa / Co-founder | [Company](https://malaa.tech/) · [LinkedIn](https://www.linkedin.com/in/itsalqarni) · [X/Twitter](https://x.com/itsalqarni) |
| 6 | Yasir Zahoor | MyEO Chair | Crystal Facilities Management / Founder & CEO | [Company](https://cfmsaudi.com/) · [LinkedIn](https://www.linkedin.com/in/yasir-zahoor-cfm) |
| 7 | Abdulaziz Alothaim | Member Engagement | RAAF Holding / Co-founder | [Company](https://raaf.sa/) · [LinkedIn](https://www.linkedin.com/in/abdulaziz-alothaim-6ba514a9) |
| 8 | Seral Sofi | Member Engagement Co Chair | Ideas Bureau / Managing Director | [Company](https://ib-bi.com/) · [LinkedIn](https://www.linkedin.com/in/seralsofi) |
| 9 | Mazin Alrukayani | Forum & GESA Chair | — | — |
| 10 | Abdelrahman Al kuhaymi | Forum Co Chair | — | — |
| 11 | Suhail Tarabulsi | Learning & Governance Chair | Delta CJSC / Acting General Manager, ICT Business | [Company](https://www.delta.com.sa/) · [LinkedIn](https://www.linkedin.com/in/suhail-tarabulsi-7745b62) |

No personal Facebook or Instagram account was sufficiently verified for publication. All unverified fields are `null`, and their icons must be hidden. Company social accounts were not substituted for individual profiles.

## Member evidence and unresolved fields

### 1. Musaad Alkadi

- [Official Graphene Ventures leadership biography](https://graphenevc.com/team/musaad-alkadi)
- [Public LinkedIn profile and EO presidency statement](https://sa.linkedin.com/in/musaadalkadi)

### 2. Mohammed Alsolami

- [Official LEAP 2026 speaker biography](https://onegiantleap.com/2026-speakers/mohammed-alsolami)
- [Public professional LinkedIn profile](https://www.linkedin.com/in/mohammedalsolami)
- [Personal Devpost profile links directly to LinkedIn, website and Twitter](https://devpost.com/MohammedAlsolami/following)
- **Arabic display name:** User-provided identity in project context. Short display name; legal name is محمد جبرالله السلمي.

### 3. Mohamed Balsharaf

- [EO Riyadh founder testimonial](https://www.eoriyadh.org/)
- [Professional LinkedIn profile](https://sa.linkedin.com/in/mohammedbalsharaf)
- [Official company website](https://nawel.sa/)
- **Spelling:** Poster uses Mohamed; EO website and professional profile use Mohammed. Public display preserves poster spelling.

### 4. Gilbert Rustom

- [Professional profile identifies Apogee Consulting and EO involvement](https://sa.linkedin.com/in/gilbertrustom)
- [EO Riyadh membership listing](https://www.eoriyadh.org/board-member)
- **Unresolved company role and website:** Current profile shows Apogee Consulting. Earlier Athar speaker biography lists New Murabba and BlindSpot. Exact present title and official company URL were not resolved, so omitted.

### 5. Faisal Alqarni

- [Company investor founder story](https://www.khwarizmivc.com/malaa)
- [Professional profile explicitly lists EO Riyadh and Malaa](https://sa.linkedin.com/in/itsalqarni)
- [Public X profile and Arabic name](https://x.com/itsalqarni/with_replies)
- [Company website](https://malaa.tech/)
- **Company job-title scope:** Co-founder is cross-verified. COO appears in recent profile mirrors and CSO in an older company post, so only stable co-founder title is published.

### 6. Yasir Zahoor

- [Official company leadership biography](https://cfmsaudi.com/our-team/)
- [Professional profile identifies Crystal and EO membership](https://uk.linkedin.com/in/yasir-zahoor-cfm)
- [EO Saudi Summit professional post](https://www.linkedin.com/posts/yasir-zahoor-cfm_eosaudisummit-activity-7331657856095522817-yRUz)

### 7. Abdulaziz Alothaim

- [EO Riyadh testimonial identifies Co-founder of RAAF Holding](https://www.eoriyadh.org/)
- [Official company LinkedIn links exact member and website](https://www.linkedin.com/company/raaf-holding)
- [Professional profile identifies EO Riyadh](https://sa.linkedin.com/in/abdulaziz-alothaim-6ba514a9)

### 8. Seral Sofi

- [Official company team and direct LinkedIn link](https://ib-bi.com/)
- [EO Riyadh founder testimonial](https://www.eoriyadh.org/)
- **Title reconciliation:** Company website currently uses Managing Director; EO testimonial and LinkedIn biography use Founder & CEO. Publish the current official company team title.

### 9. Mazin Alrukayani

- **Unresolved profile match:** Poster spells Mazin ALRUKAYANI and Forum & GESA Chair. Online candidate Mazen Rukayni / مازن الركيني is a Labayh co-founder and EO Saudi Summit speaker, but no direct source tying this exact poster-labelled member to that professional profile was established. Company and social fields intentionally blank pending chapter confirmation. GESA is preserved verbatim; EO uses GSEA for Global Student Entrepreneur Awards.
- [Candidate contextual source — not a verified identity match](https://eojeddah.org/spark-saudi-summit-2026-eo-member/)
- [Candidate biography — not published as this member data](https://www.weforum.org/people/mazen-al-rukainy/)

### 10. Abdelrahman Al kuhaymi

- [EO Riyadh listing uses Abderahman ALKUHAYMI](https://www.eoriyadh.org/board-member)
- **Unresolved professional match:** Matching-name company biographies were found for Abdelrahman Al-Kuhaymi (Healing Village and Saudi Geopolymer), but no sufficient EO/name/company cross-link resolved the identity. Do not publish their companies or guessed social profiles for this board member.

### 11. Suhail Tarabulsi

- [Official company management team](https://www.delta.com.sa/management-team/index.html)
- [Public LinkedIn profile includes EO Riyadh 2026/27 board announcement](https://sa.linkedin.com/in/suhail-tarabulsi-7745b62)
- [Company profile cross-links Suhail](https://www.linkedin.com/company/delta-cjsc)
- **Company title freshness:** Role reproduced from official management page. Page is undated; reconfirm in routine annual board review.

## Import and maintenance

- Repeatable import payload: `backend/database/data/eoa-board-2026-27.json`. Records are keyed by stable `slug`; backend seeding should insert missing records and preserve administrator changes on repeat runs.
- All eleven poster members are active/published for the supplied term. Missing professional enrichment does not invalidate the user-supplied names, roles, or portraits.
- `source_references` and `verified_at` are internal administrative fields and must not leak in the public API. `verified_at` marks the source review date; it is not a claim that every third-party page allows anonymous HTTP fetches.
- Direct LinkedIn/X opens sometimes returned 403/999. Identity and URL checks used indexed public profiles, official company cross-links and first-party posts. No sign-in, private account access or inferred handles were used.
- Required follow-up: confirm whether `GESA` in the poster should be corrected to EO’s `GSEA`; confirm Mazin Alrukayani’s exact professional-profile match and Abdelrahman Al kuhaymi’s company/profile; obtain Gilbert Rustom’s current official company website and title; periodically reconfirm company roles.
- The likely Mazin/Mazen Rukayni match is retained **only** as an internal research lead. Neither Labayh nor a candidate social URL is published without a direct chapter/member confirmation.
- Board term changes should create/update the next term explicitly. Do not silently relabel the supplied 2026/27 board as an undated current board.
