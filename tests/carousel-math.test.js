import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARC, wrapAngle, angleFor, cardTransform, activeIndex } from '../js/carousel-math.js';

const close = (a, b, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} to be within ${eps} of ${b}`);

test('wrapAngle keeps angles inside the arc span', () => {
  close(wrapAngle(0, 60), 0);
  close(wrapAngle(40, 60), -20);
  close(wrapAngle(-40, 60), 20);
  close(wrapAngle(155, 60), -25);
});

test('a centered card sits at the origin, full size', () => {
  const t = cardTransform(0, ARC);
  close(t.x, 0);
  close(t.y, 0);
  close(t.scale, 1);
  close(t.opacity, 1);
  close(t.rotate, 0);
});

test('cards dip downward and mirror across the center', () => {
  const right = cardTransform(20, ARC);
  const left = cardTransform(-20, ARC);
  assert.ok(right.x > 0, 'positive angle goes right');
  close(left.x, -right.x);
  assert.ok(right.y > 0, 'edges dip below the center');
  close(left.y, right.y);
  close(left.scale, right.scale);
});

test('cards shrink and fade toward the edges', () => {
  const mid = cardTransform(ARC.spanDeg / 4, ARC);
  const edge = cardTransform(ARC.spanDeg / 2, ARC);
  assert.ok(edge.scale < mid.scale && mid.scale < 1);
  assert.ok(edge.opacity < mid.opacity && mid.opacity < 1);
  close(edge.scale, ARC.minScale);
  close(edge.opacity, ARC.minOpacity);
});

test('a card nearer the center stacks above one further out', () => {
  assert.ok(cardTransform(0, ARC).zIndex > cardTransform(20, ARC).zIndex);
});

test('rotation follows the tangent of the arc', () => {
  close(cardTransform(12, ARC).rotate, 12);
});

test('angleFor spaces cards evenly and never leaves the span', () => {
  const count = 4;
  for (let p = 0; p < 2; p += 0.13) {
    const angles = [];
    for (let i = 0; i < count; i++) {
      const a = angleFor(i, count, p, ARC.spanDeg);
      assert.ok(Math.abs(a) <= ARC.spanDeg / 2 + 1e-9, `angle ${a} escaped the span`);
      angles.push(a);
    }
    assert.equal(new Set(angles.map((a) => a.toFixed(4))).size, count, 'cards overlapped');
  }
});

test('advancing progress by one whole step returns the same layout', () => {
  const a = [0, 1, 2, 3].map((i) => angleFor(i, 4, 0, ARC.spanDeg)).sort((x, y) => x - y);
  const b = [0, 1, 2, 3].map((i) => angleFor(i, 4, 1, ARC.spanDeg)).sort((x, y) => x - y);
  a.forEach((v, i) => close(v, b[i], 1e-9));
});

test('activeIndex names the flavor currently centered', () => {
  assert.equal(activeIndex(0, 4), 0);
  assert.equal(activeIndex(1, 4), 3);
  assert.equal(activeIndex(2, 4), 2);
  assert.equal(activeIndex(-1, 4), 1);
});
