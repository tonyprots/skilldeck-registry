#!/usr/bin/env node
/**
 * Сборщик кандидатов в каталог (дорожка А1): находит скиллы на GitHub и пишет
 * candidates.json. Карточек не заводит — решение, кого брать, за человеком.
 *
 *   GITHUB_TOKEN=$(gh auth token) npm run discover -- [--min-stars 100] [--max-skills 100] [--code-pages 100] [--fresh]
 *   npm run discover -- --md-only    # только пересобрать сводку candidates.md из candidates.json
 *
 * Источники:
 *   - карточки реестра (их репозитории сканируются всегда — для сверки);
 *   - известные сборники из CONFIG.collections;
 *   - awesome-списки из CONFIG.awesomeLists: ссылки на репозитории из README;
 *   - поиск репозиториев по темам GitHub (сортировка по звёздам, срезы по звёздам);
 *   - поиск кода `filename:SKILL.md`, срезы по размеру файла. Поиск кода отдаёт
 *     не больше 1000 результатов на запрос и 10 запросов в минуту, а файлов
 *     миллионы — это выборка, не перепись; --code-pages задаёт бюджет страниц.
 *
 * Репозитории вне реестра и сборников берутся от --min-stars звёзд и не форки;
 * в которых больше --max-skills SKILL.md — зеркала и свалки (бывает и 30 тыс.):
 * их не разбираем, а перечисляем в сводке, чтобы человек решил сам.
 * У каждого — дерево на голове ветки по умолчанию, все SKILL.md в нём, их
 * фронтматтер (тем же разбором, что в intake.mjs). Копии одного скилла под
 * разных агентов (.claude/skills, .codex/skills, plugins/…) в одном репозитории
 * сливаются в одну запись с `variants`; одинаковые SKILL.md в разных
 * репозиториях — в одну с `copies`. Звёзды и дата коммита — у репозитория.
 *
 * Кэш деревьев и разобранных SKILL.md — в .cache/discover.json (ключ — коммит,
 * поэтому повторный прогон дешёвый); выдача поиска кода живёт в кэше сутки.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { loadRegistry, ROOT } from './lib.mjs';
import { ghGet, ghGraphQL, SKILL_FILE, dirOf, readSkillFrontmatter, specIssues, repoLicense, LICENSE_FILE, licenseFromText } from './github.mjs';

const CONFIG = {
  // Репозитории-сборники скиллов: сканируются целиком, без порога звёзд.
  collections: [
    'anthropics/skills',
    'anthropics/claude-plugins-official',
    'anthropics/claude-code',
    'openai/skills',
    'obra/superpowers',
    'mattpocock/skills',
    'vercel-labs/agent-skills',
    'vercel-labs/skills',
    'huggingface/skills',
    'K-Dense-AI/scientific-agent-skills',
    'wshobson/agents',
    'trailofbits/skills',
    'alirezarezvani/claude-skills',
    'Jeffallan/claude-skills',
    'coreyhaines31/marketingskills',
    'nextlevelbuilder/ui-ux-pro-max-skill',
    'github/awesome-copilot',
    'google/skills',
    'microsoft/skills',
    'google-gemini/gemini-skills',
    'dotnet/skills',
    'cloudflare/skills',
    'supabase/agent-skills',
    'stripe/ai',
    'expo/skills',
    'remotion-dev/skills',
    'getsentry/skills',
    'callstackincubator/agent-skills',
    'hashicorp/agent-skills',
    'posit-dev/skills',
    'neondatabase/agent-skills',
    'firecrawl/skills',
  ],
  // Сборники чужих скиллов: при одинаковых SKILL.md главной считается копия не отсюда.
  // По умолчанию они ещё и больше --max-skills, поэтому не разбираются вовсе.
  aggregators: ['sickn33/agentic-awesome-skills', 'davila7/claude-code-templates', 'ComposioHQ/awesome-claude-skills'],
  // Больше стольких скиллов в репозитории (после слияния копий) — тоже сборник.
  aggregatorSkills: 100,
  // Awesome-списки: берём ссылки на репозитории из README.
  awesomeLists: [
    'ComposioHQ/awesome-claude-skills',
    'VoltAgent/awesome-agent-skills',
    'travisvn/awesome-claude-skills',
    'hesreallyhim/awesome-claude-code',
    'BehiSecc/awesome-claude-skills',
    'heilcheng/awesome-agent-skills',
    'skillmatic-ai/awesome-agent-skills',
    'karanb192/awesome-claude-skills',
  ],
  topics: [
    'agent-skills', 'claude-skills', 'claude-code-skills', 'claude-skill', 'claude-code-skill',
    'agent-skill', 'codex-skills', 'skill-md', 'agentskills', 'anthropic-skills',
  ],
  // Срезы поиска кода по размеру SKILL.md в байтах: у каждого среза своя тысяча результатов.
  // Сводка candidates.md: столько строк топа и не больше стольких скиллов из одного репозитория.
  mdTop: 100,
  mdPerRepo: 3,
  codeSizes: ['0..1500', '1501..3000', '3001..4500', '4501..6000', '6001..8000', '8001..10000',
    '10001..13000', '13001..17000', '17001..25000', '25001..400000'],
};

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const MIN_STARS = Number(opt('--min-stars', 100));
const MAX_SKILLS = Number(opt('--max-skills', 100));
const CODE_PAGES = Number(opt('--code-pages', 100));
const FRESH = args.includes('--fresh');
const OUT = resolve(ROOT, opt('--out', 'candidates.json'));
const MD_OUT = OUT.replace(/\.json$/, '.md');

/**
 * Сводка для ручного отбора пачками: топ по звёздам среди того, чего нет
 * в реестре, без архивных и без description; из одного репозитория — не
 * больше CONFIG.mdPerRepo скиллов, чтобы топ не съел один большой набор.
 */
