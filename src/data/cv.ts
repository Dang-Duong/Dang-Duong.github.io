export const cv = {
  name: 'Nguyen Dang Duong',
  title: 'Software Engineer',
  location: 'Prague, CZ',
  intro: 'Software engineer in Prague building AI, web and mobile products. Open to new projects.',
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
      type: 'Full time',
      period: 'Aug 2025 to Present',
      bullets: [
        'Built AI document extraction with Gemini for a UK mortgage platform',
        'Built secure MCP API access so AI agents can work with client platforms',
        'Rebuilt a mortgage origination platform with React, TanStack Query, Express and .NET',
        'Shipped fintech apps in React Native with wallet deposits and AML verification',
        'Automated internal workflows with n8n, a Slack bot and CI release pipelines',
        'Built a news platform with Expo, Next.js and NestJS, including Stripe payments',
        'Delivered marketing sites with Next.js and GSAP animations',
      ],
    },
  ],
  skills: [
    { group: 'AI & Automation', items: ['LLMs (Gemini, OpenRouter)', 'MCP', 'Claude Code', 'n8n'] },
    { group: 'Web & Mobile', items: ['TypeScript', 'React', 'Next.js', 'React Native', 'TanStack Query', 'Tailwind'] },
    { group: 'Backend', items: ['Node', 'NestJS', '.NET', 'PostgreSQL', 'Stripe', 'Playwright'] },
  ],
  education: [
    { school: 'Unicorn University, Prague', degree: "Bachelor's Degree in Software Development, graduating 2026", period: 'Sep 2024 to Present' },
    { school: 'Gymnázium Ostrov, Ostrov nad Ohří', degree: 'Eight year program, concluded with Maturita exam', period: 'Sep 2015 to Jun 2023' },
  ],
  projects: [
    {
      name: 'Hostivio',
      role: 'Founding engineer',
      text: 'Accommodation SaaS. Built AI guest ID scanning with a vision LLM, the iOS app and Stripe payouts',
      links: [{ label: 'hostivio.cz', href: 'https://hostivio.cz' }],
    },
    {
      name: 'Pultio',
      role: 'Founding engineer',
      text: 'Point of sale platform with AI agents for venues. Built the back office and barcode restocking',
      links: [],
    },
    {
      name: 'Smart Flower Pot',
      role: '',
      text: 'Arduino plant monitor streaming soil and air data. Built the Next.js dashboard with history charts',
      links: [
        { label: 'Live', href: 'https://smart-flower-pot.vercel.app' },
        { label: 'Code', href: 'https://github.com/Dang-Duong/smart-flower-pot' },
      ],
    },
    {
      name: 'Trip Planner',
      role: '',
      text: 'Group trip planner with a MapLibre map, day timeline, shared checklists and cost splitting',
      links: [
        { label: 'Live', href: 'https://trip-planner-ruby-one.vercel.app' },
        { label: 'Code', href: 'https://github.com/Dang-Duong/trip-planner' },
      ],
    },
    {
      name: 'Finance Bro',
      role: '',
      text: 'Personal finance app for expenses, budgets and savings goals, built with Next.js and TypeScript',
      links: [
        { label: 'Live', href: 'https://finance-bro-nu.vercel.app' },
        { label: 'Code', href: 'https://github.com/Dang-Duong/finance-bro' },
      ],
    },
  ],
  interests:
    'Training for my first Ironman. I play football, basketball and volleyball. Love video games.',
  languages: ['Czech (native)', 'English (fluent)', 'Vietnamese (intermediate)'],
};

export type CV = typeof cv;
