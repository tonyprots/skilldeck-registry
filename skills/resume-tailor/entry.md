---
name: resume-tailor
title: "Резюме под конкретную вакансию"
summary: "Сопоставляет требования вакансии с вашим опытом и собирает под неё копию резюме. Если чего-то не хватает, спрашивает у вас."
origin: curated
author:
  name: Reactive Resume
  url: https://github.com/reactive-resume
source:
  repo: reactive-resume/reactive-resume
  path: plugins/reactive-resume/skills/resume-tailor
  commit: "897bcf8e740a"
license: MIT
agents: [claude-code, codex]
roles: [universal]
tasks: [career]
scan:
  date: "2026-11-21"
  files: 7
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "есть конкретная вакансия и резюме нужно переставить и переформулировать под её требования"
  how: "Строит таблицу «требование — подтверждение», спрашивает про пробелы и правит копию резюме, а не оригинал"
  gives: "Копия резюме под вакансию, журнал изменений и список пробелов"
  needs: "Ничего обязательного; по желанию — MCP-сервер Reactive Resume"
---
7 файлов, без скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