function writeMd(d) {
  const cell = (t) => String(t ?? '').replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim();
  const cut = (t, n) => (t.length > n ? `${t.slice(0, t.lastIndexOf(' ', n) > n * 0.6 ? t.lastIndexOf(' ', n) : n).replace(/[\s,.;:—-]+$/, '')}…` : t);
  const url = (c) => `https://github.com/${c.repo}${c.path === '.' ? '' : `/tree/HEAD/${c.path}`}`;
  const perRepo = new Map();
  for (const c of d.items) perRepo.set(c.repo, (perRepo.get(c.repo) ?? 0) + 1);
  const shown = new Map();
  const top = [];
  for (const c of d.items) {
    if (top.length >= CONFIG.mdTop) break;
    if (c.in_registry || c.archived || !c.description) continue;
    if ((shown.get(c.repo) ?? 0) >= CONFIG.mdPerRepo) continue;
    shown.set(c.repo, (shown.get(c.repo) ?? 0) + 1);
    top.push(c);
  }
  const reg = [...new Set(d.items.filter((c) => c.in_registry).map((c) => c.in_registry))].sort();
  const repos = perRepo.size;
  const rows = top.map((c, i) => {
    const first = shown.get(c.repo) && top.findIndex((x) => x.repo === c.repo) === i;
    const repoCell = `\`${c.repo}\`${first && perRepo.get(c.repo) > 1 ? ` (всего ${perRepo.get(c.repo)})` : ''}`;
    return `| ${i + 1} | [${cell(c.name || c.path)}](${url(c)}) | ${repoCell} | ${cut(cell(c.description), 160)} | ${c.stars.toLocaleString('ru-RU')} | ${c.last_commit} | ${c.license} |`;
  });
  writeFileSync(MD_OUT, `# Кандидаты в каталог

Сводка \`candidates.json\` на ${d.generated}: ${d.candidates.toLocaleString('ru-RU')} кандидатов из ${repos.toLocaleString('ru-RU')} репозиториев, порог ★${d.min_stars}. Полный список с описаниями и путями — в \`candidates.json\`. Пересобрать всё: \`GITHUB_TOKEN=$(gh auth token) npm run discover\`; только эту сводку: \`npm run discover -- --md-only\`.

Уже в реестре (${reg.length}): ${reg.join(', ')}.

## Топ-${top.length} вне реестра

По звёздам репозитория — у отдельного скилла их нет. Из одного репозитория не больше ${CONFIG.mdPerRepo} скиллов, остальные — в \`candidates.json\`. Архивные репозитории и скиллы без description сюда не попадают.

| # | Скилл | Репозиторий | Описание | ★ | Коммит | Лицензия |
|---|---|---|---|---|---|---|
${rows.join('\n')}
`);
}
if (args.includes('--md-only')) {
  writeMd(JSON.parse(readFileSync(OUT, 'utf8')));
  console.error(`${MD_OUT}: сводка пересобрана`);
  process.exit(0);
}
if (!process.env.GITHUB_TOKEN) {
  console.error('Нужен GITHUB_TOKEN: GITHUB_TOKEN=$(gh auth token) npm run discover');
  process.exit(2);
}

