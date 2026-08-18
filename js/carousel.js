import { FLAVORS } from './data.js';
import { ARC, angleFor, cardTransform, activeIndex } from './carousel-math.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const NARROW = window.matchMedia('(max-width: 767px)');

/**
 * The hero arc.
 *
 * There is no autoplay. Nothing moves until the visitor clicks a card, at
 * which point the arc rotates so that card sweeps to the center and the roll
 * changes to its flavor. `progress` is the single piece of state: it is the
 * (possibly fractional) number of steps the arc has been rotated, and every
 * card's position is derived from it.
 */
export function initCarousel({ cards, rolls, nameEl, priceEl }) {
  const count = cards.length;
  const state = { progress: 0 };
  let current = -1;
  let spin = null; // the in-flight rotate-to-center tween, if any

  // The centred slot is where the product sits, so the arc must be wide enough
  // that the first card either side clears it. Derived from viewport height
  // because both the product (55vh) and the cards (25vh) are sized that way.
  //   half the product + half a card + a margin, all as fractions of height
  const clearance = () => {
    const h = window.innerHeight;
    // Measured from the DOM rather than hardcoded: the card and product sizes
    // live in CSS, and a second copy of those numbers here would silently
    // drift the moment either is retuned.
    const rolls = document.querySelector('.hero-rolls');
    const productHalf = (rolls ? rolls.offsetWidth : 0.55 * h) / 2;
    const cardHalf = (cards[0] ? cards[0].offsetWidth : 0.31 * h) / 2;
    const ideal = productHalf + cardHalf + 0.03 * h;
    // On a narrow screen there is simply not enough width to sit a card beside
    // the product at the ideal distance -- pushing for it threw every card off
    // the edge. Cap the distance so the first card either side stays fully on
    // screen, even if that means it tucks close to the product.
    const widthCap = window.innerWidth / 2 - cardHalf - 8;
    return Math.min(ideal, widthCap);
  };
  const radiusFor = () => {
    const stepRad = (ARC.spanDeg / count) * (Math.PI / 180);
    return clearance() / Math.sin(stepRad);
  };

  const cfg = { ...ARC, radius: radiusFor() };

  function layout() {
    for (let i = 0; i < count; i++) {
      const angle = angleFor(i, count, state.progress, cfg.spanDeg);
      const t = cardTransform(angle, cfg);
      // Fade out whichever card is closest to centre: that slot belongs to the
      // product, and its flavour is already being shown as the roll itself.
      const centreFade = Math.min(1, Math.abs(angle) / (cfg.spanDeg / count / 1.6));
      gsap.set(cards[i], {
        x: t.x,
        y: t.y,
        rotate: t.rotate,
        scale: t.scale,
        opacity: t.opacity * centreFade,
        zIndex: t.zIndex,
        xPercent: -50,
        yPercent: -50,
        pointerEvents: centreFade < 0.15 ? 'none' : 'auto',
      });
    }
    showFlavor(activeIndex(state.progress, count));
  }

  function showFlavor(i) {
    if (i === current) return;
    const isFirst = current === -1;
    current = i;
    const flavor = FLAVORS[i];

    cards.forEach((c, n) => c.classList.toggle('is-selected', n === i));

    rolls.forEach((p, n) => {
      const active = n === i;
      if (isFirst) {
        gsap.set(p, { opacity: active ? 1 : 0, scale: active ? 1 : 0.96 });
      } else {
        gsap.to(p, {
          opacity: active ? 1 : 0,
          scale: active ? 1 : 0.96,
          duration: REDUCED.matches ? 0 : 0.55,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    });

    // The first render must be synchronous, or the name and price would be
    // empty until a tween completed -- and would stay empty indefinitely if
    // the page loaded in a background tab where rAF is throttled.
    if (isFirst) {
      nameEl.textContent = flavor.name;
      priceEl.textContent = `$${flavor.price}`;
      gsap.set(nameEl, { opacity: 1, y: 0 });
      return;
    }

    gsap.to(nameEl, {
      opacity: 0,
      y: 8,
      duration: REDUCED.matches ? 0 : 0.18,
      overwrite: 'auto',
      onComplete: () => {
        nameEl.textContent = flavor.name;
        priceEl.textContent = `$${flavor.price}`;
        gsap.to(nameEl, { opacity: 1, y: 0, duration: REDUCED.matches ? 0 : 0.28 });
      },
    });
  }

  /**
   * Rotate the arc by `steps` positions. Positive moves cards rightward.
   * A fresh tween replaces any in-flight one rather than queueing behind it,
   * so rapid clicking stays responsive instead of playing back a backlog.
   */
  function rotateBy(steps) {
    if (!steps) return;
    if (spin) spin.kill();
    const target = Math.round(state.progress) + steps;
    if (REDUCED.matches) {
      state.progress = target;
      layout();
      return;
    }
    spin = gsap.to(state, {
      progress: target,
      duration: Math.min(0.85, 0.42 + Math.abs(steps) * 0.12),
      ease: 'power3.out',
      overwrite: 'auto',
      onUpdate: layout,
    });
  }

  /** Rotate so that card `index` ends up centered, taking the shorter way round. */
  function selectIndex(index) {
    const centered = activeIndex(state.progress, count);
    if (index === centered) return;
    let delta = centered - index;
    // Wrap to the shortest direction: with 5 cards, +4 is really -1.
    if (delta > count / 2) delta -= count;
    if (delta < -count / 2) delta += count;
    rotateBy(delta);
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', () => selectIndex(i));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectIndex(i);
      }
    });
  });

  const onPrev = () => rotateBy(1);
  const onNext = () => rotateBy(-1);
  const prevBtn = document.querySelector('.arc-prev');
  const nextBtn = document.querySelector('.arc-next');
  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);

  const hero = document.querySelector('.hero');
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  };
  hero.addEventListener('keydown', onKey);

  const onResize = () => {
    cfg.radius = radiusFor();
    layout();
  };
  window.addEventListener('resize', onResize);

  layout();

  return {
    selectedFlavor: () => FLAVORS[activeIndex(state.progress, count)],
    destroy() {
      if (spin) spin.kill();
      prevBtn.removeEventListener('click', onPrev);
      nextBtn.removeEventListener('click', onNext);
      hero.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    },
  };
}
