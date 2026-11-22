---
name: i-have-adhd
title: "Ответы для читателя с СДВГ"
summary: "Перестраивает ответы агента: сначала следующее действие, шаги по номерам, без отступлений, с конкретными оценками времени."
origin: curated
author:
  name: Ayoub Ghriss
  url: https://github.com/ayghri
source:
  repo: ayghri/i-have-adhd
  path: skills/i-have-adhd
  commit: "1ecea1993b7f"
license: MIT
agents: [claude-code, codex]
roles: [universal]
tasks: [token-economy]
scan:
  date: "2026-11-21"
  files: 3
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "в длинных ответах агента легко потеряться и нужно сразу видеть следующий шаг и место в задаче"
  how: "Включается командой и держится до конца сессии: первым — действие, шаги по номерам, состояние каждый ход"
  gives: "Ответы с действием в первой строке, шагами и оценкой времени"
  needs: "Ничего, кроме агента"
---
3 файла, без скриптов.
Включается командой /i-have-adhd и действует до конца сессии или до фразы «stop adhd mode».

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
