---
name: baseline-ui
title: "Быстрая чистка интерфейса от шаблонности"
summary: "Правит отступы, иерархию, типографику и мелкие огрехи вёрстки, а в режиме проверки цитирует каждую строку с нарушением."
origin: curated
author:
  name: Julien Thibeaut
  url: https://github.com/ibelick
source:
  repo: ibelick/ui-skills
  path: skills/baseline-ui
  commit: "7ef0076fce1d"
license: MIT
agents: [claude-code, codex]
roles: [designer, developer]
tasks: [ui-design]
scan:
  date: "2026-11-21"
  files: 1
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "вёрстку на Tailwind нужно быстро очистить от шаблонных приёмов или проверить файл по правилам"
  how: "Один файл жёстких правил MUST и NEVER: стек, примитивы, анимация, типографика, раскладка"
  gives: "Нарушения с цитатой строки, причиной и правкой в коде"
  needs: "Проект на Tailwind CSS: правила опираются на его классы"
---
1 файл, без скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
