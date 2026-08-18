import { buildHero } from './hero-dom.js';
import { initCarousel } from './carousel.js';
import { initMenu } from './sections.js';

// If the GSAP CDN did not load, drop the .js flag so every animated section
// falls back to its plain, fully visible state rather than staying blank.
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
  document.documentElement.classList.remove('js');
} else {
  gsap.registerPlugin(ScrollTrigger);
  initCarousel(buildHero(document.querySelector('.hero')));
  initMenu();
}
