# Thermodynamics Workbench

A deck in [intuition-deck](../README.md). It collects the clearest thermodynamic-cycle simulations on the web — Carnot, Otto, Diesel, Brayton, Rankine, Stirling — organized by cycle, each read on both the P–V and T–S planes, with notes on how to actually use it.

Served at `/thermo/` in the deployed site. No build step, framework, or dependency — plain HTML, CSS, and vanilla JS. The scripts in `scripts/` are optional helpers that need Node 18+.

## What's where

| Path | What it is |
|---|---|
| `index.html` | Page shell: header, sidebar, an empty `#gallery`, and an empty `#topics` the script fills in. Sets `data-motif="loop"` so the poster art draws P–V loops instead of sine waves. |
| `assets/workbench.css` | All styles. Light and dark theme tokens are at the top. |
| `assets/workbench.js` | Renders `tools.json` into the gallery, sections, and cards. Also handles embeds, fallbacks, theme, and nav. |
| `tools.json` | **The content**: cycles (topics) and tools. This is the file you edit. |
| `tools.js` | Generated copy of `tools.json` for `file://` use. Don't edit it. |
| `scripts/sync-data.mjs` | Validates `tools.json` and regenerates `tools.js`. |
| `scripts/check-embeds.mjs` | Checks each site's links and whether it allows framing. |

`assets/` and `scripts/` are copies of the same files in [`../waves/`](../waves/) — the two decks run the identical engine. If you change the engine, change it in both places (or factor it out into a shared folder).

## Editing `tools.json`

After any edit, run (from this folder):

```bash
node scripts/sync-data.mjs
```

Browsers block `fetch()` on pages opened from disk, so a double-clicked `index.html` reads `tools.js` instead. Served over http, it reads `tools.json` directly. The script also validates the file and names any broken field. Use `--check` in CI to fail when `tools.js` is stale.

Each tool follows this schema:

| Field | Meaning |
|---|---|
| `id`, `name`, `source`, `license` | Identity and attribution shown on the card. |
| `url` | "Open full page" link. |
| `embed_url` | What goes in the iframe (only needed when `can_embed` is true). |
| `can_embed` | `false` shows a preview card with an "Open in new tab" button instead of an iframe. |
| `topics` | Cycle numbers, 1–7. The card appears in each one, and once in the gallery. |
| `my_note`, `controls` | How to use it, and what the controls are. |
| `recommended_first` | Adds the ⚡ badge and sorts the card first in its section. |

Optional extras: `embed_note` (reason shown on a link-only card) and `todo` (marks a note as a draft; shows a "draft" pill — find them with `grep -n '"todo"' tools.json`).

## Embeds and the fallback

Embeds are **click-to-load** by default — each embeddable card is a full app. The sidebar has an "Auto-load" switch that loads sims as they scroll into view.

Two cards embed live (PhET Gas Properties, OpenLyceum's Carnot Heat Engine); the rest are link-only, either because the tool is proprietary (MechSimulator, simulations4all), served from a site that refuses framing (NASA Glenn), or not a browser app at all (AETHER-X needs a local backend, TESPy is a Python library).

A site that refuses framing via `X-Frame-Options` or CSP `frame-ancestors` doesn't make the iframe hang — the browser shows its own error page and still fires `load`. So check before publishing:

```bash
node scripts/check-embeds.mjs --all
```

It reads those headers for every tool and exits non-zero if an embeddable tool is blocked or a link is dead. If a site is blocked, set `"can_embed": false` for that tool.

## Draft notes to firm up

Several cards carry a `todo` (the "draft" pill). The open ones are deep-link URLs that couldn't be verified when the deck was built — the exact MechSimulator and simulations4all per-cycle URLs, and whether NASA Glenn's EngineSim/nozzle run in-browser today or only as downloads. Load each in a real browser and tighten the note (and the URL) when confirmed.

## Deploying

Deployment is handled once for the whole repo from the root — see [the top-level README](../README.md#deploying). This folder is just served at `/thermo/`.

## Attribution

This workbench embeds and links to educational simulations from MechSimulator, simulations4all, NASA Glenn Research Center, OpenLyceum, PhET, and TESPy. All rights to the linked and embedded content belong to their respective authors. See each tool's card for source attribution and license.
