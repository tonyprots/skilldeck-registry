/**
 * Чтение и проверка реестра. Единственное место, которое знает формат:
 * им пользуются и CI реестра (validate.mjs), и сборка сайта. Схемы лежат в
 * schema/*.json, здесь — то, что схемой не выразить: связи между файлами.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import matter from 'gray-matter';
import YAML from 'yaml';

// REGISTRY_DIR задаёт сборка сайта: после бандлинга import.meta.url указывает
// не на этот файл, и путь от него молча уводит мимо реестра.
export const ROOT = process.env.REGISTRY_DIR ?? join(dirname(fileURLToPath(import.meta.url)), '..');

const ajv = new Ajv({ allErrors: true, strict: true, strictRequired: false });
addFormats(ajv);
const json = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const checkEntry = ajv.compile(json('schema/entry.schema.json'));
const checkRun = ajv.compile(json('schema/run.schema.json'));

export const VERDICTS = {
  take: 'бери',
  caveats: 'бери с оговорками',
  reject: 'не бери',
  redundant: 'не нужен',
};

export const ROLES = {
  marketer: 'маркетологу',
  product: 'продакту',
  developer: 'разработчику',
  designer: 'дизайнеру',
  analyst: 'аналитику',
  writer: 'автору и редактору',
  manager: 'руководителю',
  researcher: 'исследователю',
  founder: 'предпринимателю',
  universal: 'всем',
};

/**
 * Уровень проверки (решение 2026-10-17: прогон — знак качества, а не пропуск
 * в каталог). run — полный прогон по протоколу; installed — ставили с нуля
 * и агент подхватил; catalog — только автоматический разбор; none — у черновика
 * нет даже разбора (нет открытого источника).
 */
export const LEVELS = { run: 'прогнан', installed: 'поставили с нуля', catalog: 'код разобран', none: 'не проверен' };
/** Подсказки к уровням: одна формулировка для сайта, llms.txt и карточки для агента. */
export const LEVEL_HINTS = {
  run: 'Прогнали по протоколу: те же задачи со скиллом и без, слепой критик.',
  installed: 'Ставили с нуля, агент подхватил скилл. На задачах скилл ещё не испытывали.',
  catalog: 'Автоматически разобрали код на закреплённом коммите. На задачах скилл ещё не испытывали.',
  none: 'Ни разбора, ни прогона: открытого источника пока нет.',
};
const levelOf = (e, runs) => (runs.length ? 'run' : e.installed ? 'installed' : e.scan ? 'catalog' : 'none');

/**
 * Снимок звёзд и дат коммитов (scripts/github-stats.mjs). Сборка в сеть не
 * ходит; нет файла или записи — звёзд и даты просто нет, без нулей.
 */
