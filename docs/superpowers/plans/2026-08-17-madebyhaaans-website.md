# madebyhaaans Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page site for a home cinnamon-roll business whose hero recreates the arc-carousel motion of the reference case study, with three scroll-animated sections and an order form that emails the owner.

**Architecture:** Static ES modules served as plain files — no bundler, no npm dependencies shipped. Pure logic (carousel geometry, catalog data, form validation) lives in modules with no DOM access so it can be unit-tested with Node's built-in test runner; DOM and GSAP wiring lives in separate modules that import them. All content lives in `js/data.js` so copy and prices are never hunted for inside markup.

**Tech Stack:** HTML5, CSS3 (custom properties, 3D transforms), vanilla ES modules, GSAP 3.13 + ScrollTrigger via CDN, Node 24 `node --test` for unit tests (dev only, never shipped), Web3Forms for order email, GitHub Pages for hosting.

## Global Constraints

- **No build step.** No bundler, no transpiler, no `node_modules` in the shipped site. `npm install` is never run. The `package.json` holds `{"type": "module"}` and nothing else — it exists so Node's test runner can parse ES modules, and browsers ignore it.
- **ES modules require a local server.** `file://` will fail with CORS errors. Local preview is `python3 -m http.server 8000`. This is a deliberate deviation from "double-click index.html" — document it in the README.
- **GSAP version floor:** 3.13.0, loaded from `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/`. No account, no license key.
- **Exact prices, copied verbatim from the spec:** Full-size (8) frozen pan `$28`; Ham & Cheese (8) frozen pan `$36`; Specialty flavors (Birthday Cake / Oreo) `$30`; Pre-baked (12) trays, sheet cake box `$50`.
- **Exact bake copy, verbatim:** thaw and let rise 4–5 hours; bake at 350°F for 20–30 minutes until golden brown on top; wait a few minutes then spread the included frosting or serve on the side; serve warm. Frozen pans are freezer-safe for 30 days. Each frozen pan includes a 16 oz tub of frosting. Pickup is in Kaka'ako.
- **Placeholder rule:** any invented fact (pickup days, times, lead time) must be immediately preceded by `<!-- PLACEHOLDER: confirm with Haaans -->` in the HTML. A launch check greps for this string.
- **Image filenames are a contract:** `images/pan-<flavor-id>.webp` and `images/card-<flavor-id>.webp`, where `<flavor-id>` matches the `id` field in `js/data.js`. Real photos replace AI images by overwriting the file — never by editing code.
- **Reduced motion:** every animation must be disabled or reduced to a fade under `prefers-reduced-motion: reduce`.
- **Animate only `transform` and `opacity`.** Never animate `top`, `left`, `width`, `height`, or `box-shadow` in a scroll handler.
- **Colors:** cream background, cinnamon-brown type. The reference's dark olive palette is NOT used.

---

### Task 1: Repository scaffold and catalog data

**Files:**
- Create: `.gitignore`, `package.json`, `README.md`, `index.html`, `css/styles.css`, `js/data.js`
- Test: `tests/data.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: `js/data.js` exporting `FLAVORS` (array of `{id, name, price, cardImage, panImage, alt}`) and `MENU` (array of `{id, name, price, note}`). Every later task imports from here.

- [ ] **Step 1: Initialize the repository**

```bash
cd ~/madebyhaaans
git init -b main
printf '.DS_Store\nnode_modules/\n' > .gitignore
printf '{\n  "type": "module",\n  "private": true\n}\n' > package.json
```

`package.json` exists for one reason: without `"type": "module"`, Node parses
`.js` files as CommonJS and every `import` throws. It declares no dependencies
and no scripts, nothing is ever installed from it, and browsers ignore it
completely — this is not a build step. **Verified:** without this file,
`node --test` fails with `Cannot find module`.

- [ ] **Step 2: Write the failing test for the catalog**

Create `tests/data.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FLAVORS, MENU } from '../js/data.js';

test('every flavor has the fields the carousel needs', () => {
  assert.ok(FLAVORS.length >= 4, 'need at least four flavors');
  for (const f of FLAVORS) {
    assert.match(f.id, /^[a-z0-9-]+$/, `bad id: ${f.id}`);
    assert.ok(f.name.length > 0, `missing name on ${f.id}`);
    assert.ok(f.alt.length > 10, `alt text too short on ${f.id}`);
  }
});

test('image paths follow the swap-in-a-real-photo contract', () => {
  for (const f of FLAVORS) {
    assert.equal(f.panImage, `images/pan-${f.id}.webp`);
    assert.equal(f.cardImage, `images/card-${f.id}.webp`);
  }
});

