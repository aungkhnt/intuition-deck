# Rotation & Orbits Workbench

A deck in [intuition-deck](../README.md). It collects the clearest rotation and orbital-mechanics simulations on the web, grouped by concept — rotational kinematics, torque and moment of inertia, rolling, angular momentum, and orbits — each with notes on how to actually use it.

Served at `/rotation/` in the deployed site. No build step, framework, or dependency — plain HTML, CSS, and vanilla JS. The scripts in `scripts/` are optional helpers that need Node 18+.

## What's where

| Path | What it is |
|---|---|
| `index.html` | Page shell: header, sidebar, an empty `#gallery`, and an empty `#topics` the script fills in. Sets `data-motif="loop"` so the poster art draws orbital ellipses instead of sine waves. |
| `assets/workbench.css` | All styles. Light and dark theme tokens are at the top. |
| `assets/workbench.js` | Renders `tools.json` into the gallery, sections, and cards. Also handles embeds, fallbacks, theme, and nav. |
| `tools.json` | **The content**: the five sections (topics) and the tools. This is the file you edit. |
| `tools.js` | Generated copy of `tools.json` for `file://` use. Don't edit it. |
| `scripts/sync-data.mjs` | Validates `tools.json` and regenerates `tools.js`. |
| `scripts/check-embeds.mjs` | Checks each site's links and whether it allows framing. |

`assets/` and `scripts/` are copies of the same files in [`../waves/`](../waves/) — every deck runs the identical engine. If you change the engine, change it in all decks (or factor it out into a shared folder).

The five sidebar sections are this deck's `topics` (ids 1–5): Rotational Kinematics, Torque & Moment of Inertia, Rolling Motion, Angular Momentum, and Orbits & Gravitation. A tool can sit in more than one (PhET Torque is in both Torque and Angular Momentum).

## Editing `tools.json`

After any edit, run (from this folder):

```bash
node scripts/sync-data.mjs
```

Browsers block `fetch()` on pages opened from disk, so a double-clicked `index.html` reads `tools.js` instead. Served over http, it reads `tools.json` directly. The script also validates the file and names any broken field. Use `--check` in CI to fail when `tools.js` is stale. The schema is documented in the [wave deck's README](../waves/README.md#editing-toolsjson).

## Embeds and the fallback

Embeds are **click-to-load** by default — each embeddable card is a full app. The sidebar has an "Auto-load" switch that loads sims as they scroll into view.

Four cards are marked embeddable: PhET Kepler's Laws, Gravity and Orbits, My Solar System (all HTML5), and Gravity Simulator. The rest are link-only, either because the PhET sim is **legacy Java** (Torque, Ladybug Revolution — they run in-browser via CheerpJ on PhET's own page, which refuses framing), the license is **non-commercial** (oPhysics), the site sits behind a **Cloudflare bot check** (The Physics Aviary), or it's simply link-only (Hohmann Transfer).

A site that refuses framing via `X-Frame-Options` or CSP `frame-ancestors` doesn't make the iframe hang — the browser shows its own error page and still fires `load`. So check before publishing:

```bash
node scripts/check-embeds.mjs --all
```

It reads those headers for every tool and exits non-zero if an embeddable tool is blocked or a link is dead. If a site is blocked, set `"can_embed": false` for that tool. One embeddable tool carries a `todo` to confirm in a real browser: **Gravity Simulator** (`gravitysimulator.org`) — if it refuses framing, flip it to link-only.

## Original sims (planned, not built)

No original sims are built yet. The six "irreducible core" sims to build later are specced in [`../docs/rotation-core-sims-plan.md`](../docs/rotation-core-sims-plan.md) — each with the concept it teaches, its predict-before-reveal hook, and the curated sim above it validates against. When one is built, it lands in `rotation/sims/<name>/` and flips to a live card in `tools.json` (`"kind": "original"`, `"status": "live"`), the same lifecycle the wave deck uses.

## Deploying

Deployment is handled once for the whole repo from the root — see [the top-level README](../README.md#deploying). This folder is just served at `/rotation/`.

## Attribution

This workbench embeds and links to educational simulations from PhET, oPhysics, The Physics Aviary, Gravity Simulator, and The Average Scientist. All rights to the linked and embedded content belong to their respective authors. See each tool's card for source attribution and license.
