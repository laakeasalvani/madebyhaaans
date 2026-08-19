import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FLAVORS, MENU } from '../js/data.js';

test('every flavor has the fields the carousel needs', () => {
  assert.ok(FLAVORS.length >= 5, 'need at least five cards to fill the arc');
  for (const f of FLAVORS) {
    assert.match(f.id, /^[a-z0-9-]+$/, `bad id: ${f.id}`);
    assert.ok(f.name.length > 0, `missing name on ${f.id}`);
    assert.ok(f.alt.length > 10, `alt text too short on ${f.id}`);
  }
});

test('image paths follow the swap-in-a-real-photo contract', () => {
  for (const f of FLAVORS) {
    assert.equal(f.rollImage, `images/roll-${f.id}.webp`);
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

test('exactly one flavor is the seasonal slot', () => {
  const seasonal = FLAVORS.filter((f) => f.seasonal);
  assert.equal(seasonal.length, 1, 'the arc expects one rotating special');
  assert.equal(seasonal[0].id, 'seasonal');
});

test('a single roll is $5 for every flavor', () => {
  for (const f of FLAVORS) {
    assert.equal(f.price, 5, `${f.id} should be a single-roll price of $5`);
  }
});

test('single-roll prices are not confused with pan prices', () => {
  // FLAVORS prices one roll; MENU prices a whole pan. If these ever collide,
  // someone has edited the wrong list.
  const panPrices = new Set(MENU.map((m) => m.price));
  for (const f of FLAVORS) {
    assert.ok(!panPrices.has(f.price), `${f.id} is priced like a pan, not a roll`);
  }
});