test('flavor ids are unique', () => {
  const ids = FLAVORS.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('menu prices match the spec exactly', () => {
  const byId = Object.fromEntries(MENU.map((m) => [m.id, m.price]));
  assert.equal(byId['full-size'], 28);
  assert.equal(byId['ham-cheese'], 36);
  assert.equal(byId['specialty'], 30);
  assert.equal(byId['pre-baked'], 50);
});
```

- [ ] **Step 3: Run the test and watch it fail**

Run: `cd ~/madebyhaaans && node --test`
Expected: FAIL — `Cannot find module '../js/data.js'`

- [ ] **Step 4: Write the catalog**

Create `js/data.js`:

```js
export const FLAVORS = [
  {
    id: 'original',
    name: 'Original',
    price: 28,
    panImage: 'images/pan-original.webp',
    cardImage: 'images/card-original.webp',
    alt: 'A pan of eight classic cinnamon rolls with white frosting',
  },
  {
    id: 'ham-cheese',
    name: 'Ham & Cheese',
    price: 36,
    panImage: 'images/pan-ham-cheese.webp',
    cardImage: 'images/card-ham-cheese.webp',
    alt: 'A pan of eight savory ham and cheese rolls, golden brown',
  },
  {
    id: 'birthday-cake',
    name: 'Birthday Cake',
    price: 30,
    panImage: 'images/pan-birthday-cake.webp',
    cardImage: 'images/card-birthday-cake.webp',
    alt: 'A pan of eight cinnamon rolls topped with rainbow sprinkles',
  },
  {
    id: 'oreo',
    name: 'Oreo',
    price: 30,
    panImage: 'images/pan-oreo.webp',
    cardImage: 'images/card-oreo.webp',
    alt: 'A pan of eight cinnamon rolls covered in crushed chocolate cookie crumbs',
  },
];

export const MENU = [
  {
    id: 'full-size',
    name: 'Full-size (8) frozen pan',
    price: 28,
    note: 'Bake at home whenever you want them.',
  },
  {
    id: 'ham-cheese',
    name: 'Ham & Cheese (8) frozen pan',
    price: 36,
    note: 'The savory one. Breakfast, but better.',
  },
  {
    id: 'specialty',
    name: 'Specialty flavors',
    price: 30,
    note: 'Birthday Cake or Oreo.',
  },
  {
    id: 'pre-baked',
    name: 'Pre-baked (12) tray',
    price: 50,
    note: 'Sheet cake box. Ready to eat, no oven required.',
  },
];

export const FACTS = {
  freezerDays: 30,
  frostingSize: '16 oz',
  pickupArea: "Kaka'ako",
  instagram: 'https://instagram.com/madebyhaaans',
};
```

- [ ] **Step 5: Run the test and watch it pass**

Run: `cd ~/madebyhaaans && node --test`
Expected: PASS, 4 tests

- [ ] **Step 6: Write the README**

Create `README.md`:

```markdown
# madebyhaaans

Single-page site for Haaans (@madebyhaaans) — homemade cinnamon rolls, Kaka'ako.

## Preview locally

ES modules will not load over `file://`. Serve the folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

## Run the tests

```bash
node --test
```

Tests cover the catalog data, carousel geometry, and form validation. Visual
and animation work is verified in a browser, not by these tests.

## Swapping in real photos

Overwrite the file, keep the name. `images/pan-original.webp` is the Original
pan; `images/card-oreo.webp` is the Oreo carousel card. No code changes.

## Before launch

Grep for placeholders and replace every hit:

```bash
grep -rn "PLACEHOLDER" index.html
```
```

- [ ] **Step 7: Commit**

```bash
cd ~/madebyhaaans
git add -A
git commit -m "feat: scaffold repo with catalog data and tests"
```

---

### Task 2: Design tokens and base styles

**Files:**
- Create: `css/styles.css` (full rewrite of the empty file)
- Modify: `index.html`

**Interfaces:**
- Consumes: nothing
- Produces: CSS custom properties `--cream`, `--cream-deep`, `--cinnamon`, `--cinnamon-dark`, `--frosting`, `--caramel`, `--ink`, plus `--shadow-soft`, `--shadow-lift`, and the type scale `--step--1` … `--step-5`. Every later task uses these names and never hardcodes a color.

- [ ] **Step 1: Write the token layer**

Create `css/styles.css`:

```css
:root {
  /* Warm, light palette — the reference's dark olive is deliberately not used. */
  --cream: #faf4ea;
  --cream-deep: #f2e7d6;
  --frosting: #fffdf9;
  --caramel: #c98b42;
  --cinnamon: #8a5a33;
  --cinnamon-dark: #5c3a1e;
  --ink: #2e1c0f;

  /* Depth on a light background comes from warm, soft shadows. */
  --shadow-soft: 0 10px 30px -12px rgba(92, 58, 30, 0.28);
  --shadow-lift: 0 26px 50px -18px rgba(92, 58, 30, 0.38);

  /* Fluid type scale */
  --step--1: clamp(0.83rem, 0.8rem + 0.15vw, 0.94rem);
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.13rem);
  --step-1: clamp(1.2rem, 1.1rem + 0.5vw, 1.5rem);
  --step-2: clamp(1.44rem, 1.25rem + 1vw, 2.25rem);
  --step-3: clamp(1.73rem, 1.4rem + 1.8vw, 3.38rem);
  --step-5: clamp(2.99rem, 1.8rem + 6vw, 8rem);

  --measure: 62ch;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--cream);
  color: var(--ink);
  font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif;
  font-size: var(--step-0);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
}

h1, h2, h3 {
  font-family: 'Fraunces', ui-serif, Georgia, serif;
  color: var(--cinnamon-dark);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 0.4em;
}

.section {
  padding: clamp(4rem, 10vw, 9rem) clamp(1.25rem, 5vw, 5rem);
  max-width: 1400px;
  margin-inline: auto;
}

.eyebrow {
  font-size: var(--step--1);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cinnamon);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Verify the stylesheet is clean ASCII**

A stray non-ASCII character inside a hex color fails silently — the property is
dropped and the element falls back to an inherited color, which is easy to miss.

Run: `LC_ALL=C grep -n '[^ -~]' css/styles.css`
Expected: no output

- [ ] **Step 3: Write the HTML shell**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>madebyhaaans — homemade cinnamon rolls, Kaka'ako</title>
<meta name="description" content="Take-and-bake frozen cinnamon roll pans, made by hand in Honolulu. Pick up in Kaka'ako.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
</head>
<body>
<main id="main"></main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
<script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create the entry module**

Create `js/main.js`:

```js
import { FLAVORS, MENU, FACTS } from './data.js';

console.log('loaded', FLAVORS.length, 'flavors,', MENU.length, 'menu items,', FACTS.pickupArea);
```

- [ ] **Step 5: Verify in the browser**

Start the preview server and confirm the console logs `loaded 4 flavors, 4 menu items, Kaka'ako` with no CORS or 404 errors, and that the page background is cream.

- [ ] **Step 6: Commit**

```bash
cd ~/madebyhaaans
git add -A
git commit -m "feat: add design tokens, HTML shell, and module entry point"
```

---

### Task 3: Product imagery

**Files:**
- Create: `images/pan-original.webp`, `images/pan-ham-cheese.webp`, `images/pan-birthday-cake.webp`, `images/pan-oreo.webp`, `images/card-original.webp`, `images/card-ham-cheese.webp`, `images/card-birthday-cake.webp`, `images/card-oreo.webp`, `images/frosting-tub.webp`, `images/mound.webp`
- Create: `docs/photo-shot-list.md`

**Interfaces:**
- Consumes: flavor `id` values from `js/data.js`
- Produces: image files at the exact paths `js/data.js` already declares. No code depends on how they were made.

- [ ] **Step 1: Generate the four pans from one fixed camera description**

Every pan prompt shares an identical camera clause so the crossfade registers. Only the flavor clause changes.

Fixed clause, reused verbatim in all four prompts:
`"square baking pan of eight cinnamon rolls, shot straight on at a slight 15-degree downward angle, centered, even soft daylight from the upper left, plain seamless white background, professional food photography, sharp focus, no props, no hands, no text"`

Flavor clauses:
- original: `"classic cinnamon rolls with thick white cream cheese frosting drizzled over the top"`
- ham-cheese: `"savory rolls with visible ham and melted cheddar cheese, golden brown, no frosting"`
- birthday-cake: `"cinnamon rolls with white frosting covered in rainbow sprinkles"`
- oreo: `"cinnamon rolls with white frosting topped with crushed chocolate sandwich cookie crumbs"`

Use the `generate_image` tool. Load it first with ToolSearch.

- [ ] **Step 2: Generate the four ingredient cards**

Same treatment, single subject, plain white background: a cinnamon stick with a small pile of ground cinnamon; a folded slice of ham with a wedge of cheddar; a scattering of rainbow sprinkles; a chocolate sandwich cookie broken in half.

- [ ] **Step 3: Generate the two supporting images**

`frosting-tub` — a plain white 16 oz tub of cream cheese frosting, lid off, seen at a slight angle.
`mound` — a soft low mound of cinnamon sugar, seen straight on at eye level, plain white background.

- [ ] **Step 4: Remove every background**

Run each generated image through the `remove_background` tool. The white background must become genuine transparency — the arc and the crossfade both depend on it. Inspect each result; a leftover white halo will be visible against cream.

- [ ] **Step 5: Convert and resize**

Pans render at 900px wide, cards at 320px wide, both as WebP. macOS `sips` handles this without installing anything:

