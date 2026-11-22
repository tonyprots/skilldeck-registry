---
name: ui-ux-pro-max
title: База стилей, палитр и шрифтов для интерфейсов
summary: Поиск по базе из сотен стилей, палитр, шрифтовых пар и UX-правил для выбора направления дизайна.
origin: curated
author:
  name: Next Level Builder
  url: https://github.com/nextlevelbuilder
source:
  repo: nextlevelbuilder/ui-ux-pro-max-skill
  path: .claude/skills/ui-ux-pro-max
  commit: "56ea9cf174ed"
license: MIT
agents: [claude-code, codex, cursor]
roles: [designer, developer]
tasks: [ui-design]
scan:
  date: "2026-10-19"
  files: 73
  scripts: 18
  runs_commands: true
  network: [fonts.google.com, github.com]
  outside_folder: true
  hidden_unicode: []
install:
  plugin:
    marketplace: ui-ux-pro-max-skill
    plugin: ui-ux-pro-max
compare:
  pick: "направление ещё не выбрано и нужны варианты стиля, палитры и шрифтов для сравнения"
  how: "Ищет скриптом по локальной базе: 79 стилей, 192 палитры, 74 шрифтовые пары, 119 UX-правил"
  gives: "Дизайн-система проекта, по желанию в файле MASTER.md"
  needs: "Python 3, сторонние библиотеки не нужны"
---

Хорош, когда направление ещё не выбрано: быстро показывает варианты. Плох,
когда ему доверяют решение — готовая дизайн-система по умолчанию тёмная,
фиолетовая и со свечением, то есть ровно то, от чего потом чистишь.
