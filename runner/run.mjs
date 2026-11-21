#!/usr/bin/env node
/**
 * Обвязка прогона по protocol.md (дорожка В1).
 *
 *   node runner/run.mjs <скилл> [<скилл> …] [флаги]
 *
 * Для каждого скилла из явного списка: чистая песочница, установка командой
 * из карточки на закреплённом source.commit, два плеча `claude -p` (со скиллом
 * и без) на входах из skills/<имя>/evals.yaml, проверки скриптом, слепой
 * критик в два прохода с переставленным порядком, запись run.yaml по схеме
 * реестра и выходов в with-skill/ и baseline/. Вердикт обвязка только
 * предлагает: его подтверждает человек, прочитав код скилла (шаг 5).
 *
 * Флаги:
 *   --model <м>         модель плеч, по умолчанию sonnet
 *   --critic-model <м>  модель критика, по умолчанию opus
 *   --parallel <n>      сколько claude -p сразу, по умолчанию 3
 *   --demo              прогон для проверки обвязки: demo: true, папка в drafts/
 *   --out <папка>       куда писать прогон вместо skills/<имя>/runs/<дата>
 *   --resume <слаг>     дописать начатый прогон: готовые плечи не перезапускаются
 *   --timeout-min <n>   сторож одного вызова, по умолчанию 20
 *   --budget <usd>      потолок одного вызова (--max-budget-usd), по умолчанию 3
 *   --keep-sandbox      не стирать песочницу после прогона
 *   --dry-run           показать план и число вызовов, ничего не запускать
 *
 * Изоляция. Каждое плечо — свой HOME (там только поставленный скилл или
 * ничего), свой TMPDIR и CLAUDE_CODE_TMPDIR, окружение собирается с нуля
 * (никаких корп-токенов и переменных родительской сессии). Процесс завёрнут
 * в sandbox-exec: запись только в папку плеча, домашняя папка пользователя
 * не читается, кроме установленного claude. Сеть не ограничена.
 * Флаги claude: --setting-sources user (в пустом HOME это ровно поставленный
 * скилл: при "" пользовательские скиллы не грузятся вовсе), --tools одинаковые
 * в обоих плечах, --strict-mcp-config, --no-session-persistence.
 * Критик — голый вызов: --tools "", --setting-sources "", свой системный промпт.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import YAML from 'yaml';
import { ROOT, loadRegistry, loadEvals, installCommands, readRun } from '../scripts/lib.mjs';

const ARM_TOOLS = 'Bash,Read,Write,Edit,Glob,Grep,Skill';
// Местная дата: прогон вечером по Москве не должен уехать во вчера по UTC.
const TODAY = new Date().toLocaleDateString('sv-SE');
const LIMIT_RE = /weekly limit|usage limit|hit your .*limit|rate_limit|429/i;

// ---------------------------------------------------------------- аргументы
function parseArgs(argv) {
  const o = { skills: [], model: 'sonnet', criticModel: 'opus', parallel: 3, timeoutMin: 20, budget: 3 };
  const take = (i) => { if (argv[i + 1] === undefined) die(`флагу ${argv[i]} нужно значение`); return argv[i + 1]; };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--model') o.model = take(i++);
    else if (a === '--critic-model') o.criticModel = take(i++);
    else if (a === '--parallel') o.parallel = Number(take(i++));
    else if (a === '--timeout-min') o.timeoutMin = Number(take(i++));
    else if (a === '--budget') o.budget = Number(take(i++));
    else if (a === '--out') o.out = path.resolve(take(i++));
    else if (a === '--resume') o.resume = take(i++);
    else if (a === '--demo') o.demo = true;
    else if (a === '--keep-sandbox') o.keepSandbox = true;
    else if (a === '--dry-run') o.dryRun = true;
    else if (a.startsWith('-')) die(`неизвестный флаг ${a}`);
    else o.skills.push(a);
  }
  if (!o.skills.length) die('нужен явный список скиллов: node runner/run.mjs <скилл> [<скилл> …]. Прогоны делят недельный лимит — «все разом» нет.');
  if (o.out && o.skills.length > 1) die('--out — только для одного скилла');
  if (!(o.parallel >= 1)) die('--parallel — целое от 1');
  return o;
}

function die(msg) { console.error(msg); process.exit(2); }
const log = (...a) => console.log(...a);
const rel = (p) => path.relative(process.cwd(), p) || '.';
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const shq = (s) => `'${String(s).replaceAll("'", `'\\''`)}'`;

// ---------------------------------------------------------------- авторизация
/** Токен из Keychain (`claude setup-token`) не обновляется и не гоняется с соседями. */
function auth() {
  const r = spawnSync('/usr/bin/security', ['find-generic-password', '-s', 'claude-code-oauth-token', '-a', os.userInfo().username, '-w'], { encoding: 'utf8' });
  if (r.status === 0 && r.stdout.trim()) return { CLAUDE_CODE_OAUTH_TOKEN: r.stdout.trim() };
  if (process.env.CLAUDE_CODE_OAUTH_TOKEN) return { CLAUDE_CODE_OAUTH_TOKEN: process.env.CLAUDE_CODE_OAUTH_TOKEN };
  if (process.env.ANTHROPIC_API_KEY) return { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY };
  die('нет авторизации для claude -p: нужен токен `claude setup-token` в Keychain (служба claude-code-oauth-token) или ANTHROPIC_API_KEY. Чистый HOME песочницы логин CLI не видит.');
}

