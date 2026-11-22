---
name: canvas-design
title: "Постеры и статичная графика"
summary: "Придумывает визуальную идею и по ней рисует постер или иллюстрацию в PNG или PDF."
origin: curated
author:
  name: Anthropic
  url: https://github.com/anthropics
source:
  repo: anthropics/skills
  path: skills/canvas-design
  commit: "e4bb5d960d87"
license: Apache-2.0
agents: [claude-code, codex]
roles: [designer, marketer]
tasks: [graphics]
scan:
  date: "2026-11-21"
  files: 83
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "нужен постер или арт-объект, где изображение важнее текста"
  how: "Сначала пишет манифест визуального направления, потом по нему рисует кодом страницу почти без текста"
  gives: "Постер в PNG или PDF и файл .md с манифестом"
  needs: "Среда, где агент рисует кодом в PNG или PDF; шрифты лежат в папке скилла"
---
83 файла, без скриптов.
В папке лежат шрифты, отсюда больше восьмидесяти файлов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
