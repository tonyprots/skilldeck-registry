---
name: motion-film
title: Моушн-ролик с голосом, собранный в коде
summary: "Ролик от 30 секунд до 4 минут: сценарий утверждается заранее, ИИ-голос задаёт ритм сцен, раунды критики, рендер 16:9 и 9:16."
origin: own
author:
  name: Антон Проценко
  url: https://tonyprots.ru
source:
  repo: tonyprots/motion-film-skill
  path: .
  skill: motion-film
  commit: "3bbb8ac5652e"
license: MIT
agents: [claude-code, codex]
roles: [marketer, product, manager]
tasks: [video]
scan:
  date: "2026-10-21"
  files: 103
  scripts: 55
  runs_commands: true
  network: [api.github.com, freesound.org, github.com, huggingface.co, kenney.nl, openrouter.ai, pypi.org, stt.api.cloud.yandex.net, tts.api.cloud.yandex.net]
  outside_folder: true
  hidden_unicode: []
  note: "Сеть — провайдеры голоса (OpenRouter, Yandex SpeechKit), звуки (freesound.org, kenney.nl), модели (huggingface.co), пакеты (pypi.org). Ключи провайдеров — свои."
---

Сделал, чтобы показывать свои проекты роликом вместо стопки скриншотов.
Сценарий пишу сам, голос задаёт ритм, сцены собираются в коде, поэтому
любую сцену можно переделать правкой, без монтажки. Демо-ролик в
репозитории собран самим скиллом. Критик смотрит кадры раундами, и кривой
срез или нечитаемый титр ловится до сдачи.

Не брать, если нужна запись экрана или ролик к вечеру на слабой машине:
нужны Node, ffmpeg и браузер для рендера, первая установка долгая, а для
голоса нужен ключ провайдера или своя запись.
