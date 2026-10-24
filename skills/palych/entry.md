---
name: palych
title: "Короткие и ясные ответы агента"
summary: "Агент сначала отвечает, потом объясняет ровно столько, сколько нужно: без вступлений, повторов и жаргона. Русский и английский, отвечает на языке вопроса."
origin: curated
author:
  name: ponomr
  url: https://github.com/ponomr
source:
  repo: ponomr/palych
  path: skills/palych
  commit: "57c2d6c848a3"
license: MIT
agents: [claude-code, codex]
roles: [universal]
tasks: [token-economy]
scan:
  date: "2026-10-19"
  files: 5
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
draft: true
---

Назван в честь Чехова. Работает на каждом ответе, если включён постоянно,
или по просьбе «объясни понятнее»; артефакты пишутся по своим правилам.
Пять файлов инструкций, кода нет. Соперник `caveman` в сравнении кратких
ответов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
