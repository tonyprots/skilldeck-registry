---
name: ponytail
title: "Минимальное решение без лишнего кода"
summary: "Решает задачу самой маленькой правкой и отвечает так, чтобы занятой человек понял с одного прочтения. В конце пишет, что не проверил."
origin: curated
author:
  name: DietrichGebert
  url: https://github.com/DietrichGebert
source:
  repo: DietrichGebert/ponytail
  path: skills/ponytail
  commit: "96608e078b2d"
license: MIT
agents: [claude-code, codex]
roles: [developer]
tasks: [coding, token-economy]
scan:
  date: "2026-11-21"
  files: 1
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
todo: why
compare:
  pick: "агент добавляет лишние абстракции и зависимости, а нужна самая маленькая правка, которая решает задачу"
  how: "Держится всю сессию: ищет готовое в проекте и стандартной библиотеке, пишет самый короткий дифф, который решает задачу целиком"
  gives: "Минимальная правка в коде и строка о том, что не проверено"
  needs: "Ничего, кроме агента"
---
1 файл, без скриптов.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
