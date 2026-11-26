# Multi-pack images

**25 Nov 2026:** Cherry, Green Apple, Peach and Milk Chocolate 5 and 10 pack images are now
supplied photography (`design-source/packshots/photography`, Cherry 5 pack padded to square).
The composites below remain only for Dark Chocolate, Midnight Berry and the Custom Gummies 5 pack,
until their photography arrives.

## Composites (approved 22 Nov 2026)

Pack-size images for the product pages: 5 pack and 10 pack for every gummy and
chocolate, plus the Custom Gummies 5 pack. Every pouch and box is placed as
supplied, only scaled; no packaging pixel is generated or repainted.

| Image | Layout |
|---|---|
| `<flavor>-5pack` (gummies) | UNREAL-style: two pouches behind and higher, three in front, centre closest |
| `gummies-custom-5pack` | the same layout, mixed flavors |
| `cherry-10pack`, `peach-10pack` | the real box of ten with its "10 Pack" end panel to camera, one pouch in front |
| `apple-10pack` | the real box (only a top-down photo exists, so no "10 Pack" panel yet) with one pouch |
| `<flavor>-5pack`, `-10pack` (chocolates) | 4 or 9 boxes lying in a loose stack, one box standing in front |

## Sources (`design-source/packshots/src`)

- `<flavor>-pack.png`: the supplied transparent pouch and chocolate-box PNGs.
- `cherry-10box-cut.png`: box from photo DSC07326, colour matched to the front photo DSC07313
  (the end-panel photo has a warm cast that made the pink box read peach).
- `peach-10box-matched.png`: box from DSC07465, colour and exposure matched to DSC07474.
- `apple-10box-cut.png`: box from DSC07377.

## Scripts

- `boxcut.py` (rembg) and `boxcut2.py` (convex hull, for pale boxes on white) cut boxes out of photos.
- `boxcolor.py CUT REF_PHOTO x0,y0,x1,y1 OUT [full]` matches cardboard colour to a reference photo.
- `compose2.py OUT [name ...]` builds the frames: seamless sweep, then items back to front with a
  floor shadow laid back from each silhouette, a soft shadow thrown back-left, occlusion shading on
  the items behind, and a contact shadow that follows each item's real bottom edge. Chocolate boxes
  lying flat are built from the render's own side panel and cover, perspective-corrected.

Approved frames (2048px JPG) are in `design-source/packshots/final`. Web renditions
(480/900/1600, AVIF + WebP) are in `public/assets/img/packshots` and, in the theme,
`assets/mushi-packshot-<name>-<w>.<avif|webp>`.
