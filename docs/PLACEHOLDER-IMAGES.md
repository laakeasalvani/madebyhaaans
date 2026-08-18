# Placeholder Images

The image generation service ran out of credits mid-build. The files below are
temporary stand-ins so the layout could be built and verified before the real
product photography is ready.

| Placeholder file | Stands in for |
| --- | --- |
| `images/pan-ham-cheese.webp` | copy of `images/pan-original.webp` |
| `images/card-ham-cheese.webp` | copy of `images/card-original.webp` |
| `images/card-oreo.webp` | copy of `images/card-birthday-cake.webp` |
| `images/mound.webp` | copy of `images/card-original.webp` |
| `images/frosting-tub.webp` | copy of `images/card-original.webp` |

These are duplicates of other images, not real product photos. Every file
listed here must be replaced before launch.

## Verification

Confirmed by content hash on 2026-08-18: the 10 files in `images/` contain only
5 unique images. The 5 files listed above are byte-identical copies of other
files, so `mound.webp` and `frosting-tub.webp` currently both render the
cinnamon-stick card art rather than a mound of cinnamon sugar or a tub of
frosting.

Check at any time with:

```bash
cd images && md5 -q *.webp | sort | uniq -d
```

Any output means duplicates remain. Expect no output once real photos land.
Decision on 2026-08-18 (Laakea): continue building with placeholders and swap
real photos in later. Filenames are a fixed contract -- replacing a photo means
overwriting the file, never editing code. See docs/photo-shot-list.md for how
the real photos must be shot so the hero crossfade lines up.
