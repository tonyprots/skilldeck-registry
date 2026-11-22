---
name: understand
title: "Граф знаний по кодовой базе"
summary: "Разбирает проект, строит граф архитектуры, компонентов и связей и показывает его на интерактивной панели."
origin: curated
author:
  name: EgonexAI
  url: https://github.com/Egonex-AI
source:
  repo: Egonex-AI/Understand-Anything
  path: understand-anything-plugin/skills/understand
  commit: "bb70fdb0489f"
license: MIT
agents: [claude-code]
roles: [developer, manager]
tasks: [coding]
scan:
  date: "2026-11-21"
  files: 57
  scripts: 15
  runs_commands: true
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "в незнакомом проекте нужно увидеть слои, компоненты и связи на одной карте"
  how: "Делит проект на пачки файлов, разбирает их субагентами и собирает граф; после коммитов может обновлять его"
  gives: "Файл knowledge-graph.json и интерактивная панель с графом и экскурсией по коду"
  needs: "Плагин Understand-Anything для Claude Code, Node 22+, pnpm 10+, Python"
---
57 файлов, 15 скриптов.
Устроен как плагин Claude Code: команда `/understand` и панель автора.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