const log = (...a) => console.error(...a);
const opts = { agent: 'skilldeck-discover', log };
const today = new Date().toLocaleDateString('sv-SE');
const VALID = /^[\w.-]+\/[\w.-]+$/;

async function pool(items, size, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) { const k = i++; await fn(items[k], k); }
  }));
}
const chunks = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));

// ---------- кэш ----------
const CACHE_FILE = join(ROOT, '.cache', 'discover.json');
const cache = !FRESH && existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf8')) : {};
cache.search ??= {};
cache.trees ??= {};
cache.files ??= {};
const used = { trees: new Set(), files: new Set() };
function saveCache(final = false) {
  mkdirSync(join(ROOT, '.cache'), { recursive: true });
  const out = { search: Object.fromEntries(Object.entries(cache.search).filter(([, v]) => v.date === today)) };
  // В конце прогона оставляем только то, что пригодилось: старые коммиты не копятся.
  for (const k of ['trees', 'files']) out[k] = final ? Object.fromEntries([...used[k]].filter((x) => cache[k][x]).map((x) => [x, cache[k][x]])) : cache[k];
  writeFileSync(CACHE_FILE, JSON.stringify(out));
}

// ---------- 1. откуда брать репозитории ----------
const repos = new Map(); // ключ — owner/repo в нижнем регистре
function addRepo(full, source, { path } = {}) {
  full = full.replace(/\.git$/, '').replace(/\.+$/, '');
  if (!VALID.test(full)) return;
  const key = full.toLowerCase();
  const r = repos.get(key) ?? { full, sources: new Set(), hits: new Set() };
  r.sources.add(source);
  if (path !== undefined) r.hits.add(path);
  repos.set(key, r);
}

// Реестр: по нему сверяемся, поэтому его репозитории сканируем всегда.
const registry = loadRegistry({ withRuns: false, withDrafts: true });
const regEntries = registry.entries.flatMap((e) => [e, ...(e.members ?? [])]).filter((e) => e.source && (e.source.host ?? 'github') === 'github');
const regIndex = new Map(regEntries.map((e) => [`${e.source.repo.toLowerCase()}:${e.source.path ?? '.'}`, e.name]));
for (const e of regEntries) addRepo(e.source.repo, 'registry');
log(`реестр: ${regEntries.length} карточек с GitHub`);

for (const r of CONFIG.collections) addRepo(r, 'collection');

const NOT_REPO_OWNERS = new Set(['sponsors', 'topics', 'orgs', 'features', 'marketplace', 'apps', 'settings', 'login', 'about',
  'pricing', 'collections', 'trending', 'explore', 'site', 'contact', 'security', 'enterprise', 'customer-stories', 'readme', 'users', 'search']);
for (const list of CONFIG.awesomeLists) {
  try {
    const { content } = await ghGet(`/repos/${list}/readme`, 'json', opts);
    const text = Buffer.from(content, 'base64').toString('utf8');
    let n = 0;
    for (const m of text.matchAll(/https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/g)) {
      if (NOT_REPO_OWNERS.has(m[1].toLowerCase())) continue;
      addRepo(`${m[1]}/${m[2]}`, `awesome:${list}`);
      n++;
    }
    addRepo(list, `awesome:${list}`);
    log(`awesome ${list}: ${n} ссылок`);
  } catch (err) {
    log(`awesome ${list}: ${err.message}`);
  }
}