const readStats = () => {
  const p = join(ROOT, 'stats.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
};
const withCommitDate = (source, stats) => {
  const d = source && stats[`${source.repo}@${source.commit}`]?.commit_date;
  return d ? { ...source, commit_date: d } : source;
};

/** Задача в tasks.yaml — строка-заголовок или объект { title, intro }. */
const readTasks = (raw) => {
  const tasks = {};
  const intros = {};
  const bad = [];
  for (const [slug, v] of Object.entries(raw ?? {})) {
    if (typeof v === 'string') tasks[slug] = v;
    else if (v && typeof v.title === 'string' && (v.intro === undefined || typeof v.intro === 'string')) {
      tasks[slug] = v.title;
      if (v.intro?.trim()) intros[slug] = v.intro.trim();
    } else bad.push(slug);
  }
  return { tasks, intros, bad };
};

const dirs = (p) =>
  existsSync(p) ? readdirSync(p).filter((d) => !d.startsWith('.') && statSync(join(p, d)).isDirectory()).sort() : [];

const readOutput = (runDir, side, id) => {
  const p = join(runDir, side, `${id}.md`);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
};

/**
 * @param {{ production?: boolean, withRuns?: boolean }} opts production — сборка для публикации:
 *   черновики выпадают, демо-прогоны роняют проверку. withRuns: false — каталог без прогонов:
 *   папки runs/ не читаются вовсе, уровень считается по разбору и установке.
 *   withDrafts: false — черновики выпадают и в обычной сборке.
 *   В режиме production ещё и редакторские проверки: «Черновик редакции» в тексте без
 *   todo и «проверить» в scan.note — ошибка; карточки с todo — предупреждение.
 * @returns {{ entries: any[], tasks: Record<string,string>, taskIntros: Record<string,string>,
 *   protocol: {version:number, body:string}, errors: string[], warnings: string[] }}
 */
export function loadRegistry({ production = false, withRuns = true, withDrafts = !production } = {}) {
  const errors = [];
  const warnings = [];
  const fail = (where, msg) => errors.push(`${where}: ${msg}`);
  const ajvErrors = (where, list) =>
    list.forEach((e) => fail(where, `${e.instancePath || '/'} ${e.message}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ''}`));

  const { tasks, intros: taskIntros, bad } = readTasks(YAML.parse(readFileSync(join(ROOT, 'tasks.yaml'), 'utf8')));
  for (const slug of bad) fail('tasks.yaml', `задача "${slug}" — не строка и не { title, intro }`);
  const stats = readStats();
  const protoSrc = matter(readFileSync(join(ROOT, 'protocol.md'), 'utf8'));
  const protocol = { version: protoSrc.data.version, body: protoSrc.content };
  if (!Number.isInteger(protocol.version)) fail('protocol.md', 'во frontmatter нет целого version');

  const entries = [];
  for (const name of dirs(join(ROOT, 'skills'))) {
    const dir = join(ROOT, 'skills', name);
    const where = `skills/${name}/entry.md`;
    if (!existsSync(join(dir, 'entry.md'))) { fail(where, 'файла нет'); continue; }
    const { data, content } = matter(readFileSync(join(dir, 'entry.md'), 'utf8'));
    if (!checkEntry(data)) { ajvErrors(where, checkEntry.errors); continue; }
    if (data.name !== name) fail(where, `name "${data.name}" не совпадает с папкой`);
    for (const t of data.tasks) if (!tasks[t]) fail(where, `задачи "${t}" нет в tasks.yaml`);
    if (data.origin === 'fork' && !data.upstream) fail(where, 'у fork должен быть upstream');
    if (!content.trim()) fail(where, 'нет текста от автора');
    if (data.scan?.hidden_unicode.length && !data.scan.note) fail(where, 'в разборе скрытый юникод — нужен note после просмотра');

    const runs = [];
    for (const runName of withRuns ? dirs(join(dir, 'runs')) : []) {
      const runDir = join(dir, 'runs', runName);
      const rwhere = `skills/${name}/runs/${runName}/run.yaml`;
      if (!existsSync(join(runDir, 'run.yaml'))) { fail(rwhere, 'файла нет'); continue; }
      const run = YAML.parse(readFileSync(join(runDir, 'run.yaml'), 'utf8'));
      if (typeof run?.skill_commit === 'number') fail(rwhere, 'skill_commit прочитан как число — возьмите хеш в кавычки');
      if (!checkRun(run)) { ajvErrors(rwhere, checkRun.errors); continue; }
      if (!runName.startsWith(run.date)) fail(rwhere, `папка не начинается с даты ${run.date}`);
      if (run.protocol > protocol.version) fail(rwhere, `протокол v${run.protocol} новее protocol.md v${protocol.version}`);
      const ids = new Set(run.inputs.map((i) => i.id));
      if (ids.size !== run.inputs.length) fail(rwhere, 'повторяются id входов');
      if (!run.inputs.some((i) => i.kind === 'bad')) fail(rwhere, 'нет плохого входа — протокол требует хотя бы один');
      const covered = new Set(run.results.map((r) => r.input));
      for (const r of run.results) if (!ids.has(r.input)) fail(rwhere, `результат для неизвестного входа "${r.input}"`);
      for (const id of ids) if (!covered.has(id)) fail(rwhere, `нет результата для входа "${id}"`);
      if (production && run.demo) fail(rwhere, 'демо-прогон в сборке для публикации');
      runs.push({
        ...run,
        slug: runName,
        results: run.results.map((r) => ({
          ...r,
          output: { skill: readOutput(runDir, 'with-skill', r.input), baseline: readOutput(runDir, 'baseline', r.input) },
        })),
        notes: existsSync(join(runDir, 'notes.md')) ? readFileSync(join(runDir, 'notes.md'), 'utf8') : null,
      });
    }
    runs.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
    for (const r of runs) {
      if (data.source?.commit && !data.source.commit.startsWith(r.skill_commit) && !r.skill_commit.startsWith(data.source.commit)) r.stale = true;
    }
    if (!withDrafts && data.draft) continue;
    const repoStats = data.source && !data.includes ? stats[data.source.repo] : null;
    entries.push({
      ...data,
      ...(data.source && { source: withCommitDate(data.source, stats) }),
      ...(repoStats && { stars: { count: repoStats.stars, date: repoStats.date } }),
      body: content.trim(),
      runs,
      latest: runs[0] ?? null,
      level: levelOf(data, runs),
    });
  }

  // Наборы (решение 2026-10-22): участники набора живут своими карточками
  // в реестре, но на сайте — только внутри карточки набора.
  const byName = new Map(entries.map((e) => [e.name, e]));
  const inSet = new Set();
  for (const e of entries) {
    if (!e.includes) continue;
    e.members = [];
    for (const n of e.includes) {
      const m = byName.get(n);
      if (!m) { fail(`skills/${e.name}/entry.md`, `участника набора "${n}" нет или он черновик`); continue; }
      if (m.includes) fail(`skills/${e.name}/entry.md`, `"${n}" сам набор — вложенные наборы не поддерживаются`);
      e.members.push({ name: m.name, title: m.title, author: m.author, source: m.source, license: m.license, agents: m.agents, scan: m.scan });
      inSet.add(n);
    }
    e.scan = mergeScans([{ name: e.name, scan: e.scan }, ...e.members.map((m) => ({ name: m.name, scan: m.scan }))]);
  }

  // Редакторские хвосты перед публикацией. scan.note участника уходит в карточку
  // набора, поэтому «проверить» ищем у всех; текст участника на сайт не идёт.
  if (production) {
    for (const e of entries) {
      const where = `skills/${e.name}/entry.md`;
      if (!e.members && /проверить/i.test(e.scan?.note ?? '')) fail(where, 'в scan.note внутренняя пометка «проверить» — она уйдёт на сайт');
      if (inSet.has(e.name)) continue;
      if (/Черновик редакции/.test(e.body) && !e.todo) fail(where, 'в тексте «Черновик редакции», а todo: why не стоит — сайт покажет черновик');
      if (e.todo === 'why') warnings.push(`${where}: нет текста «Зачем он мне» (todo: why), раздел на сайте скрыт`);
    }
  }
  return { entries: entries.filter((e) => !inSet.has(e.name)), tasks, taskIntros, protocol, errors, warnings };
}

/**
 * Разбор набора — сумма разборов участников: худшее из флагов, объединение
 * адресов. Пометки подписаны именем участника: «milchin: …».
 */
function mergeScans(parts) {
  const named = parts.filter((p) => p.scan);
  const s = named.map((p) => p.scan);
  if (!s.length) return undefined;
  const notes = named.filter((p) => p.scan.note).map((p) => `${p.name}: ${p.scan.note}`);
  return {
    date: s.map((x) => x.date).sort()[0],
    files: s.reduce((n, x) => n + x.files, 0),
    scripts: s.reduce((n, x) => n + x.scripts, 0),
    runs_commands: s.some((x) => x.runs_commands),
    network: [...new Set(s.flatMap((x) => x.network))].sort(),
    outside_folder: s.some((x) => x.outside_folder),
    hidden_unicode: s.flatMap((x) => x.hidden_unicode),
    ...(notes.length && { note: notes.join(' ') }),
  };
}

/**
 * Ручная установка ставит ровно закреплённый коммит. Скилл в корне репозитория
 * копируется без .git; для Codex — та же копия в ~/.codex/skills.
 */
const manualInstall = ({ name, source, agents = [] }) => {
  const { repo, path, commit, host = 'github' } = source;
  const git = host === 'sourcecraft' ? `https://git.sourcecraft.dev/${repo}.git` : `https://github.com/${repo}`;
  const root = !path || path === '.';
  const copy = (dir) =>
    root
      ? `mkdir -p ${dir} && rsync -a --exclude .git /tmp/${name}/ ${dir}/${name}/`
      : `mkdir -p ${dir} && cp -R /tmp/${name}/${path} ${dir}/${name}`;
  return [
    `git clone ${git} /tmp/${name}`,
    `git -C /tmp/${name} checkout ${commit}`,
    copy('~/.claude/skills'),
    ...(agents.includes('codex') ? ['# Codex:', copy('~/.codex/skills')] : []),
  ].join('\n');
};

/** Команды установки: выводятся из источника, plugin — только если объявлен. */
export function installCommands(e) {
  if (!e.source) return [];
  // Набор ставится целиком: сам скилл и все участники, каждый со своего коммита.
  const all = [e, ...(e.members ?? [])].filter((x) => x.source);
  const { repo, host = 'github' } = e.source;
  const github = all.every((x) => (x.source.host ?? 'github') === 'github');
  // npx skills и плагины знают только GitHub и ставят последнюю версию;
  // ровно проверенный коммит даёт ручная установка.
  const out = github
    ? [{ id: 'skills', label: 'npx skills', code: all.map((x) => `npx skills add ${x.source.repo} --skill ${x.source.skill ?? x.name}`).join('\n') }]
    : [];
  if (host === 'github' && !e.members && e.install?.plugin) {
    const { marketplace, plugin } = e.install.plugin;
    out.push({
      id: 'plugin',
      label: 'Claude Code',
      code: `/plugin marketplace add ${repo}\n/plugin install ${plugin}@${marketplace}`,
    });
  }
  // Набор ставится под агентов набора, а не под агентов каждого участника.
  out.push({ id: 'manual', label: 'Вручную', code: all.map((x) => manualInstall({ ...x, agents: e.agents })).join('\n\n') });
  return out;
}

/**
 * Каталог для агентов: одна форма для index.json в репозитории и на сайте.
 * scan — сырые поля разбора, без пересказа; stars — снимок с датой, у набора нет.
 * @param {any[]} entries
 * @param {{ site?: URL|string, tasks?: Record<string,string> }} opts
 */
export function buildIndex(entries, { site, tasks } = {}) {
  const abs = (p) => (site ? new URL(p, site).href : undefined);
  const used = new Set(entries.flatMap((e) => e.tasks));
  return {
    version: 1,
    generated_at: new Date().toISOString(),
    ...(site && { site: new URL('/', site).href }),
    ...(tasks && { tasks: Object.fromEntries(Object.entries(tasks).filter(([slug]) => used.has(slug))) }),
    roles: ROLES,
    skills: entries.map((e) => ({
      name: e.name,
      title: e.title,
      summary: e.summary,
      ...(site && { url: abs(`/skills/${e.name}`), md: abs(`/skills/${e.name}.md`) }),
      origin: e.origin,
      author: { name: e.author.name, ...(e.author.url && { url: e.author.url }) },
      source: e.source,
      license: e.license,
      agents: e.agents,
      tasks: e.tasks,
      roles: e.roles,
      ...(e.members && {
        includes: e.members.map((m) => ({
          name: m.name,
          title: m.title,
          author: { name: m.author.name, ...(m.author.url && { url: m.author.url }) },
          license: m.license,
          source: m.source,
          ...(m.source?.commit_date && { commit_date: m.source.commit_date }),
        })),
      }),
      ...(e.stars && { stars: e.stars }),
      ...(e.scan && {
        scan: {
          date: e.scan.date,
          files: e.scan.files,
          runs_commands: e.scan.runs_commands,
          network: e.scan.network,
          outside_folder: e.scan.outside_folder,
          hidden_unicode: e.scan.hidden_unicode,
          spec_issues: e.scan.spec_issues ?? [],
        },
      }),
      level: e.level,
      scanned_at: e.scan?.date ?? null,
      ...(e.latest && { verdict: e.latest.verdict, verified_at: e.latest.date, verified_commit: e.latest.skill_commit }),
      install: installCommands(e).map(({ id, code }) => ({ id, code })),
    })),
  };
}
