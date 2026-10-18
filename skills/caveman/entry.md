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
license: Apache-2.0
agents: [claude-code, codex]
tasks: [token-economy]
works_with_russian: true
install:
  plugin:
    marketplace: caveman
    plugin: caveman
---

Хотел сэкономить на длинных сессиях. Оказалось, что стоимость растёт не от
длины ответов, а от хвоста контекста, и сжатие ответов почти ничего не даёт.
