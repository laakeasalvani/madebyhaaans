# madebyhaaans — Website Design Spec

**Date:** 2026-08-17
**Owner:** Laakea Salvani
**Client:** Haaans (@madebyhaaans) — homemade cinnamon rolls, Kaka'ako, Honolulu

---

## 1. Goal

A single-page marketing site for a home cinnamon-roll business that currently
takes all orders through Instagram DMs. The site must:

- Look and move like the reference case study (Kris Anfalova, "kumo" matcha), applying
  that design language across the whole page rather than only the hero.
- Show the menu and prices clearly.
- Explain the take-and-bake process for frozen pans.
- Collect orders through a form that emails Haaans, replacing DM-only ordering.

Primary audience arrives from an Instagram bio link, on a phone.

## 2. Reference analysis

The reference video is a ~12-second loop of one hero screen. Verified frame by frame:

- Dark background photograph; product (a matcha cup) centered on a mound of powder.
- An arc of rounded ingredient cards sweeping horizontally across the middle. Cards
  rotate along the curve, scale down and fade toward the edges, and loop infinitely.
- As the arc turns, the centered product crossfades between flavor variants and a
  script-font flavor name crossfades with it.
- A small floating pill under the product shows price + an add-to-cart button.
- An oversized headline runs along the bottom edge, partially occluded by the product.
- Top bar: wordmark left, floating pill of icon links center, one round button right.

**The "3D" is not WebGL.** Every element is a flat cut-out image positioned with CSS
3D transforms (rotate + scale + translate along a curve). This is the technique we
replicate. It is why photo quality, not code, determines whether it looks right.

## 3. Decisions made

| Question | Decision |
|---|---|
| Scope | Full site in the reference's style, not just the hero |
| Photography | AI-generated for v1, structured so real photos drop in later |
| Ordering | Form that emails Haaans (not DM-only, not card checkout) |
| Color world | Cream background, cinnamon-brown type — light and airy, not the reference's dark palette |
| 3D method | CSS 3D transforms + GSAP, same technique as the reference |
| Mobile | Full animation, tuned down (fewer visible cards, lighter shadows) |
| Flavors | Original, Ham & Cheese, Birthday Cake, Oreo — data-driven so more can be added |
| Hosting | GitHub Pages, free `github.io` URL to start |

**Deliberate deviation:** the reference is dark olive; this site is light cream. The
structure, motion, timing, and composition are copied faithfully; the palette is not.
On a light background, depth must come from soft warm shadows and subtle background
tinting rather than from glow against darkness.

## 4. Page structure

One scrolling page, five sections.

### 4.1 Hero — flavor carousel

The centerpiece and the closest recreation of the reference.

- A pan of cinnamon rolls, centered, resting on a soft mound of cinnamon sugar.
- An arc of rounded cream cards across the middle: cinnamon stick, ham slice,
  birthday sprinkles, Oreo. Cards tilt and shrink toward the edges and loop forever.
- As the arc advances, the center pan crossfades to that flavor; a script-font flavor
  name crossfades beneath it.
- A floating pill under the pan: price + "Order" button, which scrolls to the form.
- Oversized headline along the bottom edge, partially behind the pan.
- Top bar: `madebyhaaans` wordmark left, floating pill of section links center,
  Instagram button right.
- Auto-advances on a timer; pauses on hover; draggable/swipeable by hand.

### 4.2 Menu & pricing

Four cards, tilting up toward the viewer and settling flat as they scroll into view,
staggered one after another. Hover lifts the card and warms its shadow.

- Full-size (8) frozen pan — $28
- Ham & Cheese (8) frozen pan — $36
- Specialty flavors (Birthday Cake / Oreo) — $30
- Pre-baked (12) tray, sheet cake box — $50

Footnotes: frozen pans are freezer-safe for 30 days; each frozen pan includes a
16 oz tub of frosting.

### 4.3 Take & Bake

A pan pinned at the center rotates through four visual states as the reader scrolls:
frozen and pale → risen → golden brown → frosted. Steps count off alongside:

1. Thaw and let rise 4–5 hours
2. Bake at 350°F for 20–30 minutes, until golden brown on top
3. Wait a few minutes, then spread the included frosting or serve it on the side
4. Serve warm

### 4.4 About & pickup

Haaans' story, Kaka'ako pickup, freezer-safe window, included frosting, Instagram
link. Intentionally the calmest section — a rest between two heavy ones.

### 4.5 Order form

Fields: flavor, quantity, pickup day, name, phone, notes. Submits to a form relay
that emails Haaans. Fields lift and warm on focus so the section matches the rest of
the page. Inline validation; a clear success state after submit.

## 5. Technical design

### 5.1 Stack

Static files, no build step, matching the conventions of `pacific-web-design` and
`capturewithki`. Open `index.html` in a browser and it runs.

```
~/madebyhaaans/
  index.html
  css/styles.css
  js/carousel.js     # hero arc: geometry, looping, drag, flavor swap
  js/scroll.js       # ScrollTrigger setup for sections 2-4
  js/data.js         # flavors, prices, copy — single source of truth
  images/
  docs/
```

`js/data.js` exists so prices, flavors, and copy are edited in one place and never
hunted for inside markup or animation code. Adding a fifth flavor is one array entry.

### 5.2 Animation

GSAP 3 with ScrollTrigger, loaded from CDN. Free as of GSAP 3.13 — no license, no
account, no install step.

Hero carousel geometry: cards are positioned by angle on a virtual circle whose center
sits below the viewport, producing the shallow arc. Each card's `rotate`, `scale`, and
opacity derive from its angle, so the arc is defined by a handful of constants
(radius, arc span, card count) rather than hand-tuned per card.

