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
compare:
  pick: "от исследования зависит решение и каждый факт должен держаться на цитате из источника"
  how: "Ведёт 13 фаз с субагентами: план, поиск, реестр утверждений с цитатами, red team против выводов, сверка"
  gives: "HTML-страница с ответом, полный PDF и папка с источниками"
  needs: "Claude Code с субагентами, uv, pandoc; для PDF — headless Chromium"
---
301 файл, 94 скрипта.
Рассчитан на Claude Code: запускает субагентов, а скрипты — через uv, отчёт сохраняет в папку исследования.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
