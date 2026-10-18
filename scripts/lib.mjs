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

const dirs = (p) =>
  existsSync(p) ? readdirSync(p).filter((d) => !d.startsWith('.') && statSync(join(p, d)).isDirectory()).sort() : [];

const readOutput = (runDir, side, id) => {
  const p = join(runDir, side, `${id}.md`);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
};

/**
 * @param {{ production?: boolean }} opts production — сборка для публикации:
 *   черновики выпадают, демо-прогоны роняют проверку.
 * @returns {{ entries: any[], tasks: Record<string,string>, protocol: {version:number, body:string}, errors: string[] }}
 */
export function loadRegistry({ production = false } = {}) {
  const errors = [];
  const fail = (where, msg) => errors.push(`${where}: ${msg}`);
  const ajvErrors = (where, list) =>
    list.forEach((e) => fail(where, `${e.instancePath || '/'} ${e.message}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ''}`));

  const tasks = YAML.parse(readFileSync(join(ROOT, 'tasks.yaml'), 'utf8'));
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

    const runs = [];
    for (const runName of dirs(join(dir, 'runs'))) {
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
    if (!data.draft && runs.length === 0) fail(where, 'опубликованная карточка без единого прогона');
    if (production && data.draft) continue;
    entries.push({ ...data, body: content.trim(), runs, latest: runs[0] ?? null });
  }
  return { entries, tasks, protocol, errors };
}

/** Команды установки: выводятся из источника, plugin — только если объявлен. */
export function installCommands(e) {
  if (!e.source) return [];
  const { repo, path, skill } = e.source;
  const out = [{ id: 'skills', label: 'npx skills', code: `npx skills add ${repo} --skill ${skill ?? e.name}` }];
  if (e.install?.plugin) {
    const { marketplace, plugin } = e.install.plugin;
    out.push({
      id: 'plugin',
      label: 'Claude Code',
      code: `/plugin marketplace add ${repo}\n/plugin install ${plugin}@${marketplace}`,
    });
  }
  const sub = path ? `/${path}` : '';
  out.push({
    id: 'manual',
    label: 'Вручную',
    code: `git clone https://github.com/${repo} /tmp/${e.name}\ncp -R /tmp/${e.name}${sub} ~/.claude/skills/${e.name}`,
  });
  return out;
}

/** Каталог для агентов: одна форма для index.json в репозитории и на сайте. */
export function buildIndex(entries, { site } = {}) {
  return {
    version: 1,
    skills: entries
      .filter((e) => e.latest)
      .map((e) => ({
        name: e.name,
        title: e.title,
        summary: e.summary,
        ...(site && { url: new URL(`/skills/${e.name}`, site).href }),
        origin: e.origin,
        source: e.source,
        license: e.license,
        agents: e.agents,
        tasks: e.tasks,
        works_with_russian: e.works_with_russian,
        verdict: e.latest.verdict,
        verified_at: e.latest.date,
        verified_commit: e.latest.skill_commit,
        install: installCommands(e).map(({ id, code }) => ({ id, code })),
      })),
  };
}
