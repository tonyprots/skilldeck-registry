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
license: MIT
agents: [claude-code, codex]
tasks: [transcription]
works_with_russian: true
install:
  plugin:
    marketplace: tonyprots
    plugin: transcriber
pinned: true
---

Сделал под свои голосовые и записи встреч: облачные сервисы путают имена и
термины, а отдавать туда рабочие записи нельзя. Всё работает локально, две
модели сверяют друг друга, и места, где они расходятся, уходят в очередь на
проверку, а не в текст молча.

Не брать, если нужна расшифровка за секунды на слабой машине: первая
установка тянет модели, и прогон длиннее, чем у облачного сервиса.
