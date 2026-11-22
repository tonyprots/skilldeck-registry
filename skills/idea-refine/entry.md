---
name: idea-refine
title: "Доводка сырой идеи"
summary: "Расширяет набор вариантов, проверяет скрытые допущения и сужает идею до одностраничника, с которым можно идти дальше."
origin: curated
author:
  name: Addy Osmani
  url: https://github.com/addyosmani
source:
  repo: addyosmani/agent-skills
  path: skills/idea-refine
  commit: "8c99fa36d900"
license: MIT
agents: [claude-code, codex]
roles: [product, founder]
tasks: [product, planning]
scan:
  date: "2026-11-21"
  files: 5
  scripts: 1
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "идея ещё сырая и нужно расширить варианты, вскрыть допущения и сузить её до MVP"
  how: "Ведёт три фазы: 5–8 вариантов идеи, сужение до 2–3 направлений с допущениями, план MVP"
  gives: "Одностраничник docs/ideas/[идея].md со списком «Не делаем»"
  needs: "Ничего, кроме агента"
---
5 файлов, 1 скрипт.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
