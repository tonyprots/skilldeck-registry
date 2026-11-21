---
name: pptx
title: "Презентации PowerPoint"
summary: "Собирает деку в .pptx, вытаскивает текст из чужой, правит слайды по шаблону и показывает сетку миниатюр для проверки."
origin: curated
author:
  name: Anthropic
  url: https://github.com/anthropics
source:
  repo: anthropics/skills
  path: skills/pptx
  commit: "e4bb5d960d87"
license: Apache-2.0
agents: [claude-code, codex]
roles: [universal, manager]
tasks: [presentations, documents]
scan:
  date: "2026-11-21"
  files: 58
  scripts: 17
  runs_commands: true
  network:
    - "schemas.openxmlformats.org"
  outside_folder: false
  hidden_unicode: []
  note: "Адрес schemas.openxmlformats.org — пространство имён формата OOXML в коде, а не запрос в сеть."
draft: true
---
58 файлов, 17 скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
