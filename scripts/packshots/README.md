# Multi-pack studio images

Composites for the 5-pack, 10-pack and mixed-box product images. Every pouch is
the original MUSHI render, cut out at full resolution: no packaging pixel is
generated, so logos, flavour names, illustrations and badge text stay exact.
The layout and lighting follow the UNREAL Snacks variety-pack references:
tiered rows, controlled overlap, one key light, grounded shadows.

## Sources

| Asset | From | Used for |
|---|---|---|
| `design-source/exports/CHERRY1.png`, `APPLE1.png`, `PEACH1.png` | 2160px hero renders (supplied 20 Nov) | every gummy pouch |
| `MUSHI_EXPORTS.zip` → `gummies.png`, `mushi-bundle.png` | group renders | reviewed, not used: the bundle render's badge text is garbled |

The zip has no individual transparent pouch files, so the cut-outs are made here.

## Pipeline

1. `silhouette.py` — one pouch outline, measured on the Cherry render and shared by
   all three gummy renders (same 3D model and camera; edges match to the pixel).
   The bottom edge is traced along the dark contact line, not taken from the model mask.
2. `gmask.py` — the real gummy pair in front of each pouch.
3. `compose.py OUT [name ...]` — seamless sweep backdrop, then pouches back to front with:
   a soft shadow cast left onto the wall and onto any pouch behind, a floor shadow and a
   contact line for pouches on the floor, slight per-pouch rotation, depth shading for
   rear rows, and a light film grain over the whole frame.

Masks live in `design-source/packshots/masks`, cut-outs in `.../cutouts`, 2400px masters in
`.../masters`. Web renditions (800/1600, WebP + AVIF) go to `public/assets/img`.
Re-running `compose.py` reproduces the masters exactly.

## Quality checks (run on every render)

- Exact package count per image.
- Share of each pouch left visible after overlaps (minimum 47% so far).
- The gummies in the renders hide each pouch's bottom-right corner. Pouches drawn
  without their gummies keep that corner hidden behind a pouch in front; the audit
  measures exposed corner pixels and must report 0.

## Known limits

- The renders have real gummies in front of every pouch, and no gummy-free version
  exists, so each front-row pouch keeps its gummy pair as photographed. Flipping or
  rotating the pairs was tested and does not cover the corner. Transparent, gummy-free
  pouch renders from the designer would remove this constraint.
- Green Apple has no clean corner in any supplied render, so in mixed boxes it rides the
  back row.

## Higgsfield

The connected Higgsfield integration can read the account (2,207 credits, Ultra plan)
but cannot generate or upload. Generation would have to run through the browser, and
any model redraws package text and logos, so the brief's compositing route is used for
packaging. Higgsfield remains an option for scene plates (backdrop, surfaces, light)
behind these genuine cut-outs.
