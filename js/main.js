import { buildHero } from './hero-dom.js';
import { initCarousel } from './carousel.js';
import { initMenu } from './sections.js';

// If the GSAP CDN did not load, drop the .js flag so every animated section
// falls back to its plain, fully visible state rather than staying blank.
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
  document.documentElement.classList.remove('js');
} else {
  gsap.registerPlugin(ScrollTrigger);

  const carousel = initCarousel(buildHero(document.querySelector('.hero')));
  initMenu();

  // The cart icon orders whatever flavor is currently centered in the arc.
  // The order form arrives in a later task; until then this falls back to the
  // menu so the button is never a dead end.
  // Hide nav links whose target section does not exist yet. The site is being
  // built section by section, and a public page must never offer a link that
  // silently does nothing. These reappear on their own as sections land.
  document.querySelectorAll('.nav-pill a[href^="#"]').forEach((a) => {
    if (!document.querySelector(a.getAttribute('href'))) a.remove();
  });

  // Same for the hero's Order button, but repoint rather than remove it: the
  // call to action must survive even before the order form exists.
  const heroOrder = document.querySelector('.hero-order');
  if (!document.querySelector('#order')) heroOrder.setAttribute('href', '#menu');

  const cart = document.querySelector('.nav-cart');
  const orderFlavor = () => {
    const flavor = carousel.selectedFlavor();
    const form = document.querySelector('#order');
    if (form) {
      const select = form.querySelector('[name="flavor"]');
      if (select) select.value = flavor.id;
      form.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' });
    }
  };
  cart.addEventListener('click', orderFlavor);
  document.querySelector('.hero-order').addEventListener('click', (e) => {
    if (!document.querySelector('#order')) {
      e.preventDefault();
      orderFlavor();
    }
  });
}
