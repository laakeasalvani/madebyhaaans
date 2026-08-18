import { FLAVORS } from './data.js';
import { ARC, angleFor, cardTransform, activeIndex } from './carousel-math.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const NARROW = window.matchMedia('(max-width: 767px)');

const SECONDS_PER_CARD = 2.6;

export function initCarousel({ cards, pans, nameEl, priceEl }) {
  const count = cards.length;
  const state = { progress: 0 };
  let current = -1;

  // Tighter radius on phones so cards stay large enough to read.
  const cfg = { ...ARC, radius: NARROW.matches ? 780 : ARC.radius };

  function layout() {
    for (let i = 0; i < count; i++) {
      const angle = angleFor(i, count, state.progress, cfg.spanDeg);
      const t = cardTransform(angle, cfg);
      gsap.set(cards[i], {
        x: t.x,
        y: t.y,
        rotate: t.rotate,
        scale: t.scale,
        opacity: t.opacity,
        zIndex: t.zIndex,
        xPercent: -50,
        yPercent: -50,
      });
    }
    showFlavor(activeIndex(state.progress, count));
  }

  function showFlavor(i) {
    if (i === current) return;
    current = i;
    const flavor = FLAVORS[i];

    pans.forEach((p, n) => {
      gsap.to(p, {
        opacity: n === i ? 1 : 0,
        scale: n === i ? 1 : 0.96,
        duration: REDUCED.matches ? 0 : 0.55,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    gsap.to(nameEl, {
      opacity: 0,
      y: 8,
      duration: REDUCED.matches ? 0 : 0.18,
      onComplete: () => {
        nameEl.textContent = flavor.name;
        priceEl.textContent = `$${flavor.price}`;
        gsap.to(nameEl, { opacity: 1, y: 0, duration: REDUCED.matches ? 0 : 0.28 });
      },
    });
  }

  // Autoplay: one full step per SECONDS_PER_CARD, forever.
  //
  // `spin` is a relative tween ("-=count") on state.progress: it caches its
  // start/end values when created and keeps interpolating from that cached
  // baseline for as long as it lives, even across pause/resume. If something
  // else (drag, or the keyboard step tween below) changes state.progress
  // while spin is paused, a plain spin.resume() would snap the arc back onto
  // spin's own stale trajectory and silently discard that change. So instead
  // of resuming the same instance after an external mutation, restartSpin()
  // kills it and creates a fresh relative tween from wherever state.progress
  // actually is now. Because the arc's appearance only depends on progress
  // modulo `count` (see carousel-math tests), restarting never causes a
  // visible jump -- it just continues the same drift from the true position.
  function makeSpin() {
    return gsap.to(state, {
      progress: `-=${count}`,
      duration: SECONDS_PER_CARD * count,
      ease: 'none',
      repeat: -1,
      onUpdate: layout,
    });
  }

  let spin = makeSpin();

  function restartSpin() {
    spin.kill();
    spin = makeSpin();
  }

  if (REDUCED.matches) spin.pause();

  // Drag is bound to the whole hero: .hero-arc sits behind .hero-stage and is
  // pointer-events:none, so binding to it would leave the middle of the screen dead.
  const hero = document.querySelector('.hero');
  const arc = document.querySelector('.hero-arc');

  // Drag / swipe. Horizontal distance maps to arc steps.
  let dragging = false;
  let startX = 0;
  let startProgress = 0;

  const pxPerStep = () => Math.max(120, window.innerWidth / (count + 2));

  function onDown(e) {
    dragging = true;
    startX = e.clientX;
    startProgress = state.progress;
    spin.pause();
    hero.setPointerCapture?.(e.pointerId);
  }

  function onMove(e) {
    if (!dragging) return;
    state.progress = startProgress + (e.clientX - startX) / pxPerStep();
    layout();
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    // state.progress moved during the drag while spin sat paused, so
    // restart rather than resume -- see the note above makeSpin().
    if (!REDUCED.matches) restartSpin();
  }

  hero.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  // Pause only while the pointer is actually over a card, not the whole hero —
  // otherwise the spin would stop the moment the cursor entered the section.
  // Nothing moves state.progress while just hovering, so a plain resume is
  // fine here (no stale trajectory to restart away from).
  const onEnter = () => !REDUCED.matches && spin.pause();
  const onLeave = () => !dragging && !REDUCED.matches && spin.resume();
  arc.addEventListener('pointerover', onEnter);
  arc.addEventListener('pointerout', onLeave);

  // Keyboard access: step one flavor at a time. Spec 5.5 requires this.
  function step(direction) {
    spin.pause();
    gsap.to(state, {
      progress: Math.round(state.progress) + direction,
      duration: REDUCED.matches ? 0 : 0.5,
      ease: 'power2.out',
      onUpdate: layout,
      // Same reasoning as onUp: this tween just moved state.progress, so
      // restart spin from here instead of resuming its stale trajectory.
      onComplete: () => { if (!REDUCED.matches) restartSpin(); },
    });
  }

  const onPrev = () => step(1);
  const onNext = () => step(-1);
  const prevBtn = document.querySelector('.arc-prev');
  const nextBtn = document.querySelector('.arc-next');
  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  };
  hero.addEventListener('keydown', onKey);

  const onResize = () => {
    cfg.radius = NARROW.matches ? 780 : ARC.radius;
    layout();
  };
  window.addEventListener('resize', onResize);

  layout();

  return {
    destroy() {
      spin.kill();
      hero.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      arc.removeEventListener('pointerover', onEnter);
      arc.removeEventListener('pointerout', onLeave);
      prevBtn.removeEventListener('click', onPrev);
      nextBtn.removeEventListener('click', onNext);
      hero.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    },
  };
}
