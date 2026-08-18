import { FLAVORS } from './data.js';

/**
 * Creates the hero's data-driven elements. Adding a fifth flavor to data.js
 * is all it takes — nothing here counts to four.
 */
export function buildHero(root) {
  const arc = root.querySelector('.hero-arc');
  const pansWrap = root.querySelector('.hero-pans');

  const cards = FLAVORS.map((f, i) => {
    const fig = document.createElement('figure');
    fig.className = 'arc-card';
    fig.dataset.index = String(i);
    fig.innerHTML =
      `<img src="${f.cardImage}" alt="" width="320" height="320" loading="lazy">`;
    arc.append(fig);
    return fig;
  });

  const pans = FLAVORS.map((f, i) => {
    const img = document.createElement('img');
    img.className = 'hero-pan';
    img.src = f.panImage;
    img.alt = f.alt;
    img.width = 900;
    img.height = 900;
    if (i === 0) img.classList.add('is-active');
    pansWrap.append(img);
    return img;
  });

  return {
    cards,
    pans,
    nameEl: root.querySelector('.hero-flavor'),
    priceEl: root.querySelector('.hero-price'),
  };
}