```bash
cd ~/madebyhaaans/images
for f in pan-*.png;  do sips -Z 900 -s format webp "$f" --out "${f%.png}.webp"; done
for f in card-*.png; do sips -Z 320 -s format webp "$f" --out "${f%.png}.webp"; done
sips -Z 400 -s format webp frosting-tub.png --out frosting-tub.webp
sips -Z 1200 -s format webp mound.png --out mound.webp
rm -f *.png
```

- [ ] **Step 6: Verify the filename contract holds**

Run: `cd ~/madebyhaaans && node --test && ls images/`
Expected: tests pass, and every path named in `FLAVORS` exists on disk.

Confirm each file is under 150 KB:

Run: `du -k images/* | sort -rn | head -5`

- [ ] **Step 7: Write the shot list for real photos**

Create `docs/photo-shot-list.md` telling Haaans exactly how to reshoot these: phone camera is fine; put the pan on a white posterboard near a window with the light coming from one side; stand so you are looking slightly down at it, about 15 degrees, not straight overhead; do not move your feet between flavors; take one photo of each flavor from that same spot; one photo of the frosting tub; send them uncropped.

- [ ] **Step 8: Commit**

```bash
cd ~/madebyhaaans
git add -A
git commit -m "feat: add product imagery and photography shot list"
```

---

### Task 4: Carousel geometry

**Files:**
- Create: `js/carousel-math.js`
- Test: `tests/carousel-math.test.js`

**Interfaces:**
- Consumes: nothing — this module is pure, imports nothing, and touches no DOM
- Produces:
  - `ARC` — `{radius, spanDeg, minScale, minOpacity}` default config
  - `wrapAngle(angleDeg, spanDeg) -> number` in `[-spanDeg/2, spanDeg/2]`
  - `angleFor(index, count, progress, spanDeg) -> number`
  - `cardTransform(angleDeg, cfg) -> {x, y, rotate, scale, opacity, zIndex}`
  - `activeIndex(progress, count) -> number`

- [ ] **Step 1: Write the failing tests**

Create `tests/carousel-math.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARC, wrapAngle, angleFor, cardTransform, activeIndex } from '../js/carousel-math.js';

const close = (a, b, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} to be within ${eps} of ${b}`);

test('wrapAngle keeps angles inside the arc span', () => {
  close(wrapAngle(0, 60), 0);
  close(wrapAngle(40, 60), -20);
  close(wrapAngle(-40, 60), 20);
  close(wrapAngle(155, 60), -25);
});

test('a centered card sits at the origin, full size', () => {
  const t = cardTransform(0, ARC);
  close(t.x, 0);
  close(t.y, 0);
  close(t.scale, 1);
  close(t.opacity, 1);
  close(t.rotate, 0);
});

test('cards dip downward and mirror across the center', () => {
  const right = cardTransform(20, ARC);
  const left = cardTransform(-20, ARC);
  assert.ok(right.x > 0, 'positive angle goes right');
  close(left.x, -right.x);
  assert.ok(right.y > 0, 'edges dip below the center');
  close(left.y, right.y);
  close(left.scale, right.scale);
});

test('cards shrink and fade toward the edges', () => {
  const mid = cardTransform(ARC.spanDeg / 4, ARC);
  const edge = cardTransform(ARC.spanDeg / 2, ARC);
  assert.ok(edge.scale < mid.scale && mid.scale < 1);
  assert.ok(edge.opacity < mid.opacity && mid.opacity < 1);
  close(edge.scale, ARC.minScale);
  close(edge.opacity, ARC.minOpacity);
});

test('a card nearer the center stacks above one further out', () => {
  assert.ok(cardTransform(0, ARC).zIndex > cardTransform(20, ARC).zIndex);
});

test('rotation follows the tangent of the arc', () => {
  close(cardTransform(12, ARC).rotate, 12);
});

test('angleFor spaces cards evenly and never leaves the span', () => {
  const count = 4;
  for (let p = 0; p < 2; p += 0.13) {
    const angles = [];
    for (let i = 0; i < count; i++) {
      const a = angleFor(i, count, p, ARC.spanDeg);
      assert.ok(Math.abs(a) <= ARC.spanDeg / 2 + 1e-9, `angle ${a} escaped the span`);
      angles.push(a);
    }
    assert.equal(new Set(angles.map((a) => a.toFixed(4))).size, count, 'cards overlapped');
  }
});

test('advancing progress by one whole step returns the same layout', () => {
  const a = [0, 1, 2, 3].map((i) => angleFor(i, 4, 0, ARC.spanDeg)).sort((x, y) => x - y);
  const b = [0, 1, 2, 3].map((i) => angleFor(i, 4, 1, ARC.spanDeg)).sort((x, y) => x - y);
  a.forEach((v, i) => close(v, b[i], 1e-9));
});

test('activeIndex names the flavor currently centered', () => {
  assert.equal(activeIndex(0, 4), 0);
  assert.equal(activeIndex(1, 4), 3);
  assert.equal(activeIndex(2, 4), 2);
  assert.equal(activeIndex(-1, 4), 1);
});
```

- [ ] **Step 2: Run the tests and watch them fail**

Run: `cd ~/madebyhaaans && node --test`
Expected: FAIL — `Cannot find module '../js/carousel-math.js'`

- [ ] **Step 3: Implement the geometry**

Create `js/carousel-math.js`:

```js
/**
 * Pure geometry for the hero arc. No DOM, no GSAP, no imports —
 * so it can be unit-tested in Node and reasoned about on its own.
 *
 * Cards ride the top of a virtual circle whose center sits far below the
 * viewport. A card's angle from the top of that circle determines everything:
 * where it sits, how far it has tipped, how small it has gone, how faint it is.
 */

export const ARC = {
  radius: 1400,      // px — larger radius, shallower arc
  spanDeg: 60,       // total angular span the cards loop through
  minScale: 0.66,    // scale at the outermost edge
  minOpacity: 0.15,  // opacity at the outermost edge
};

const DEG = Math.PI / 180;

/** Fold an angle back into [-span/2, +span/2] so the arc loops seamlessly. */
export function wrapAngle(angleDeg, spanDeg) {
  const half = spanDeg / 2;
  let a = (angleDeg + half) % spanDeg;
  if (a < 0) a += spanDeg;
  return a - half;
}

/** Angle of card `index` when the carousel has advanced `progress` steps. */
export function angleFor(index, count, progress, spanDeg) {
  const step = spanDeg / count;
  return wrapAngle((index + progress) * step, spanDeg);
}

/** Screen-space transform for a card sitting at `angleDeg` on the arc. */
export function cardTransform(angleDeg, cfg = ARC) {
  const { radius, spanDeg, minScale, minOpacity } = cfg;
  const half = spanDeg / 2;
  const rad = angleDeg * DEG;
  const t = Math.min(Math.abs(angleDeg) / half, 1); // 0 at center, 1 at the edge

  return {
    x: radius * Math.sin(rad),
    y: radius * (1 - Math.cos(rad)),
    rotate: angleDeg,
    scale: 1 - (1 - minScale) * t,
    opacity: 1 - (1 - minOpacity) * t,
    zIndex: Math.round(100 - t * 100),
  };
}

