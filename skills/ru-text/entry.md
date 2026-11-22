---
name: ru-text
title: "Вычитка русского текста: типографика и редактура"
summary: "Молча правит типографику в любом русском тексте агента, а по просьбе редактирует: приводит к инфостилю, правит деловые письма и тексты интерфейса, убирает следы нейросети."
origin: curated
author:
  name: Arseniy Kamyshev
  url: https://github.com/talkstream
source:
  repo: talkstream/ru-text
  path: skills/ru-text
  commit: "e398aec9e6f0"
license: MIT
agents: [claude-code, codex]
roles: [writer, marketer, universal]
tasks: [russian-text, writing]
scan:
  date: "2026-11-21"
  files: 13
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "агент пишет по-русски и ёлочки, тире и неразрывные пробелы должны ставиться сами, без отдельной команды"
  how: "Молча правит типографику в любом русском ответе агента, а по просьбе редактирует по справочникам под жанр"
  gives: "Исправленный текст со списком правок, по команде — оценка текста от 0 до 10"
  needs: "Ничего, кроме агента"
---
13 файлов, без скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
