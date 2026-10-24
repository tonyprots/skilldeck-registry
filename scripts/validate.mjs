#!/usr/bin/env node
// Проверка реестра. С флагом --production — как перед публикацией:
// черновики пропускаются, демо-прогоны считаются ошибкой, а редакторские
// хвосты («Черновик редакции» без todo, «проверить» в scan.note) — тоже.
// Карточки с todo: why — предупреждение: сборка зелёная, раздел на сайте скрыт.
import { loadRegistry } from './lib.mjs';

const production = process.argv.includes('--production');
const { entries, errors, warnings } = loadRegistry({ production });
const runs = entries.reduce((n, e) => n + e.runs.length, 0);

if (warnings.length) {
  console.warn(`Предупреждений: ${warnings.length}`);
  for (const w of warnings) console.warn(`  ${w}`);
}

if (errors.length) {
  console.error(`Ошибок: ${errors.length}`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`ОК: карточек ${entries.length}, прогонов ${runs}${production ? ' (режим публикации)' : ''}`);
