---
name: book-to-skill
title: "Скилл из книги или документа"
summary: "Превращает книгу в скилл для агента: вытаскивает принципы, модели, техники и антипаттерны. Читает PDF, EPUB, DOCX и другие форматы."
origin: curated
author:
  name: Virgilio Junior
  url: https://github.com/virgiliojr94
source:
  repo: virgiliojr94/book-to-skill
  commit: "57f3db51ff33"
license: MIT
agents: [claude-code, codex]
roles: [universal, researcher]
tasks: [agents]
scan:
  date: "2026-11-21"
  files: 171
  scripts: 119
  runs_commands: true
  network:
    - "arxiv.org"
    - "doi.org"
    - "example.invalid"
  outside_folder: true
  hidden_unicode:
    - "CHANGELOG.md"
    - "book_to_skill/utils.py"
    - "tests/test_book_to_skill.py"
    - "tests/test_sanitize_bidi_controls.py"
    - "tools/validate_skill.py"
  note: "Скрытые символы — соединители внутри сингальских и персидских слов в комментариях и тестах, образцы для проверки собственного чистильщика управляющих символов и BOM в комментарии. Адрес example.invalid — заглушка."
draft: true
---
171 файл, 119 скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
