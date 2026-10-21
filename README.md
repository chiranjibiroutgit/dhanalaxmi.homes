# Dhanalaxmi Group — Real Estate Marketplace

Production-grade React marketplace for **Dhanalaxmi.group.in** — luxury residential, commercial
and plotted assets. Built to blend e-commerce browsing efficiency with luxury real-estate polish.

## Live

| Item | Value |
| --- | --- |
| Hosting URL | https://dhanalaxmigroup-in.web.app |
| Firebase project | `dhanalaxmigroup-in` |
| Console | https://console.firebase.google.com/project/dhanalaxmigroup-in/overview |
| Custom domain | `dhanalaxmihomes.com` |

## Stack

- **React 18 + Vite** — SPA with client-side routing
- **Tailwind CSS** — brand tokens (`navy #0A192F`, `gold #D4AF37`, `green #15803D`, `mist #F8F9FA`)
- **React Router DOM** — `/`, `/property/:id`, `/cart`, `/me`
- **React Context** — `CartContext` (saved properties, localStorage) + `NavContext` (IntersectionObserver scrollspy)
- **Lucide React** — iconography
- **Firebase Hosting** — static hosting with SPA rewrite

## Scripts

```bash
npm install        # install dependencies
npm run dev        # local dev server (http://localhost:5173)
npm run build      # production build → dist/
npm run preview    # preview the production build
npm run deploy     # build + deploy to Firebase Hosting
```

## Project structure

```
src/
├── App.jsx                  # Providers + routing shell (single fade-in on load)
├── main.jsx                 # React entry
├── index.css                # Tailwind layers + design-system components
├── components/
│   ├── Header.jsx           # Sticky dual-zone nav (scrollspy + cart badge + mobile drawer)
│   ├── Hero.jsx             # #home — architectural hero + search + trust metrics
│   ├── SearchBar.jsx        # Controlled multi-parameter search (location / type / budget)
│   ├── PropertyGrid.jsx     # #properties — 3/2/1 column grid, sorting, empty state
│   ├── PropertyCard.jsx     # 16:10 card, badges, save-heart, spec chips, View Details
│   ├── PropertyDetail.jsx   # /property/:id — gallery, specs, amenities, sticky CTAs
│   ├── MyCart.jsx           # /cart — saved properties table + Request Callback
│   ├── Me.jsx               # /me — profile, saved searches, site visits, support
│   ├── AboutUs.jsx          # #about — story, values, metrics, testimonials
│   └── Footer.jsx           # Brand footer + compliance links
├── context/
│   ├── CartContext.jsx      # Saved properties state (localStorage persistence)
│   └── NavContext.jsx       # Active section tracking via IntersectionObserver
└── data/
    └── properties.js        # ← THE 5 PROPERTY RECORDS + contact details
```

## Updating content (no styling changes required)

**All 5 properties** live in `src/data/properties.js` as plain objects. To swap in new listings,
edit or add objects with the same shape:

```js
{
  id, slug, title, subtitle, type, status, badge,
  location, microLocation, price, priceNumeric, priceLabel,
  rera, possession, bhk, carpetArea, parking, facing, floor,
  furnishing, maintenance, description, shortDescription,
  images: [3 urls], thumbnail, floorPlan,
  amenities: [{ name, icon }],   // icon keys: Waves | ShieldCheck | Building2 | Zap | Leaf | Anchor | Settings | Droplets | MapPin
  specs: [{ label, value }], highlights: [...]
}
```

Also update `CONTACT` in the same file (phone, WhatsApp, email, address) — the WhatsApp CTAs and
call buttons read from it.

### Swap in real project photography

Replace the Unsplash URLs in `images` / `thumbnail` / `floorPlan` with your own asset paths, e.g.
`/media/sea-princess-1/exterior-01.jpg` and drop the files into `public/media/`.

## Deploying

```bash
firebase login          # once
npm run deploy          # build + deploy
```

`firebase.json` configures `dist/` as the public root, an SPA rewrite (`** → /index.html`) and
immutable caching for hashed assets. `.firebaserc` pins the project to `dhanalaxmigroup-in`.

## Custom domain

Firebase Console → Hosting → **Add custom domain** → `dhanalaxmi.group.in`, then add the
provided DNS records at your registrar. SSL is provisioned automatically.

## Notes

- Saved properties persist in `localStorage` (`dl_cart`) — the header badge and My Cart read from it.
- "Back to Listings" restores the exact grid scroll position via `sessionStorage` (`dl_scroll_y`).
- Accessibility: WCAG AA contrast, visible focus rings, ARIA labels on icon-only controls.
