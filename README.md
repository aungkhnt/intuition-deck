# intuition-deck

Interactive simulations for building physical intuition — and, over time, for checking the math behind it.

This is a **monorepo**: one repo, one `main` branch, one folder per deck. Each deck is a self-contained static site. A small landing page at the root links them together, and the whole thing deploys as a single Vercel project.

The long game: each deck starts as curated and original sims for *learning* a topic, then grows into sims sharp enough to *verify* the first principles they teach — e.g. numerical solutions checked against analytic ones.

## Layout

```
intuition-deck/
├── index.html          landing page (links to each deck)
├── 404.html            shared not-found page
├── assets/site.css     styles for the landing + 404
├── vercel.json         { "cleanUrls": true }
├── waves/              ── Wave Physics Workbench (the first deck)
│   ├── index.html
│   ├── assets/  tools.json  tools.js  scripts/
│   ├── sims/…          original sims (placeholders for now)
│   └── README.md       how the workbench works
├── thermo/             ── Thermodynamics Workbench
│   ├── index.html
│   ├── assets/  tools.json  tools.js  scripts/
│   └── README.md
└── <next-deck>/        future decks drop in as sibling folders
```

Deployed, that maps to:

| URL | Serves |
|---|---|
| `/` | the landing page |
| `/waves/` | the Wave Physics Workbench |
| `/thermo/` | the Thermodynamics Workbench |
| `/<next-deck>/` | future decks |

## Why a monorepo (not branches)

Branches are a *timeline of one codebase*, meant to diverge and merge back. Separate projects aren't versions of each other, so they belong in separate folders on the same branch — not on separate branches. One repo keeps every deck visible at once, deployable together, and able to share code (fonts, tokens, the `sync-data` validator).

## Adding a new deck

1. Create a folder, e.g. `optics/`, with its own `index.html` and assets. Keep every internal link **relative** (`assets/x.css`, not `/assets/x.css`) so it works under `/optics/`.
2. Add a card for it in the root [index.html](index.html) (copy the Wave Physics card, change the text and `href`).
3. That's it — Vercel serves it at `/optics/` on the next deploy.

## Local preview

No build step, no dependencies. Open `index.html` directly, or serve the folder so `fetch()` works (the workbench loads `tools.json` that way):

```bash
python3 -m http.server 8765
```

Then visit `http://localhost:8765/` for the landing page and `/waves/` for the workbench. (In the Claude Code app, the Browser pane serves this automatically via `.claude/launch.json`.)

## Deploying

The whole repo deploys as one Vercel project from the root:

```bash
vercel --prod
```

`vercel.json` sets only `cleanUrls: true`. Do **not** add `trailingSlash: true` — on Vercel it breaks the root `index.html`, sending every path to `404.html`.

## License

Site code (HTML/CSS/JS/JSON) is MIT licensed — see [LICENSE](LICENSE). Embedded third-party simulations follow each source's own license; every deck names its sources and licenses on the relevant cards.
