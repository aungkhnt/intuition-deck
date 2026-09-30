# Wave Physics Workbench

The first deck in [intuition-deck](../README.md). It collects the best free wave simulations on the web, organized by the topics of an intro waves course, each with notes on how to actually use it. Next to them sit placeholders for original sims that will verify the physics from first principles.

Served at `/waves/` in the deployed site. No build step, framework, or dependency — plain HTML, CSS, and vanilla JS. The scripts in `scripts/` are optional helpers that need Node 18+.

## What's where

| Path | What it is |
|---|---|
| `index.html` | Page shell: header, sidebar, and an empty `#topics` that the script fills in. |
| `assets/workbench.css` | All styles. Light and dark theme tokens are at the top. |
| `assets/workbench.js` | Renders `tools.json` into sections and cards. Also handles embeds, fallbacks, theme, and nav. |
| `tools.json` | **The content**: topics and tools. This is the file you edit. |
| `tools.js` | Generated copy of `tools.json` for `file://` use (see below). Don't edit it. |
| `scripts/sync-data.mjs` | Validates `tools.json` and regenerates `tools.js`. |
| `scripts/check-embeds.mjs` | Checks each site's links and whether it allows framing. |
| `sims/<name>/` | One folder per original sim. They're placeholders for now. |

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
| `embed_url` | What goes in the iframe. Sometimes the bare app rather than its wrapper page, e.g. Falstad's `Fourier.html` or the Mathlets `javascript/build/…` pages. |
| `can_embed` | `false` shows a preview card with an "Open in new tab" button instead of an iframe. |
| `topics` | Section numbers, 1–8. The card appears in each one. |
| `my_note`, `controls` | How to use it, and what the controls are. |
| `recommended_first` | Adds the ⚡ badge and sorts the card first in its section. |

Optional extras: `embed_note` (reason shown on a link-only card), `todo` (marks a note as a draft; shows a "draft" pill — find them with `grep -n '"todo"' tools.json`), and `kind`/`status`/`verifies`/`gap_filler` for original sims.

## Embeds and the fallback

Embeds are **click-to-load** by default — there are 20 embeddable cards and each is a full app. The sidebar has an "Auto-load" switch that loads sims as they scroll into view.

If an iframe hasn't fired `load` within 3 seconds, the card's preview covers it; the iframe keeps loading underneath and the preview steps aside if it finishes. Offline and `http://`-inside-`https://` are caught before the iframe is created.

One limit: a site that refuses framing via `X-Frame-Options` or CSP `frame-ancestors` doesn't make the iframe hang — the browser shows its own error page and still fires `load`, and cross-origin frames can't be inspected. So check before publishing:

```bash
node scripts/check-embeds.mjs --all
```

It reads those headers for every tool and exits non-zero if an embeddable tool is blocked or a link is dead. If a site is blocked, set `"can_embed": false` for that tool.

## Adding an original sim

1. Build it in `sims/<name>/index.html`. Use **relative** asset paths (`main.js`, not `/waves/sims/<name>/main.js`) so it works from disk and when deployed.
2. In `tools.json`, change its `"status"` from `"planned"` to `"live"`.
3. Run `node scripts/sync-data.mjs`.

It then embeds like any other tool, both in §9 and in each topic listed in its `topics`.

## Deploying

Deployment is handled once for the whole repo from the root — see [the top-level README](../README.md#deploying). This folder is just served at `/waves/`.

## Attribution

This workbench embeds and links to educational simulations from PhET, Falstad, oPhysics, MIT Mathlets, Walter Fendt, The Physics Aviary, Dan Russell (PSU), and others. All rights to embedded content belong to their respective authors. See each tool's card for source attribution and license.