/** Which card is currently centered. Counts backward: advancing moves cards right. */
export function activeIndex(progress, count) {
  return ((-Math.round(progress) % count) + count) % count;
}
```

- [ ] **Step 4: Run the tests and watch them pass**

Run: `cd ~/madebyhaaans && node --test`
Expected: PASS, all tests green

- [ ] **Step 5: Commit**

```bash
cd ~/madebyhaaans
git add js/carousel-math.js tests/carousel-math.test.js
git commit -m "feat: add pure carousel arc geometry with unit tests"
```

---

### Task 5: Static hero layout

**Files:**
- Modify: `index.html`, `css/styles.css`, `js/main.js`
- Create: `js/hero-dom.js`

**Interfaces:**
- Consumes: `FLAVORS`, `FACTS` from `js/data.js`
- Produces: `buildHero(root) -> {cards, pans, nameEl, priceEl}` — creates the hero DOM and returns handles the animation task needs. Cards are `<figure class="arc-card">` elements in flavor order; pans are stacked `<img class="hero-pan">` elements, all but the first at `opacity: 0`.

- [ ] **Step 1: Add the hero markup**

Replace `<main id="main"></main>` in `index.html` with:

```html
<header class="topbar">
  <a class="wordmark" href="#main">madebyhaaans</a>
  <nav class="nav-pill" aria-label="Sections">
    <a href="#menu">Menu</a>
    <a href="#bake">Take &amp; Bake</a>
    <a href="#about">About</a>
  </nav>
  <a class="ig-button" href="https://instagram.com/madebyhaaans" target="_blank" rel="noopener">Instagram</a>
</header>

<main id="main">
  <section class="hero" id="hero">
    <div class="hero-arc" aria-hidden="true"></div>
    <div class="hero-stage">
      <img class="hero-mound" src="images/mound.webp" alt="" aria-hidden="true">
      <div class="hero-pans"></div>
      <p class="hero-flavor" aria-live="polite"></p>
      <div class="hero-pill">
        <span class="hero-price"></span>
        <a class="hero-order" href="#order">Order</a>
      </div>
      <div class="arc-controls">
        <button type="button" class="arc-prev">Previous flavor</button>
        <button type="button" class="arc-next">Next flavor</button>
      </div>
    </div>
    <h1 class="hero-headline">Warm rolls,<br>whenever you want them.</h1>
  </section>
</main>
```

- [ ] **Step 2: Build the hero DOM from data**

Create `js/hero-dom.js`:

```js
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
```

- [ ] **Step 3: Style the hero**

Append to `css/styles.css`:

```css
.topbar {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem clamp(1rem, 4vw, 3rem);
}

.wordmark {
  font-family: 'Fraunces', serif;
  font-size: var(--step-1);
  color: var(--cinnamon-dark);
  text-decoration: none;
}

.nav-pill {
  display: flex;
  gap: clamp(0.75rem, 2vw, 1.75rem);
  padding: 0.6rem 1.25rem;
  background: rgba(255, 253, 249, 0.72);
  backdrop-filter: blur(12px);
  border-radius: 999px;
  box-shadow: var(--shadow-soft);
}

.nav-pill a, .ig-button {
  color: var(--cinnamon);
  text-decoration: none;
  font-size: var(--step--1);
  letter-spacing: 0.04em;
}

.ig-button {
  padding: 0.6rem 1.1rem;
  background: var(--cinnamon-dark);
  color: var(--frosting);
  border-radius: 999px;
}

.hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  place-items: center;
  overflow: clip;
  background:
    radial-gradient(120% 80% at 50% 18%, var(--frosting) 0%, var(--cream) 45%, var(--cream-deep) 100%);
}

/* The arc lives in its own 3D context so cards can tip without the
   browser re-laying-out the page on every frame. */
.hero-arc {
  position: absolute;
  inset: 0;
  perspective: 1200px;
  transform-style: preserve-3d;
  pointer-events: none;
}

.arc-card {
  position: absolute;
  top: 42%;
  left: 50%;
  width: clamp(90px, 12vw, 168px);
  aspect-ratio: 1;
  margin: 0;
  display: grid;
  place-items: center;
  background: var(--frosting);
  border-radius: 26%;
  box-shadow: var(--shadow-soft);
  will-change: transform, opacity;
  /* JS writes the real transform; this keeps it centered before first paint. */
  transform: translate(-50%, -50%);
}

.arc-card img { width: 72%; height: auto; }

.hero-stage {
  position: relative;
  z-index: 10;
  display: grid;
  justify-items: center;
  translate: 0 -4vh;
}

.hero-pans {
  position: relative;
  width: clamp(240px, 34vw, 460px);
  aspect-ratio: 1;
}

.hero-pan {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  will-change: opacity, transform;
}

.hero-pan.is-active { opacity: 1; }

.hero-mound {
  position: absolute;
  bottom: -6%;
  width: clamp(320px, 46vw, 620px);
  z-index: -1;
  opacity: 0.9;
}

.hero-flavor {
  font-family: 'Fraunces', serif;
  font-size: var(--step-3);
  color: var(--cinnamon-dark);
  margin: 0.2em 0 0.4em;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.5rem 0.5rem 0.5rem 1.2rem;
  background: var(--frosting);
  border-radius: 999px;
  box-shadow: var(--shadow-lift);
}

.hero-price { font-weight: 600; color: var(--cinnamon-dark); }

.hero-order {
  padding: 0.6rem 1.4rem;
  background: var(--cinnamon-dark);
  color: var(--frosting);
  border-radius: 999px;
  text-decoration: none;
}

/* Oversized headline hugging the bottom, partly hidden behind the product —
   the reference's signature move. */
.hero-headline {
  position: absolute;
  bottom: 0;
  left: 50%;
  translate: -50% 0;
  z-index: 5;
  margin: 0;
  width: max-content;
  max-width: 96vw;
  text-align: center;
  font-size: var(--step-5);
  line-height: 0.92;
  color: var(--cinnamon-dark);
  opacity: 0.92;
  pointer-events: none;
}

/* Cards must accept pointer events even though the arc itself does not,
   so hover-to-pause works without the arc swallowing clicks on the pan. */
.arc-card { pointer-events: auto; }

/* Keyboard and screen-reader access to the carousel. Visually hidden until
   focused, then shown as real buttons — never display:none, which would
   remove them from the tab order entirely. */
