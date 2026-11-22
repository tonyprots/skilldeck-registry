---
name: code-review-and-quality
title: "Ревью кода по пяти критериям"
summary: "Перед слиянием проверяет изменение на корректность, читаемость, архитектуру, безопасность и производительность."
origin: curated
author:
  name: Addy Osmani
  url: https://github.com/addyosmani
source:
  repo: addyosmani/agent-skills
  path: skills/code-review-and-quality
  commit: "8c99fa36d900"
license: MIT
agents: [claude-code, codex]
roles: [developer]
tasks: [coding]
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
  pick: "нужно проверить пул-реквест или дифф перед слиянием — свой, коллеги или написанный другим агентом"
  how: "Смотрит изменение по пяти осям: корректность, читаемость, архитектура, безопасность, скорость; начинает с тестов"
  gives: "Ревью с пометками Critical, Nit, Optional и вердиктом по изменению"
  needs: "Ничего, кроме агента"
---
1 файл, без скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