// Поиск репозиториев по темам: срезы по звёздам, чтобы не упереться в 1000 на запрос.
const cuts = [...new Set([1000, 300, 100, 50, 20, 10, 5, 0].filter((c) => c > MIN_STARS).concat(MIN_STARS))].sort((a, b) => b - a);
const starRanges = cuts.map((c, i) => (i === 0 ? `>=${c}` : `${c}..${cuts[i - 1] - 1}`));
for (const topic of CONFIG.topics) {
  let n = 0;
  for (const range of starRanges) {
    for (let page = 1; page <= 10; page++) {
      const q = `topic:${topic} stars:${range}`;
      let res;
      try {
        res = await ghGet(`/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=100&page=${page}`, 'json', opts);
      } catch (err) {
        log(`  ${q} стр. ${page}: ${err.message}`);
        break;
      }
      if (page === 1 && res.total_count > 1000) log(`  ${q}: ${res.total_count} — дальше 1000 не видно`);
      for (const it of res.items) if (!it.fork) { addRepo(it.full_name, 'topic'); n++; }
      if (res.items.length < 100) break;
    }
  }
  log(`тема ${topic}: ${n}`);
}

// Поиск кода: выборка по срезам размера в пределах бюджета страниц.
let codePages = 0;
codeSearch: for (const size of CONFIG.codeSizes) {
  for (let page = 1; page <= 10; page++) {
    if (codePages >= CODE_PAGES) break codeSearch;
    const q = `filename:SKILL.md size:${size}`;
    const key = `${q}|${page}`;
    let hits = cache.search[key]?.date === today ? cache.search[key].hits : null;
    if (!hits) {
      try {
        const res = await ghGet(`/search/code?q=${encodeURIComponent(q)}&per_page=100&page=${page}`, 'json', opts);
        hits = res.items.map((it) => [it.repository.full_name, it.path]);
      } catch (err) {
        log(`  ${key}: ${err.message}`);
        break;
      }
      cache.search[key] = { date: today, hits };
      saveCache();
    }
    codePages++;
    for (const [full, p] of hits) if (SKILL_FILE.test(p)) addRepo(full, 'code-search', { path: p });
    if (hits.length < 100) break;
  }
}
log(`поиск кода: ${codePages} страниц, всего репозиториев ${repos.size}`);

// ---------- 2. метаданные репозиториев одним GraphQL на 50 штук ----------
const meta = new Map(); // ключ из repos → данные GitHub
const FIELDS = 'nameWithOwner stargazerCount isFork isArchived licenseInfo { spdxId } defaultBranchRef { target { ... on Commit { oid committedDate } } }';
let metaDone = 0;
await pool(chunks([...repos.keys()], 50), 3, async (batch) => {
  const q = batch.map((k, i) => {
    const [o, n] = repos.get(k).full.split('/');
    return `r${i}: repository(owner: ${JSON.stringify(o)}, name: ${JSON.stringify(n)}) { ${FIELDS} }`;
  });
  try {
    const { data } = await ghGraphQL(`query { ${q.join('\n')} }`, opts);
    batch.forEach((k, i) => data[`r${i}`] && meta.set(k, data[`r${i}`]));
  } catch (err) {
    log(`  метаданные: ${err.message}`);
  }
  metaDone += batch.length;
  if (metaDone % 1000 < 50) log(`метаданные: ${metaDone}/${repos.size}`);
});

