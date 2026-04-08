# Compliance Skills

> Data protection, regulatory compliance, legal requirements

---

## Regulatory Landscape

### Saudi Arabia

| Regulation | Authority | Relevance |
|-----------|-----------|-----------|
| PDPL (Personal Data Protection Law) | SDAIA | Personal data handling |
| Anti-Cyber Crime Law | CITC | Cybersecurity compliance |
| E-Commerce Law | MCIT | Online business operations |
| Commercial Registration | MoC | Business registration |
| NCA Cybersecurity Framework | NCA | Critical infrastructure |

### GCC

| Country | Key Regulation |
|---------|---------------|
| UAE | Federal Data Protection Law (2021) |
| Bahrain | Personal Data Protection Law (2018) |
| Kuwait | Cybercrime Law |
| Oman | E-Transactions Law |
| Qatar | Personal Data Privacy Law (2016) |

---

## PDPL Compliance (Saudi Arabia)

### Key Requirements

| Requirement | Status | Priority |
|-------------|--------|----------|
| Lawful basis for data processing | ⬜ Not implemented | Critical |
| User consent mechanism | ⬜ Not implemented | Critical |
| Privacy policy (AR/EN) | ⬜ Not created | Critical |
| Data subject rights (access, delete) | ⬜ Not implemented | High |
| Data breach notification | ⬜ No process | High |
| Data Protection Impact Assessment | ⬜ Not conducted | Medium |
| Data processing records | ⬜ Not maintained | Medium |
| Cross-border transfer safeguards | ⬜ Not addressed | Medium |
| Data residency (Saudi hosting) | ⬜ Not configured | Medium |

### Data Categories

| Category | Examples | Handling |
|----------|----------|----------|
| Identity data | Name, email, phone | Encrypted at rest |
| Professional data | Company, role, skills | Standard protection |
| Application data | Scorecard, applications | Restricted access |
| Usage data | Analytics, logs | Anonymized |
| Financial data | Payment info (future) | PCI compliance |

---

## Privacy Policy Requirements

### Must Include
- Identity of data controller (Wosool)
- Purpose of data collection
- Types of data collected
- Legal basis for processing
- Data retention periods
- User rights (access, correction, deletion)
- Data sharing and third parties
- Cookie usage
- Contact information for data inquiries
- Available in Arabic and English

---

## Terms of Service Requirements

### Must Cover
- Service description
- User eligibility and registration
- Acceptable use policy
- Intellectual property
- Limitation of liability
- Dispute resolution
- Termination conditions
- Governing law (Saudi Arabia)
- Available in Arabic and English

---

## Data Governance

### Data Lifecycle

```
Collection → Processing → Storage → Access → Retention → Deletion
    ↓            ↓           ↓         ↓          ↓           ↓
  Consent    Purpose     Encryption  RBAC    Policy-based  Secure
  mechanism  limitation  at rest     controls  retention    erasure
```

### Data Retention Schedule

| Data Type | Retention | After Expiry |
|-----------|-----------|-------------|
| Active user data | Duration of account | Archive or delete |
| Inactive accounts | 2 years | Notify, then delete |
| Application data | 3 years | Archive |
| Analytics data | 1 year | Anonymize |
| Logs | 90 days | Delete |
| Backup data | 30 days | Auto-delete |

---

## Security Compliance

### Minimum Controls
- [ ] Encryption at rest (database, backups)
- [ ] Encryption in transit (HTTPS/TLS)
- [ ] Access control (RBAC)
- [ ] Audit logging
- [ ] Incident response plan
- [ ] Regular security assessments
- [ ] Employee security training
- [ ] Third-party security review

---

## Compliance Checklist

### Pre-Launch
- [ ] Privacy policy drafted and reviewed (AR/EN)
- [ ] Terms of service drafted and reviewed (AR/EN)
- [ ] Cookie consent mechanism
- [ ] Data processing records established
- [ ] Security controls documented
- [ ] Incident response plan created
- [ ] Data Protection Officer designated (if required)

### Post-Launch
- [ ] Regular PDPL compliance audits
- [ ] User data access requests handled within 30 days
- [ ] Data breach notification within 72 hours
- [ ] Annual privacy impact assessment
- [ ] Third-party processor agreements maintained
- [ ] Employee training on data protection

---

## Third-Party Data Processors

| Service | Data Processed | Compliance |
|---------|---------------|------------|
| Vercel | Frontend static files | SOC 2 compliant |
| Railway | Backend application data | Assess compliance |
| Supabase | Database (user data) | SOC 2, GDPR |
| Cloudflare | DNS, CDN traffic | SOC 2, GDPR |
| Sentry | Error data (potentially PII) | SOC 2, GDPR |
| OpenAI | Text data for AI processing | DPA required |
