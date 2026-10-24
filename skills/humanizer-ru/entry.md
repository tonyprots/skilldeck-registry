---
name: humanizer-ru
title: Чистка русского текста от следов нейросети
summary: Ищет канцелярит, номинальность и ИИ-штампы в русской прозе и правит, не трогая факты и голос автора. Со сканером, который ставит балл чистоты.
origin: curated
author:
  name: Илья Утов
  url: https://github.com/ilyautov
source:
  repo: ilyautov/humanizer-ru
  path: skills/humanizer-ru
  commit: "3621b1ca6b9a"
license: MIT
agents: [claude-code, codex]
roles: [writer, marketer]
tasks: [russian-text]
scan:
  date: "2026-10-19"
  files: 21
  scripts: 13
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
install:
  plugin:
    marketplace: ilyautov-plugins
    plugin: humanizer-ru
---

Пользуюсь каждый день, но в своей редакции. Сильнее всего скилл чинит
номинальность — цепочки существительных, на которых и палится машинный
русский. Слабее — свежие штампы: их список приходится дополнять самому.
