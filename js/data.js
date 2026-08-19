/**
 * Single source of truth for everything the site sells and says.
 *
 * Image paths are a contract: replacing a photo means overwriting the file at
 * the same path, never editing code. See docs/photo-shot-list.md.
 *
 * To change the seasonal special, edit ONLY the last FLAVORS entry -- its name,
 * price and alt text -- and drop a new image at images/roll-seasonal.webp.
 *
 * TWO DIFFERENT PRICES LIVE HERE, deliberately:
 *   FLAVORS[].price is the price of ONE roll, shown in the hero.
 *   MENU[].price is the price of a PAN or tray, shown in the menu section.
 * They are not versions of the same number. Changing one never implies
 * changing the other.
 */

export const FLAVORS = [
  {
    id: 'original',
    name: 'Original',
    price: 5,
    rollImage: 'images/roll-original.webp',
    cardImage: 'images/card-original.webp',
    alt: 'A classic cinnamon roll with thick white cream cheese frosting',
  },
  {
    id: 'ham-cheese',
    name: 'Ham & Cheese',
    price: 5,
    rollImage: 'images/roll-ham-cheese.webp',
    cardImage: 'images/card-ham-cheese.webp',
    alt: 'A savory roll layered with ham and melted cheddar, baked golden brown',
  },
  {
    id: 'birthday-cake',
    name: 'Birthday Cake',
    price: 5,
    rollImage: 'images/roll-birthday-cake.webp',
    cardImage: 'images/card-birthday-cake.webp',
    alt: 'A cinnamon roll with white frosting covered in rainbow sprinkles',
  },
  {
    id: 'oreo',
    name: 'Oreo',
    price: 5,
    rollImage: 'images/roll-oreo.webp',
    cardImage: 'images/card-oreo.webp',
    alt: 'A cinnamon roll topped with white frosting and crushed chocolate cookie crumbs',
  },
  {
    id: 'seasonal',
    name: "This Month's Special",
    price: 5,
    rollImage: 'images/roll-seasonal.webp',
    cardImage: 'images/card-seasonal.webp',
    alt: 'This month\'s rotating specialty cinnamon roll',
    seasonal: true,
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
