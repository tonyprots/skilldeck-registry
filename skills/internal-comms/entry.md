---
name: internal-comms
title: "Внутренние рассылки и статусы"
summary: "По готовым образцам пишет статусы команды, сводки для руководства, рассылки по компании и ответы на частые вопросы."
origin: curated
author:
  name: Anthropic
  url: https://github.com/anthropics
source:
  repo: anthropics/skills
  path: skills/internal-comms
  commit: "e4bb5d960d87"
license: Apache-2.0
agents: [claude-code, codex]
roles: [manager, writer]
tasks: [writing]
scan:
  date: "2026-11-21"
  files: 6
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "нужен статус команды в формате «прогресс, планы, проблемы», апдейт для руководства или рассылка"
  how: "Определяет тип сообщения и пишет по файлу-образцу: 3P-апдейт, рассылка по компании, ответы на частые вопросы"
  gives: "Текст статуса, сводки для руководства, рассылки или FAQ по образцу"
  needs: "Ничего, кроме агента"
---
6 файлов, без скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
