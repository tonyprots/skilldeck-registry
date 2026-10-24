#!/usr/bin/env node
// index.json в корне реестра: тот же каталог, что отдаёт сайт, для агента,
// который читает репозиторий напрямую. Собирается в режиме публикации.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadRegistry, buildIndex, ROOT } from './lib.mjs';

const { entries, tasks, errors } = loadRegistry({ production: true });
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
const index = buildIndex(entries, { tasks });
writeFileSync(join(ROOT, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(`index.json: ${index.skills.length}`);
