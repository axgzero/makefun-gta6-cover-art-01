# Vice Coast Cover Studio

Turn any photo — plus a caption — into poster-style cover art in the
multi-panel, neon-sunset look of a Vice City poster, and export it as a PNG
to share. Runs entirely offline in a desktop browser from static files:
your photos are read on your own machine and never uploaded.

> Referral code: `cefc1nk2`

## How it works

1. **Pick a panel** in the live preview, then upload your own photo or tap
   one of the three built-in samples (AI-generated, free to use).
2. **Crop & position** each panel: drag the photo inside the preview,
   scroll to zoom, or use the sliders. Flip and reset per panel.
3. **Choose a layout** — Hero + 3, Collage 5, Poster 6, or tilted Snapshots —
   and a **sunset grade** — Vice Sunset, Neon Night, Palm Gold, Teal Heat,
   Midnight.
4. **Write your words**: title, subtitle and badge, with three title styles
   (sunset gradient, neon outline, solid white).
5. **Export a PNG** in Square 1080 × 1080, Portrait 1080 × 1350, or Wide
   1920 × 1080. Undo / redo and a "Surprise me" shuffle are built in.

## Run it

```sh
# any static server, e.g. from the repo root:
python3 -m http.server 8080 --directory app
# then open http://localhost:8080
```

No build step, no network requests, no dependencies. The cover engine is
`app/src/cover.js` (panels, grade, vector palms + skyline, lettering);
the editor is `app/src/main.js`.

## Originality

Everything in this repo is original: the palms, skyline and lettering are
drawn by the app's own code, the sample photos were generated for this
studio, and the lettering uses system fonts. No Rockstar Games name, logo,
artwork, character or font is used anywhere.

## Entry program

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with
`vendor/makefun-app.ts` (`buildDossier`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE). SPDX-License-Identifier: MIT.
