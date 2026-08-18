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
    // The very first call (current === -1, from the initial layout() below)
    // is not a "change" -- it's establishing the starting state. Crossfading
    // it leaves nameEl/priceEl empty until a 0.18s tween completes, which is
    // a real regression from the pre-carousel main.js that set these values
    // synchronously. Worse, if the page loads in a background tab the rAF
    // ticker is throttled and that tween may not complete for a while, so
    // the price pill can render blank. Set the initial state instantly with
    // gsap.set and only crossfade on genuine subsequent changes.
    const isFirst = current === -1;
    current = i;
    const flavor = FLAVORS[i];

    pans.forEach((p, n) => {
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
      onComplete: () => {
        nameEl.textContent = flavor.name;
        priceEl.textContent = `$${flavor.price}`;
        gsap.to(nameEl, { opacity: 1, y: 0, duration: REDUCED.matches ? 0 : 0.28 });
      },
    });
  }

  // Whether the pointer is currently resting over a card. Tracked so that
  // restartSpin() (called after a drag or a keyboard/click step) knows to
  // leave the fresh tween paused if the pointer never left -- otherwise a
  // drag that ends with the cursor still over a card would un-pause the
  // spin out from under a hover that's still active.
  let hovering = false;

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
    if (hovering) spin.pause();
  }

  if (REDUCED.matches) spin.pause();

  // Drag is bound to the whole hero: .hero-arc sits behind .hero-stage and is
  // pointer-events:none, so binding to it would leave the middle of the screen dead.
  const hero = document.querySelector('.hero');
  const arc = document.querySelector('.hero-arc');

  // Drag / swipe. Horizontal distance maps to arc steps.
  let dragging = false;
  let activePointerId = null;
  let startX = 0;
  let startProgress = 0;

  const pxPerStep = () => Math.max(120, window.innerWidth / (count + 2));

  function onDown(e) {
    // Ignore a second finger/pointer touching down mid-drag -- only the
    // first one drives the arc.
    if (dragging) return;
    dragging = true;
    activePointerId = e.pointerId;
    startX = e.clientX;
    startProgress = state.progress;
    spin.pause();
    hero.setPointerCapture?.(e.pointerId);
  }

  function onMove(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    state.progress = startProgress + (e.clientX - startX) / pxPerStep();
    layout();
  }

  // Handles both a normal release (pointerup) and an interrupted drag
  // (pointercancel -- fired when the OS takes over the gesture, e.g. a
  // touch drag that turns into a browser-chrome swipe). Without handling
  // pointercancel, a cancelled touch drag leaves `dragging` stuck true and
  // `spin` paused forever: the carousel freezes until reload, since the
  // `!dragging` guard in onLeave also blocks hover-resume in that state.
  function onPointerEnd(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    dragging = false;
    activePointerId = null;
    // state.progress moved during the drag while spin sat paused, so
    // restart rather than resume -- see the note above makeSpin().
    if (!REDUCED.matches) restartSpin();
  }

  hero.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onPointerEnd);
  window.addEventListener('pointercancel', onPointerEnd);

  // Pause only while the pointer is actually over a card, not the whole hero —
  // otherwise the spin would stop the moment the cursor entered the section.
  // Nothing moves state.progress while just hovering, so a plain resume is
  // fine here (no stale trajectory to restart away from).
  const onEnter = () => {
    hovering = true;
    if (!REDUCED.matches) spin.pause();
  };
  const onLeave = () => {
    hovering = false;
    if (!dragging && !REDUCED.matches) spin.resume();
  };
  arc.addEventListener('pointerover', onEnter);
  arc.addEventListener('pointerout', onLeave);

  // Keyboard access: step one flavor at a time. Spec 5.5 requires this.
  // Kept in a variable (rather than fire-and-forget) for two reasons:
  // overwrite: 'auto' lets a second press within the tween's 0.5s duration
  // cleanly replace the first instead of both fighting over state.progress
  // (the first's onComplete would otherwise fire mid-second-tween and call
  // restartSpin() while the second was still animating); and destroy() needs
  // a handle to kill it, since its onComplete calls restartSpin() and would
  // otherwise resurrect a playing autoplay tween after the caller believes
  // the carousel has been torn down.
  let stepTween = null;

  function step(direction) {
    spin.pause();
    stepTween = gsap.to(state, {
      progress: Math.round(state.progress) + direction,
      duration: REDUCED.matches ? 0 : 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
      onUpdate: layout,
      // Same reasoning as onPointerEnd: this tween just moved state.progress,
      // so restart spin from here instead of resuming its stale trajectory.
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
      if (stepTween) stepTween.kill();
      hero.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      arc.removeEventListener('pointerover', onEnter);
      arc.removeEventListener('pointerout', onLeave);
      prevBtn.removeEventListener('click', onPrev);
      nextBtn.removeEventListener('click', onNext);
      hero.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    },
  };
}
