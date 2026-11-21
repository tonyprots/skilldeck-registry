---
name: deepdive
title: "Веб-ресёрч под решение с источником у каждого факта"
summary: "Собирает источники, под каждый факт кладёт дословную цитату, проверяет выводы контраргументами и заканчивает рекомендацией."
origin: curated
author:
  name: Ion
  url: https://github.com/Socialpranker
source:
  repo: Socialpranker/deepdive
  commit: "e2337975f6b3"
license: MIT
agents: [claude-code]
roles: [researcher, founder, product]
tasks: [research]
scan:
  date: "2026-11-21"
  files: 301
  scripts: 94
  runs_commands: true
  network:
    - "feeds.example.co.uk"
    - "github.com"
    - "raw.githubusercontent.com"
  outside_folder: true
  hidden_unicode: []
draft: true
---
301 файл, 94 скрипта.
Рассчитан на Claude Code: запускает субагентов и скрипты через uv, отчёт сохраняет в папку исследования.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
