---
name: skill-inspector
title: "Проверка чужого скилла перед установкой"
summary: "Решает, безопасно ли ставить скилл, по его правам, рискам и признакам вредоносного кода. Проверку ведёт по двум независимым линиям."
origin: curated
author:
  name: NVIDIA
  url: https://github.com/NVIDIA
source:
  repo: NVIDIA/SkillSpector
  path: skills/skill-inspector
  commit: "48e0f942ea1f"
license: Apache-2.0
agents: [claude-code, codex]
roles: [universal, developer]
tasks: [security, agents]
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
  pick: "перед установкой чужого скилла нужно проверить его права, сетевые запросы и скрытое поведение"
  how: "Сводит две линии: статический прогон SkillSpector и чтение исходников агентом; скрипты проверяемого скилла не запускает"
  gives: "Отчёт с вердиктом APPROVE, CAUTION или REJECT и доказательствами по файлам"
  needs: "Утилита NVIDIA SkillSpector; без неё — ручной разбор с меньшей уверенностью"
---
1 файл, без скриптов.
Опирается на утилиту NVIDIA SkillSpector; без неё есть ручной режим.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
