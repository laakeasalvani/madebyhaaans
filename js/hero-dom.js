import { FLAVORS } from './data.js';

/**
 * Builds the hero's data-driven elements from FLAVORS.
 *
 * Cards are real <button>s: they are clicked to choose a flavor, so they must
 * be focusable, keyboard-operable and announced as controls. Nothing here
 * counts to five -- adding a flavor to data.js is all it takes.
 */
export function buildHero(root) {
  const arc = root.querySelector('.hero-arc');
  const rollsWrap = root.querySelector('.hero-rolls');

  const cards = FLAVORS.map((f, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'arc-card' + (f.seasonal ? ' is-seasonal' : '');
    btn.dataset.index = String(i);
    btn.setAttribute('aria-label', `Show ${f.name}`);
    btn.innerHTML =
      `<img src="${f.cardImage}" alt="" width="320" height="320" loading="lazy">` +
      `<span class="arc-card-label">${f.name}</span>`;
    arc.append(btn);
    return btn;
  });

  const rolls = FLAVORS.map((f, i) => {
    const img = document.createElement('img');
    img.className = 'hero-roll';
    img.src = f.rollImage;
    img.alt = f.alt;
    img.width = 900;
    img.height = 900;
    if (i === 0) img.classList.add('is-active');
    rollsWrap.append(img);
    return img;
  });

  return {
    cards,
    rolls,
    nameEl: root.querySelector('.hero-flavor'),
    priceEl: root.querySelector('.hero-price'),
  };
}
