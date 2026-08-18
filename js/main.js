import { buildHero } from './hero-dom.js';
import { FLAVORS } from './data.js';

const hero = buildHero(document.querySelector('.hero'));
hero.nameEl.textContent = FLAVORS[0].name;
hero.priceEl.textContent = `$${FLAVORS[0].price}`;
