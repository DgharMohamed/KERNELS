# Mars Analogs — Main Website

Main landing site, shared header/footer, and placeholder pages for the Mars Analogs educational project. Built with plain HTML, CSS, and JavaScript—no frameworks, no build step, and no external assets.

## How to Run

- **Open locally:** Double-click `index.html` to open it directly in your browser.
- **Local server (optional):** Run `npx serve .` or `python3 -m http.server` in the project folder.
- **GitHub Pages:** Push the repository to GitHub and enable **Settings → Pages → Deploy from a branch** (`main` / root). All paths are relative, so it works at any subpath.

## Connecting Team Pages (`js/config.js`)

Edit **`js/config.js`**—no HTML files need to be touched. Update the `LINKS` object:

```js
const LINKS = {
  home: 'index.html',
  learning: 'learning.html',     // Learning page about Mars sites
  challenges: 'challenges.html', // Quiz / Challenges page
  game: '#',                     // Replace '#' with Operation Red Rock URL
  quiz: 'challenges.html',       // Card 1 button: "Take a quiz"
  rovers: '#',                   // Card 2 button: "Choose a rover"
  articles: '#'                  // Card 3 button: "Read articles"
};
```

Any link set to `'#'` stays visible and displays a **"Coming soon"** toast on click without scrolling or reloading the page.

## Adding a New Page to the Header

Add **one line** to `NAV_ITEMS` in **`js/config.js`**:

```js
const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: LINKS.home },
  { id: 'learning', label: 'Learning', href: LINKS.learning },
  { id: 'challenges', label: 'Challenges', href: LINKS.challenges },
  { id: 'map', label: 'Map', href: 'map.html' }, // <-- add one line here
  { id: 'game', label: 'Game', href: LINKS.game, isAccent: true }
];
```

On the new HTML page, set `<body data-page="map">` so the header automatically highlights that link with `aria-current="page"`.

## Verification Checklist

- [x] Shared header is identical across `index.html`, `learning.html`, and `challenges.html`, with `aria-current="page"` on the active item
- [x] Mobile hamburger menu (< 760 px) toggles `aria-expanded`, closes on `Escape` (restoring focus) and on link click, with no focus trap
- [x] "Start learning" smoothly scrolls to `#steps` and moves keyboard focus to `#steps-heading`
- [x] All card and game-band buttons pull their URLs from `js/config.js`
- [x] Any `'#'` link displays a "Coming soon" toast without scrolling or reloading
- [x] `prefers-reduced-motion: reduce` disables star twinkling, smooth scroll, and card reveal transitions
- [x] Full keyboard-only navigation works with visible `:focus-visible` outlines
- [x] Responsive from 360 px to 1920 px with zero horizontal scrolling
- [x] Zero console errors and zero external requests
