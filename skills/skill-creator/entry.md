---
name: skill-creator
title: "Создание и замер скиллов"
summary: "Помогает написать новый скилл или улучшить старый, гоняет на нём эвалы и подбирает описание, чтобы агент его находил."
origin: curated
author:
  name: Anthropic
  url: https://github.com/anthropics
source:
  repo: anthropics/skills
  path: skills/skill-creator
  commit: "e4bb5d960d87"
license: Apache-2.0
agents: [claude-code]
roles: [developer, universal]
tasks: [agents]
scan:
  date: "2026-11-21"
  files: 18
  scripts: 10
  runs_commands: true
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
---
18 файлов, 10 скриптов.
Прогоны эвалов идут через `claude -p`, поэтому в полном виде работает в Claude Code.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
