import { MENU } from './data.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

export function initMenu() {
  const grid = document.querySelector('.menu-grid');

  grid.innerHTML = MENU.map(
    (m) => `
    <article class="menu-card">
      <h3>${m.name}</h3>
      <p class="menu-price">$${m.price}</p>
      <p class="menu-note-sm">${m.note}</p>
    </article>`
  ).join('');

  const cards = grid.querySelectorAll('.menu-card');

  // Cards start tipped back in CSS so they are never invisible before GSAP
  // runs. Reduced motion just snaps them upright -- a section that never
  // appears would be a far worse failure than one that does not animate.
  if (REDUCED.matches) {
    gsap.set(cards, { opacity: 1, rotateX: 0, y: 0 });
    return;
  }

  // Each card tips up toward the reader and settles flat, one after another.
  //
  // fromTo with immediateRender:false, NOT to(). A plain to() normalizes the
  // transform and writes the end state inline the moment the tween is created,
  // which wipes the CSS start state and leaves the cards already upright and
  // visible at the top of the page -- the animation silently never plays.
  // immediateRender:false keeps GSAP's hands off the elements until the
  // trigger actually fires, so the CSS start state survives until then.
  gsap.fromTo(
    cards,
    { opacity: 0, y: 70, rotateX: 42 },
    {
      scrollTrigger: { trigger: grid, start: 'top 80%', once: true },
      immediateRender: false,
      opacity: 1,
      y: 0,
      rotateX: 0,
      transformOrigin: '50% 100%',
      duration: 0.75,
      ease: 'power3.out',
      stagger: 0.11,
    }
  );
}
