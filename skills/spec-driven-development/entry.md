---
name: spec-driven-development
title: "Спецификация до первой строки кода"
summary: "Перед работой пишет спецификацию: цель, рамки, стек, команды, проверки. Код начинается только после неё."
origin: curated
author:
  name: Addy Osmani
  url: https://github.com/addyosmani
source:
  repo: addyosmani/agent-skills
  path: skills/spec-driven-development
  commit: "8c99fa36d900"
license: MIT
agents: [claude-code, codex]
roles: [product, developer]
tasks: [planning, coding]
scan:
  date: "2026-11-21"
  files: 1
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "начинается новый проект или фича в коде, а требования есть только в виде смутной идеи"
  how: "Ведёт четыре фазы и после каждой ждёт одобрения: спецификация из шести разделов, план, задачи, код"
  gives: "Спецификация SPEC.md, план tasks/plan.md и список задач tasks/todo.md"
  needs: "Ничего, кроме агента"
---
1 файл, без скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
