---
name: research
title: "Исследование по первоисточникам"
summary: "Запускает фоновое исследование вопроса по первоисточникам и сохраняет вывод в репозиторий Markdown-файлом."
origin: curated
author:
  name: Matt Pocock
  url: https://github.com/mattpocock
source:
  repo: mattpocock/skills
  path: skills/engineering/research
  commit: "abeeaf95660b"
license: MIT
agents: [claude-code, codex]
roles: [researcher, developer]
tasks: [research]
scan:
  date: "2026-11-21"
  files: 2
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "нужно собрать факты по API или документации, не прерывая основную работу"
  how: "Отдаёт вопрос фоновому агенту, который читает только первоисточники: документацию, код, спецификации"
  gives: "Markdown-файл в репозитории с источником у каждого утверждения"
  needs: "Ничего, кроме агента"
---
2 файла, без скриптов.
Сам SKILL.md короткий: двенадцать строк про то, как поставить задачу фоновому агенту.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
