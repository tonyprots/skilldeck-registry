---
name: webapp-testing
title: "Проверка веб-приложения в Playwright"
summary: "Пишет сценарии Playwright для локального приложения: поднимает сервер, кликает, снимает скриншоты и собирает логи браузера."
origin: curated
author:
  name: Anthropic
  url: https://github.com/anthropics
source:
  repo: anthropics/skills
  path: skills/webapp-testing
  commit: "e4bb5d960d87"
license: Apache-2.0
agents: [claude-code, codex]
roles: [developer]
tasks: [coding]
scan:
  date: "2026-11-21"
  files: 6
  scripts: 4
  runs_commands: true
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "нужно прокликать локальное веб-приложение, снять скриншоты или поймать ошибки в консоли"
  how: "Пишет скрипты Playwright на Python; хелпер поднимает один или несколько серверов, затем скрипт осматривает DOM и действует"
  gives: "Скрипт Playwright, скриншоты и логи консоли браузера"
  needs: "Python, библиотека Playwright и браузер Chromium"
---
6 файлов, 4 скрипта.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
