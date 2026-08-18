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
