---
name: archify
title: "Схемы архитектуры и процессов в HTML"
summary: "Рисует схемы архитектуры, процессов, последовательностей и ERD отдельной HTML-страницей с экспортом в SVG и видео."
origin: curated
author:
  name: tt-a1i
  url: https://github.com/tt-a1i
source:
  repo: tt-a1i/archify
  path: archify
  commit: "8509a3d63e76"
license: Apache-2.0
agents: [claude-code, codex]
roles: [developer, designer]
tasks: [diagrams]
scan:
  date: "2026-11-21"
  files: 206
  scripts: 103
  runs_commands: true
  network: []
  outside_folder: true
  hidden_unicode: []
todo: why
compare:
  pick: "нужна проверенная схема архитектуры, процесса, ERD или таймлайна по описанию, Mermaid или коду"
  how: "Собирает схему из JSON строгого формата, проверяет валидатором и в браузере, берёт факты из кода"
  gives: "HTML-страница со схемой и экспортом в SVG, картинку и WebM"
  needs: "Node 18+ и Chrome, Chromium или Edge для проверки в браузере"
---
206 файлов, 103 скрипта.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