// Переименованные репозитории сходятся к одному имени.
const byName = new Map();
for (const [k, r] of repos) {
  const m = meta.get(k);
  if (!m?.defaultBranchRef?.target?.oid) continue;
  const canon = m.nameWithOwner.toLowerCase();
  const into = byName.get(canon) ?? { repo: m.nameWithOwner, meta: m, sources: new Set(), hits: new Set() };
  r.sources.forEach((s) => into.sources.add(s));
  r.hits.forEach((h) => into.hits.add(h));
  byName.set(canon, into);
}
const forced = (r) => r.sources.has('registry') || r.sources.has('collection');
const kept = [...byName.values()].filter((r) => forced(r) || (!r.meta.isFork && r.meta.stargazerCount >= MIN_STARS));
log(`репозиториев с данными: ${byName.size}, к сканированию: ${kept.length} (порог ★${MIN_STARS}, без форков)`);

// ---------- 3. деревья: все SKILL.md и LICENSE рядом с ними ----------
// SKILL.md в тестах и фикстурах — не скиллы, а данные для проверок. Смотрим
// выше папки скилла: скилл с именем test остаётся.
const TEST_DIR = /(^|\/)(tests?|__tests__|fixtures?|testdata|test-fixtures)\//i;
let treesDone = 0;
await pool(kept, 6, async (r) => {
  const oid = r.meta.defaultBranchRef.target.oid;
  const key = `${r.repo}@${oid}`;
  used.trees.add(key);
  let tree = cache.trees[key];
  if (!tree) {
    try {
      const t = await ghGet(`/repos/${r.repo}/git/trees/${oid}?recursive=1`, 'json', opts);
      const blobs = t.tree.filter((x) => x.type === 'blob' && !/(^|\/)node_modules\//.test(x.path));
      const skills = blobs.filter((x) => SKILL_FILE.test(x.path)).map((x) => x.path);
      const dirs = new Set(skills.map(dirOf));
      const licenses = blobs.filter((x) => LICENSE_FILE.test(x.path.split('/').pop()) && dirs.has(dirOf(x.path)) && dirOf(x.path)).map((x) => x.path);
      tree = cache.trees[key] = { skills, licenses, ...(t.truncated && { truncated: true }) };
    } catch (err) {
      log(`  дерево ${r.repo}: ${err.message}`); // в кэш не кладём — следующий прогон повторит
      tree = { skills: [], licenses: [] };
    }
  }
  // Обрезанное дерево (больше 100 тыс. файлов): добираем путями из поиска кода.
  r.truncated = !!tree.truncated;
  r.skillPaths = [...new Set([...tree.skills, ...(tree.truncated ? [...r.hits] : [])])].filter((p) => !TEST_DIR.test(`${dirOf(dirOf(p))}/`));
  r.licensePaths = tree.licenses;
  if (++treesDone % 500 === 0) { log(`деревья: ${treesDone}/${kept.length}`); saveCache(); }
});
saveCache();
const skippedLarge = kept.filter((r) => !forced(r) && r.skillPaths.length > MAX_SKILLS)
  .sort((a, b) => b.meta.stargazerCount - a.meta.stargazerCount)
  .map((r) => `${r.repo} ★${r.meta.stargazerCount}, SKILL.md: ${r.skillPaths.length}`);
const withSkills = kept.filter((r) => r.skillPaths.length && (forced(r) || r.skillPaths.length <= MAX_SKILLS));
const truncated = withSkills.filter((r) => r.truncated).map((r) => r.repo);
log(`больше ${MAX_SKILLS} SKILL.md, пропущено: ${skippedLarge.length}`);
log(`репозиториев со SKILL.md: ${withSkills.length}, файлов: ${withSkills.reduce((s, r) => s + r.skillPaths.length, 0)}`);

// ---------- 4. тексты SKILL.md и LICENSE пачками через GraphQL ----------
const fileKey = (r, p) => `${r.repo}@${r.meta.defaultBranchRef.target.oid}:${p}`;
const want = [];
for (const r of withSkills) {
  for (const p of [...r.skillPaths, ...r.licensePaths]) {
    const k = fileKey(r, p);
    used.files.add(k);
    if (!cache.files[k]) want.push({ r, p, k });
  }
}
log(`файлов к загрузке: ${want.length} (из кэша: ${used.files.size - want.length})`);
const norm = (t) => t.replace(/\r\n/g, '\n').trim();
function parseFile(r, p, text) {
  if (!SKILL_FILE.test(p)) return { license: licenseFromText(text, null) };
  const { fm, spec } = readSkillFrontmatter(text);
  const folder = dirOf(p).split('/').pop() || r.repo.split('/')[1];
  spec.push(...specIssues(fm, folder));
  const str = (v) => (v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v)).trim();
  return {
    name: str(fm.name),
    description: str(fm.description).slice(0, 1024),
    hash: createHash('sha1').update(norm(text)).digest('hex').slice(0, 16),
    ...(spec.length && { spec }),
  };
}
let filesDone = 0;
await pool(chunks(want, 80), 6, async (batch) => {
  const groups = new Map();
  batch.forEach((f, i) => groups.set(f.r, [...(groups.get(f.r) ?? []), [f, i]]));
  const q = [...groups].map(([r, files], gi) => {
    const [o, n] = r.repo.split('/');
    const objs = files.map(([f, i]) => `f${i}: object(expression: ${JSON.stringify(`${r.meta.defaultBranchRef.target.oid}:${f.p}`)}) { ... on Blob { text } }`);
    return `g${gi}: repository(owner: ${JSON.stringify(o)}, name: ${JSON.stringify(n)}) { ${objs.join(' ')} }`;
  });
  try {
    const { data } = await ghGraphQL(`query { ${q.join('\n')} }`, opts);
    [...groups].forEach(([, files], gi) => {
      for (const [f, i] of files) {
        const text = data[`g${gi}`]?.[`f${i}`]?.text;
        // Текста нет у бинарного блоба и симлинка — запоминаем, чтобы не просить снова.
        cache.files[f.k] = typeof text === 'string' ? parseFile(f.r, f.p, text) : { missing: true };
      }
    });
  } catch (err) {
    log(`  тексты: ${err.message}`);
  }
  filesDone += batch.length;
  if (filesDone % 4000 < 80) { log(`тексты: ${filesDone}/${want.length}`); saveCache(); }
});
saveCache(true);

