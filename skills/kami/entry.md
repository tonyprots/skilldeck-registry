---
name: kami
title: "Вёрстка документов по шаблонам"
summary: "Верстает резюме, одностраничники, письма, портфолио и слайды по готовым шаблонам и отдаёт PDF."
origin: curated
author:
  name: Tw93
  url: https://github.com/tw93
source:
  repo: tw93/Kami
  path: skills/kami
  commit: "27177605ad00"
license: MIT
agents: [claude-code, codex]
roles: [designer, universal]
tasks: [documents, career]
scan:
  date: "2026-11-21"
  files: 124
  scripts: 29
  runs_commands: true
  network:
    - "cdn.jsdelivr.net"
    - "cdn.jsdmirror.com"
    - "github.com"
    - "tsanger.cn"
  outside_folder: true
  hidden_unicode:
    - "scripts/hangul.py"
  note: "Скрытый символ — WORD JOINER в scripts/hangul.py: им скилл склеивает корейские слова, чтобы строка не рвалась посередине слова."
draft: true
---
124 файла, 29 скриптов.
Сделан для китайского рынка: часть подсказок на китайском, шрифты грузятся с китайских CDN. Раз в день проверяет обновления на GitHub.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
