# Opportunities cards — 24 October 2026

The opportunities page now prioritizes investment, VC connections, then perks and support programs in a single responsive row. It shuffles within groups on each visit and moves cards to the right. Pointer hover, keyboard focus, touch interaction and reduced-motion preferences suspend movement. Search and category filters remain available. Card titles contain at most four words in Arabic and English. Internal review dates and editorial notes are not rendered.

The bilingual catalog contains 49 entries, with provider sources in each record, plus existing published API directory records. It covers STV AI and NICE, Impact46 gaming, nine VC connection entries, technology perks, Monsha’at Mazaya offers, NTDP support products and Future Factories. Downloaded brand assets come from official provider pages. Missing images fall back to the provider name.

This is verified starter coverage, not an exhaustive inventory of all VC announcements, technology perks or Mazaya offers. Mazaya and some provider sites intermittently return errors. Program listings do not assert that an intake is open. NTDP eligibility varies by product; accelerator enablement is not direct startup grant funding. Future Factories is industrial support, not a universal startup benefit. Exact award amounts and discounts are deliberately omitted unless established for the specific offer.

Connection destinations are resolved through the Laravel API after Sanctum authentication, verified email, membership access, and approved registration or a complete active founder profile. Suspended/unclaimed profiles are denied. Legacy applications also check current status and deadline. Public official source citations remain available for reading.

Deploy both the Laravel API and frontend from the same release; the API needs `resources/data/opportunities.json` and its new connection route. No database migration or dependency change is required. Preserve the existing Hostinger standalone dependency packaging and deployment settings. A source commit alone does not prove either hosting release is active.
