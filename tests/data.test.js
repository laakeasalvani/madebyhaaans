import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FLAVORS, MENU } from '../js/data.js';

test('every flavor has the fields the carousel needs', () => {
  assert.ok(FLAVORS.length >= 4, 'need at least four flavors');
  for (const f of FLAVORS) {
    assert.match(f.id, /^[a-z0-9-]+$/, `bad id: ${f.id}`);
    assert.ok(f.name.length > 0, `missing name on ${f.id}`);
    assert.ok(f.alt.length > 10, `alt text too short on ${f.id}`);
  }
});

test('image paths follow the swap-in-a-real-photo contract', () => {
  for (const f of FLAVORS) {
    assert.equal(f.panImage, `images/pan-${f.id}.webp`);
    assert.equal(f.cardImage, `images/card-${f.id}.webp`);
  }
});

test('flavor ids are unique', () => {
  const ids = FLAVORS.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('menu prices match the spec exactly', () => {
  const byId = Object.fromEntries(MENU.map((m) => [m.id, m.price]));
  assert.equal(byId['full-size'], 28);
  assert.equal(byId['ham-cheese'], 36);
  assert.equal(byId['specialty'], 30);
  assert.equal(byId['pre-baked'], 50);
});
