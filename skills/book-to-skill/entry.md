---
name: book-to-skill
title: "Скилл из книги или документа"
summary: "Вытаскивает из книги принципы, ментальные модели, техники и антипаттерны и собирает из них скилл для агента. Читает PDF, EPUB, DOCX и другие форматы."
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
  note: "Скрытые символы безвредны: соединители внутри сингальских и персидских слов (комментарии, тесты, CHANGELOG), образцы управляющих символов в тестах собственного чистильщика и BOM в комментарии к коду. Адрес example.invalid — заглушка."
todo: why
compare:
  pick: "нужно, чтобы агент применял методы автора книги или документа, а не пересказывал их"
  how: "Достаёт текст скриптом на Python и по главам вынимает фреймворки, принципы, техники и антипаттерны"
  gives: "Папка скилла: SKILL.md, главы, глоссарий, паттерны, шпаргалка"
  needs: "Python 3 и пакеты-экстракторы под формат файла; для публикации на GitHub — gh"
---
171 файл, 119 скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
