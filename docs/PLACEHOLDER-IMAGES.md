# Image status

Real photographs supplied by Laakea on 2026-08-18 and cut out from their white
backdrops locally (no paid service involved -- the generation service is at 0
credits on a free plan).

## Real, done

| Path | Source |
| --- | --- |
| `images/roll-original.webp` | Original.webp |
| `images/roll-ham-cheese.webp` | Ham and Cheese.webp |
| `images/roll-birthday-cake.webp` | Birthday Cake.webp |
| `images/roll-oreo.webp` | Oreo.webp |
| `images/card-*.webp` | same photos, 320px |

Originals kept at `~/Desktop/haaans-photos/`. The cutout script is
`scratchpad/cutout2.py` -- rerun it if the photos are ever replaced.

How the cutout works, since it is not obvious: brightness alone cannot separate
the product from the backdrop, because the frosting is as white as the paper.
The script instead finds the PASTRY by colour (warm and chromatic, where both
backdrop and shadow are neutral grey), takes its largest blob, then fills the
enclosed holes to win the white frosting back. The photo's own drop shadow is
neutral grey at value 165-205, which is why the brightness cut sits at 150 --
anything higher swallows the shadow into the silhouette.

## Still placeholder

| Path | Currently | Needs |
| --- | --- | --- |
| `images/roll-seasonal.webp` | copy of roll-original | a photo of the monthly special |
| `images/card-seasonal.webp` | copy of card-original | same |
| `images/frosting-tub.webp` | old cinnamon-stick art | a 16 oz frosting tub, for the About section |
| `images/mound.webp` | old cinnamon-stick art | unused since Revision A; delete or replace |

## Known limitation

The photos are top-down flat-lays. The reference design is a three-quarter view
of a product on a pedestal. The site therefore reads flatter than the
reference. Fixing that means reshooting at an angle, not changing code.

## Verify

```bash
cd images && md5 -q *.webp | sort | uniq -d
```

Expect exactly two duplicate groups until the seasonal and frosting photos land.
