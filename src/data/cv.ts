export const cv = {
  name: 'Nguyen Dang Duong',
  title: 'Software Engineer',
  location: 'Prague, CZ',
  intro:
    'Software engineer shipping AI-powered web & mobile products end-to-end. Finishing my BSc in Software Development in 2026. Currently training for my first Ironman.',
  about:
    'Software engineer building AI-powered web and mobile products end-to-end. Finishing my BSc in Software Development in 2026. Really into sport — currently training for my first Ironman.',
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
        'Built AI document extraction with Gemini for a UK mortgage platform',
        'Built secure MCP API access for AI agents with tenant-scoped keys and rate limiting',
        'Automated internal workflows with n8n, a Slack bot and CI pipelines',
        'Rebuilt a mortgage-origination platform with React, TanStack Query, Express and Drizzle',
        'Developed fintech features in React Native — wallet deposits and AML verification',
        'Added CI quality gates and end-to-end tests with Playwright and Vitest',
      ],
    },
    {
      company: 'Hostivio & Pultio',
      role: 'Founding Engineer',
      type: 'Part-time',
      period: 'Jan 2025 – Present',
      bullets: [
        'Built AI guest-ID scanning with a vision LLM and on-device OCR',
        'Shipped the Hostivio iOS app with Expo, EAS builds and OTA updates',
        'Automated Czech police guest registration (Ubyport)',
        'Built Stripe Connect payouts and a direct booking engine',
        'Set up PostHog analytics and improved Core Web Vitals',
        'Built the Pultio point-of-sale back office',
      ],
    },
  ],
  skills: [
    { group: 'AI & Automation', items: ['LLM integration (Gemini, OpenRouter)', 'MCP', 'Claude Code', 'n8n', 'GitHub Actions'] },
    { group: 'Frontend', items: ['TypeScript', 'React', 'Next.js (SSR)', 'Vite', 'TanStack Query', 'Tailwind', 'GSAP'] },
    { group: 'Mobile', items: ['React Native', 'Expo', 'EAS', 'Reanimated', 'Tamagui'] },
    { group: 'Backend', items: ['Node / Express', 'NestJS', '.NET / C#', 'PostgreSQL / Drizzle', 'Stripe'] },
    { group: 'Quality', items: ['Playwright', 'Vitest / Jest', 'PostHog', 'Sentry'] },
  ],
  education: [
    { school: 'Unicorn University, Prague', degree: "Bachelor's Degree in Software Development — graduating 2026", period: 'Sep 2024 – Present' },
    { school: 'VŠE, Prague', degree: "Bachelor's studies, Faculty of Informatics and Statistics", period: 'Sep 2023 – Sep 2024' },
    { school: 'Gymnázium Ostrov, Ostrov nad Ohří', degree: '8-year Program, Concluded with Maturita Exam', period: 'Sep 2015 – Jun 2023' },
  ],
  projectsNote: "Curious what I've built? Let me know and I'll happily walk you through it.",
  interests: 'Really into sport — recently started training for my first Ironman.',
  languages: ['Czech (native)', 'English (fluent)', 'Vietnamese (intermediate)'],
};

export type CV = typeof cv;
