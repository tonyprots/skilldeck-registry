---
name: to-tickets
title: "Разбивка плана на задачи"
summary: "Делит план или спецификацию на сквозные задачи со связями блокировки и заводит их в трекер."
origin: curated
author:
  name: Matt Pocock
  url: https://github.com/mattpocock
source:
  repo: mattpocock/skills
  path: skills/engineering/to-tickets
  commit: "abeeaf95660b"
license: MIT
agents: [claude-code, codex]
roles: [manager, product]
tasks: [planning]
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
  pick: "план или спецификация готовы и их нужно разбить на связанные задачи для агентов"
  how: "Запускается только вручную, режет план на сквозные срезы с зависимостями и публикует в трекер"
  gives: "Задачи в трекере или по файлу на задачу в папке.scratch/"
  needs: "Скилл автора setup-matt-pocock-skills, для GitHub или Linear — аккаунт"
---
2 файла, без скриптов.
Трекер и метки задаются отдельным скиллом автора `setup-matt-pocock-skills`.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
