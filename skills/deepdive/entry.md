---
name: deepdive
title: "Исследование в вебе под решение: у каждого факта источник"
summary: "Каждый факт подкрепляет дословной цитатой из источника и проверяет выводы контраргументами. Отчёт заканчивается рекомендацией."
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
todo: why
---
301 файл, 94 скрипта.
Рассчитан на Claude Code: запускает субагентов, а скрипты — через uv, отчёт сохраняет в папку исследования.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
