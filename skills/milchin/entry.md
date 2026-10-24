---
name: milchin
title: "Типограф русского текста без модели"
summary: "Ёлочки, тире, неразрывные пробелы, многоточие и чистка невидимых символов по однозначным правилам. Скрипт на Python, ноль токенов."
origin: curated
author:
  name: beaverbeard
  url: https://github.com/beaverbeard
source:
  repo: beaverbeard/milchin
  path: .claude/skills/milchin
  commit: "09e376847393"
license: MIT
agents: [claude-code]
roles: [writer]
tasks: [russian-text]
scan:
  date: "2026-10-19"
  files: 2
  scripts: 1
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: [milchin.py]
  spec_issues:
    - "фронтматтер SKILL.md — невалидный YAML"
  note: "Невидимые символы — только в строковых константах: то, что типограф вычищает, неразрывный пробел, который он ставит, два служебных маркера и самотест. Проверили глазами на закреплённом коммите."
---

Работу делает milchin.py без зависимостей; модель только запускает его.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
