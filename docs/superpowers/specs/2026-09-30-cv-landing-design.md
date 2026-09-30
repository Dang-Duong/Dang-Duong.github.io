# CV Landing Page — Design

## Goal
Personal landing page + refreshed CV for Nguyen Dang Duong, aimed at mid-level React/SSR product roles at fintech-scale companies (target employer is never named anywhere). Inspired by tom-nguyen.dev: minimal, text-first, one signature interactive element, CV PDF download.

## Stack
- Astro (static output), TypeScript, plain CSS (no Tailwind — one page doesn't need it).
- Three.js for the single WebGL hero scene, loaded as an Astro island only on the client.
- Hosting: GitHub Pages via GitHub Actions (`withastro/action`). Repo: `Dang-Duong/cv` (public). Custom domain later = add `public/CNAME` + DNS.

## Content source of truth
`src/data/cv.ts` — one typed object (header, experience, skills, education, interests, languages, links). Both the landing page and the printable `/cv` page render from it, so the site and PDF never drift.

## Pages
1. `/` — landing
   - Top bar: name · "Software Engineer, Prague" · live Prague time · Contact link.
   - Hero: tagline + WebGL scene (see below).
   - Experience (Yolk Studio), Skills (grouped), Education, Interests, Languages — compact, scannable.
   - Projects replaced by: "Curious what I've built? Let me know and I'll happily walk you through it."
   - Footer "Get in contact": email, LinkedIn, GitHub, Download CV.
2. `/cv` — A4 print stylesheet version; `public/cv.pdf` generated from it with Playwright (`pnpm cv:pdf`).

## Hero WebGL scene
Three interlocking glossy rings (swim / bike / run → Ironman nod), physical material with iridescence + environment lighting for a Blender-render look. Drag to rotate (pointer), slow idle spin, subtle scroll parallax. Respects `prefers-reduced-motion` (static frame) and falls back to nothing if WebGL is unavailable. Caps devicePixelRatio at 2.

## Visual direction
Sporty, race-kit feel: near-black background, off-white text, one electric volt/lime accent (#D4FF3A-ish). Bold condensed display type (Barlow Condensed 700–800, uppercase for headings) + Inter for body, JetBrains Mono for small data labels (dates, live clock styled like a race timer). Subtle race motifs: section labels as numbered "splits" (01 / SWIM-style counters), thin track-line dividers. Rings in the hero use the volt accent + iridescent chrome. Dark only (sporty identity is the point); light-mode skipped.

## CV content
- Header: Nguyen Dang Duong — Software Engineer · Prague, CZ · BSc Software Development, graduating 2026.
- Experience (two entries, AI/automation bullets first in each; no unverified claims — no Android, no user counts):
  - **Yolk Studio — Software Engineer, Full-time, Aug 2025 – Present**: UK mortgage-origination platform rebuild (fintech), Gemini Doc AI, secure MCP API keys, internal automation (n8n, Slack bot, Web Store CI, React Doctor), fintech mobile (Wefund, Orbi), Newspage, quality/CI gates.
  - **Hostivio & Pultio — Founding Engineer, Part-time, Jan 2025 – Present**: AI guest-ID scanning (vision LLM + on-device OCR), Expo iOS app with EAS/OTA/CI, Ubyport police-registration integration, Stripe Connect payouts, direct booking engine, PostHog analytics, LCP 10.7s fix; Pultio POS back office + EAN restocking.
- Skills: AI & Automation / Frontend / Mobile / Backend / Quality groups.
- Education: Unicorn University (BSc, graduating 2026); VŠE 2023–24 one line; Gymnázium Ostrov.
- Interests: "Sport-obsessed — currently training for my first Ironman."
- Languages: Czech (native), English (fluent), Vietnamese (intermediate).

## Confirmed
- Contact email: duongd973@gmail.com.
- Dark sporty theme, Ironman rings concept.

## Verification
`pnpm build` passes; Playwright screenshots of `/` (desktop + 390px mobile) and `/cv`; PDF opens and fits 1–2 A4 pages; deployed Pages URL returns 200.

## Out of scope
Blog, CMS, analytics, i18n, projects gallery.

## Revision (2026-09-30): minimal landing + ball playground
- Landing page no longer shows CV sections (like tom-nguyen.dev): header, full-screen hero, contact footer with Download CV (PDF). CV content lives only in `/cv` → `cv.pdf`.
- Hero WebGL scene replaced: draggable physics playground of procedurally textured balls (football, basketball, volt "140.6" Ironman ball) — gravity, throw, ball–ball collisions, double-click to add (max 12). Touch grabs only when a ball is hit, otherwise page scrolls. Paused offscreen; static under reduced motion.
- Sporty background: 8 numbered lane lines across the hero.
