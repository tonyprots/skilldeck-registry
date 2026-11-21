---
name: ex-ussr-kinship-research
title: "Генеалогия по архивам бывшего СССР и Российской империи"
summary: "Ищет родственников в метрических, военных, миграционных записях и документах о репрессиях, сверяет однофамильцев и собирает доказательную цепочку в отчёт."
origin: curated
author:
  name: Denis Shiryaev
  url: https://github.com/DenisSergeevitch
source:
  repo: DenisSergeevitch/ex-ussr-kinship-research
  commit: "d2ce9075de02"
license: MIT
agents: [claude-code, codex]
roles: [researcher, universal]
tasks: [research]
scan:
  date: "2026-11-21"
  files: 92
  scripts: 18
  runs_commands: true
  network:
    - "archive.org"
    - "gwar.mil.ru"
    - "other.invalid"
    - "www.familysearch.org"
  outside_folder: true
  hidden_unicode: []
  note: "Адрес other.invalid — заглушка: домен .invalid зарезервирован и никуда не ведёт."
todo: why
---
92 файла, 18 скриптов.
Ведёт поиск сам, часами, и сохраняет каждую находку вместе с источником. Работает с персональными данными. Отвечает на языке пользователя.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
