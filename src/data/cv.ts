export const cv = {
  name: 'Nguyen Dang Duong',
  title: 'Software Engineer',
  location: 'Prague, CZ',
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
        'Built AI document extraction with Gemini for a UK mortgage platform',
        'Built secure MCP API access for AI agents',
        'Automated internal workflows with n8n, Slack and CI',
        'Shipped React, Next.js and React Native products for fintech clients',
      ],
    },
    {
      company: 'Hostivio & Pultio',
      role: 'Founding Engineer',
      type: 'Part-time',
      period: 'Jan 2025 – Present',
      bullets: [
        'Built AI guest-ID scanning with a vision LLM',
        'Shipped the Hostivio iOS app with Expo and OTA updates',
        'Built Stripe Connect payouts and a direct booking engine',
      ],
    },
  ],
  skills: [
    { group: 'AI & Automation', items: ['LLMs (Gemini, OpenRouter)', 'MCP', 'Claude Code', 'n8n'] },
    { group: 'Web & Mobile', items: ['TypeScript', 'React', 'Next.js', 'React Native', 'TanStack Query', 'Tailwind'] },
    { group: 'Backend', items: ['Node', 'NestJS', '.NET', 'PostgreSQL', 'Stripe', 'Playwright'] },
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
