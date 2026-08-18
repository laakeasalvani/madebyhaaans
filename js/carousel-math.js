/**
 * Pure geometry for the hero arc. No DOM, no GSAP, no imports —
 * so it can be unit-tested in Node and reasoned about on its own.
 *
 * Cards ride the top of a virtual circle whose center sits far below the
 * viewport. A card's angle from the top of that circle determines everything:
 * where it sits, how far it has tipped, how small it has gone, how faint it is.
 */

export const ARC = {
  radius: 1400,      // px — larger radius, shallower arc
  spanDeg: 60,       // total angular span the cards loop through
  minScale: 0.66,    // scale at the outermost edge
  minOpacity: 0.55,  // opacity at the outermost edge
};

const DEG = Math.PI / 180;

/** Fold an angle back into [-span/2, +span/2] so the arc loops seamlessly. */
export function wrapAngle(angleDeg, spanDeg) {
  const half = spanDeg / 2;
  let a = (angleDeg + half) % spanDeg;
  if (a < 0) a += spanDeg;
  return a - half;
}

/** Angle of card `index` when the carousel has advanced `progress` steps. */
export function angleFor(index, count, progress, spanDeg) {
  const step = spanDeg / count;
  return wrapAngle((index + progress) * step, spanDeg);
}

/** Screen-space transform for a card sitting at `angleDeg` on the arc. */
export function cardTransform(angleDeg, cfg = ARC) {
  const { radius, spanDeg, minScale, minOpacity } = cfg;
  const half = spanDeg / 2;
  const rad = angleDeg * DEG;
  const t = Math.min(Math.abs(angleDeg) / half, 1); // 0 at center, 1 at the edge

  return {
    x: radius * Math.sin(rad),
    y: radius * (1 - Math.cos(rad)),
    rotate: angleDeg,
    scale: 1 - (1 - minScale) * t,
    // Quadratic, not linear: cards either side of centre should read as solid
    // white like the reference, with the fade saved for the outermost edge.
    opacity: 1 - (1 - minOpacity) * t * t,
    zIndex: Math.round(100 - t * 100),
  };
}

/** Which card is currently centered. Counts backward: advancing moves cards right. */
export function activeIndex(progress, count) {
  return ((-Math.round(progress) % count) + count) % count;
}
