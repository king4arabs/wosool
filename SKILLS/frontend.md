# Frontend Skills

> Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui

---

## Current Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.2 | React framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| shadcn/ui | — | Component library |
| Radix UI | — | Accessible primitives |
| Lucide React | — | Icon library |
| CVA | — | Component variant management |

---

## Conventions

### File Structure
```
frontend/src/
├── app/           # Routes (App Router, file-based)
├── components/
│   ├── layout/    # Header, Footer, PublicLayout
│   ├── sections/  # Page section components
│   └── ui/        # shadcn/ui components (Button, Card, Badge, etc.)
├── data/          # Static/mock data
├── lib/           # Utilities (cn, API client)
└── types/         # TypeScript type definitions
```

### Naming
- **Files:** kebab-case (`founder-card.tsx`)
- **Components:** PascalCase (`FounderCard`)
- **Utilities:** camelCase (`formatDate`)
- **Types:** PascalCase (`FounderProfile`)

### Imports
- Use `@/` path alias for `src/` directory
- Example: `import { Button } from '@/components/ui/button'`

### Components
- Use `forwardRef` and `displayName` for all UI components
- Use `cn()` from `@/lib/utils` for class merging (clsx + tailwind-merge)
- Use CVA (Class Variance Authority) for component variants
- Follow shadcn/ui patterns for consistency
- When using Radix `Slot` (asChild), ensure single child element

### Styling
- Tailwind CSS v4 with CSS-based config (`@theme` in `globals.css`)
- No `tailwind.config.ts` file
- System fonts only (no Google Fonts)
- Brand colors: Navy (#0A1628), Gold (#C9A84C), Cream (#F8F5EF)

### Toast Notifications
- Use `useToast()` hook from providers
- `toast(message, variant, duration)`
- Variants: success, error, warning, info

---

## Build & Development

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build (Turbopack)
npm run lint         # ESLint check
```

---

## Checklist

### Code Quality
- [ ] TypeScript strict mode enabled
- [x] ESLint configured
- [ ] Prettier configured
- [ ] Import sorting
- [ ] Component tests (Vitest + RTL)
- [ ] E2E tests (Playwright)

### Performance
- [ ] Image optimization (next/image)
- [ ] Code splitting (dynamic imports)
- [ ] Lighthouse score 90+
- [x] Static generation for public pages

### Accessibility
- [x] Radix UI primitives (ARIA compliant)
- [ ] Keyboard navigation testing
- [ ] Screen reader testing
- [ ] Color contrast validation
- [ ] Focus management

### SEO
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Meta tags (title, description)
- [ ] Open Graph tags on all pages
- [ ] Structured data (JSON-LD)
- [ ] Arabic hreflang tags

### i18n (Planned)
- [ ] next-intl or similar library
- [ ] Arabic translations
- [ ] RTL layout support
- [ ] Date/number localization

---

## Recommended Tools

| Tool | Purpose | Priority |
|------|---------|----------|
| Vitest | Unit testing | High |
| React Testing Library | Component testing | High |
| Playwright | E2E testing | Medium |
| Storybook | Component documentation | Medium |
| MSW | API mocking | Medium |
| Bundle Analyzer | Build optimization | Low |
