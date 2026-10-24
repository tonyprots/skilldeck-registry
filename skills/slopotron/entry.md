---
name: slopotron
title: "Чистка русского текста от ИИ-маркеров"
summary: "Находит канцелярит и мёртвые паттерны, по которым видно нейросеть, и правит их или только перечисляет. Логику и структуру текста не трогает."
origin: curated
author:
  name: beaverbeard
  url: https://github.com/beaverbeard
source:
  repo: beaverbeard/slopotron
  path: .claude/skills/slopotron
  commit: "122d38545c7e"
license: MIT
agents: [claude-code]
roles: [writer, marketer]
tasks: [russian-text]
scan:
  date: "2026-10-19"
  files: 1
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
  spec_issues:
    - "фронтматтер SKILL.md — невалидный YAML"
---

Два режима: правка и список флагов. Один файл SKILL.md, без скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
