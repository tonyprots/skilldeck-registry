/**
 * Общее для скриптов, которые ходят в GitHub: запросы с токеном и ожиданием
 * лимитов, разбор фронтматтера чужого SKILL.md, лицензия. Используют
 * intake.mjs (приём одного скилла), discover.mjs (сборщик кандидатов) и
 * github-stats.mjs (снимок звёзд).
 *
 * Токен — из GITHUB_TOKEN (локально: GITHUB_TOKEN=$(gh auth token)); без него
 * лимит 60 запросов в час, а GraphQL и поиск кода не работают вовсе.
 */
import matter from 'gray-matter';

export const API = 'https://api.github.com';
export const RAW = 'https://raw.githubusercontent.com';

export const githubHeaders = (agent = 'skilldeck') => ({
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': agent,
  ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * fetch с повтором: исчерпанный лимит — ждём до сброса (x-ratelimit-reset),
 * вторичный лимит — retry-after или минуту, 5xx и сетевые сбои — короткая пауза.
 * 404 и прочие 4xx — сразу ошибка: повтор их не исправит.
 */
export async function ghFetch(url, { agent, method = 'GET', body, tries = 6, log = console.error } = {}) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(url, { method, body, headers: { ...githubHeaders(agent), ...(body && { 'Content-Type': 'application/json' }) } });
    } catch (err) {
      if (attempt >= tries) throw err;
      await sleep(2000 * attempt);
      continue;
    }
    const remaining = res.headers.get('x-ratelimit-remaining');
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    if (res.ok) {
      // Последний запрос окна: дальше ждать сброса, а не ловить 403 (поиск кода — 10 в минуту).
      if (remaining === '0' && reset) await sleep(Math.max(reset * 1000 - Date.now() + 1000, 0));
      return res;
    }
    const retryAfter = Number(res.headers.get('retry-after'));
    let wait = 0;
    if ((res.status === 403 || res.status === 429) && remaining === '0' && reset) wait = reset * 1000 - Date.now() + 2000;
    else if ((res.status === 403 || res.status === 429) && retryAfter) wait = retryAfter * 1000;
    else if (res.status === 403 || res.status === 429) wait = 60_000;
    else if (res.status >= 500) wait = 3000 * attempt;
    if (!wait || attempt >= tries) throw Object.assign(new Error(`${res.status} ${url}`), { status: res.status });
    log(`  лимит GitHub (${res.status}), жду ${Math.ceil(wait / 1000)} с`);
    await sleep(Math.max(wait, 1000));
  }
}

export const ghGet = async (url, as = 'json', opts) => {
  const res = await ghFetch(url.startsWith('http') ? url : `${API}${url}`, opts);
  return as === 'json' ? res.json() : res.text();
};

/** GraphQL; частичные ошибки (NOT_FOUND у одного из алиасов) не роняют запрос. */
export async function ghGraphQL(query, opts) {
  // Большой ответ иногда рвётся на чтении тела (undici: terminated) — повторяем запрос целиком.
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await ghFetch(`${API}/graphql`, { ...opts, method: 'POST', body: JSON.stringify({ query }) });
      const json = await res.json();
      if (!json.data) throw new Error(`GraphQL: ${JSON.stringify(json.errors ?? json).slice(0, 300)}`);
      return json;
    } catch (err) {
      if (attempt >= 3 || err.status) throw err;
      await sleep(3000 * attempt);
    }
  }
}

export const SKILL_FILE = /(^|\/)SKILL\.md$/;
export const dirOf = (p) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');

/**
 * Фронтматтер чужого SKILL.md. Он бывает невалидным YAML (двоеточие без
 * кавычек в description): Claude Code такое грузит, gray-matter падает —
 * тогда name и description достаём регуляркой и отмечаем это в spec.
 */
export function readSkillFrontmatter(text) {
  const spec = [];
  let fm;
  try {
    fm = matter(text).data;
  } catch {
    spec.push('фронтматтер SKILL.md — невалидный YAML');
    const head = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    fm = Object.fromEntries([...head.matchAll(/^(name|description):\s*(.*)$/gm)].map((m) => [m[1], m[2].trim()]));
  }
  return { fm: fm ?? {}, spec };
}

/** Спецификация Agent Skills: name совпадает с папкой, a-z0-9 через дефис, description до 1024. */
export function specIssues(fm, folder) {
  const spec = [];
  if (!fm.name) spec.push('нет name');
  else if (fm.name !== folder) spec.push(`name «${fm.name}» не совпадает с папкой «${folder}»`);
  if (fm.name && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) spec.push('name не в формате a-z0-9 через дефис');
  if (!fm.description) spec.push('нет description');
  else if (String(fm.description).length > 1024) spec.push(`description длиннее 1024 (${String(fm.description).length})`);
  return spec;
}

/** Лицензия репозитория по SPDX от GitHub; NOASSERTION (файл есть, не распознан) — как «нет». */
export const repoLicense = (spdx) => (spdx && spdx !== 'NOASSERTION' ? spdx : 'none');

/** Файл LICENSE в папке скилла важнее лицензии репозитория. */
export const LICENSE_FILE = /^LICEN[CS]E(\.\w+)?$/i;
export function licenseFromText(text, fallback) {
  if (/Apache License/i.test(text)) return 'Apache-2.0';
  if (/MIT License|Permission is hereby granted, free of charge/i.test(text)) return 'MIT';
  if (/Attribution-ShareAlike 4\.0/i.test(text)) return 'CC-BY-SA-4.0';
  if (/proprietary|All rights reserved/i.test(text)) return 'proprietary';
  return fallback;
}
