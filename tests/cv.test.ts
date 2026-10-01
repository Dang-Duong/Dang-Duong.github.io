import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cv } from '../src/data/cv.ts';

const text = JSON.stringify(cv).toLowerCase();

test('never names target employer or unverified claims', () => {
  for (const banned of ['ftmo', 'android', 'play store']) assert.ok(!text.includes(banned), banned);
});
test('contact email', () => assert.equal(cv.email, 'duongd973@gmail.com'));
test('Yolk is the only role, with a solid set of bullets', () => {
  assert.equal(cv.experience.length, 1);
  assert.equal(cv.experience[0].company, 'Yolk Studio');
  assert.ok(cv.experience[0].bullets.length >= 5 && cv.experience[0].bullets.length <= 7);
});
test('ironman in interests', () => assert.match(cv.interests, /ironman/i));
test('experience bullets stay short and metric-free', () => {
  for (const e of cv.experience)
    for (const b of e.bullets) {
      assert.doesNotMatch(b, /\d{2,}/, b);
      assert.ok(b.length <= 110, b);
    }
});
test('CV text has no hyphens or dashes', () => {
  const e = cv.experience[0];
  const fields = [
    ...e.bullets,
    e.role,
    e.type,
    e.period,
    ...cv.education.flatMap((x) => [x.school, x.degree, x.period]),
    ...cv.skills.flatMap((s) => [s.group, ...s.items]),
    ...cv.projects.flatMap((p) => [p.name, p.role, p.text]),
    cv.interests,
    ...cv.languages,
  ];
  for (const f of fields) assert.doesNotMatch(f, /[-–—]/, f);
});
test('projects list Hostivio and Pultio with AI work', () => {
  assert.deepEqual(cv.projects.map((p) => p.name), ['Hostivio', 'Pultio']);
  assert.match(cv.projects[0].text, /AI/);
  for (const p of cv.projects) assert.ok(p.text.length <= 110, p.text);
});
