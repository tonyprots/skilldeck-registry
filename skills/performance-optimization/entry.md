---
name: performance-optimization
title: "Скорость приложения: сначала замер"
summary: "Чинит Core Web Vitals, запросы N+1 и размер бандла там, где замер показал, что тормозит фронтенд, бэкенд или база."
origin: curated
author:
  name: Addy Osmani
  url: https://github.com/addyosmani
source:
  repo: addyosmani/agent-skills
  path: skills/performance-optimization
  commit: "8c99fa36d900"
license: MIT
agents: [claude-code, codex]
roles: [developer]
tasks: [coding]
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
  pick: "приложение тормозит или просели Core Web Vitals и нужна правка, подтверждённая замером"
  how: "Цикл с замерами: базовая линия, одна правка, повторный замер; правку без выигрыша откатывает"
  gives: "Правки в коде с цифрами до и после и журнал отклонённых попыток"
  needs: "Инструменты замера: Lighthouse, web-vitals, профайлер; для проверок в CI — Node"
---
2 файла, без скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
