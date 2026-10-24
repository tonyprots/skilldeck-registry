---
name: agranovsky
title: "Фактчекинг текстов после нейросети"
summary: "Проверяет каждое фактическое утверждение по источникам: выдуманные числа, цитаты, законы и ссылки. Стиль и грамматику не трогает."
origin: curated
author:
  name: beaverbeard
  url: https://github.com/beaverbeard
source:
  repo: beaverbeard/agranovsky
  path: .claude/skills/agranovsky
  commit: "7c81cb21e1de"
license: MIT
agents: [claude-code]
roles: [writer, researcher, marketer]
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

Один вопрос к каждому факту — где пруф. Один файл SKILL.md; источники агент ищет своими средствами.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
