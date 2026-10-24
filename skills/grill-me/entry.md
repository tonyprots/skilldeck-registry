---
name: grill-me
title: Допрос плана по одному вопросу за раз
summary: Агент задаёт вопросы о плане или дизайне, пока не закроет каждую развилку. Короткий скилл, который меняет поведение сильнее длинных.
origin: curated
author:
  name: Matt Pocock
  url: https://github.com/mattpocock
source:
  repo: mattpocock/skills
  path: skills/productivity/grill-me
  commit: "49dd158d1076"
license: MIT
agents: [claude-code, codex, cursor]
roles: [product, developer, manager, founder]
tasks: [planning]
scan:
  date: "2026-10-19"
  files: 2
  scripts: 0
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
install:
  plugin:
    marketplace: mattpocock
    plugin: mattpocock-skills
draft: true
---

Три строки инструкции, а агент перестаёт кивать и начинает спорить. Ставлю
перед любым планом, где решение дороже часа работы.