**Mobile tuning.** The same animations run on phones, adjusted by breakpoint rather
than replaced:

- Visible cards drop from 5 to 3; arc radius tightens so the cards stay legible.
- Multi-layer shadows collapse to a single soft shadow (the expensive part to paint).
- Images serve at roughly half resolution via `srcset`.
- Scroll-driven transforms are limited to `transform` and `opacity` only, so the
  browser never re-lays-out mid-scroll.
- Auto-advance continues; drag becomes touch-swipe.

### 5.3 Images

AI-generated for v1: one pan per flavor shot from an identical angle so crossfades
register, plus card ingredients and the frosting tub, all with backgrounds removed.
Exported as WebP with PNG fallback, sized for phone screens, lazy-loaded below the
fold. Filenames are stable (`pan-original.webp`, `card-oreo.webp`) so real photos
replace them by overwriting a file.

### 5.4 Order form

GitHub Pages is static and cannot send email, so the form posts to a third-party
relay. **Web3Forms** — free, 250 submissions/month, setup is entering an email and
receiving an access key. Requires a human to sign up; Laakea will do this.

Fallback if the relay is down or the key is missing: the form surfaces an error and
shows a direct Instagram DM link so an order is never silently lost.

### 5.5 Performance and accessibility

- `prefers-reduced-motion` disables the arc's auto-rotation and scroll transforms,
  replacing them with plain fades. Non-negotiable: this much motion causes nausea.
- Images lazy-loaded; hero images preloaded.
- Target: usable first paint under 2 seconds on a mid-range phone over LTE.
- Real text for headings, not images. Alt text on every product image.
- Form inputs have real labels; the carousel is keyboard-navigable.

## 6. Open items

To be supplied before launch. None block the build.

- **Haaans' email address** for order delivery — Laakea to supply.
- **Pickup days, times, and lead time** — real details unknown. v1 ships with clearly
  marked placeholder copy that MUST be replaced before the site goes public.
- Confirm the four-flavor lineup with Haaans.
- Real product photography, replacing AI images. A shot list will be written for her:
  fixed angle, plain background, phone camera acceptable.

Placeholder copy is tagged with an HTML comment `<!-- PLACEHOLDER: confirm with Haaans -->`
so it is greppable and cannot be launched by accident.

## 7. Success criteria

- The hero reads as the same design as the reference video to someone who has seen both.
- The carousel and scroll effects hold 60fps with no visible stutter on an iPhone
  from roughly 2020 onward, verified by scrolling the full page top to bottom.
- A first-time visitor can find prices and submit an order without scrolling back up.
- A test order submission arrives in the destination inbox with every field intact.
- Swapping one AI image for a real photo requires no code change.

## 8. Out of scope for v1

- Card payment / checkout / cart
- Accounts, order history, or an admin panel
- A custom domain (free `github.io` URL to start)
- Multiple pages — everything lives on one scrolling page
- Real 3D / WebGL models

---

# Revision A - 2026-08-18

Requested after reviewing the built hero against the reference at full size.
The hero was too timid: product too small, cards too small, and autoplay took
control away from the visitor. Sections 4.1 and 5.2 are superseded by this.

## What changed and why

**Product is a single cinnamon roll, not a pan.** A pan reads as a tray of food;
a single roll reads as a product. Laakea is supplying real photographs.

**Proportions now match the reference.** Measured off the reference frame: the
product occupies roughly 55% of viewport height, the flavor cards roughly 25% -
so a card is a little under half the product's height. The build had 34vw
product and 12vw cards, which is why it felt small.

**The arc bleeds off both edges.** The outermost cards are clipped by the screen
so the arc implies continuation beyond the frame. Desktop and mobile both.

**Autoplay is removed entirely.** The carousel is now click-to-choose: clicking
a card rotates the arc so that card sweeps to center, and the roll then changes
to that flavor. Nothing moves until the visitor acts. The arc motion is kept as
the reward for clicking rather than as ambient decoration.

**Five cards, not four.** A fifth "seasonal special" slot joins the four
flavors, so the arc fills like the reference and Haaans has a promotable slot.
Its name and image must be swappable from `js/data.js` alone.

**Nav becomes a 5-icon pill:** Menu, Take & Bake, About, Instagram, Cart.
Icons only, matching the reference. The cart is highlighted dark and orders the
currently-selected flavor - it jumps to the order form with that flavor
pre-filled, which is what connects the carousel to actually buying something.

**Flavor name moves above the roll.** It previously sat beneath, competing with
the price pill and the headline for the same band of space.

**Headline and price pill both stay**, with the headline running behind the
roll as in the reference. The larger product finally makes that overlap
possible - it was removed earlier only because a small product left no room.

**Palette is unchanged.** Cream and brown, as decided originally. The reference
is dark olive; only its structure, proportions and motion are being copied.

**Mobile scales the product to about 40%** of viewport height rather than 55%,
so the nav, flavor name, pill and headline are not crowded off a phone screen.

## Consequences

- `js/carousel.js` loses its autoplay tween, drag-to-spin, and the
  `restartSpin()` machinery that existed to keep autoplay coherent after
  interaction. Hover-pause becomes meaningless and goes too. Keyboard stepping
  stays, and clicking becomes the primary interaction.
- `js/data.js` gains a fifth entry and its image paths change from `pan-*` to
  `roll-*`. `tests/data.test.js` must be updated to match, including the
  filename contract.
- Existing `pan-*.webp` files are superseded.
