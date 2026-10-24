---
name: transcriber
title: Расшифровка аудио и видео на своей машине
summary: Файл или ссылка на YouTube, ВК Видео, Рутуб, Яндекс Музыку — на выходе текст, субтитры, спикеры и очередь спорных мест.
origin: own
author:
  name: Антон Проценко
  url: https://tonyprots.ru
source:
  repo: tonyprots/transcriber-skill
  path: skills/transcriber
  commit: "2b7bbdab7313"
license: MIT
agents: [claude-code, codex]
roles: [researcher, manager, universal]
tasks: [transcription]
scan:
  date: "2026-10-19"
  files: 60
  scripts: 41
  runs_commands: true
  network: [api.github.com, api.music.yandex.net, github.com, raw.githubusercontent.com]
  outside_folder: true
  hidden_unicode: []
  note: "Сеть — скачать модели и ролик по ссылке; сама расшифровка идёт локально."
install:
  plugin:
    marketplace: tonyprots
    plugin: transcriber
---

Сделал под свои голосовые и записи встреч: облачные сервисы путают имена и
термины, а отдавать туда рабочие записи нельзя. Всё работает локально, две
модели сверяют друг друга, и места, где они расходятся, уходят в очередь на
проверку, а не в текст молча.

Не брать, если нужна расшифровка за секунды на слабой машине: первая
установка тянет модели, и прогон длиннее, чем у облачного сервиса.
