---
name: redkollegiya
title: "Редколлегия: полная вычитка русского текста"
summary: "Набор из шести скиллов: дирижёр сам выбирает режим и прогоняет текст через смысловую редактуру, фактчек, чистку от ИИ, корректуру и типографику."
origin: curated
author:
  name: beaverbeard
  url: https://github.com/beaverbeard
source:
  repo: beaverbeard/redkollegiya
  path: .claude/skills/redkollegiya
  commit: "850547a9631b"
license: MIT
agents: [claude-code]
roles: [writer]
tasks: [russian-text]
includes: [chukovsky, agranovsky, slopotron, rozental, milchin]
scan:
  date: "2026-10-19"
  files: 2
  scripts: 1
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
---

Взял ради фактчека. Агентский текст чаще всего врёт придуманными числами,
цитатами и ссылками, и Аграновский в этом наборе ловит то, что обычная
вычитка пропускает. Дирижёр сам выбирает режим и прогоняет текст по всем
редакторам, а находки применяет скриптом по дословным цитатам, поэтому
правки не расползаются по тексту.

Не брать ради одной чистки стиля: с ней у меня лучше справляются
humanizer-ru и editorial. Ставится только целиком: шесть скиллов, и каждый
прогон проходит через пятерых редакторов.