.arc-controls {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.arc-controls:focus-within {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip-path: none;
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.arc-controls button {
  font: inherit;
  font-size: var(--step--1);
  padding: 0.5rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--cinnamon-dark);
  color: var(--frosting);
  cursor: pointer;
}

@media (max-width: 767px) {
  .arc-card { border-radius: 30%; box-shadow: 0 8px 18px -8px rgba(92, 58, 30, 0.3); }
  /* Shrink the nav rather than hiding it — phones are the main audience and
     still need a way to reach the menu and the order form. */
  .nav-pill { gap: 0.6rem; padding: 0.45rem 0.8rem; font-size: 0.78rem; }
  .nav-pill a { font-size: 0.78rem; }
  .wordmark { font-size: var(--step-0); }
  .ig-button { padding: 0.45rem 0.8rem; }
}
```

- [ ] **Step 4: Wire it up**

Replace `js/main.js` with:

```js
import { buildHero } from './hero-dom.js';
import { FLAVORS } from './data.js';

const hero = buildHero(document.querySelector('.hero'));
hero.nameEl.textContent = FLAVORS[0].name;
hero.priceEl.textContent = `$${FLAVORS[0].price}`;
```

- [ ] **Step 5: Verify in the browser**

Serve the site and confirm: four cards exist in the DOM stacked at the center (they have no arc positions yet — that is Task 6), the Original pan is visible over the mound, the flavor name reads "Original", the pill reads "$28", the headline sits along the bottom, and the console is free of 404s.

- [ ] **Step 6: Commit**

```bash
cd ~/madebyhaaans
git add -A
git commit -m "feat: build static hero layout from catalog data"
```

---

### Task 6: Hero carousel animation

**Files:**
- Create: `js/carousel.js`
- Modify: `js/main.js`

**Interfaces:**
- Consumes: `buildHero()` handles from Task 5; `ARC`, `angleFor`, `cardTransform`, `activeIndex` from Task 4
- Produces: `initCarousel({cards, pans, nameEl, priceEl}) -> {destroy()}` — starts autoplay, drag, and flavor crossfade

- [ ] **Step 1: Implement the carousel**

Create `js/carousel.js`:

```js
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
  const spin = gsap.to(state, {
    progress: `-=${count}`,
    duration: SECONDS_PER_CARD * count,
    ease: 'none',
    repeat: -1,
    onUpdate: layout,
  });

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
    if (!REDUCED.matches) spin.resume();
  }

  hero.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  // Pause only while the pointer is actually over a card, not the whole hero —
  // otherwise the spin would stop the moment the cursor entered the section.
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
      onComplete: () => { if (!REDUCED.matches) spin.resume(); },
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
```

- [ ] **Step 2: Start it**

Replace `js/main.js` with:

```js
import { buildHero } from './hero-dom.js';
import { initCarousel } from './carousel.js';

initCarousel(buildHero(document.querySelector('.hero')));
```

- [ ] **Step 3: Verify the motion in the browser**

Confirm all of the following, and fix before moving on:
- Cards sit on a shallow downward-dipping arc, tilting with it.
- Cards shrink and fade toward the edges, and never pop or overlap wrongly.
- A card leaving one edge reappears at the other with no jump.
- The centered pan crossfades and the name and price change with it.
- Dragging left and right moves the arc under the cursor and autoplay resumes on release.
- Hovering pauses the spin.
- Console is clean.

- [ ] **Step 4: Verify keyboard access**

Press Tab until focus reaches the hero controls. Confirm the hidden Previous
and Next buttons become visible when focused, that clicking or pressing Enter
on them advances the arc by exactly one flavor, and that the left and right
arrow keys do the same. A carousel that only responds to dragging is unusable
for anyone not using a mouse.

- [ ] **Step 5: Verify reduced motion**

Set the emulated `prefers-reduced-motion` to `reduce`, reload, and confirm: the arc is laid out correctly but stationary, and the pan does not crossfade on its own.

- [ ] **Step 6: Verify on a phone-sized viewport**

Resize to 375×812, reload, and confirm the cards stay large enough to recognize and the arc is not spilling off-screen.

- [ ] **Step 7: Commit**

```bash
cd ~/madebyhaaans
git add -A
git commit -m "feat: animate hero arc carousel with flavor crossfade and drag"
```

---

### Task 7: Menu section

**Files:**
- Modify: `index.html`, `css/styles.css`, `js/main.js`
- Create: `js/sections.js`

**Interfaces:**
- Consumes: `MENU`, `FACTS` from `js/data.js`
- Produces: `initMenu()` in `js/sections.js` — renders the menu cards and registers their ScrollTrigger

- [ ] **Step 1: Add the section markup**

Insert after the closing `</section>` of the hero in `index.html`:

```html
<section class="section menu" id="menu">
  <p class="eyebrow">The menu</p>
  <h2>Pick your pan.</h2>
  <div class="menu-grid"></div>
  <p class="menu-note">
    All frozen pans are baked at your convenience and stay freezer-safe for 30 days.
    Every frozen pan comes with a 16 oz tub of frosting.
  </p>
</section>
```

- [ ] **Step 2: Render and animate the cards**

Create `js/sections.js`:

```js
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

  if (REDUCED.matches) {
    gsap.set(cards, { opacity: 1, rotateX: 0, y: 0 });
    return;
  }

  // Each card tips up toward the reader and settles flat, one after another.
  gsap.from(cards, {
    scrollTrigger: { trigger: grid, start: 'top 80%', once: true },
    rotateX: 42,
    y: 70,
    opacity: 0,
    transformOrigin: '50% 100%',
    duration: 0.75,
    ease: 'power3.out',
    stagger: 0.11,
  });
}
```

- [ ] **Step 3: Style the cards**

Append to `css/styles.css`:

```css
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: clamp(1rem, 2.5vw, 2rem);
  perspective: 1000px;
  margin-top: 2.5rem;
}

.menu-card {
  padding: clamp(1.5rem, 3vw, 2.25rem);
  background: var(--frosting);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  transform-style: preserve-3d;
  transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.3, 1), box-shadow 0.35s;
}

.menu-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lift);
}

.menu-card h3 { font-size: var(--step-1); margin-bottom: 0.35em; }
.menu-price { font-size: var(--step-2); font-family: 'Fraunces', serif; color: var(--caramel); margin: 0 0 0.4em; }
.menu-note-sm { color: var(--cinnamon); font-size: var(--step--1); margin: 0; }
.menu-note { margin-top: 2.5rem; max-width: var(--measure); color: var(--cinnamon); font-size: var(--step--1); }
```

- [ ] **Step 4: Register ScrollTrigger and call it**

Replace `js/main.js` with:

```js
import { buildHero } from './hero-dom.js';
import { initCarousel } from './carousel.js';
import { initMenu } from './sections.js';

gsap.registerPlugin(ScrollTrigger);

initCarousel(buildHero(document.querySelector('.hero')));
initMenu();
```

- [ ] **Step 5: Verify in the browser**

Scroll to the menu and confirm: four cards read $28, $36, $30, $50; each tips up and settles in sequence; hovering lifts a card; scrolling back up does not replay it (`once: true`); console is clean.

- [ ] **Step 6: Commit**

```bash
cd ~/madebyhaaans
git add -A
git commit -m "feat: add menu section with scroll-triggered card tilt"
```

---

### Task 8: Take & Bake section

**Files:**
- Modify: `index.html`, `css/styles.css`, `js/sections.js`, `js/main.js`

**Interfaces:**
- Consumes: nothing from earlier tasks beyond GSAP and ScrollTrigger
- Produces: `initBake()` exported from `js/sections.js`

- [ ] **Step 1: Add the markup**

Insert after the menu section in `index.html`:

```html
<section class="bake" id="bake">
  <div class="bake-sticky">
    <img class="bake-pan" src="images/pan-original.webp" alt="A pan of cinnamon rolls">
  </div>
  <div class="bake-steps">
    <p class="eyebrow">Take &amp; Bake</p>
    <h2>Four steps, that's it.</h2>
    <ol>
      <li data-step="1"><strong>Thaw and let rise</strong> for 4–5 hours.</li>
      <li data-step="2"><strong>Bake at 350°F</strong> for 20–30 minutes, until golden brown on top.</li>
      <li data-step="3"><strong>Wait a few minutes</strong>, then spread the included frosting or serve it on the side.</li>
      <li data-step="4"><strong>Serve warm</strong> and enjoy.</li>
    </ol>
  </div>