// ---------- 5. кандидаты: копии под разных агентов — в одну запись ----------
const inDotDir = (p) => p.split('/').some((s) => s.startsWith('.'));
const depth = (p) => (p ? p.split('/').length : 0);
const byCanonical = (a, b) => inDotDir(a) - inDotDir(b) || depth(a) - depth(b) || a.length - b.length || a.localeCompare(b);
const sourceLabels = (r) => [...r.sources].sort();

let candidates = [];
for (const r of withSkills) {
  const groups = new Map();
  for (const p of r.skillPaths) {
    const f = cache.files[fileKey(r, p)];
    if (!f || f.missing) continue;
    const dir = dirOf(p);
    const name = f.name || dir.split('/').pop() || r.repo.split('/')[1];
    // Одно имя в одном репозитории — одна вещь: копии под разных агентов
    // часто расходятся в description (cursor-plugin против plugin).
    const g = name.toLowerCase();
    groups.set(g, [...(groups.get(g) ?? []), { dir, f }]);
  }
  const repoLic = repoLicense(r.meta.licenseInfo?.spdxId);
  const aggregator = CONFIG.aggregators.some((a) => a.toLowerCase() === r.repo.toLowerCase()) || groups.size > CONFIG.aggregatorSkills;
  for (const list of groups.values()) {
    list.sort((a, b) => byCanonical(a.dir, b.dir));
    const { dir, f } = list[0];
    const path = dir || '.';
    const licPath = r.licensePaths.find((lp) => dirOf(lp) === dir);
    const license = (licPath && cache.files[fileKey(r, licPath)]?.license) || repoLic;
    const variants = list.slice(1).map((x) => x.dir || '.');
    const reg = [path, ...variants].map((p) => regIndex.get(`${r.repo.toLowerCase()}:${p}`)).find(Boolean) ?? null;
    // Сначала поля, по которым решают при отборе пачки, потом — где лежит.
    candidates.push({
      name: f.name || null,
      description: f.description || null,
      stars: r.meta.stargazerCount,
      last_commit: r.meta.defaultBranchRef.target.committedDate.slice(0, 10),
      license,
      in_registry: reg,
      repo: r.repo,
      path,
      found_by: sourceLabels(r),
      ...(r.meta.isArchived && { archived: true }),
      ...(variants.length && { variants }),
      ...(f.spec && { spec_issues: f.spec }),
      _hash: f.hash,
      _aggregator: aggregator,
    });
  }
}
const perRepo = candidates.length;

