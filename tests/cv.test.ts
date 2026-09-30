import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cv } from '../src/data/cv.ts';

const text = JSON.stringify(cv).toLowerCase();

test('never names target employer or unverified claims', () => {
  for (const banned of ['ftmo', 'android', 'play store']) assert.ok(!text.includes(banned), banned);
});
test('contact email', () => assert.equal(cv.email, 'duongd973@gmail.com'));
test('two experience entries with bullets', () => {
  assert.equal(cv.experience.length, 2);
  for (const e of cv.experience) assert.ok(e.bullets.length >= 4, e.company);
});
test('ironman in interests', () => assert.match(cv.interests, /ironman/i));
