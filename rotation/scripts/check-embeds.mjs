#!/usr/bin/env node
// Checks every external tool in tools.json: does its page still load, and will
// its site let the workbench frame it (X-Frame-Options / CSP frame-ancestors)?
//
// This is the reliable way to know. In the browser, an iframe refused by those
// headers still fires `load` (on an error page), so the workbench itself can't
// tell a blocked embed from a working one.
//
//   node scripts/check-embeds.mjs         check embeddable tools + all links
//   node scripts/check-embeds.mjs --all   also report whether link-only tools could embed
//
// Exits 1 if a link is broken or an embeddable tool is blocked. Needs Node 18+.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { tools } = JSON.parse(readFileSync(join(root, 'tools.json'), 'utf8'));
const includeLinkOnly = process.argv.includes('--all');
const TIMEOUT_MS = 20_000;
const CONCURRENCY = 6;
const USER_AGENT = 'Mozilla/5.0 (compatible; intuition-deck embed check)';

const external = tools.filter((tool) => (tool.kind ?? 'external') === 'external');
const results = await mapLimit(external, CONCURRENCY, checkTool);

let failures = 0;
for (const { tool, verdict, detail } of results) {
  if (verdict === 'blocked' || verdict === 'broken') failures++;
  console.log(`${verdict.padEnd(8)} ${tool.id.padEnd(36)} ${detail}`);
}
console.log(`\n${results.length} tools checked, ${failures} problem(s).`);
process.exit(failures ? 1 : 0);

async function checkTool(tool) {
  const embedding = tool.can_embed || includeLinkOnly;
  const page = await inspect(tool.url);
  if (page.error || page.status >= 400) {
    if (page.challenged) return { tool, verdict: 'unknown', detail: 'bot challenge (Cloudflare): check in a real browser' };
    return { tool, verdict: 'broken', detail: `url: ${page.error ?? `HTTP ${page.status}`}` };
  }
  if (!embedding) return { tool, verdict: 'ok', detail: 'link only; page loads' };

  const frame = tool.embed_url && tool.embed_url !== tool.url ? await inspect(tool.embed_url) : page;
  if (frame.challenged) return { tool, verdict: 'unknown', detail: 'bot challenge (Cloudflare): check in a real browser' };
  if (frame.error || frame.status >= 400) return { tool, verdict: 'broken', detail: `embed_url: ${frame.error ?? `HTTP ${frame.status}`}` };

  const blockedBy = framingBlock(frame);
  const label = tool.can_embed ? '' : ' (link-only tool)';
  if (blockedBy) return { tool, verdict: tool.can_embed ? 'blocked' : 'info', detail: `refuses framing: ${blockedBy}${label}` };
  return { tool, verdict: 'ok', detail: `embeddable, no framing restrictions${label}` };
}

async function inspect(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,*/*' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    await res.body?.cancel();
    return {
      status: res.status,
      xfo: res.headers.get('x-frame-options'),
      csp: res.headers.get('content-security-policy'),
      challenged: res.headers.get('cf-mitigated') === 'challenge',
    };
  } catch (err) {
    // fetch() hides the useful part (ENOTFOUND, ECONNRESET, ...) in err.cause.
    return { error: err.name === 'TimeoutError' ? 'timed out' : err.cause?.code ?? err.cause?.message ?? err.message };
  }
}

// CSP frame-ancestors wins over X-Frame-Options when both are present.
function framingBlock({ xfo, csp }) {
  const ancestors = csp?.split(';').map((d) => d.trim()).find((d) => /^frame-ancestors\b/i.test(d));
  if (ancestors) {
    const sources = ancestors.split(/\s+/).slice(1);
    return sources.includes('*') || sources.includes('https:') ? null : ancestors;
  }
  if (xfo && /^(deny|sameorigin)$/i.test(xfo.trim())) return `X-Frame-Options: ${xfo.trim()}`;
  return null;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}
