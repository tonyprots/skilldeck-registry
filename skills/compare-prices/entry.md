---
name: compare-prices
title: "Где дешевле: Wildberries, Ozon, Яндекс Маркет и другие площадки"
summary: "Одним запросом ищет товар на десяти площадках, сортирует предложения по цене и проверяет карточку самого дешёвого."
origin: curated
author:
  name: Vladimir-Human
  url: https://github.com/Vladimir-Human
source:
  repo: Vladimir-Human/ru-marketplace-mcp
  path: skills/compare-prices
  commit: "20fc7dc6f28a"
license: MIT
agents: [claude-code, codex]
roles: [universal]
tasks: [shopping]
scan:
  date: "2026-11-21"
  files: 1
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
  note: "Разбор охватывает только папку скилла. Сеть, команды и браузер — у MCP-сервера ru-marketplace-mcp, его код в этот разбор не входил."
draft: true
---
1 файл, без скриптов.
Сам скилл — инструкция для агента, а запросы к площадкам делает MCP-сервер ru-marketplace-mcp из того же репозитория, его ставят отдельно. Только чтение, без ключей API. Часть площадок сервер открывает через ваш отдельный Chrome, для Taobao и Мегамаркета в нём нужен вход покупателя.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
