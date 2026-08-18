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
