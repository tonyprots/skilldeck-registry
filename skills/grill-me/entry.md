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
license: MIT
agents: [claude-code, codex, cursor]
tasks: [planning]
works_with_russian: false
install:
  plugin:
    marketplace: mattpocock
    plugin: mattpocock-skills
---

Три строки инструкции, а агент перестаёт кивать и начинает спорить. Ставлю
перед любым планом, где решение дороже часа работы.