function claudeBin() {
  const r = spawnSync('/bin/sh', ['-c', 'command -v claude'], { encoding: 'utf8' });
  if (r.status !== 0) die('claude не найден в PATH');
  return fs.realpathSync(r.stdout.trim());
}

// ---------------------------------------------------------------- песочница
/**
 * Профиль sandbox-exec: пишет плечо только в свою папку, домашнюю папку
 * пользователя не читает (иначе базовое плечо нашло бы настоящие скиллы),
 * кроме каталога с самим claude.
 */
function sandboxProfile(writable, readableInHome) {
  const home = os.homedir();
  const q = (p) => JSON.stringify(p);
  return [
    '(version 1)',
    '(allow default)',
    `(deny file-read* (subpath ${q(home)}))`,
    `(allow file-read* (literal ${q(home)}) ${readableInHome.map((p) => `(subpath ${q(p)})`).join(' ')})`,
    '(deny file-write*)',
    `(allow file-write* (subpath ${q(writable)}) (subpath "/dev"))`,
    '',
  ].join('\n');
}

/** Окружение с нуля: только то, без чего не живут оболочка и claude. */
function armEnv(box, creds) {
  const keep = ['PATH', 'LANG', 'LC_ALL', 'LC_CTYPE', 'TERM', 'USER', 'LOGNAME', 'TZ'];
  const env = Object.fromEntries(keep.filter((k) => process.env[k]).map((k) => [k, process.env[k]]));
  return {
    ...env,
    SHELL: '/bin/zsh',
    HOME: path.join(box, 'home'),
    TMPDIR: path.join(box, 'tmp'),
    CLAUDE_CODE_TMPDIR: path.join(box, 'tmp'),
    DISABLE_AUTOUPDATER: '1',
    ...creds,
  };
}

function makeBox(dir) {
  for (const d of ['home', 'proj', 'tmp']) fs.mkdirSync(path.join(dir, d), { recursive: true });
  return dir;
}

/** Запуск под sandbox-exec со сторожем; stdout — в файл. */
function sandboxed(cmd, args, { box, env, cwd, input, stdoutFile, timeoutMin, readable }) {
  const profile = path.join(box, '.sandbox.sb');
  fs.writeFileSync(profile, sandboxProfile(box, readable));
  return new Promise((resolve) => {
    const out = fs.openSync(stdoutFile, 'w');
    const p = spawn('/usr/bin/sandbox-exec', ['-f', profile, cmd, ...args], {
      cwd, env, stdio: ['pipe', out, 'pipe'], timeout: timeoutMin * 60_000, killSignal: 'SIGTERM',
    });
    let stderr = '';
    p.stderr.on('data', (d) => { stderr += d; });
    p.stdin.end(input ?? '');
    p.on('close', (code, signal) => { fs.closeSync(out); resolve({ code, signal, stderr }); });
  });
}

// ---------------------------------------------------------------- снимок файлов
/** Все файлы песочницы плеча, кроме рабочей папки проекта, — пути вида ~/… и $TMPDIR/…. */
function snapshot(box) {
  const seen = new Map();
  const walk = (d, label) => {
    let list;
    try { list = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of list) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, `${label}/${e.name}`);
      else { try { seen.set(`${label}/${e.name}`, fs.statSync(p).mtimeMs); } catch { /* исчез */ } }
    }
  };
  walk(path.join(box, 'home'), '~');
  walk(path.join(box, 'tmp'), '$TMPDIR');
  return seen;
}
const changed = (before, after) => [...after].filter(([k, t]) => before.get(k) !== t).map(([k]) => k);
/** Идентификаторы сессий и числа — в *, чтобы служебные файлы claude совпали в обоих плечах. */
const shape = (p) => p.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]{14,}/gi, '*').replace(/\d{3,}/g, '*').replace(/-private-[^/]+/g, '*');

// ---------------------------------------------------------------- разбор stream-json
function parseStream(file) {
  const s = { init: null, tools: [], toolErrors: 0, denied: 0, result: null };
  if (!fs.existsSync(file)) return s;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.startsWith('{')) continue;
    let m;
    try { m = JSON.parse(line); } catch { continue; }
    if (m.type === 'system' && m.subtype === 'init') s.init = m;
    if (m.type === 'assistant') for (const c of m.message?.content ?? []) if (c.type === 'tool_use') s.tools.push({ name: c.name, input: c.input });
    if (m.type === 'user') {
      for (const c of m.message?.content ?? []) {
        if (c?.type !== 'tool_result') continue;
        const t = typeof c.content === 'string' ? c.content : JSON.stringify(c.content);
        if (c.is_error) s.toolErrors++;
        if (/Operation not permitted|EPERM/.test(t)) s.denied++;
      }
    }
    if (m.type === 'result') s.result = m;
  }
  return s;
}
const ok = (s) => s.result && !s.result.is_error;
const tokensOf = (r) => {
  const u = r?.usage ?? {};
  return (u.input_tokens ?? 0) + (u.output_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
};
const limitHit = (s, stderr = '') => LIMIT_RE.test(stderr) || (s.result?.is_error && LIMIT_RE.test(String(s.result.result ?? '')));

// ---------------------------------------------------------------- пул
async function pool(jobs, n, state) {
  const out = new Array(jobs.length);
  let i = 0;
  const worker = async () => {
    while (i < jobs.length) {
      const k = i++;
      if (state.stopped) { out[k] = null; continue; }
      out[k] = await jobs[k]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, jobs.length) }, worker));
  return out;
}

