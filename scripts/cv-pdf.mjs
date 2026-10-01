import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cv } from '../src/data/cv.ts';

const tex = (s) =>
  s.replace(/[\\&%$#_{}~^]/g, (c) => ({ '\\': '\\textbackslash{}', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}' })[c] ?? `\\${c}`);

const entry = (title, date, lines, bullets = []) =>
  [
    `\\textbf{${tex(title)}} \\hfill ${tex(date)}`,
    ...lines.map((l) => `\\\\ ${tex(l)}`),
    bullets.length ? `\\begin{itemize}\n${bullets.map((b) => `  \\item ${tex(b)}`).join('\n')}\n\\end{itemize}` : '',
  ].join('\n');

const project = (p) => {
  const right = [p.role && `\\emph{${tex(p.role)}}`, ...p.links.map((l) => `\\href{${l.href}}{${tex(l.label)}}`)]
    .filter(Boolean)
    .join(' $\\cdot$ ');
  return `\\textbf{${tex(p.name)}} \\hfill ${right}\n\\\\ ${tex(p.text)}`;
};

const doc = String.raw`\documentclass{resume}
\usepackage{fontspec}
\usepackage[left=0.75in,top=0.6in,right=0.75in,bottom=0.6in]{geometry}
\usepackage{enumitem}
\setlist[itemize]{label=\textbullet, leftmargin=0.9em, labelsep=0.4em, nosep, before=\vspace{-0.6\parskip}}
\usepackage{hyperref}

\name{${tex(cv.name)}}

\begin{document}
\printaddress{${tex(cv.phone)} \\ ${tex(cv.email)}}
\printaddress{\href{https://dduong.dev}{dduong.dev} \\ \href{https://github.com/Dang-Duong}{github.com/Dang-Duong} \\ \href{https://www.linkedin.com/in/dang-duong-nguyen/}{linkedin.com/in/dang-duong-nguyen}}

\begin{rSection}{Experience}
${cv.experience.map((j) => entry(j.company, j.period, [`${j.role} · ${j.type}`], j.bullets)).join('\n\n')}
\end{rSection}

\begin{rSection}{Education}
${cv.education.map((e) => entry(e.school, e.period, [e.degree])).join('\n\n')}
\end{rSection}

\begin{rSection}{Skills}
\begin{tabular}{@{} >{\bfseries}l @{\hspace{4ex}} p{0.68\linewidth} @{}}
${cv.skills.map((s) => `${tex(s.group)}: & ${tex(s.items.join(', '))} \\\\`).join('\n')}
\end{tabular}
\end{rSection}

\begin{rSection}{Projects}
${cv.projects.map(project).join('\n\n')}
\end{rSection}

\begin{rSection}{Interests}
${tex(cv.interests)}
\end{rSection}

\begin{rSection}{Languages}
${cv.languages.map(tex).join(' $\\bullet$ ')}
\end{rSection}

\end{document}
`;

const dir = mkdtempSync(join(tmpdir(), 'cv-'));
copyFileSync('scripts/latex/resume.cls', join(dir, 'resume.cls'));
writeFileSync(join(dir, 'cv.tex'), doc);
execFileSync('tectonic', ['--chatter', 'minimal', join(dir, 'cv.tex')], { stdio: 'inherit' });
copyFileSync(join(dir, 'cv.pdf'), 'public/cv.pdf');
