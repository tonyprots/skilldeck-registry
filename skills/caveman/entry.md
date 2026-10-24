---
name: caveman
title: Сжатые ответы агента ради экономии токенов
summary: Агент отвечает телеграфным стилем, сохраняя технический смысл. Есть русские режимы.
origin: curated
author:
  name: Julius Brussee
  url: https://github.com/JuliusBrussee
source:
  repo: JuliusBrussee/caveman
  path: skills/caveman
  commit: "bad48a0e1df5"
license: Apache-2.0
agents: [claude-code, codex]
roles: [developer, universal]
tasks: [token-economy]
scan:
  date: "2026-10-19"
  files: 2
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
install:
  plugin:
    marketplace: caveman
    plugin: caveman
draft: true
---

Хотел сэкономить на длинных сессиях. Оказалось, что стоимость растёт не от
длины ответов, а от хвоста контекста, и сжатие ответов почти ничего не даёт.
