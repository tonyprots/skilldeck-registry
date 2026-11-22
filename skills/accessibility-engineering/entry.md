---
name: accessibility-engineering
title: "Доступность интерфейса по WCAG 2.2"
summary: "Прогоняет axe-core и pa11y, вручную проверяет, как интерфейс работает с клавиатурой и экранным диктором, затем исправляет найденные нарушения."
origin: curated
author:
  name: Addy Osmani
  url: https://github.com/addyosmani
source:
  repo: addyosmani/agent-skills
  path: skills/accessibility-engineering
  commit: "8c99fa36d900"
license: MIT
agents: [claude-code, codex]
roles: [designer, developer]
tasks: [ui-design]
scan:
  date: "2026-11-21"
  files: 2
  scripts: 1
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "интерфейс уже готов и перед выпуском нужна проверка доступности по WCAG 2.2 AA"
  how: "Прогоняет axe-core и pa11y, затем вручную проверяет клавиатуру, экранный диктор и масштаб 200%"
  gives: "Нарушения по уровням серьёзности и исправления в коде"
  needs: "Node для запуска axe-core и pa11y через npx; VoiceOver или NVDA"
---
2 файла, 1 скрипт.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
