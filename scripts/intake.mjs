#!/usr/bin/env node
/**
 * Приём скилла в каталог: закрепляет коммит и делает статический разбор.
 * Это ручной запуск будущего бота заявок — тот же отчёт он положит в PR.
 *
 *   node scripts/intake.mjs <owner/repo> [--skill <name>] [--path <dir>] [--json]
 *
 * Без --skill и --path перечисляет все SKILL.md в репозитории. С ними печатает
 * блок `source` + `scan` для frontmatter entry.md. Токен GitHub — из
 * GITHUB_TOKEN (локально: GITHUB_TOKEN=$(gh auth token)); без него лимит 60
 * запросов в час.
 *
 * Разбор честно ограничен: ищет запуск команд, сетевые адреса в коде, скрытый
 * юникод и запись вне папки по шаблонам. Это не доказательство безопасности,
 * поэтому на сайте он называется «автоматический разбор», а не «безопасно».
 */
import YAML from 'yaml';
import matter from 'gray-matter';

const API = 'https://api.github.com';
const RAW = 'https://raw.githubusercontent.com';
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'skilldeck-intake',
  ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
};

const get = async (url, as = 'json') => {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return as === 'json' ? r.json() : r.text();
};

const CODE = /\.(py|sh|bash|zsh|js|mjs|cjs|ts|rb|go|ps1)$/i;
const TEXT = /\.(md|txt|ya?ml|json|toml|csv|html|css|py|sh|bash|zsh|js|mjs|cjs|ts|rb|go|ps1)$/i;
// Невидимые и меняющие направление символы: ими прячут инструкции от человека.
const HIDDEN = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF\u{E0000}-\u{E007F}]/u;
const EXEC = [
  /\bsubprocess\.|\bos\.system\(|\bos\.popen\(/,
  /\bchild_process\b|\bexecSync\(|\bspawnSync?\(/,
  /\beval\(|\bexec\(/,
  /\bcurl\s|\bwget\s/,
];
const NET_CALL = /\b(fetch\(|requests\.(get|post)|urllib|http\.client|axios|XMLHttpRequest|curl\s|wget\s|WebSocket\()/;
const OUTSIDE = /(~\/|\$HOME|os\.path\.expanduser|homedir\(\)|\/etc\/|\/usr\/local)/;
const URL_RE = /https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi;
const LOCAL = /^(localhost|127\.|0\.0\.0\.0|example\.(com|org)|.*\.example)$/;

const args = process.argv.slice(2);
const repo = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
  console.error('usage: intake.mjs <owner/repo> [--skill name] [--path dir] [--json]');
  process.exit(2);
}

const meta = await get(`${API}/repos/${repo}`);
const head = await get(`${API}/repos/${repo}/commits/${meta.default_branch}`);
const commit = head.sha;
const tree = (await get(`${API}/repos/${repo}/git/trees/${commit}?recursive=1`)).tree;
const skillFiles = tree.filter((t) => t.type === 'blob' && /(^|\/)SKILL\.md$/.test(t.path));
const dirOf = (p) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');

const wantPath = opt('--path');
const wantSkill = opt('--skill');
if (!wantPath && !wantSkill) {
  console.log(`${repo} @ ${commit.slice(0, 12)} · ★${meta.stargazers_count} · ${meta.license?.spdx_id ?? 'none'}`);
  for (const f of skillFiles) console.log(`  ${dirOf(f.path) || '.'}`);
  process.exit(0);
}

const candidates = skillFiles.filter((f) => {
  const d = dirOf(f.path);
  return wantPath !== undefined ? d === wantPath.replace(/^\.$|\/$/g, '') : d.split('/').pop() === wantSkill || (!d && meta.name === wantSkill);
});
if (candidates.length !== 1) {
  console.error(`Нашлось ${candidates.length} SKILL.md под условие. Уточните --path. Есть:`);
  for (const f of skillFiles) console.error(`  ${dirOf(f.path) || '.'}`);
  process.exit(1);
}
const dir = dirOf(candidates[0].path);
const inDir = tree.filter((t) => t.type === 'blob' && (dir === '' || t.path.startsWith(`${dir}/`)));
const rel = (p) => (dir ? p.slice(dir.length + 1) : p);

const skillMd = await get(`${RAW}/${repo}/${commit}/${candidates[0].path}`, 'text');
// Спецификация Agent Skills: валидный YAML, name совпадает с папкой и не
// длиннее 64, description до 1024. Агенты бывают снисходительнее парсера,
// но строгий загрузчик на таком файле падает — это пишем в разбор.
const spec = [];
let fm;
try {
  fm = matter(skillMd).data;
} catch {
  spec.push('фронтматтер SKILL.md — невалидный YAML');
  const head = skillMd.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  fm = Object.fromEntries([...head.matchAll(/^(name|description):\s*(.*)$/gm)].map((m) => [m[1], m[2].trim()]));
}
const folder = dir.split('/').pop() || meta.name;
if (!fm.name) spec.push('нет name');
else if (fm.name !== folder) spec.push(`name «${fm.name}» не совпадает с папкой «${folder}»`);
if (fm.name && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) spec.push('name не в формате a-z0-9 через дефис');
if (!fm.description) spec.push('нет description');
else if (String(fm.description).length > 1024) spec.push(`description длиннее 1024 (${String(fm.description).length})`);

// Лицензия: файл в папке скилла важнее лицензии репозитория.
const licFile = inDir.find((t) => /^LICEN[CS]E(\.\w+)?$/i.test(rel(t.path)));
let license = meta.license?.spdx_id && meta.license.spdx_id !== 'NOASSERTION' ? meta.license.spdx_id : 'none';
if (licFile) {
  const text = await get(`${RAW}/${repo}/${commit}/${licFile.path}`, 'text');
  if (/Apache License/i.test(text)) license = 'Apache-2.0';
  else if (/MIT License|Permission is hereby granted, free of charge/i.test(text)) license = 'MIT';
  else if (/Attribution-ShareAlike 4\.0/i.test(text)) license = 'CC-BY-SA-4.0';
  else if (/proprietary|All rights reserved/i.test(text)) license = 'proprietary';
}

const scripts = [];
const network = new Set();
const hidden = [];
let exec = false;
let outside = false;
const texts = inDir.filter((t) => TEXT.test(t.path) && t.size < 400_000);
for (const t of texts) {
  const body = await get(`${RAW}/${repo}/${commit}/${t.path}`, 'text');
  if (HIDDEN.test(body)) hidden.push(rel(t.path));
  if (!CODE.test(t.path)) continue;
  scripts.push(rel(t.path));
  if (EXEC.some((re) => re.test(body))) exec = true;
  if (OUTSIDE.test(body)) outside = true;
  if (NET_CALL.test(body)) for (const m of body.matchAll(URL_RE)) if (!LOCAL.test(m[1].toLowerCase())) network.add(m[1].toLowerCase());
}

const source = { repo, ...(dir && { path: dir }), commit: commit.slice(0, 12) };
if (fm.name && fm.name !== folder) source.skill = fm.name;
const scan = {
  date: new Date().toISOString().slice(0, 10),
  files: inDir.length,
  scripts: scripts.length,
  runs_commands: exec,
  network: [...network].sort(),
  outside_folder: outside,
  hidden_unicode: hidden,
  ...(spec.length && { spec_issues: spec }),
};
const report = {
  source,
  license,
  scan,
  upstream: { name: fm.name, description: fm.description, stars: meta.stargazers_count, pushed: meta.pushed_at?.slice(0, 10) },
};
if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
else console.log(YAML.stringify({ source, license, scan }).trim() + `\n# ${fm.name}: ${String(fm.description ?? '').slice(0, 300)}`);
