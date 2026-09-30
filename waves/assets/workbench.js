/* Wave Physics Workbench: renders tools.json into topic sections and cards.
   A classic script (not a module) so index.html also works opened from disk. */
(() => {
  'use strict';

  const EMBED_TIMEOUT_MS = 3000;
  const THEME_KEY = 'wb-theme';
  const AUTOLOAD_KEY = 'wb-autoload';
  const IS_FILE = location.protocol === 'file:';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  // Third-party sims may run scripts and open popups, but can't navigate this page away.
  const SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox ' +
    'allow-forms allow-modals allow-downloads allow-pointer-lock';

  const stageTools = new WeakMap();
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch { /* storage unavailable (private mode, blocked) */ }
    },
  };

  let autoload = store.get(AUTOLOAD_KEY) === 'on';

  /* ---------- helpers ---------- */

  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue;
      if (key === 'class') el.className = value;
      else if (key === 'dataset') Object.assign(el.dataset, value);
      else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
      else el.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children.flat(Infinity)) {
      if (child == null || child === false) continue;
      el.append(child);
    }
    return el;
  }

  // "λ_{n} = 2L/n" renders as λ<sub>n</sub> = 2L/n. The text is never parsed as HTML.
  function math(text) {
    const frag = document.createDocumentFragment();
    const pattern = /([_^])\{([^}]*)\}/g;
    let last = 0;
    for (const match of text.matchAll(pattern)) {
      frag.append(text.slice(last, match.index), h(match[1] === '_' ? 'sub' : 'sup', null, match[2]));
      last = match.index + match[0].length;
    }
    frag.append(text.slice(last));
    return frag;
  }

  // Keeps each piece of an equation whole when it wraps; lines break only at · and ⇒.
  function equation(text) {
    return text.split(/\s+([·⇒])\s+/).map((part, i) => (i % 2
      ? [' ', h('span', { class: 'eq-sep' }, part), ' ']
      : h('span', { class: 'eq-part' }, math(part))));
  }

  const isExternal = (url) => /^https?:\/\//i.test(url);

  // Folder URLs need an explicit index.html when browsing from disk.
  const localHref = (url) => (IS_FILE && !isExternal(url) && url.endsWith('/') ? `${url}index.html` : url);

  const hostOf = (url) => (isExternal(url) ? new URL(url).host : 'this site');

  function joinNodes(nodes, separator) {
    return nodes.flatMap((node, i) => (i ? [separator, node] : [node]));
  }

  /* ---------- theme ---------- */

  const effectiveTheme = () => document.documentElement.dataset.theme || (darkQuery.matches ? 'dark' : 'light');

  function paintThemeButton() {
    const button = document.getElementById('theme-toggle');
    const dark = effectiveTheme() === 'dark';
    const label = dark ? 'Switch to light theme' : 'Switch to dark theme';
    button.textContent = dark ? '☀︎' : '☾';
    button.setAttribute('aria-label', label);
    button.title = label;
  }

  function toggleTheme() {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    const system = darkQuery.matches ? 'dark' : 'light';
    // Picking what the OS already says drops the override, so the page follows the OS again.
    if (next === system) {
      delete document.documentElement.dataset.theme;
      store.set(THEME_KEY, null);
    } else {
      document.documentElement.dataset.theme = next;
      store.set(THEME_KEY, next);
    }
    paintThemeButton();
  }

  /* ---------- data ---------- */

  function loadData() {
    if (IS_FILE) return loadMirror();
    return fetch('tools.json', { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`tools.json: HTTP ${res.status}`);
        return res.json();
      })
      .catch((err) => {
        console.warn('[workbench] tools.json failed, falling back to tools.js:', err);
        return loadMirror();
      });
  }

  // tools.js is a generated copy of tools.json (scripts/sync-data.mjs). Browsers
  // refuse fetch() on file:// pages, but a plain <script> still loads.
  function loadMirror() {
    return new Promise((resolve, reject) => {
      const script = h('script', { src: 'tools.js' });
      script.onload = () => (window.WORKBENCH_DATA
        ? resolve(window.WORKBENCH_DATA)
        : reject(new Error('tools.js did not define WORKBENCH_DATA')));
      script.onerror = () => reject(new Error('Could not load tools.js'));
      document.head.append(script);
    });
  }

  /* ---------- rendering ---------- */

  function render(data, root) {
    const topicsById = new Map(data.topics.map((topic) => [topic.id, topic]));
    const originals = data.tools.filter((tool) => tool.kind === 'original');
    const byTopic = new Map(data.topics.map((topic) => [topic.id, []]));
    for (const tool of data.tools) {
      // Planned sims only appear in the Original Sims section; live ones join their topics too.
      if (tool.kind === 'original' && tool.status !== 'live') continue;
      for (const id of tool.topics) byTopic.get(id)?.push(tool);
    }

    const rank = (tool) => (tool.recommended_first ? 0 : 1);
    const toc = document.getElementById('toc');
    const sections = [];

    for (const topic of data.topics) {
      const list = (topic.originals ? originals : byTopic.get(topic.id)).slice().sort((a, b) => rank(a) - rank(b));
      const section = topicSection(topic, list, topicsById);
      sections.push(section);
      root.append(section);
      toc.append(h('li', null,
        h('a', { href: `#${topic.slug}` },
          h('span', { class: 'toc__num' }, topic.id),
          h('span', null, topic.short || topic.title),
          h('span', { class: 'toc__count', title: `${list.length} tools` }, list.length))));
    }

    for (const stage of root.querySelectorAll('.stage--embed')) autoloadObserver?.observe(stage);
    watchSections(sections);
    jumpToHash();
  }

  function topicSection(topic, list, topicsById) {
    const cards = list.map((tool) => (tool.kind === 'original' && tool.status !== 'live'
      ? plannedCard(tool, topic, topicsById)
      : toolCard(tool, topic)));

    return h('section', { class: 'topic', id: topic.slug, 'aria-labelledby': `${topic.slug}-title` },
      h('header', { class: 'topic__head' },
        h('p', { class: 'topic__num' }, `§${topic.id}`),
        h('h2', { id: `${topic.slug}-title` }, topic.title),
        h('p', { class: 'topic__summary' }, topic.summary),
        topic.equation && h('p', { class: 'topic__eq' }, equation(topic.equation))),
      cards.length
        ? h('div', { class: 'grid' }, cards)
        : h('p', { class: 'topic__empty' }, 'No tools here yet.'));
  }

  function toolCard(tool, topic) {
    const key = `${topic.slug}--${tool.id}`;
    const embeddable = Boolean(tool.can_embed && tool.embed_url);
    return h('article', {
      class: tool.kind === 'original' ? 'card card--original' : 'card',
      id: key,
      'aria-labelledby': `${key}-title`,
    },
    cardHead(tool, key),
    embeddable ? embedStage(tool) : h('div', { class: 'stage stage--link' }, preview(tool, tool.embed_note)),
    notes(tool, 'My notes'),
    controls(tool),
    h('footer', { class: 'card__foot' },
      h('a', { class: 'link', href: localHref(tool.url), target: '_blank', rel: 'noopener noreferrer' }, 'Open full page ↗'),
      embeddable && h('div', { class: 'card__actions' },
        h('button', { class: 'link-btn', type: 'button', dataset: { action: 'unload' } }, 'Unload'),
        h('button', { class: 'link-btn', type: 'button', dataset: { action: 'expand' }, 'aria-pressed': 'false' }, 'Expand'))));
  }

  function plannedCard(tool, topic, topicsById) {
    const key = `${topic.slug}--${tool.id}`;
    const pairs = tool.topics.map((id) => topicsById.get(id)).filter(Boolean);
    return h('article', { class: 'card card--original card--planned', id: key, 'aria-labelledby': `${key}-title` },
      h('span', { class: 'ribbon' }, 'Coming soon'),
      cardHead(tool, key),
      h('div', { class: 'stage stage--planned' },
        tool.verifies && [
          h('p', { class: 'eyebrow' }, 'Will verify'),
          h('p', { class: 'planned__check' }, math(tool.verifies)),
        ],
        pairs.length > 0 && h('p', { class: 'planned__pairs' }, 'Pairs with ',
          joinNodes(pairs.map((t) => h('a', { href: `#${t.slug}` }, `§${t.id} ${t.short || t.title}`)), ', '))),
      notes(tool, 'Plan'),
      controls(tool),
      h('footer', { class: 'card__foot' },
        h('a', { class: 'link link--stub', href: localHref(tool.url), title: 'Not built yet: this folder is a placeholder' }, `/${tool.url}`),
        h('span', { class: 'card__status' }, 'Not built yet')));
  }

  function cardHead(tool, key) {
    const original = tool.kind === 'original';
    return h('header', { class: 'card__head' },
      h('div', { class: 'card__titles' },
        h('h3', { class: 'card__title', id: `${key}-title` }, tool.name),
        h('p', { class: 'card__source' },
          h('span', { class: 'card__icon', 'aria-hidden': 'true' }, original ? '📐' : '🌐'),
          h('span', { class: 'sr-only' }, original ? 'Original sim: ' : 'External tool: '),
          tool.source)),
      h('div', { class: 'card__badges' },
        tool.recommended_first && h('span', { class: 'badge badge--start' }, h('span', { 'aria-hidden': 'true' }, '⚡'), 'Start here'),
        tool.gap_filler && h('span', { class: 'badge', title: 'Covers something none of the external tools show' }, 'Gap-filler'),
        h('span', { class: 'badge badge--license', title: 'License' }, tool.license)));
  }

  function notes(tool, label) {
    return h('div', { class: 'notes' },
      h('p', { class: 'eyebrow' }, label,
        tool.todo && h('span', { class: 'pill--draft', title: `Draft: ${tool.todo}` }, 'draft')),
      h('p', { class: 'notes__body' }, tool.my_note));
  }

  function controls(tool) {
    return tool.controls && h('details', { class: 'controls' },
      h('summary', null, 'Controls'),
      h('p', null, tool.controls));
  }

  function preview(tool, reason, extra) {
    return h('div', { class: 'preview' },
      h('p', { class: 'preview__title' }, tool.name),
      h('p', { class: 'preview__meta' }, `${tool.source} · ${hostOf(tool.url)}`),
      reason && h('p', { class: 'preview__reason' }, reason),
      h('div', { class: 'preview__actions' },
        h('a', { class: 'btn btn--primary', href: localHref(tool.url), target: '_blank', rel: 'noopener noreferrer' }, 'Open in new tab →'),
        extra));
  }

  // A faint sine across the poster; each tool gets its own wavelength and phase.
  function waveArt(seed) {
    let hash = 0;
    for (const ch of seed) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
    const cycles = 1.5 + (hash % 4) * 0.5;
    const phase = ((hash >>> 3) % 8) * (Math.PI / 4);
    const points = [];
    for (let i = 0; i <= 120; i++) {
      const u = i / 120;
      points.push(`${(u * 400).toFixed(1)},${(40 - 26 * Math.sin(u * cycles * 2 * Math.PI + phase)).toFixed(1)}`);
    }
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'stage__art');
    svg.setAttribute('viewBox', '0 0 400 80');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const axis = document.createElementNS(SVG_NS, 'line');
    for (const [name, value] of [['x1', 0], ['y1', 40], ['x2', 400], ['y2', 40]]) axis.setAttribute(name, value);
    const curve = document.createElementNS(SVG_NS, 'polyline');
    curve.setAttribute('points', points.join(' '));
    for (const el of [axis, curve]) el.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(axis, curve);
    return svg;
  }

  /* ---------- embeds ---------- */

  function embedStage(tool, { manual = false } = {}) {
    const stage = h('div', { class: 'stage stage--embed', dataset: manual ? { state: 'idle', manual: 'true' } : { state: 'idle' } });
    stage.append(h('div', { class: 'stage__poster' },
      waveArt(tool.id),
      h('p', { class: 'stage__host' }, hostOf(tool.embed_url)),
      h('button', { class: 'btn btn--primary', type: 'button', onclick: () => mountEmbed(stage) }, '▶︎ Load simulation'),
      h('p', { class: 'stage__hint' }, 'Runs live, right in this card')));
    stageTools.set(stage, tool);
    return stage;
  }

  function mountEmbed(stage) {
    if (stage.dataset.state !== 'idle') return;
    const tool = stageTools.get(stage);
    const src = localHref(tool.embed_url);
    const external = isExternal(src);

    stage.closest('.card')?.classList.add('has-embed');
    stage.querySelector('.stage__poster')?.remove();

    const blocker = !navigator.onLine && external ? 'You seem to be offline.'
      : location.protocol === 'https:' && /^http:/i.test(src) ? 'Browsers block http:// pages inside an https:// site.'
      : null;
    if (blocker) {
      showFallback(stage, tool, blocker, { final: true });
      return;
    }

    const frame = h('iframe', {
      src,
      title: `${tool.name} (interactive simulation)`,
      allow: 'fullscreen; autoplay; clipboard-write',
      allowfullscreen: true,
      referrerpolicy: 'strict-origin-when-cross-origin',
      sandbox: external ? SANDBOX : null,
    });

    // No `load` within the timeout: show the preview card on top, but keep the
    // iframe loading underneath. If it finishes later, the card steps aside.
    const timer = setTimeout(() => {
      if (stage.dataset.state === 'loading') {
        showFallback(stage, tool, 'Still loading after 3 seconds. The site may just be slow, or it may refuse to be embedded.');
      }
    }, EMBED_TIMEOUT_MS);

    frame.addEventListener('load', () => {
      clearTimeout(timer);
      if (!frame.isConnected) return;
      stage.dataset.state = 'loaded';
      stage.querySelector('.stage__fallback')?.remove();
    });

    stage.dataset.state = 'loading';
    stage.append(frame, h('span', { class: 'stage__status', 'aria-hidden': 'true' }, 'Loading…'));
  }

  function showFallback(stage, tool, reason, { final = false } = {}) {
    stage.querySelector('.stage__fallback')?.remove();
    stage.dataset.state = final ? 'failed' : 'slow';
    const overlay = h('div', { class: 'stage__fallback', role: 'status' });
    overlay.append(preview(tool, reason,
      !final && h('button', { class: 'btn btn--quiet', type: 'button', onclick: () => overlay.remove() }, 'Keep waiting')));
    stage.append(overlay);
  }

  function unloadEmbed(card) {
    const stage = card.querySelector('.stage--embed');
    // `manual` keeps auto-load from immediately loading it again.
    stage.replaceWith(embedStage(stageTools.get(stage), { manual: true }));
    card.classList.remove('has-embed');
  }

  function toggleWide(card, button) {
    const wide = card.classList.toggle('card--wide');
    button.setAttribute('aria-pressed', String(wide));
    button.textContent = wide ? 'Collapse' : 'Expand';
    requestAnimationFrame(() => card.scrollIntoView({ block: 'nearest', behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
  }

  const autoloadObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const stage = entry.target;
        if (autoload && entry.isIntersecting && stage.dataset.state === 'idle' && !stage.dataset.manual) mountEmbed(stage);
      }
    }, { rootMargin: '200px 0px' })
    : null;

  /* ---------- navigation ---------- */

  function watchSections(sections) {
    if (!('IntersectionObserver' in window)) return;
    const links = [...document.querySelectorAll('#toc a')];
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      const current = sections.find((section) => visible.has(section));
      for (const link of links) {
        if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }, { rootMargin: '-72px 0px -55% 0px' });
    for (const section of sections) observer.observe(section);
  }

  // Sections are rendered after load, so the browser's own jump to #hash misses them.
  // Web fonts then reflow the page, so land again once they're in (unless the reader scrolled).
  function jumpToHash() {
    if (location.hash.length < 2) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    target.scrollIntoView({ block: 'start', behavior: 'instant' });
    const landedAt = window.scrollY;
    document.fonts?.ready.then(() => {
      if (Math.abs(window.scrollY - landedAt) < 2) target.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }

  function setMenu(open) {
    const button = document.querySelector('.menu-btn');
    document.body.classList.toggle('menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close topics menu' : 'Open topics menu');
  }

  function showLoadError(root, err) {
    console.error('[workbench]', err);
    root.append(h('div', { class: 'notice', role: 'alert' },
      h('p', null, h('strong', null, 'The tool list didn’t load.')),
      h('p', null, IS_FILE
        ? 'Opened from disk, this page reads tools.js. Make sure it sits next to index.html, or regenerate it with: node scripts/sync-data.mjs'
        : 'Couldn’t fetch tools.json. Check that it’s deployed next to index.html and is valid JSON.')));
  }

  /* ---------- init ---------- */

  function init() {
    const root = document.getElementById('topics');

    paintThemeButton();
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    darkQuery.addEventListener('change', paintThemeButton);

    document.querySelector('.menu-btn').addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    document.getElementById('sidebar').addEventListener('click', (event) => {
      if (event.target.closest('a[href^="#"]')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenu(false);
    });

    const autoloadBox = document.getElementById('autoload');
    autoloadBox.checked = autoload;
    autoloadBox.addEventListener('change', () => {
      autoload = autoloadBox.checked;
      store.set(AUTOLOAD_KEY, autoload ? 'on' : null);
      if (!autoload || !autoloadObserver) return;
      // Re-observing makes the observer report stages that are already on screen.
      for (const stage of root.querySelectorAll('.stage--embed[data-state="idle"]')) {
        autoloadObserver.unobserve(stage);
        autoloadObserver.observe(stage);
      }
    });

    root.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const card = button.closest('.card');
      if (button.dataset.action === 'expand') toggleWide(card, button);
      else if (button.dataset.action === 'unload') unloadEmbed(card);
    });

    if (IS_FILE) document.getElementById('file-mode-note').hidden = false;

    loadData()
      .then((data) => render(data, root))
      .catch((err) => showLoadError(root, err));
  }

  init();
})();