</section>
```

- [ ] **Step 2: Animate the pan through the steps**

Append to `js/sections.js`:

```js
export function initBake() {
  const section = document.querySelector('.bake');
  const pan = section.querySelector('.bake-pan');
  const steps = section.querySelectorAll('.bake-steps li');

  if (REDUCED.matches) {
    gsap.set(steps, { opacity: 1, x: 0 });
    return;
  }

  // The pan turns and warms as the reader moves down the steps:
  // pale and flat -> risen -> golden -> frosted.
  gsap.to(pan, {
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
    },
    rotate: 24,
    scale: 1.08,
    filter: 'saturate(1.25) brightness(1.04)',
    ease: 'none',
  });

  steps.forEach((li) => {
    gsap.from(li, {
      scrollTrigger: { trigger: li, start: 'top 78%', once: true },
      opacity: 0,
      x: 34,
      duration: 0.6,
      ease: 'power3.out',
    });
  });
}
```

The pan starts pale via CSS (`filter: saturate(0.85) brightness(1.08)`) so the scrub warms it into full color.

- [ ] **Step 3: Style it**

Append to `css/styles.css`:

```css
.bake {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(2rem, 6vw, 6rem);
  align-items: start;
  padding: clamp(4rem, 10vw, 9rem) clamp(1.25rem, 5vw, 5rem);
  max-width: 1400px;
  margin-inline: auto;
  background: linear-gradient(180deg, var(--cream) 0%, var(--cream-deep) 100%);
}

.bake-sticky {
  position: sticky;
  top: 18vh;
  display: grid;
  place-items: center;
}

.bake-pan {
  width: min(100%, 460px);
  filter: saturate(0.85) brightness(1.08);
  will-change: transform, filter;
}

.bake-steps ol {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
  display: grid;
  gap: clamp(3rem, 12vh, 8rem);
}

.bake-steps li {
  font-size: var(--step-1);
  padding-left: 3.5rem;
  position: relative;
}

.bake-steps li::before {
  content: counter(list-item);
  position: absolute;
  left: 0;
  top: -0.15em;
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: var(--cinnamon-dark);
  color: var(--frosting);
  font-family: 'Fraunces', serif;
  font-size: var(--step-0);
}

@media (max-width: 767px) {
  .bake { grid-template-columns: 1fr; }
  .bake-sticky { top: 12vh; }
  .bake-pan { width: min(62%, 260px); }
  .bake-steps ol { gap: 3rem; }
}
```

- [ ] **Step 4: Call it**

In `js/main.js`, add `initBake` to the import from `./sections.js` and call `initBake();` after `initMenu();`.

- [ ] **Step 5: Verify in the browser**

Scroll through the section and confirm: the pan stays pinned while the steps scroll past, it rotates and warms in color as you go, each step fades in from the right, the numbers read 1–4, and the bake copy matches the spec word for word. On a 375px viewport the layout stacks and the pan shrinks.

- [ ] **Step 6: Commit**

```bash
cd ~/madebyhaaans
git add -A
git commit -m "feat: add take-and-bake section with pinned scrubbing pan"
```

---

### Task 9: About and pickup section

**Files:**
- Modify: `index.html`, `css/styles.css`

**Interfaces:**
- Consumes: nothing
- Produces: nothing — static content only, deliberately the calmest section

- [ ] **Step 1: Add the markup, tagging every invented fact**

Insert after the bake section:

```html
<section class="section about" id="about">
  <div class="about-copy">
    <p class="eyebrow">About</p>
    <h2>Made by hand, in Honolulu.</h2>
    <p>
      Haaans makes every pan by hand in small batches — soft, oversized rolls
      rolled the night before and frozen at their peak, so they bake up in your
      own oven like they just came out of hers.
    </p>
    <p>
      Frozen pans stay freezer-safe for 30 days, and every one comes with a
      16 oz tub of frosting. Pick up in Kaka'ako.
    </p>
    <!-- PLACEHOLDER: confirm with Haaans -->
    <p class="pickup">
      Pickup is Saturday mornings, 9–11am in Kaka'ako. Please order at least
      48 hours ahead so there's time to roll them.
    </p>
    <a class="ig-button" href="https://instagram.com/madebyhaaans" target="_blank" rel="noopener">
      Follow @madebyhaaans
    </a>
  </div>
  <img class="about-tub" src="images/frosting-tub.webp"
       alt="A 16 ounce tub of cream cheese frosting, included with every frozen pan"
       loading="lazy">
</section>
```

- [ ] **Step 2: Style it**

Append to `css/styles.css`:

```css
.about {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: clamp(2rem, 6vw, 5rem);
  align-items: center;
}

.about-copy p { max-width: var(--measure); }
.about-copy .ig-button { display: inline-block; margin-top: 1.5rem; }

.pickup {
  padding: 1.1rem 1.4rem;
  background: var(--frosting);
  border-left: 4px solid var(--caramel);
  border-radius: 0 16px 16px 0;
  box-shadow: var(--shadow-soft);
}

.about-tub { width: 100%; height: auto; }

@media (max-width: 767px) {
  .about { grid-template-columns: 1fr; }
  .about-tub { width: 60%; justify-self: center; }
}
```

- [ ] **Step 3: Verify the placeholder is findable**

Run: `cd ~/madebyhaaans && grep -n "PLACEHOLDER" index.html`
Expected: exactly one hit, immediately above the pickup paragraph

- [ ] **Step 4: Verify in the browser**

Confirm the section reads well, the frosting tub image loads, the Instagram link opens `instagram.com/madebyhaaans` in a new tab, and the layout stacks cleanly at 375px.

- [ ] **Step 5: Commit**

```bash
cd ~/madebyhaaans
git add -A
git commit -m "feat: add about and pickup section"
```

---

### Task 10: Order form

**Files:**
- Create: `js/form.js`, `tests/form.test.js`
- Modify: `index.html`, `css/styles.css`, `js/main.js`

**Interfaces:**
- Consumes: `FLAVORS`, `MENU`, `FACTS` from `js/data.js`
- Produces:
  - `validateOrder(fields) -> {ok: boolean, errors: Record<string,string>}` — pure, unit-tested
  - `initForm()` — wires submission to Web3Forms

- [ ] **Step 1: Write the failing validation tests**

Create `tests/form.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateOrder } from '../js/form.js';

const valid = {
  name: 'Kai Nakamura',
  phone: '808-555-0134',
  item: 'full-size',
  flavor: 'original',
  quantity: '2',
  pickupDay: '2026-08-22',
  notes: '',
};

