export const cv = {
  name: 'Nguyen Dang Duong',
  title: 'Software Engineer',
  location: 'Prague, CZ',
  tagline: 'Built for the long distance.',
  intro:
    'Software engineer shipping AI-powered web & mobile products end-to-end. Finishing my BSc in Software Development in 2026. Currently training for my first Ironman.',
  email: 'duongd973@gmail.com',
  phone: '+420 720 072 937',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dang-duong-nguyen/' },
    { label: 'GitHub', href: 'https://github.com/Dang-Duong' },
  ],
  experience: [
    {
      company: 'Yolk Studio',
      role: 'Software Engineer',
      type: 'Full-time',
      period: 'Aug 2025 – Present',
      bullets: [
        'Took an AI document-extraction product to production with Gemini — smart input extraction, evidence checklists and an admin console for prompts, benchmarks, test sets and correction replay',
        'Built secure MCP API access for AI agents on a lending platform — SHA-256-hashed keys, tenant-scoped row-level security and per-key rate limiting; closed two security-audit findings',
        'Automated studio operations: n8n leave sync, a Slack bot, Chrome Web Store release CI and an automated React code-health scan on every PR across 3 repos',
        'Core engineer on the rebuild of a UK mortgage-origination platform — 396 merged PRs in 3 months across underwriting decisions, lending-policy engine and funds release (React, TanStack Query, Express, Drizzle/Postgres, .NET)',
        'Grew the platform test suite to ~1,200 tests, added CI gates for schema drift, dead code and formatting, and profiled large tables with the Event Timing API to keep interactions fast at 2,000 rows',
        'Shipped fintech features in React Native for an investment app — QR wallet deposits, AML verification flows and biometric sessions',
        '1,100+ merged PRs across 10+ client products — web, mobile and backend',
      ],
    },
    {
      company: 'Hostivio & Pultio',
      role: 'Founding Engineer',
      type: 'Part-time',
      period: 'Jan 2025 – Present',
      bullets: [
        'Built AI guest-ID scanning — a vision LLM reads passports and ID cards into strict JSON schemas via zero-data-retention routing, images never stored; preceded by an on-device OCR version with MRZ check-digit validation in a Web Worker',
        'Shipped the Hostivio iOS app (Expo / React Native) with EAS builds, OTA updates, push notifications and GitHub Actions CI',
        'Automated Czech police foreign-guest registration (Ubyport) with batch submission, removing a manual legal chore for hosts',
        'Built Stripe Connect payments — host onboarding, balances, payouts — and a direct booking engine with an embeddable widget',
        'Cut homepage mobile LCP from 10.7 s by shrinking hero media from 1.35 MB to ~50 KB; standardised PostHog analytics, session replay and error tracking across apps',
        'Built the Pultio point-of-sale back office — inventory, catalogue, statistics and EAN barcode restocking',
      ],
    },
  ],
  skills: [
    { group: 'AI & Automation', items: ['LLM integration (Gemini, OpenRouter vision)', 'MCP', 'Claude Code', 'n8n', 'GitHub Actions'] },
    { group: 'Frontend', items: ['TypeScript', 'React', 'Next.js (App Router, SSR)', 'Vite', 'TanStack Query', 'Tailwind', 'shadcn/ui', 'GSAP'] },
    { group: 'Mobile', items: ['React Native', 'Expo', 'EAS', 'Reanimated', 'Tamagui'] },
    { group: 'Backend', items: ['Node / Express', 'NestJS', '.NET / C#', 'PostgreSQL / Drizzle', 'Stripe'] },
    { group: 'Quality', items: ['Playwright', 'Vitest / Jest', 'PostHog', 'Sentry'] },
  ],
  education: [
    { school: 'Unicorn University, Prague', degree: 'BSc Software Development', period: '2024 – 2026 (graduating)' },
    { school: 'VŠE, Prague', degree: 'Faculty of Informatics and Statistics', period: '2023 – 2024' },
    { school: 'Gymnázium Ostrov', degree: '8-year programme, Maturita', period: '2015 – 2023' },
  ],
  projectsNote: "Curious what I've built? Let me know and I'll happily walk you through it.",
  interests: 'Really into sport — recently started training for my first Ironman.',
  languages: ['Czech (native)', 'English (fluent)', 'Vietnamese (intermediate)'],
};

export type CV = typeof cv;
