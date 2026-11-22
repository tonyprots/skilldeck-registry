---
name: nativeprompt
title: "Промпт под конкретную модель по правилам вендора"
summary: "Показывает, что поправить в промпте для Claude, Codex, Gemini и других моделей, и к каждому совету даёт ссылку на правило вендора."
origin: curated
author:
  name: Edvard Grishin
  url: https://github.com/edvardgrishin27
source:
  repo: edvardgrishin27/nativeprompt
  commit: "f2ab8f3b97df"
license: MIT
agents: [claude-code, codex]
roles: [universal, developer]
tasks: [agents]
scan:
  date: "2026-11-21"
  files: 112
  scripts: 38
  runs_commands: true
  network:
    - "github.com"
  outside_folder: true
  hidden_unicode: []
todo: why
compare:
  pick: "нужно подогнать промпт или CLAUDE.md под Claude, Codex, Gemini или другую модель по правилам вендора"
  how: "Утилита проверяет промпт по правилам вендора модели, агент переписывает его по метапромпту утилиты, не додумывая задачу"
  gives: "Улучшенный промпт, находки со ссылками на вендора, совет по уровню усилий"
  needs: "Утилита nativeprompt на Python, ставится через pipx"
---
112 файлов, 38 скриптов.
Работает через утилиту nativeprompt на Python, её ставят отдельно через pipx. Спорные фразы оставляет на решение человека.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
