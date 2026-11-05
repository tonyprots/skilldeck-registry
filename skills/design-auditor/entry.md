---
name: design-auditor
title: "Приёмка готового интерфейса по 19 категориям"
summary: "Проверяет вёрстку или макет Figma: контраст, фокус, отступы, состояния, формы, тексты кнопок, тёмные паттерны — и ставит балл из ста с расчётом."
origin: curated
author:
  name: Ashutos1997
  url: https://github.com/Ashutos1997
source:
  repo: Ashutos1997/claude-design-auditor-skill
  skill: design-auditor
  commit: "e7a1f3153d8e"
license: none
agents: [claude-code, codex]
roles: [designer, developer]
tasks: [ui-design]
scan:
  date: "2026-11-05"
  files: 18
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
  spec_issues:
    - "name «design-auditor» не совпадает с папкой «claude-design-auditor-skill»"
---

Последний шаг перед сдачей: проходит по 19 категориям и показывает, откуда
взялся балл. По умолчанию проверяет выборочно, поэтому прошу его перебрать
все элементы, а не пару примеров: дефект обычно сидит в крайнем случае.

Лицензии в репозитории нет. Пользоваться можно, а брать его код в свой
проект — нет.