// Один скилл в разных репозиториях: тот же SKILL.md (хеш) или те же name
// и description (перепаковка с правками во фронтматтере). Главная копия —
// из реестра, затем не из сборника, затем с большим числом звёзд.
const parent = candidates.map((_, i) => i);
const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
const firstBy = new Map();
candidates.forEach((c, i) => {
  const keys = [`h:${c._hash}`];
  if (c.name && c.description) keys.push(`n:${c.name.toLowerCase()}\u0000${c.description.toLowerCase().replace(/\s+/g, ' ')}`);
  for (const k of keys) {
    if (firstBy.has(k)) parent[find(i)] = find(firstBy.get(k));
    else firstBy.set(k, i);
  }
});
const clusters = new Map();
candidates.forEach((c, i) => clusters.set(find(i), [...(clusters.get(find(i)) ?? []), c]));
candidates = [];
for (const list of clusters.values()) {
  list.sort((a, b) => !!b.in_registry - !!a.in_registry || a._aggregator - b._aggregator || b.stars - a.stars || a.repo.localeCompare(b.repo) || a.path.localeCompare(b.path));
  const [main, ...rest] = list;
  if (rest.length) {
    main.copies = { count: rest.length, examples: rest.slice(0, 5).map((c) => `${c.repo}/${c.path}`) };
    main.in_registry ??= rest.find((c) => c.in_registry)?.in_registry ?? null;
  }
  if (main._aggregator) main.aggregator = true;
  candidates.push(main);
}
for (const c of candidates) { delete c._hash; delete c._aggregator; }
candidates.sort((a, b) => b.stars - a.stars || a.repo.localeCompare(b.repo) || a.path.localeCompare(b.path));

// ---------- 6. запись и сводка ----------
const matched = candidates.filter((c) => c.in_registry);
const matchedNames = new Set(matched.map((c) => c.in_registry));
const missing = regEntries.filter((e) => !matchedNames.has(e.name)).map((e) => `${e.name} (${e.source.repo}/${e.source.path ?? '.'})`);
const count = (src) => [...byName.values()].filter((r) => [...r.sources].some((s) => s === src || s.startsWith(`${src}:`))).length;
const summary = {
  generated: today,
  min_stars: MIN_STARS,
  max_skills: MAX_SKILLS,
  code_search_pages: codePages,
  repos_found: { registry: count('registry'), collection: count('collection'), awesome: count('awesome'), topic: count('topic'), 'code-search': count('code-search') },
  repos_scanned: kept.length,
  repos_with_skills: withSkills.length,
  skill_files: withSkills.reduce((s, r) => s + r.skillPaths.length, 0),
  candidates_before_copies: perRepo,
  candidates: candidates.length,
  in_registry: matched.length,
  registry_not_found: missing,
  truncated_trees: truncated,
  skipped_large: skippedLarge,
};
// Одна запись — одна строка: диф между прогонами читается построчно.
writeFileSync(OUT, `{\n${Object.entries(summary).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')},\n  "items": [\n${candidates.map((c) => `    ${JSON.stringify(c)}`).join(',\n')}\n  ]\n}\n`);

writeMd({ ...summary, items: candidates });

log(`\n${OUT}: ${candidates.length} кандидатов (до слияния копий между репозиториями — ${perRepo})`);
log(`репозитории по источникам: ${JSON.stringify(summary.repos_found)}`);
log(`в реестре: ${matched.length} — ${[...matchedNames].sort().join(', ')}`);
if (missing.length) log(`карточки реестра, которых сборщик не нашёл: ${missing.join('; ')}`);
if (truncated.length) log(`обрезанные деревья: ${truncated.join(', ')}`);
