---
name: systematic-debugging
title: "Отладка по шагам до любой правки"
summary: "Перед исправлением бага агент воспроизводит его, сужает место, проверяет гипотезу доказательством и только потом правит."
origin: curated
author:
  name: Jesse Vincent
  url: https://github.com/obra
source:
  repo: obra/superpowers
  path: skills/systematic-debugging
  commit: "bb92a7774141"
license: MIT
agents: [claude-code, codex]
roles: [developer]
tasks: [coding]
scan:
  date: "2026-10-19"
  files: 11
  scripts: 2
  runs_commands: false
  network: []
  outside_folder: true
  hidden_unicode: []
draft: true
---

Из набора superpowers. Внутри примеры на TypeScript и shell; разбор отметил обращения к путям вне папки — нужен просмотр.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
