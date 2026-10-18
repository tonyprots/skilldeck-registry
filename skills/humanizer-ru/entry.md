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
license: MIT
agents: [claude-code, codex]
tasks: [russian-text]
works_with_russian: true
install:
  plugin:
    marketplace: ilyautov-plugins
    plugin: humanizer-ru
---

Пользуюсь каждый день, но в своей редакции. Сильнее всего скилл чинит
номинальность — цепочки существительных, на которых и палится машинный
русский. Слабее — свежие штампы: их список приходится дополнять самому.
