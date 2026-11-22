---
name: compare-prices
title: "Где дешевле: Wildberries, Ozon, Яндекс Маркет и другие площадки"
summary: "Одним запросом ищет товар на десяти площадках, сортирует рублёвые предложения по цене и проверяет карточку самого дешёвого."
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
  note: "Разбор охватывает только папку скилла. Сеть, команды и браузер — у MCP-сервера ru-marketplace-mcp, его код в этот разбор не входил."
todo: why
compare:
  pick: "нужно одним запросом узнать, на какой российской площадке товар дешевле"
  how: "Одним вызовом MCP опрашивает десять площадок, сортирует рублёвые цены и сверяет карточку самого дешёвого"
  gives: "Список предложений от дешёвого к дорогому и отчёт, какие площадки ответили"
  needs: "Отдельный MCP-сервер ru-marketplace-mcp, Chrome; вход в Taobao и Мегамаркет"
---
1 файл, без скриптов.
Сам скилл — инструкция для агента, а запросы к площадкам делает MCP-сервер ru-marketplace-mcp из того же репозитория, его ставят отдельно. Только чтение, без ключей API. Часть площадок сервер открывает через отдельный профиль Chrome, для Taobao и Мегамаркета в нём нужно войти в аккаунт покупателя.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
