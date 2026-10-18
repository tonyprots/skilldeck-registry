#!/usr/bin/env node
// Проверка реестра. С флагом --production — как перед публикацией:
// черновики пропускаются, демо-прогоны считаются ошибкой.
import { loadRegistry } from './lib.mjs';

const production = process.argv.includes('--production');
const { entries, errors } = loadRegistry({ production });
const runs = entries.reduce((n, e) => n + e.runs.length, 0);

if (errors.length) {
  console.error(`Ошибок: ${errors.length}`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`ОК: карточек ${entries.length}, прогонов ${runs}${production ? ' (режим публикации)' : ''}`);
