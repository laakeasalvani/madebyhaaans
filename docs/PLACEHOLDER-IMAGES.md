# Placeholder Images

The image generation service ran out of credits mid-build (free plan, 0 credits).
Laakea is supplying real photographs. Everything below is a temporary stand-in
so the layout could be built and verified.

## Revision A changed what images are needed

The hero product is now a SINGLE cinnamon roll, not a pan, and there are five
cards instead of four. The old `pan-*.webp` files have been removed.

| Path | What it must become | Current stand-in |
| --- | --- | --- |
| `images/roll-original.webp` | one Original roll | old pan photo |
| `images/roll-ham-cheese.webp` | one Ham & Cheese roll | copy of pan-original |
| `images/roll-birthday-cake.webp` | one Birthday Cake roll | old pan photo |
| `images/roll-oreo.webp` | one Oreo roll | old pan photo |
| `images/roll-seasonal.webp` | the monthly special | copy of pan-original |
| `images/card-original.webp` | cinnamon stick / ingredient | real |
| `images/card-ham-cheese.webp` | ham + cheese | copy of card-original |
| `images/card-birthday-cake.webp` | sprinkles | real |
| `images/card-oreo.webp` | an Oreo | copy of card-birthday-cake |
| `images/card-seasonal.webp` | something seasonal | copy of card-birthday-cake |
| `images/frosting-tub.webp` | a 16 oz frosting tub | copy of card-original |
| `images/mound.webp` | cinnamon sugar mound | copy of card-original |

All four roll images MUST be shot from the same angle, or the crossfade between
flavors will jump. See docs/photo-shot-list.md.

## Verification

```bash
cd images && md5 -q *.webp | sort | uniq -d
```

Output means duplicates remain. Expect none once real photos land.
