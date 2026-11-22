---
name: pptx
title: "Презентации PowerPoint"
summary: "Собирает презентацию в .pptx, вытаскивает текст из чужой, правит слайды по шаблону и показывает сетку миниатюр для выбора макета."
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
tasks: [presentations]
scan:
  date: "2026-11-21"
  files: 58
  scripts: 17
  runs_commands: true
  network:
    - "schemas.openxmlformats.org"
  outside_folder: false
  hidden_unicode: []
  note: "Адрес schemas.openxmlformats.org — пространство имён формата OOXML в коде, а не запрос в сеть."
todo: why
compare:
  pick: "нужен файл PowerPoint: собрать новый, поправить по шаблону или достать текст из чужого"
  how: "Новую презентацию пишет скриптом на pptxgenjs, чужую правит в XML по шаблону, проверяет валидатором и рендером"
  gives: "Файл .pptx, текст слайдов и сетка миниатюр макетов"
  needs: "Node с pptxgenjs, Python, LibreOffice и Poppler для рендера слайдов"
---
58 файлов, 17 скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
