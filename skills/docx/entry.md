---
name: docx
title: "Документы Word"
summary: "Создаёт и редактирует файлы .docx: оглавление, номера страниц, таблицы, правки в режиме рецензирования."
origin: curated
author:
  name: Anthropic
  url: https://github.com/anthropics
source:
  repo: anthropics/skills
  path: skills/docx
  commit: "e4bb5d960d87"
license: Apache-2.0
agents: [claude-code, codex]
roles: [universal]
tasks: [documents]
scan:
  date: "2026-11-21"
  files: 61
  scripts: 15
  runs_commands: true
  network:
    - "schemas.openxmlformats.org"
  outside_folder: false
  hidden_unicode: []
  note: "Адрес schemas.openxmlformats.org — пространство имён формата OOXML в коде, а не запрос в сеть."
todo: why
compare:
  pick: "нужен файл Word или правки в чужом .docx в режиме рецензирования и с комментариями"
  how: "Новый документ пишет скриптом на библиотеке docx, готовый распаковывает и правит XML, сверяет рендером"
  gives: "Файл .docx с оглавлением, таблицами, комментариями или рецензированием"
  needs: "Node.js с пакетом docx, Python, pandoc, LibreOffice и Poppler"
---
61 файл, 15 скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
