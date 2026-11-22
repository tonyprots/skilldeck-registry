---
name: summarize-meeting
title: "Итоги встречи по расшифровке"
summary: "Делает из расшифровки заметку с участниками, темой, решениями и ключевыми тезисами, а задачи расписывает по ответственным и срокам."
origin: curated
author:
  name: Pawel Huryn
  url: https://github.com/phuryn
source:
  repo: phuryn/pm-skills
  path: pm-execution/skills/summarize-meeting
  commit: "9af7bfd0bc47"
license: MIT
agents: [claude-code, codex]
roles: [manager, universal]
tasks: [writing]
scan:
  date: "2026-11-21"
  files: 1
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "расшифровка встречи уже есть и из неё нужна заметка с решениями и задачами"
  how: "Разбирает расшифровку по одному шаблону: участники, тема, тезисы, решения, задачи и открытые вопросы"
  gives: "Заметка в Markdown с таблицей задач по ответственным и срокам"
  needs: "Ничего, кроме агента"
---
1 файл, без скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