test('a complete order passes', () => {
  const r = validateOrder(valid);
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, {});
});

test('name is required', () => {
  const r = validateOrder({ ...valid, name: '   ' });
  assert.equal(r.ok, false);
  assert.match(r.errors.name, /name/i);
});

test('phone must contain at least seven digits', () => {
  assert.equal(validateOrder({ ...valid, phone: '555' }).ok, false);
  assert.equal(validateOrder({ ...valid, phone: '(808) 555 0134' }).ok, true);
});

test('quantity must be a whole number between 1 and 20', () => {
  assert.equal(validateOrder({ ...valid, quantity: '0' }).ok, false);
  assert.equal(validateOrder({ ...valid, quantity: '21' }).ok, false);
  assert.equal(validateOrder({ ...valid, quantity: '2.5' }).ok, false);
  assert.equal(validateOrder({ ...valid, quantity: '20' }).ok, true);
});

test('item and flavor must be ones we actually sell', () => {
  assert.equal(validateOrder({ ...valid, item: 'pizza' }).ok, false);
  assert.equal(validateOrder({ ...valid, flavor: 'durian' }).ok, false);
});

test('a pickup day must be chosen', () => {
  const r = validateOrder({ ...valid, pickupDay: '' });
  assert.equal(r.ok, false);
  assert.match(r.errors.pickupDay, /pickup/i);
});

test('every error is a sentence a customer can act on', () => {
  const r = validateOrder({ name: '', phone: '', item: '', flavor: '', quantity: '', pickupDay: '' });
  for (const [field, msg] of Object.entries(r.errors)) {
    assert.ok(msg.length > 8, `error for ${field} is too terse: ${msg}`);
  }
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `cd ~/madebyhaaans && node --test`
Expected: FAIL — `Cannot find module '../js/form.js'`

- [ ] **Step 3: Implement validation and submission**

Create `js/form.js`:

```js
import { FLAVORS, MENU } from './data.js';

// Replace with the real key from web3forms.com. Until then, submission
// falls back to the Instagram DM link so no order is ever silently lost.
export const WEB3FORMS_KEY = '';

const ITEM_IDS = MENU.map((m) => m.id);
const FLAVOR_IDS = FLAVORS.map((f) => f.id);

/** Pure. No DOM. Returns every problem at once so the customer fixes them in one pass. */
export function validateOrder(fields) {
  const errors = {};
  const f = fields || {};

  if (!String(f.name || '').trim()) {
    errors.name = 'Please tell us your name.';
  }

  const digits = String(f.phone || '').replace(/\D/g, '');
  if (digits.length < 7) {
    errors.phone = 'Please enter a phone number we can reach you at.';
  }

  if (!ITEM_IDS.includes(f.item)) {
    errors.item = 'Please choose which pan you want.';
  }

  if (!FLAVOR_IDS.includes(f.flavor)) {
    errors.flavor = 'Please choose a flavor.';
  }

  const qty = Number(f.quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
    errors.quantity = 'Please enter how many pans you want, from 1 to 20.';
  }

  if (!String(f.pickupDay || '').trim()) {
    errors.pickupDay = 'Please choose a pickup day.';
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function initForm() {
  const form = document.querySelector('.order-form');
  if (!form) return;

  const status = form.querySelector('.form-status');

  form.querySelector('[name="item"]').innerHTML = MENU.map(
    (m) => `<option value="${m.id}">${m.name} — $${m.price}</option>`
  ).join('');

  form.querySelector('[name="flavor"]').innerHTML = FLAVORS.map(
    (f) => `<option value="${f.id}">${f.name}</option>`
  ).join('');

  function showErrors(errors) {
    form.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
    for (const [field, msg] of Object.entries(errors)) {
      const el = form.querySelector(`[data-error-for="${field}"]`);
      if (el) el.textContent = msg;
      form.querySelector(`[name="${field}"]`)?.setAttribute('aria-invalid', 'true');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(form).entries());
    const { ok, errors } = validateOrder(fields);

    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    showErrors(errors);

    if (!ok) {
      status.textContent = 'Please fix the highlighted fields.';
      status.className = 'form-status is-error';
      return;
    }

    if (!WEB3FORMS_KEY) {
      status.innerHTML =
        'Online ordering isn\'t switched on yet — ' +
        '<a href="https://instagram.com/madebyhaaans" target="_blank" rel="noopener">send the order by DM</a> for now.';
      status.className = 'form-status is-error';
      return;
    }

    status.textContent = 'Sending your order…';
    status.className = 'form-status';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New cinnamon roll order — ${fields.name}`,
          from_name: 'madebyhaaans website',
          ...fields,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      form.reset();
      status.textContent = "Order sent. Haaans will message you to confirm.";
      status.className = 'form-status is-success';
    } catch (err) {
      status.innerHTML =
        'That didn\'t go through. Please ' +
        '<a href="https://instagram.com/madebyhaaans" target="_blank" rel="noopener">send it by DM</a> instead.';
      status.className = 'form-status is-error';
      console.error(err);
    }
  });
}
```

- [ ] **Step 4: Run the tests and watch them pass**

Run: `cd ~/madebyhaaans && node --test`
Expected: PASS, all tests across all three test files

- [ ] **Step 5: Add the markup**

Insert after the about section:

```html
<section class="section order" id="order">
  <p class="eyebrow">Order</p>
  <h2>Get a pan.</h2>
  <form class="order-form" novalidate>
    <label>Your name
      <input name="name" type="text" autocomplete="name" required>
      <span class="field-error" data-error-for="name"></span>
    </label>
    <label>Phone
      <input name="phone" type="tel" autocomplete="tel" required>
      <span class="field-error" data-error-for="phone"></span>
    </label>
    <label>What do you want?
      <select name="item"></select>
      <span class="field-error" data-error-for="item"></span>
    </label>
    <label>Flavor
      <select name="flavor"></select>
      <span class="field-error" data-error-for="flavor"></span>
    </label>
    <label>How many?
      <input name="quantity" type="number" min="1" max="20" value="1">
      <span class="field-error" data-error-for="quantity"></span>
    </label>
    <label>Pickup day
      <input name="pickupDay" type="date">
      <span class="field-error" data-error-for="pickupDay"></span>
    </label>
    <label class="order-notes">Anything else?
      <textarea name="notes" rows="3"></textarea>
    </label>
    <button type="submit">Send order</button>
    <p class="form-status" role="status" aria-live="polite"></p>
  </form>
</section>
```

- [ ] **Step 6: Style it**

Append to `css/styles.css`:

```css
.order-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-top: 2.5rem;
  max-width: 820px;
}

.order-form label {
  display: grid;
  gap: 0.4rem;
  font-size: var(--step--1);
  color: var(--cinnamon);
}

.order-form input,
.order-form select,
.order-form textarea {
  font: inherit;
  font-size: var(--step-0);
  color: var(--ink);
  padding: 0.8rem 1rem;
  background: var(--frosting);
  border: 1px solid transparent;
  border-radius: 14px;
  box-shadow: var(--shadow-soft);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}

