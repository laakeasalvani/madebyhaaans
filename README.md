# madebyhaaans

Single-page site for Haaans (@madebyhaaans) — homemade cinnamon rolls, Kaka'ako.

**Live:** https://laakeasalvani.github.io/madebyhaaans/

Deployed from `main` via GitHub Pages, so every push to `main` republishes the
site within a minute or two. There is no build step and no staging site --
treat a push to `main` as publishing.

## Not finished yet

The site is public but part-built. Still to come: Take & Bake, About and pickup
details, and the order form. Nav icons for sections that do not exist remove
themselves on load, so nothing on the page links to a dead anchor.

Before promoting the link widely: `docs/PLACEHOLDER-IMAGES.md` lists the
seasonal card and frosting tub, which are still stand-ins, and the order form
will need Haaans' email plus a Web3Forms key.

## Preview locally

ES modules will not load over `file://`. Serve the folder:

```bash
python3 bin/serve.py 8000
```

Use `bin/serve.py` rather than `python3 -m http.server`: it sends no-store
headers. The stock server sends none, and browsers then cache CSS and JS
aggressively enough to serve stale files after an edit.

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
