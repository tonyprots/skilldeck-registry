---
name: clean-user-facing-text
title: "Чистка текста перед публикацией"
summary: "Убирает скрытый юникод и следы нейросети, сохраняя факты, цифры и голос автора."
origin: curated
author:
  name: Guillaume Meyer
  url: https://github.com/guillaumemeyer
source:
  repo: guillaumemeyer/watermarks-remover
  path: skills/clean-user-facing-text
  commit: "5a62be6338d2"
license: MIT
agents: [claude-code, codex]
roles: [writer]
tasks: [writing]
scan:
  date: "2026-11-21"
  files: 10
  scripts: 5
  runs_commands: true
  network: []
  outside_folder: false
  hidden_unicode:
    - "scripts/text_unicode.py"
  note: "Скрытый юникод в scripts/text_unicode.py — образцы невидимых символов, которые скилл находит и вычищает."
todo: why
compare:
  pick: "в тексте могут быть невидимые символы и омоглифы и прозу нужно править по замеру, а не на глаз"
  how: "Скриптом вычищает скрытый юникод, меряет текст стилометрией и переписывает прозу только при высоком балле"
  gives: "Копия файла с вычищенным текстом и балл стилометрии до и после"
  needs: "Python 3"
---
10 файлов, 5 скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
