# Mars & Earth Explorer

An educational, front-end-only atlas for exploring real Martian geography and
comparing it responsibly with landscapes on Earth.

## Features

- **Interactive Mars map** using NASA/JPL Mars Trek imagery (MGS MOLA
  colorized hillshade).
- **Five featured locations** — Olympus Mons, Valles Marineris, Jezero Crater,
  Gale Crater and Hellas Planitia — with profiles, scientific highlights and
  source links.
- **Search and selection** across all locations, with map focus and readouts.
- **Earth comparison lab** pairing each Mars location with a terrestrial
  analogue on an interactive Earth satellite map.
- **At-a-glance metrics**, shared processes and important differences for every
  comparison.
- Responsive layout, keyboard-accessible controls and reduced-motion support.

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [Leaflet](https://leafletjs.com/) via [react-leaflet](https://react-leaflet.js.org/)
- Oxlint for static analysis

## Getting started

```bash
npm install
npm run dev       # start the Vite dev server
npm run build     # production build in dist/
npm run preview   # preview the production build
npm run lint      # run oxlint
```

The app is front-end only. It needs an internet connection to stream map tiles
from NASA Mars Trek and Esri.

## Project structure

```
src/
  components/   Header, SearchBar, LocationList, LocationDetails,
                MarsMap, ComparisonMap
  data/         marsPlaces.js (Mars locations), earthComparisons.js
  pages/        ExplorerPage, ComparisonPage, AboutPage
  styles/       global.css, map.css, compare.css
  utils/        format.js (coordinates), planet.js (map helpers)
  App.jsx       view state and navigation
  main.jsx      app entry point
public/         favicon and icon sprite
```

## Data and imagery

- Mars locations and coordinates: IAU Working Group for Planetary System
  Nomenclature, maintained by the USGS Astrogeology Science Center.
- Descriptions and facts: cross-checked against NASA Science and mission pages.
- Mars basemap: NASA/JPL Mars Trek WMTS tiles
  (`Mars_MGS_MOLA_ClrShade_merge_global_463m`) in an equirectangular Mars
  projection (IAU2000:104905).
- Earth basemap: Esri World Imagery satellite tiles.

## Scope and limitations

This is an educational demo, not a scientific model. Earth analogues illustrate
shared geological processes; they do not imply that the landscapes formed in the
same way. Map imagery is streamed from third parties and may change or be
unavailable. There is no backend, no user accounts and no persisted state.
