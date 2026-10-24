#!/usr/bin/env node
// Снимок звёзд и дат коммитов с GitHub → stats.json (решение 2026-10-22).
// Сборка в сеть не ходит: lib.mjs читает готовый файл. Звёзды — у всего
// репозитория, не у скилла, и с датой снимка; это не живое число.
//
//   GITHUB_TOKEN=$(gh auth token) node scripts/github-stats.mjs
//
// Берёт все карточки, включая черновики и участников наборов, у которых
// источник на GitHub. Существующие записи для других репозиториев сохраняет.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadRegistry, ROOT } from './lib.mjs';

const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'skilldeck-stats',
  ...(token && { Authorization: `Bearer ${token}` }),
};
const get = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
};

const { entries } = loadRegistry({ withRuns: false, withDrafts: true });
// Участники наборов в entries не попадают — берём их из members.
const sources = entries
  .flatMap((e) => [e, ...(e.members ?? [])])
  .map((e) => e.source)
  .filter((s) => s && (s.host ?? 'github') === 'github');

const file = join(ROOT, 'stats.json');
const stats = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
const today = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD по местному времени
const problems = [];

for (const repo of [...new Set(sources.map((s) => s.repo))].sort()) {
  try {
    const r = await get(`/repos/${repo}`);
    stats[repo] = { stars: r.stargazers_count, date: today };
  } catch (err) {
    problems.push(err.message);
  }
}
for (const key of [...new Set(sources.map((s) => `${s.repo}@${s.commit}`))].sort()) {
  const [repo, commit] = key.split('@');
  try {
    const c = await get(`/repos/${repo}/commits/${commit}`);
    stats[key] = { commit_date: c.commit.committer.date.slice(0, 10) };
  } catch (err) {
    problems.push(err.message);
  }
}

const sorted = Object.fromEntries(Object.keys(stats).sort().map((k) => [k, stats[k]]));
writeFileSync(file, JSON.stringify(sorted, null, 2) + '\n');
console.log(`stats.json: ${Object.keys(sorted).length} записей`);
if (problems.length) {
  console.error(`Не получилось: ${problems.length}`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
