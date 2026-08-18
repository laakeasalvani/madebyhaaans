import { buildHero } from './hero-dom.js';
import { initCarousel } from './carousel.js';

initCarousel(buildHero(document.querySelector('.hero')));
