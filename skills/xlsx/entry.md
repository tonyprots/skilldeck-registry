---
name: xlsx
title: "Таблицы Excel и CSV"
summary: "Читает, правит и создаёт таблицы с формулами, форматированием и графиками. Формулы пересчитывает в LibreOffice и проверяет, нет ли ошибок."
origin: curated
author:
  name: Anthropic
  url: https://github.com/anthropics
source:
  repo: anthropics/skills
  path: skills/xlsx
  commit: "e4bb5d960d87"
license: Apache-2.0
agents: [claude-code, codex]
roles: [analyst, universal]
tasks: [data]
scan:
  date: "2026-11-21"
  files: 53
  scripts: 12
  runs_commands: true
  network:
    - "schemas.openxmlformats.org"
  outside_folder: false
  hidden_unicode: []
  note: "Адрес schemas.openxmlformats.org — пространство имён формата OOXML в коде, а не запрос в сеть. Сокет в scripts/office/soffice.py локальный (AF_UNIX): через него скилл обращается к LibreOffice."
todo: why
---
53 файла, 12 скриптов.
Для пересчёта формул нужен LibreOffice.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