.order-form input:focus-visible,
.order-form select:focus-visible,
.order-form textarea:focus-visible {
  outline: none;
  border-color: var(--caramel);
  box-shadow: var(--shadow-lift);
  transform: translateY(-2px);
}

.order-form [aria-invalid='true'] { border-color: #b3402b; }

.order-notes, .form-status { grid-column: 1 / -1; }

.field-error { color: #b3402b; font-size: var(--step--1); min-height: 1.2em; }

.order-form button {
  grid-column: 1 / -1;
  justify-self: start;
  font: inherit;
  padding: 0.9rem 2.2rem;
  background: var(--cinnamon-dark);
  color: var(--frosting);
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
}

.order-form button:hover { transform: translateY(-2px); box-shadow: var(--shadow-lift); }

.form-status.is-error { color: #b3402b; }
.form-status.is-success { color: #3f7d4a; }
```

- [ ] **Step 7: Call it**

In `js/main.js`, add `import { initForm } from './form.js';` and call `initForm();` last.

- [ ] **Step 8: Verify in the browser**

Confirm: submitting an empty form shows a plain-language error under every required field and nothing is sent; filling it correctly and submitting with an empty key shows the DM fallback message; the item and flavor dropdowns are populated from `data.js`; focusing a field lifts it.

- [ ] **Step 9: Commit**

```bash
cd ~/madebyhaaans
git add -A
git commit -m "feat: add order form with validated Web3Forms submission"
```

---

### Task 11: Performance, motion, and cross-device pass

**Files:**
- Modify: `css/styles.css`, `index.html`, `js/carousel.js`

**Interfaces:**
- Consumes: everything built so far
- Produces: no new interfaces — this task hardens what exists

- [ ] **Step 1: Preload the hero's critical images**

In `index.html` `<head>`, after the stylesheet link:

```html
<link rel="preload" as="image" href="images/pan-original.webp">
<link rel="preload" as="image" href="images/mound.webp">
```

- [ ] **Step 2: Mark below-fold images lazy**

Confirm every `<img>` outside the hero has `loading="lazy"` and explicit `width`/`height` (or an `aspect-ratio` in CSS) so nothing shifts as it loads.

Run: `grep -n '<img' index.html`

- [ ] **Step 3: Serve half-resolution images to phones**

Generate 480px-wide variants of each pan and add `srcset` to the hero pans in `js/hero-dom.js`:

```bash
cd ~/madebyhaaans/images
for f in pan-*.webp; do sips -Z 480 "$f" --out "${f%.webp}-480.webp"; done
```

**This weakens the filename contract from Task 3:** overwriting `pan-original.webp`
with a real photo now leaves a stale `pan-original-480.webp` behind, and phones
would keep showing the old AI image. Record the follow-up command in `README.md`
under "Swapping in real photos":

```bash
cd images && for f in pan-*.webp; do case "$f" in *-480.webp) continue;; esac; sips -Z 480 "$f" --out "${f%.webp}-480.webp"; done
```

In `hero-dom.js`, after `img.src = f.panImage;` add:

```js
img.srcset = `${f.panImage.replace('.webp', '-480.webp')} 480w, ${f.panImage} 900w`;
img.sizes = '(max-width: 767px) 62vw, 34vw';
```

- [ ] **Step 4: Verify the reduced-motion promise across the whole page**

With `prefers-reduced-motion: reduce` emulated, reload and scroll the entire page. Every one of these must hold: the arc is still and readable, no pan scrub, menu cards are visible without tilting in, bake steps are visible without sliding, and nothing is stuck invisible at `opacity: 0`. A section that never appears is a worse failure than an over-animated one — check each.

- [ ] **Step 5: Verify at three viewport sizes**

Check 375×812, 768×1024, and 1440×900. At each: no horizontal scrollbar, the headline does not collide with the pan illegibly, the nav is usable, and the arc stays on screen.

Run in the console at each size to catch overflow:

```js
document.documentElement.scrollWidth <= window.innerWidth
```

Expected: `true` at every size

- [ ] **Step 6: Check the console and network**

Reload and confirm zero console errors and zero 404s. Confirm total image weight is under 1 MB.

- [ ] **Step 7: Commit**

```bash
cd ~/madebyhaaans
git add -A
git commit -m "perf: preload hero art, add responsive images, verify reduced motion"
```

---

### Task 12: Launch

**Files:**
- Modify: `js/form.js` (the Web3Forms key), `README.md`

**Interfaces:**
- Consumes: everything
- Produces: a live URL

- [ ] **Step 1: Block on the two facts that cannot be invented**

Do not proceed until Laakea supplies Haaans' email address and the real pickup days, times, and lead time. Both are recorded as open items in the spec.

- [ ] **Step 2: Get the Web3Forms key**

Laakea does this — it requires entering an email into a third-party form, which is his call, not the implementer's. Exact steps to give him:

1. Go to `https://web3forms.com`
2. Type Haaans' email into the box labeled "Enter your email"
3. Click **Create Access Key**
4. Check that inbox for an email containing a long access key
5. Copy that key and paste it here

- [ ] **Step 3: Install the key**

In `js/form.js`, set `WEB3FORMS_KEY` to the key.

- [ ] **Step 4: Send a real test order**

Fill the form on the live-served page and submit. Confirm the email arrives in Haaans' inbox with the name, phone, item, flavor, quantity, pickup day, and notes all intact and readable. An order that arrives mangled is a failure — fix the field names and resend before continuing.

- [ ] **Step 5: Replace every placeholder**

Run: `cd ~/madebyhaaans && grep -rn "PLACEHOLDER" index.html`
Expected after fixing: no output. The site must not go public while this prints anything.

- [ ] **Step 6: Create the GitHub repository**

No `gh` CLI is installed, so Laakea does this part in the browser. Exact steps to give him:

1. Go to `https://github.com/new`
2. In **Repository name**, type `madebyhaaans`
3. Leave it **Public**
4. Do **not** check "Add a README file"
5. Click **Create repository**
6. Copy the URL shown at the top, which looks like `https://github.com/<username>/madebyhaaans.git`

- [ ] **Step 7: Push**

```bash
cd ~/madebyhaaans
git remote add origin https://github.com/<username>/madebyhaaans.git
git push -u origin main
```

- [ ] **Step 8: Turn on GitHub Pages**

Laakea does this in the browser. Exact steps:

1. On the repository page, click **Settings** (top right of the repo, not your profile)
2. In the left sidebar, click **Pages**
3. Under **Source**, choose **Deploy from a branch**
4. Under **Branch**, choose `main`, leave the folder as `/ (root)`
5. Click **Save**
6. Wait about a minute, then reload the page — the live link appears at the top

- [ ] **Step 9: Verify the live site**

Open the live URL on a phone. Confirm the carousel spins, images load, the form sends a real order, and nothing 404s. GitHub Pages is case-sensitive where macOS is not — a filename that worked locally can 404 live, so check the console specifically for missing images.

- [ ] **Step 10: Update the README and commit**

Add the live URL to `README.md`.

```bash
cd ~/madebyhaaans
git add -A
git commit -m "docs: add live site URL"
git push
```