// ---------------------------------------------------------------- подготовка
function findEntry(name) {
  // Участники наборов в loadRegistry прячутся внутрь набора — карточку читаем напрямую.
  const { entries } = loadRegistry({ withRuns: false });
  const hit = entries.find((e) => e.name === name);
  if (hit) return hit;
  const p = path.join(ROOT, 'skills', name, 'entry.md');
  if (!fs.existsSync(p)) die(`skills/${name}/entry.md нет`);
  return matter(fs.readFileSync(p, 'utf8')).data;
}

function rawRoot() {
  const drafts = path.join(ROOT, '..', 'drafts');
  return fs.existsSync(drafts) ? path.join(drafts, 'eval-runs') : path.join(ROOT, 'runner', '.raw');
}

/** Новая папка — новый слаг: занятый в runs/ или в сырых логах не берём, иначе подхватятся чужие плечи. */
function nextSlug(parent, rawParent, resume) {
  if (resume) return resume;
  const taken = (slug) => fs.existsSync(path.join(parent, slug)) || fs.existsSync(path.join(rawParent, slug));
  let slug = TODAY;
  for (let n = 2; taken(slug); n++) slug = `${TODAY}-${n}`;
  return slug;
}

function prepare(name, o) {
  const entry = findEntry(name);
  if (!entry.source?.commit) die(`${name}: у карточки нет source.commit — ставить нечего`);
  const { evals, errors } = loadEvals(name);
  if (errors.length) die(`skills/${name}/evals.yaml:\n  ${errors.join('\n  ')}`);
  if (!evals) die(`${name}: нет skills/${name}/evals.yaml — сначала набор задач (формат — schema/evals.schema.json)`);
  const install = installCommands(entry).find((c) => c.id === 'manual');
  if (!install) die(`${name}: у карточки нет ручной установки`);
  const parent = o.out ? path.dirname(o.out) : o.demo ? path.join(rawRoot(), name) : path.join(ROOT, 'skills', name, 'runs');
  const slug = o.out ? path.basename(o.out) : nextSlug(parent, path.join(rawRoot(), name), o.resume);
  if (!slug.startsWith(TODAY) && !o.resume) die(`папка прогона должна начинаться с даты ${TODAY}`);
  const runDir = path.join(parent, slug);
  const rawDir = path.join(rawRoot(), name, slug, 'raw');
  if (fs.existsSync(path.join(runDir, 'run.yaml')) && !o.resume) die(`${rel(runDir)}/run.yaml уже есть — новый прогон пишется в новую папку`);
  return { name, entry, evals, install: install.code, runDir, rawDir, slug };
}

