#!/usr/bin/env node
// Validates tools.json and regenerates tools.js, the copy index.html reads when
// it's opened straight from disk (browsers block fetch() on file:// pages).
//
//   node scripts/sync-data.mjs           validate, then write tools.js
//   node scripts/sync-data.mjs --check   validate, and fail if tools.js is stale

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = join(root, 'tools.json');
const mirrorPath = join(root, 'tools.js');
const checkOnly = process.argv.includes('--check');

let data;
try {
  data = JSON.parse(readFileSync(jsonPath, 'utf8'));
} catch (err) {
  fail(`tools.json is not valid JSON: ${err.message}`);
}

const problems = validate(data);
if (problems.length) fail(`tools.json has ${problems.length} problem(s):\n${problems.map((p) => `  - ${p}`).join('\n')}`);

const mirror = [
  '// GENERATED from tools.json by scripts/sync-data.mjs. Do not edit by hand.',
  '// index.html loads this only when opened from disk (file://), where fetch() is blocked.',
  `window.WORKBENCH_DATA = ${JSON.stringify(data, null, 2)};`,
  '',
].join('\n');

const current = existsSync(mirrorPath) ? readFileSync(mirrorPath, 'utf8') : '';
const summary = `tools.json OK (${data.topics.length} topics, ${data.tools.length} tools)`;

if (checkOnly) {
  if (current !== mirror) fail(`${summary}, but tools.js is out of date. Run: node scripts/sync-data.mjs`);
  console.log(`${summary}; tools.js is in sync.`);
} else if (current === mirror) {
  console.log(`${summary}; tools.js already up to date.`);
} else {
  writeFileSync(mirrorPath, mirror);
  console.log(`${summary}; wrote tools.js.`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function validate({ topics, tools } = {}) {
  if (!Array.isArray(topics) || !Array.isArray(tools)) return ['top level must be { "topics": [...], "tools": [...] }'];

  const problems = [];
  const topicIds = new Set();
  const collectorIds = new Set();
  for (const topic of topics) {
    const where = `topic ${JSON.stringify(topic.title ?? topic.id)}`;
    if (!Number.isInteger(topic.id)) problems.push(`${where}: "id" must be an integer`);
    if (topicIds.has(topic.id)) problems.push(`${where}: duplicate id ${topic.id}`);
    topicIds.add(topic.id);
    if (topic.originals) collectorIds.add(topic.id);
    for (const key of ['slug', 'title', 'summary']) if (!topic[key]) problems.push(`${where}: missing "${key}"`);
  }

  const toolIds = new Set();
  for (const tool of tools) {
    const where = `tool ${JSON.stringify(tool.id ?? tool.name)}`;
    for (const key of ['id', 'name', 'source', 'url', 'license', 'my_note']) {
      if (!tool[key]) problems.push(`${where}: missing "${key}"`);
    }
    if (toolIds.has(tool.id)) problems.push(`${where}: duplicate id`);
    toolIds.add(tool.id);

    if (typeof tool.can_embed !== 'boolean') problems.push(`${where}: "can_embed" must be true or false`);
    if (tool.can_embed && !tool.embed_url) problems.push(`${where}: "can_embed" is true but "embed_url" is empty`);

    if (!Array.isArray(tool.topics) || tool.topics.length === 0) {
      problems.push(`${where}: "topics" must be a non-empty array`);
    } else {
      for (const id of tool.topics) {
        if (!topicIds.has(id)) problems.push(`${where}: unknown topic ${id}`);
        if (collectorIds.has(id)) problems.push(`${where}: topic ${id} lists original sims automatically; don't tag it`);
      }
    }

    const kind = tool.kind ?? 'external';
    if (kind === 'external') {
      if (!/^https?:\/\//.test(tool.url)) problems.push(`${where}: "url" must be an absolute http(s) URL`);
      if (tool.embed_url && !tool.embed_url.startsWith('https://')) {
        problems.push(`${where}: "embed_url" must be https:// (browsers block http:// iframes on an https:// site)`);
      }
    } else if (kind === 'original') {
      if (!['planned', 'live'].includes(tool.status)) problems.push(`${where}: "status" must be "planned" or "live"`);
      if (!/^sims\/[a-z0-9-]+\/$/.test(tool.url)) problems.push(`${where}: "url" should look like "sims/<name>/"`);
      if (tool.status === 'live' && !existsSync(join(root, tool.url, 'index.html'))) {
        problems.push(`${where}: "status" is "live" but ${tool.url}index.html doesn't exist`);
      }
    } else {
      problems.push(`${where}: "kind" must be "external" or "original"`);
    }
  }
  return problems;
}
