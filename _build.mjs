/**
 * Build the static site.
 *
 * The legal and support pages are generated from the markdown in `docs/`, which
 * is their single source of truth. Keeping a second editable copy here caused a
 * real hazard: a placeholder substitution could apply to one copy and not the
 * other, publishing a page that still said [LEGAL_NAME].
 *
 * Only the landing page has its own fragment, because it is site-specific.
 */
import { readFileSync, writeFileSync, readdirSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');

// Assets may come from the main repo, or sit alongside the site in a split-out
// site repository. Try both so one build script serves both layouts.
const iconCandidates = [
  join(here, 'assets', 'icon-48.png'),            // split-out site repo
  join(ROOT, 'app', 'public', 'icons', 'icon-48.png'), // inside the main repo
];
const iconPath = iconCandidates.find(existsSync);
if (!iconPath) throw new Error('icon-48.png not found in either the app or site assets');
const LOGO = 'data:image/png;base64,' + readFileSync(iconPath).toString('base64');

const shotDirs = [join(here, 'assets', 'screenshots'), join(ROOT, 'growth', 'screenshots'), join(here, 'shots')];
const shotDir = shotDirs.find(existsSync);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Inline markdown: code, bold, links, and bracketed placeholders. */
function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\[([^\]]+)\]\((mailto:[^)]+|https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(?<!["'>])\[([A-Z_]+)\](?!\()/g, '<span class="placeholder">[$1]</span>');
  // Turn bare email addresses into working mailto: links. Done last, and only
  // outside an existing href or anchor text, so an explicit markdown link is
  // never double-wrapped. Both add-on stores expect a reachable support contact.
  out = out.replace(
    /(?<![">:\w.+-])([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
    '<a href="mailto:$1">$1</a>');
  return out;
}

/** Small block-level markdown subset: headings, lists, tables, paragraphs. */
function markdownToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    // Drop the draft banner - it is an instruction to the owner, not to readers.
    if (line.startsWith('> ')) { while (i < lines.length && lines[i].startsWith('> ')) i++; continue; }

    if (line.startsWith('## ')) { out.push(`<h2>${inline(line.slice(3).trim())}</h2>`); i++; continue; }
    if (line.startsWith('### ')) { out.push(`<h3>${inline(line.slice(4).trim())}</h3>`); i++; continue; }
    if (line.startsWith('# ')) { i++; continue; } // page H1 comes from the fragment metadata

    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(`<li>${inline(lines[i].slice(2).trim())}</li>`); i++; }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i]); i++; }
      const cells = (r) => r.split('|').slice(1, -1).map((c) => c.trim());
      const body = rows
        .filter((r) => !/^\|[\s:|-]+\|$/.test(r))
        .map((r, idx) => {
          const tag = idx === 0 ? 'th' : 'td';
          return `<tr>${cells(r).map((c) => `<${tag}>${inline(c)}</${tag}>`).join('')}</tr>`;
        });
      out.push(`<table>${body.join('')}</table>`);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^([-*] |#{1,3} |\||> )/.test(lines[i])) {
      para.push(lines[i].trim());
      i++;
    }
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

/**
 * depth 0 = site root, depth 1 = a page in its own directory.
 * chrome 'minimal' strips the nav: the upgrade page exists so that someone who
 * has decided to pay can pay, and every extra link is a way to not do that.
 */
const shell = (title, desc, body, depth = 0, chrome = 'full') => {
  const up = depth === 0 ? '' : '../';
  const header = chrome === 'minimal'
    ? `<header class="site bare"><div class="wrap">
  <a class="brand" href="${up}"><img class="logo" src="${LOGO}" alt=""><strong>SheetFill</strong></a>
</div></header>`
    : `<header class="site"><div class="wrap">
  <a class="brand" href="${up}"><img class="logo" src="${LOGO}" alt=""><strong>SheetFill</strong></a>
  <nav>
    <a href="${up}">Home</a>
    <a href="${up}support/">Help</a>
    <a href="${up}privacy/">Privacy</a>
    <a href="${up}terms/">Terms</a>
  </nav>
</div></header>`;
  const footer = chrome === 'minimal'
    ? `<footer class="site bare"><div class="wrap">
  <nav><a href="${up}privacy/">Privacy</a><a href="${up}terms/">Terms</a><a href="${up}support/">Help</a></nav>
</div></footer>`
    : `<footer class="site"><div class="wrap">
  <nav>
    <a href="${up}">Home</a><a href="${up}support/">Help</a>
    <a href="${up}privacy/">Privacy</a><a href="${up}terms/">Terms</a>
  </nav>
  <div>SheetFill fills web forms from your spreadsheet. Your data never leaves your computer.</div>
</div></footer>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<link rel="icon" href="${LOGO}">
<link rel="stylesheet" href="${up}style.css">
</head>
<body>
${header}
${body}
${footer}
</body></html>`;
};

