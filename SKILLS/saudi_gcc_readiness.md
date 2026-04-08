# Saudi & GCC Readiness

> Regional considerations for Saudi Arabia, GCC, MENA markets

---

## Saudi Arabia — Primary Market

### Vision 2030 Alignment

| Pillar | Wosool Alignment |
|--------|-----------------|
| Thriving economy | Supporting founder ecosystem growth |
| Vibrant society | Community building among entrepreneurs |
| Ambitious nation | Enabling world-class startups from Saudi |

### Ecosystem Partners

| Entity | Type | Relevance |
|--------|------|-----------|
| Monsha'at | Government (SME authority) | SME support, programs |
| MCIT | Government (tech ministry) | Digital transformation |
| SDAIA | Government (data/AI) | AI governance, PDPL |
| Saudi Venture Capital Company (SVC) | Government VC | Fund of funds |
| Flat6Labs Riyadh | Accelerator | Startup programs |
| Wa'ed | Accelerator (Aramco) | Energy sector startups |
| Badir | Incubator (KACST) | Tech incubation |
| Impact46 | VC | Startup investment |
| STV | VC | Growth-stage investment |
| KAUST | University | Innovation and research |

### Tech Hubs

| City | Focus |
|------|-------|
| Riyadh | Government, enterprise, fintech |
| Jeddah | Commerce, logistics, lifestyle |
| KAUST (Thuwal) | Deep tech, research |
| NEOM | Future technologies |
| Dhahran (Aramco) | Energy tech |

---

## Localization Requirements

### Language

| Requirement | Status | Priority |
|-------------|--------|----------|
| Arabic UI translations | ❌ Not started | High |
| RTL layout support | ❌ Not started | High |
| Bilingual content (AR/EN) | ❌ Not started | High |
| Arabic typography | ❌ Not configured | Medium |
| Arabic email templates | ❌ Not started | Medium |

### Arabic Typography
- Font: system Arabic fonts (Tahoma, Arial, Noto Sans Arabic)
- Direction: RTL for Arabic, LTR for English
- Mixed content: Auto-direction with `dir="auto"`
- Numbers: Western Arabic numerals (1, 2, 3) preferred in tech context
- Date format: Gregorian primary, Hijri secondary

### RTL Implementation (Next.js)

```tsx
// layout.tsx pattern
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
```

- Tailwind CSS v4 supports `rtl:` and `ltr:` variants
- Use logical properties (`ms-4` instead of `ml-4`)
- Mirror icons and navigation for RTL

---

## Currency & Payments

| Market | Currency | Payment Provider |
|--------|----------|-----------------|
| Saudi Arabia | SAR (ر.س) | Moyasar |
| UAE | AED (د.إ) | Stripe |
| Bahrain | BHD (د.ب) | Stripe |
| Kuwait | KWD (د.ك) | Stripe |
| Oman | OMR (ر.ع) | Stripe |
| Qatar | QAR (ر.ق) | Stripe |

### Saudi Payment Methods
- Credit/debit cards (Visa, Mastercard, mada)
- mada (Saudi debit network — required)
- Apple Pay / STC Pay
- Bank transfer (for enterprise)

---

## Data Residency

### Requirements
- Saudi PDPL may require personal data stored within Saudi Arabia
- Consider Saudi-region hosting options:
  - AWS Middle East (Bahrain) — closest AWS region
  - Oracle Cloud (Jeddah) — Saudi data center
  - Alibaba Cloud (Riyadh) — planned
  - STC Cloud — Saudi-based
  - Cloudflare (regional) — edge caching

### Database Hosting Options

| Provider | Region | Notes |
|----------|--------|-------|
| Supabase | AWS Bahrain | Closest supported region |
| AWS RDS | me-south-1 (Bahrain) | Full PostgreSQL |
| Oracle Cloud | Jeddah | Saudi data center |
| Self-hosted | Saudi VPS | Full control |

---

## Cultural Considerations

### Business Culture
- Relationship-first approach
- Trust and reputation are paramount
- Personal introductions valued over cold outreach
- Arabic communication appreciated alongside English
- Religious holidays and prayer times awareness

### Calendar Awareness
- Gregorian calendar primary
- Hijri calendar for religious events
- Ramadan: adjusted working hours, special events
- Saudi National Day (Sep 23)
- Founding Day (Feb 22)
- Eid al-Fitr and Eid al-Adha

### Content Guidelines
- Respectful of Saudi culture and values
- No content conflicting with Saudi regulations
- Trust guardrails (see README.md)
- Partner status transparency (Confirmed/Prospective/Ecosystem-Aligned)

---

## GCC Expansion Readiness

### Per-Country Checklist

| Requirement | SA | UAE | BH | KW | OM | QA |
|-------------|----|----|----|----|----|----|
| Local regulations reviewed | 🟡 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Currency support | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Payment provider | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Local partnerships | 🟡 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Localized content | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Data compliance | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## Events & Community (Saudi/GCC)

### Key Tech Events

| Event | Location | Timing |
|-------|----------|--------|
| LEAP | Riyadh | February |
| 24 Fintech | Riyadh | September |
| GITEX Global | Dubai | October |
| Step Conference | Dubai | February |
| ArabNet | Riyadh/Dubai | Various |
| Saudi Smart Cities | Riyadh | November |

### Community Engagement
- Arabic Twitter/X tech community (very active)
- LinkedIn for professional networking
- Clubhouse/Twitter Spaces for live discussions
- WhatsApp groups for community communication
- In-person meetups in Riyadh, Jeddah, Dubai

---

## Readiness Checklist

### Pre-Launch (Saudi)
- [ ] Arabic UI available
- [ ] RTL layout functional
- [ ] SAR currency support
- [ ] mada payment integration
- [ ] Privacy policy in Arabic
- [ ] Saudi-region data hosting
- [ ] Local partnership announced
- [ ] Arabic social media presence

### Post-Launch (GCC Expansion)
- [ ] Multi-currency support
- [ ] Country-specific compliance
- [ ] Local partnerships per country
- [ ] Cross-border networking features
- [ ] Multi-country events calendar