// ---------------------------------------------------------------- шаг 1: установка
async function installSkill(ctx, o) {
  const box = makeBox(path.join(ctx.sandbox, 'template-skill'));
  makeBox(path.join(ctx.sandbox, 'template-base'));
  // Команда из карточки клонирует в /tmp/<имя>: переносим клон в песочницу,
  // чтобы не трогать чужой /tmp и не спотыкаться о старую папку.
  const code = ctx.install.replaceAll('/tmp/', `${path.join(box, 'tmp')}/`);
  fs.writeFileSync(path.join(ctx.rawDir, 'install.sh'), `${code}\n`);
  const res = await sandboxed('/bin/bash', ['-euo', 'pipefail', '-c', code], {
    box, env: armEnv(box, {}), cwd: path.join(box, 'proj'), stdoutFile: path.join(ctx.rawDir, 'install.log'),
    timeoutMin: 5, readable: [],
  });
  fs.appendFileSync(path.join(ctx.rawDir, 'install.log'), res.stderr);
  const found = ['home/.claude/skills', 'proj/.claude/skills']
    .map((d) => path.join(box, d, ctx.name, 'SKILL.md')).find((p) => fs.existsSync(p));
  const clone = path.join(box, 'tmp', ctx.name);
  const head = fs.existsSync(path.join(clone, '.git'))
    ? spawnSync('git', ['-C', clone, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim() : null;
  const pin = ctx.entry.source.commit;
  const commitOk = head === null || head.startsWith(pin);
  ctx.installResult = { ok: res.code === 0 && !!found && commitOk, code: res.code, skillMd: found ? path.relative(box, found) : null, head, commitOk };
  if (!ctx.installResult.ok) {
    throw new Error(`установка не сработала как написано (код ${res.code}, SKILL.md ${found ? 'есть' : 'нет'}, коммит ${head ?? '—'} против ${pin}). Лог: ${rel(path.join(ctx.rawDir, 'install.log'))}`);
  }
  log(`  ${ctx.name}: поставлен ${ctx.installResult.skillMd}${head ? ` @ ${head.slice(0, 12)}` : ''}`);
}

// ---------------------------------------------------------------- шаг 3: плечи
function armJob(ctx, input, arm, o, state) {
  return async () => {
    const key = `${arm}-${input.id}`;
    const rawLog = path.join(ctx.rawDir, `${key}.jsonl`);
    const savedOut = path.join(ctx.rawDir, `${key}.out.md`);
    const meta = path.join(ctx.rawDir, `${key}.meta.json`);
    if (fs.existsSync(meta) && fs.existsSync(savedOut) && ok(parseStream(rawLog))) {
      log(`  ${ctx.name} ${key}: уже есть, пропускаю`);
      return { arm, input: input.id, ...JSON.parse(fs.readFileSync(meta, 'utf8')), stream: parseStream(rawLog) };
    }
    const box = path.join(ctx.sandbox, key);
    const tpl = path.join(ctx.sandbox, `template-${arm === 'skill' ? 'skill' : 'base'}`);
    // Клон из установки (tmp/) и профиль песочницы шаблона плечу не нужны.
    fs.cpSync(tpl, box, { recursive: true, filter: (src) => !['tmp', '.sandbox.sb'].includes(path.relative(tpl, src).split(path.sep)[0]) });
    makeBox(box);
    const base = path.basename(input.file);
    fs.copyFileSync(path.join(ctx.evals.dir, input.file), path.join(box, 'proj', base));
    const prompt = (input.prompt ?? ctx.evals.prompt).replaceAll('{input}', base).replaceAll('{output}', 'output.md');
    const before = snapshot(box);
    const t0 = Date.now();
    const res = await sandboxed(state.claude, [
      '-p', '--model', o.model, '--output-format', 'stream-json', '--verbose',
      '--tools', ARM_TOOLS, '--allowedTools', ARM_TOOLS,
      '--strict-mcp-config', '--setting-sources', 'user', '--no-session-persistence',
      '--max-budget-usd', String(o.budget),
    ], {
      box, env: armEnv(box, state.creds), cwd: path.join(box, 'proj'), input: prompt, stdoutFile: rawLog,
      timeoutMin: o.timeoutMin, readable: state.readable,
    });
    const s = parseStream(rawLog);
    if (limitHit(s, res.stderr)) { state.stopped = `лимит подписки: ${String(s.result?.result ?? res.stderr).slice(0, 160)}`; return null; }
    const outFile = path.join(box, 'proj', 'output.md');
    const hasFile = fs.existsSync(outFile);
    fs.writeFileSync(savedOut, hasFile ? fs.readFileSync(outFile, 'utf8') : String(s.result?.result ?? ''));
    const writes = changed(before, snapshot(box));
    const m = {
      seconds: Math.round((Date.now() - t0) / 1000), exit: res.code, signal: res.signal, outputFile: hasFile,
      writes, stderr: res.stderr.slice(-2000),
    };
    fs.writeFileSync(meta, JSON.stringify(m, null, 1));
    log(`  ${ctx.name} ${key}: ${ok(s) ? 'готово' : 'ОШИБКА'} за ${m.seconds} с${hasFile ? '' : ', файла выхода нет — взят ответ'}`);
    return { arm, input: input.id, ...m, stream: s };
  };
}

// ---------------------------------------------------------------- шаг 4: слепой критик
const CRITIC_SYSTEM = [
  'Ты слепой критик в прогоне скиллов для ИИ-агентов. Тебе дают задание, вход и два выхода',
  'разных исполнителей, A и B. Кто их сделал и как — неизвестно и неважно. Длина сама по себе',
  'не достоинство. Сравни выходы по каждому критерию и ответь строго одним JSON-объектом,',
  'без текста вокруг.',
].join(' ');

/**
 * Невидимое — видимым. Первый пробный прогон milchin (2026-11-21) дал ничью
 * на выходах, которые отличались 15 неразрывными пробелами: критик их просто
 * не видел. Знаки одинаковы для входа и обоих выходов, о сторонах ничего не говорят.
 */
const INVISIBLE = [
  ['\u00a0', '⍽'], ['\u202f', '‹NNBSP›'], ['\u2009', '‹THSP›'], ['\u2007', '‹FIGSP›'], ['\u200b', '‹ZWSP›'],
  ['\u200c', '‹ZWNJ›'], ['\u200d', '‹ZWJ›'], ['\u2060', '‹WJ›'], ['\ufeff', '‹BOM›'], ['\u00ad', '‹SHY›'],
];
const CYR = /[А-Яа-яЁё]/;
// Латинская буква внутри русского слова (омоглиф) — тоже невидимый дефект.
const markHomoglyphs = (t) => t.replace(/[A-Za-zА-Яа-яЁё]+/g, (w) => (CYR.test(w) && /[A-Za-z]/.test(w) ? w.replace(/[A-Za-z]/g, (c) => `‹lat ${c}›`) : w));
const visible = (t) => markHomoglyphs(INVISIBLE.reduce((s, [c, v]) => s.replaceAll(c, v), t));
const LEGEND = 'Невидимые символы показаны знаками, в самих файлах это обычные символы Юникода: ⍽ — неразрывный пробел, ‹NNBSP› — узкий неразрывный, ‹THSP› — тонкая шпация, ‹FIGSP› — цифровая шпация, ‹ZWSP›, ‹ZWNJ›, ‹ZWJ›, ‹WJ› — символы нулевой ширины, ‹BOM› — метка порядка байтов, ‹SHY› — мягкий перенос, ‹lat x› — латинская буква x внутри русского слова.';

function criticPrompt(ctx, input, a, b, criteria) {
  const task = (input.prompt ?? ctx.evals.prompt).replaceAll('{input}', 'файл входа').replaceAll('{output}', 'файл выхода');
  const src = fs.readFileSync(path.join(ctx.evals.dir, input.file), 'utf8');
  const block = (title, text) => `===== ${title} =====\n${text.trimEnd()}\n===== КОНЕЦ: ${title} =====`;
  return [
    block('ЗАДАНИЕ ИСПОЛНИТЕЛЮ', task),
    LEGEND,
    block('ВХОД', visible(src) || '(пустой файл)'),
    block('ВЫХОД A', visible(a) || '(пусто)'),
    block('ВЫХОД B', visible(b) || '(пусто)'),
    'Критерии:',
    ...criteria.map((c) => `- ${c.id}: ${c.criterion}`),
    '',
    'Ответ — один JSON-объект:',
    `{"criteria": {${criteria.map((c) => `"${c.id}": "A" | "B" | "tie"`).join(', ')}}, "overall": "A" | "B" | "tie", "a": "что сделал A", "b": "что сделал B", "why": "почему так, одна-две фразы"}`,
    'Поля "a" и "b" уйдут в карточку скилла по отдельности, поэтому каждое — одна короткая самостоятельная фраза по-русски о том, что сделано: без букв A и B, без «то же», «так же», «в отличие от» и других ссылок на второй выход. Знаки невидимых символов в них не упоминай, называй словами.',
  ].join('\n\n');
}

function parseJsonObject(text) {
  const t = String(text ?? '');
  const i = t.indexOf('{');
  const j = t.lastIndexOf('}');
  if (i < 0 || j < i) return null;
  try { return JSON.parse(t.slice(i, j + 1)); } catch { return null; }
}

function criticJob(ctx, input, pass, order, outputs, criteria, o, state) {
  return async () => {
    const file = path.join(ctx.rawDir, `critic-${input.id}-${pass}.json`);
    const tmp = path.join(ctx.sandbox, `critic-${input.id}-${pass}`);
    fs.mkdirSync(tmp, { recursive: true });
    const prompt = criticPrompt(ctx, input, outputs[order.A], outputs[order.B], criteria);
    fs.writeFileSync(path.join(ctx.rawDir, `critic-${input.id}-${pass}.prompt.txt`), prompt);
    for (let attempt = 1; attempt <= 2; attempt++) {
      const res = await sandboxed(state.claude, [
        '-p', '--model', o.criticModel, '--output-format', 'json', '--system-prompt', CRITIC_SYSTEM,
        '--tools', '', '--disable-slash-commands', '--strict-mcp-config', '--setting-sources', '', '--no-session-persistence',
      ], {
        box: tmp, env: armEnv(makeBox(tmp), state.creds), cwd: tmp, input: prompt, stdoutFile: file,
        timeoutMin: o.timeoutMin, readable: state.readable,
      });
      let r = null;
      try { r = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* пусто */ }
      if (LIMIT_RE.test(res.stderr) || (r?.is_error && LIMIT_RE.test(String(r.result)))) { state.stopped = 'лимит подписки на критике'; return null; }
      const v = parseJsonObject(r?.result);
      if (v && ['A', 'B', 'tie'].includes(v.overall)) {
        return { input: input.id, pass, order, verdict: v, model: Object.keys(r.modelUsage ?? {})[0] ?? o.criticModel, tokens: tokensOf(r), cacheRead: r.usage?.cache_read_input_tokens ?? 0, seconds: Math.round((r.duration_ms ?? 0) / 1000) };
      }
    }
    log(`  ${ctx.name} критик ${input.id}/${pass}: ответ не разобран`);
    return { input: input.id, pass, order, verdict: null };
  };
}

/** Два прохода с переставленным порядком: совпали — их выбор, разошлись — ничья. */
function agree(passes, pick) {
  const sides = passes.filter((p) => p?.verdict).map((p) => {
    const w = pick(p.verdict);
    return w === 'A' || w === 'B' ? p.order[w] : w === 'tie' ? 'tie' : null;
  });
  if (!sides.length || sides.includes(null)) return 'n/a';
  return sides.every((x) => x === sides[0]) ? sides[0] : 'tie';
}

// ---------------------------------------------------------------- проверки скриптом
function runChecks(ctx, input, outFile) {
  const out = {};
  for (const c of ctx.evals.checks.filter((c) => c.kind === 'script' && (!c.inputs || c.inputs.includes(input.id)))) {
    const cmd = c.run.replaceAll('{input}', shq(path.join(ctx.evals.dir, input.file))).replaceAll('{output}', shq(outFile));
    const r = spawnSync('/bin/sh', ['-c', cmd], { cwd: ROOT, encoding: 'utf8' });
    const v = r.status === 0 ? parseJsonObject(r.stdout.trim().split('\n').pop()) : null;
    out[c.id] = v ? { pass: !!v.pass, value: v.value, detail: v.detail } : { error: (r.stderr || r.stdout || `код ${r.status}`).trim().slice(-300) };
  }
  return out;
}

const fmt = (v) => (v === undefined ? '—' : typeof v === 'number' ? String(v) : JSON.stringify(v));

// ---------------------------------------------------------------- вердикт
/**
 * Предварительный вердикт, по правилу: сломался на плохом входе (проверка
 * скриптом провалена со скиллом и пройдена без него, или критик выбрал плечо
 * без скилла) — reject; на обычных задачах критик чаще выбирает скилл — take;
 * чаще без скилла — reject; иначе — redundant. «С оговорками» ставит человек.
 */
function proposeVerdict(ctx, rows) {
  const typical = rows.filter((r) => r.kind === 'typical');
  const bad = rows.filter((r) => r.kind === 'bad');
  const n = (side) => typical.filter((r) => r.critic === side).length;
  const broken = bad.filter((r) => r.critic === 'baseline' || Object.entries(r.checks.skill).some(([id, v]) => v.pass === false && r.checks.baseline[id]?.pass === true));
  // Провал проверки на плохом входе в обоих плечах — не вина скилла, но и не «справился».
  const bothFailed = bad.filter((r) => !broken.includes(r)).flatMap((r) => Object.entries(r.checks.skill)
    .filter(([id, v]) => v.pass === false && r.checks.baseline[id]?.pass === false).map(([id]) => `${r.input}/${id}`));
  const [sk, bl, tie] = [n('skill'), n('baseline'), n('tie')];
  const verdict = broken.length ? 'reject' : sk > typical.length / 2 ? 'take' : bl > typical.length / 2 ? 'reject' : 'redundant';
  const scripts = typical.flatMap((r) => Object.entries(r.checks.skill).map(([id, v]) => {
    const b = r.checks.baseline[id];
    return `${r.input}/${id}: ${fmt(v.value)} против ${fmt(b?.value)}`;
  }));
  const summary = [
    `Предварительно, по правилу обвязки; вердикт подтверждает человек.`,
    `Слепой критик на ${typical.length} обычных задачах: скилл ${sk}, без скилла ${bl}, ничья ${tie}.`,
    scripts.length ? `Скриптом (со скиллом против без): ${scripts.join('; ')}.` : '',
    !bad.length ? ''
      : broken.length ? `На плохом входе скилл сломал работу: ${broken.map((r) => r.input).join(', ')}.`
      : bothFailed.length ? `На плохом входе проверку провалили оба плеча (${bothFailed.join(', ')}): хуже без скилла не стало, но и скилл не помог.`
      : 'Плохой вход работу не сломал.',
  ].filter(Boolean).join(' ');
  return { verdict, summary };
}

// ---------------------------------------------------------------- запись
function writeRun(ctx, o, state, arms, critics, t0) {
  const byKey = new Map(arms.filter(Boolean).map((a) => [`${a.arm}-${a.input}`, a]));
  fs.mkdirSync(path.join(ctx.runDir, 'with-skill'), { recursive: true });
  fs.mkdirSync(path.join(ctx.runDir, 'baseline'), { recursive: true });
  const rows = [];
  for (const input of ctx.evals.inputs) {
    const sk = byKey.get(`skill-${input.id}`);
    const bl = byKey.get(`base-${input.id}`);
    const outs = {};
    for (const [arm, side] of [['skill', 'with-skill'], ['base', 'baseline']]) {
      const f = path.join(ctx.runDir, side, `${input.id}.md`);
      fs.writeFileSync(f, fs.readFileSync(path.join(ctx.rawDir, `${arm}-${input.id}.out.md`), 'utf8'));
      outs[arm] = f;
    }
    const passes = critics.filter((c) => c?.input === input.id);
    const critic = passes.length ? agree(passes, (v) => v.overall) : 'n/a';
    const first = passes.find((p) => p?.verdict);
    const say = (arm) => (first ? first.verdict[first.order.A === arm ? 'a' : 'b'] : null);
    const invoked = sk.stream.tools.some((t) => t.name === 'Skill' && String(t.input?.skill ?? '').includes(ctx.name));
    const loaded = (sk.stream.init?.skills ?? []).includes(ctx.name);
    rows.push({
      input: input.id, kind: input.kind, critic,
      checks: { skill: runChecks(ctx, input, outs.skill), baseline: runChecks(ctx, input, outs.base) },
      criteria: Object.fromEntries(ctx.evals.checks
        .filter((c) => c.kind === 'critic' && (!c.inputs || c.inputs.includes(input.id)))
        .map((c) => [c.id, agree(passes, (v) => v.criteria?.[c.id])])),
      say: { skill: say('skill'), baseline: say('baseline') },
      invoked, loaded, outputFile: { skill: sk.outputFile, baseline: bl.outputFile },
      why: passes.filter((p) => p?.verdict).map((p) => p.verdict.why),
    });
  }

  // Шаг 5, что видно из прогона: команды плеча со скиллом и запись вне рабочей папки,
  // которой нет в плече без скилла (служебные файлы claude есть в обоих и отсекаются сами).
  const skillArms = [...byKey.values()].filter((a) => a.arm === 'skill');
  const baseShapes = new Set([...byKey.values()].filter((a) => a.arm === 'base').flatMap((a) => a.writes.map(shape)));
  const writes = [...new Set(skillArms.flatMap((a) => a.writes.map(shape)).filter((p) => !baseShapes.has(p)))].sort();
  const scriptCalls = skillArms.flatMap((a) => a.stream.tools.filter((t) => t.name === 'Bash').map((t) => String(t.input?.command ?? '')))
    .filter((c) => c.includes(`/skills/${ctx.name}`) || c.includes('CLAUDE_SKILL_DIR'));
  const denied = skillArms.reduce((n, a) => n + a.stream.denied, 0);

  const all = [...byKey.values()];
  const tokens = all.reduce((n, a) => n + tokensOf(a.stream.result), 0) + critics.filter(Boolean).reduce((n, c) => n + (c.tokens ?? 0), 0);
  const cacheRead = all.reduce((n, a) => n + (a.stream.result?.usage?.cache_read_input_tokens ?? 0), 0) + critics.filter(Boolean).reduce((n, c) => n + (c.cacheRead ?? 0), 0);
  ctx.cacheShare = tokens ? Math.round((cacheRead / tokens) * 100) : 0;
  // Минуты — сумма длительностей вызовов claude: не зависит ни от --parallel, ни от --resume.
  const callSeconds = all.reduce((n, a) => n + (a.seconds ?? 0), 0) + critics.filter(Boolean).reduce((n, c) => n + (c.seconds ?? 0), 0);
  const minutes = Math.round(callSeconds / 6) / 10;
  ctx.wallMinutes = Math.round((Date.now() - t0) / 6000) / 10;
  const { verdict, summary } = proposeVerdict(ctx, rows);
  const model = skillArms.map((a) => a.stream.init?.model).find(Boolean) ?? o.model;
  const protocolVersion = matter(fs.readFileSync(path.join(ROOT, 'protocol.md'), 'utf8')).data.version;

  const run = {
    date: ctx.slug.slice(0, 10),
    protocol: protocolVersion,
    ...(o.demo && { demo: true }),
    agent: { name: 'claude-code', version: state.agentVersion },
    model,
    skill_commit: ctx.entry.source.commit,
    inputs: ctx.evals.inputs.map((i) => ({
      id: i.id, kind: i.kind, title: i.title, source: i.source,
      sha256: sha256(fs.readFileSync(path.join(ctx.evals.dir, i.file))),
    })),
    results: rows.map((r) => ({
      input: r.input,
      with_skill: r.say.skill ?? (r.outputFile.skill ? 'Выход — в with-skill/.' : 'Файл выхода не создан, сохранён ответ агента.'),
      baseline: r.say.baseline ?? (r.outputFile.baseline ? 'Выход — в baseline/.' : 'Файл выхода не создан, сохранён ответ агента.'),
      critic: r.critic,
      note: [
        ...Object.entries(r.checks.skill).map(([id, v]) => `${id}: ${v.error ? 'сбой проверки' : fmt(v.value)} против ${r.checks.baseline[id]?.error ? 'сбой проверки' : fmt(r.checks.baseline[id]?.value)}`),
        r.invoked ? 'скилл вызван' : r.loaded ? 'скилл загружен, но не вызван' : 'скилл не загрузился',
      ].join('; '),
    })),
    security: {
      runs_scripts: scriptCalls.length > 0,
      network: ctx.entry.scan?.network ?? [],
      writes,
      note: [
        scriptCalls.length ? `Агент со скиллом запускал скрипты скилла, запусков: ${scriptCalls.length}.` : 'Скриптов скилла агент не запускал.',
        'Сеть — по разбору кода, трафик не перехватывали.',
        writes.length ? '' : 'Вне рабочей папки скилл ничего не записал (сравнение с плечом без скилла).',
        denied ? `Песочница отказала в доступе ${denied} раз.` : '',
      ].filter(Boolean).join(' '),
    },
    verdict,
    summary,
    cost: { tokens, minutes },
  };
  fs.writeFileSync(path.join(ctx.runDir, 'run.yaml'), YAML.stringify(run, { lineWidth: 0 }));
  fs.writeFileSync(path.join(ctx.runDir, 'evidence.json'), JSON.stringify({
    install: ctx.installResult,
    flags: { model: o.model, critic_model: o.criticModel, arm_tools: ARM_TOOLS, setting_sources: 'user', sandbox: 'sandbox-exec' },
    rows: rows.map(({ say, ...r }) => r),
    critic: critics.filter(Boolean).map(({ tokens: _t, cacheRead: _c, ...c }) => c),
    arms: all.map((a) => ({ arm: a.arm, input: a.input, seconds: a.seconds, exit: a.exit, output_file: a.outputFile, tool_calls: a.stream.tools.length, tool_errors: a.stream.toolErrors, sandbox_denied: a.stream.denied, skills_loaded: a.stream.init?.skills?.includes(ctx.name) ?? false })),
  }, null, 1));
  fs.writeFileSync(path.join(ctx.runDir, 'notes.md'), notes(ctx, o, run, rows, all, critics));
  return { run, rows };
}

function notes(ctx, o, run, rows, arms, critics) {
  const L = [];
  L.push(`# Прогон ${ctx.name}, ${run.date}`, '');
  if (o.demo) L.push('**Демо-прогон**: проверка обвязки, не знак качества. В сборку для публикации не попадает.', '');
  const criticModels = [...new Set(critics.filter((c) => c?.model).map((c) => c.model))].join(', ') || o.criticModel;
  L.push(`Агент Claude Code ${run.agent.version}, модель плеч \`${run.model}\`, критик \`${criticModels}\` в два прохода с переставленным порядком; невидимые символы критику показаны знаками.`,
    `Скилл поставлен командой из карточки на коммите \`${run.skill_commit}\`${ctx.installResult.head ? ` (HEAD клона \`${ctx.installResult.head.slice(0, 12)}\`)` : ''}, файл \`${ctx.installResult.skillMd}\`.`, '');
  L.push('| Вход | Вид | Критик | Проверки скриптом (со скиллом / без) | Скилл |', '|---|---|---|---|---|');
  for (const r of rows) {
    const checks = Object.entries(r.checks.skill).map(([id, v]) => `${id}: ${v.error ? 'сбой' : fmt(v.value)} / ${r.checks.baseline[id]?.error ? 'сбой' : fmt(r.checks.baseline[id]?.value)}`).join('<br>') || '—';
    L.push(`| \`${r.input}\` | ${r.kind === 'bad' ? 'плохой' : 'обычный'} | ${r.critic} | ${checks} | ${r.invoked ? 'вызван' : r.loaded ? 'не вызван' : 'не загружен'} |`);
  }
  L.push('', '## Почему так решил критик', '');
  for (const r of rows) for (const w of r.why) L.push(`- \`${r.input}\`: ${w}`);
  L.push('', '## Предварительный вердикт', '', `\`${run.verdict}\` — ${run.summary}`, '',
    'Правило: сломал плохой вход — reject; критик чаще выбирает скилл на обычных задачах — take; чаще без скилла — reject; иначе redundant. «С оговорками» ставит только человек.', '',
    '## Что остаётся человеку', '',
    '- Шаг 5 протокола: прочитать код скилла на закреплённом коммите и сверить с `security` в `run.yaml`. Обвязка видит только команды агента и запись в песочнице, сеть берёт из разбора кода.',
    '- Подтвердить или поправить вердикт и `summary`.', '',
    '## Расход', '',
    `${run.cost.tokens} токенов (вход, выход, запись и чтение кэша вместе; чтение кэша — ${ctx.cacheShare}%), ${run.cost.minutes} мин — сумма длительностей всех вызовов claude; этот запуск обвязки от установки до записи — ${ctx.wallMinutes} мин. Плечи: ${arms.map((a) => `${a.arm}-${a.input} ${a.seconds} с`).join(', ')}.`, '');
  return L.join('\n');
}

// ---------------------------------------------------------------- main
async function main() {
  const o = parseArgs(process.argv.slice(2));
  const ctxs = o.skills.map((s) => prepare(s, o));
  const calls = ctxs.reduce((n, c) => n + c.evals.inputs.length * 2 + c.evals.inputs.filter((i) => c.evals.checks.some((k) => k.kind === 'critic' && (!k.inputs || k.inputs.includes(i.id)))).length * 2, 0);
  log(`План: ${ctxs.map((c) => `${c.name} (входов: ${c.evals.inputs.length})`).join(', ')}; вызовов claude -p: ${calls}; плечи — ${o.model}, критик — ${o.criticModel}, параллельно ${o.parallel}.`);
  for (const c of ctxs) log(`  ${c.name} → ${rel(c.runDir)}${o.demo ? ' (демо)' : ''}; сырые логи → ${rel(c.rawDir)}`);
  if (o.dryRun) return;

  const claude = claudeBin();
  const state = {
    claude,
    creds: auth(),
    agentVersion: spawnSync(claude, ['--version'], { encoding: 'utf8' }).stdout.trim().split(/\s/)[0],
    // Домашняя папка закрыта на чтение целиком, кроме установки claude.
    readable: [path.join(os.homedir(), '.local')],
    stopped: false,
  };
  let failed = 0;
  for (const ctx of ctxs) {
    const t0 = Date.now();
    fs.mkdirSync(ctx.rawDir, { recursive: true });
    ctx.sandbox = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), `skilldeck-${ctx.name}-`)));
    try {
      log(`\n${ctx.name}: установка`);
      await installSkill(ctx, o);
      log(`${ctx.name}: плечи`);
      const arms = await pool(ctx.evals.inputs.flatMap((i) => ['skill', 'base'].map((a) => armJob(ctx, i, a, o, state))), o.parallel, state);
      if (state.stopped) throw new Error(`${state.stopped}. Дописать позже: --resume ${ctx.slug}`);
      const bad = arms.filter((a) => !ok(a.stream));
      if (bad.length) throw new Error(`плечи с ошибкой: ${bad.map((a) => `${a.arm}-${a.input}`).join(', ')} — см. ${rel(ctx.rawDir)}`);
      log(`${ctx.name}: критик`);
      const outputs = Object.fromEntries(ctx.evals.inputs.map((i) => [i.id, {
        skill: fs.readFileSync(path.join(ctx.rawDir, `skill-${i.id}.out.md`), 'utf8'),
        baseline: fs.readFileSync(path.join(ctx.rawDir, `base-${i.id}.out.md`), 'utf8'),
      }]));
      const jobs = [];
      for (const input of ctx.evals.inputs) {
        const criteria = ctx.evals.checks.filter((c) => c.kind === 'critic' && (!c.inputs || c.inputs.includes(input.id)));
        if (!criteria.length) continue;
        const first = crypto.randomInt(2) ? { A: 'skill', B: 'baseline' } : { A: 'baseline', B: 'skill' };
        const second = { A: first.B, B: first.A };
        jobs.push(criticJob(ctx, input, 1, first, outputs[input.id], criteria, o, state));
        jobs.push(criticJob(ctx, input, 2, second, outputs[input.id], criteria, o, state));
      }
      const critics = await pool(jobs, o.parallel, state);
      if (state.stopped) throw new Error(`${state.stopped}. Дописать позже: --resume ${ctx.slug}`);
      const { run } = writeRun(ctx, o, state, arms, critics, t0);
      const { errors } = readRun(ctx.runDir, { production: false });
      if (errors.length) throw new Error(`run.yaml не прошёл проверку реестра:\n  ${errors.join('\n  ')}`);
      log(`${ctx.name}: ${rel(path.join(ctx.runDir, 'run.yaml'))} — предварительно ${run.verdict}, ${run.cost.minutes} мин, ${run.cost.tokens} токенов`);
    } catch (e) {
      failed++;
      console.error(`${ctx.name}: ${e.message}`);
      if (state.stopped) break;
    } finally {
      if (!o.keepSandbox) fs.rmSync(ctx.sandbox, { recursive: true, force: true });
      else log(`  песочница: ${ctx.sandbox}`);
    }
  }
  process.exit(failed ? 1 : 0);
}

main();