// --- pages generated from docs/ (single source of truth) --------------------
const fromDocs = [
  { out: 'privacy/index.html', src: 'docs/PRIVACY_DRAFT.md', title: 'SheetFill — Privacy Policy',
    desc: 'SheetFill runs entirely on your computer. Your spreadsheet is never uploaded.',
    h1: 'Privacy Policy', lede: 'SheetFill runs entirely on your computer. Your spreadsheet is never uploaded.' },
  { out: 'terms/index.html', src: 'docs/TERMS_DRAFT.md', title: 'SheetFill — Terms of Service',
    desc: 'The terms governing your use of SheetFill.',
    h1: 'Terms of Service', lede: 'Plain terms for a small tool.' },
  { out: 'support/index.html', src: 'docs/SUPPORT.md', title: 'SheetFill — Help',
    desc: 'Answers to the common SheetFill questions, and how to get in touch.',
    h1: 'Help', lede: 'Most problems have a one-line answer.' },
];

// docs/ may live one level up (main repo) or beside the site (split repo).
const docsRoot = existsSync(join(here, 'docs')) ? here : ROOT;

for (const p of fromDocs) {
  const md = readFileSync(join(docsRoot, p.src), 'utf8');
  let inner = markdownToHtml(md);

  // An unfilled contact address must not become a broken mailto: link.
  inner = inner.replace(/<a href="mailto:\[([A-Z_]+)\]">[^<]*<\/a>/g,
                        (_m, t) => `<span class="placeholder">[${t}]</span>`);

  const notice = /\[[A-Z_]+\]/.test(inner)
    ? '<p class="pending">Some details on this page are still being finalised and are shown in ' +
      'brackets. They will be completed before the extension is published to the add-on stores.</p>'
    : '';

  const body = `<div class="wrap legal">\n<h1>${p.h1}</h1>\n<p class="lede">${p.lede}</p>\n${notice}\n${inner}\n</div>`;
  mkdirSync(join(here, dirname(p.out)), { recursive: true });
  writeFileSync(join(here, p.out), shell(p.title, p.desc, body, 1));
  console.log('  ' + p.out);
}

// --- pages with their own fragment ------------------------------------------
for (const f of readdirSync(join(here, 'pages'))) {
  const raw = readFileSync(join(here, 'pages', f), 'utf8');
  const [meta, ...rest] = raw.split('\n---\n');
  const metaObj = JSON.parse(meta);
  const { title, description } = metaObj;
  const meta_ = metaObj;
  const name = f.replace('.frag.html', '.html');
  let body = rest.join('\n---\n');

  // Pages go live before the stores approve and before the checkout variants
  // exist, so any CTA whose URL is still a token must render as a disabled
  // button rather than publish a link that goes nowhere.
  body = body.replace(
    /<a class="([^"]*)" href="\[([A-Z_]+)\]">([^<]*)<\/a>/g,
    (_m, cls, token, text) => {
      const label =
        token === 'EDGE_LISTING_URL' ? 'Edge — coming soon'
        : token === 'AMO_LISTING_URL' ? 'Firefox — coming soon'
        : `${text} — coming soon`;
      return `<span class="${cls} disabled" aria-disabled="true">${label}</span>`;
    });

  const depth = meta_.dir ? 1 : 0;
  const out = meta_.dir ? join(meta_.dir, 'index.html') : name;
  if (meta_.dir) mkdirSync(join(here, meta_.dir), { recursive: true });
  writeFileSync(join(here, out), shell(title, description, body, depth, meta_.chrome ?? 'full'));
  console.log('  ' + out);
}

// --- screenshots -------------------------------------------------------------
const shotsOut = join(here, 'shots');
if (shotDir && shotDir !== shotsOut) {
  mkdirSync(shotsOut, { recursive: true });
  for (const f of readdirSync(shotDir)) copyFileSync(join(shotDir, f), join(shotsOut, f));
}
console.log('site built');
