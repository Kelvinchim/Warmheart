# Storefront performance changes

Measured locally on 6 November 2026 against repository commit `c74966f`.
These are production build sizes, not live-site loading-time measurements.

| Measurement | Before | After |
| --- | ---: | ---: |
| Production JavaScript | 5,962.30 KB | 196.02 KB |
| JavaScript, gzip (Vite) | 4,420.60 KB | 59.03 KB |
| Build duration on this machine | 1.86 s | 0.90 s |

Six Base64 campaign photos caused nearly all the oversized JavaScript. They
now use WebP files at 480, 960 and 1440 pixels, emitted with Vite content hashes.
The exact embedded photographs were retained; the older public JPGs were not
substituted. Browsers select the size using `srcset` and `sizes`. The first hero
image has a responsive preload; hero and primary product images load eagerly,
while other images load lazily with asynchronous decoding. Existing layout and
photo crops remain in place.

Cart initialization now reads local storage once before rendering. Existing cart
photos migrate to the current product image URLs by product ID, preserving item
quantities, sizes and prices. Newly stored carts and checkout payloads contain
small image URLs instead of Base64 photos. This also avoids the previous initial
empty-cart write on mount.

The PayChangu checkout handler, verification function, subscription function,
Netlify routing, order status handling and checkout request logic are unchanged.
No keys or payment environments were modified. No live payment was attempted.

## Validation

- Production build passes, with no oversized-chunk warning.
- Browser tests pass against the production preview: mobile campaign image
  decoding, resolved responsive preload URLs, JavaScript size budget, legacy
  cart migration, reload persistence, add to cart, quantity changes, mocked
  checkout payload/redirect, successful order and failed order/retry pages.
- Mobile screenshot reviewed for layout and correct campaign photography.
- `git diff --check` passes; payment functions and Netlify configuration have no diff.

Run `npm ci`, `npm run build`, then `npm test`. Install Playwright Chromium
with `npx playwright install chromium`, or set `CHROME_PATH` to an installed
Chrome executable. Tests intercept checkout locally and never contact PayChangu.
The image generation script accepts a folder of `PHOTO_*.jpg` originals extracted
from the six Base64 constants in the baseline commit. Run
`node scripts/optimize-images.mjs <originals-folder>` when regenerating assets;
generated assets are committed and no image conversion is required at deployment.

## Publication

Changes are local in this checkout. Nothing has been pushed or deployed.
Netlify should build this source using its existing configuration once the
changes are published to the connected repository. Confirm real mobile loading
and payment return behavior on a deploy preview before production publication.
Old public JPGs and the legacy coming-soon page remain for compatibility; the
active storefront does not request them.
