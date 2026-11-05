---
name: taste-skill
title: "Арт-дирекция лендингов без нейрослопа"
summary: "Выдаёт направление из библиотеки 247 сайтов-образцов, подбирает настоящие картинки из открытых коллекций и гоняет цикл «скриншот — правка»."
origin: curated
author:
  name: Leonxlnx
  url: https://github.com/Leonxlnx
source:
  repo: Leonxlnx/taste-skill
  path: skills/taste-skill
  skill: design-taste-frontend
  commit: "b9ca2fd8047f"
license: MIT
agents: [claude-code, codex]
roles: [designer, marketer]
tasks: [ui-design]
scan:
  date: "2026-10-19"
  files: 38
  scripts: 12
  runs_commands: true
  network: [api.artic.edu, api.openverse.org, archive.org, collectionapi.metmuseum.org, commons.wikimedia.org, creativecommons.org, github.com, images-api.nasa.gov, images.nasa.gov, www.artic.edu, www.metmuseum.org, www.nasa.gov]
  outside_folder: true
  hidden_unicode: []
  spec_issues:
    - "name «design-taste-frontend» не совпадает с папкой «taste-skill»"
---

Беру для лендингов и одностраничников. Он выдаёт направление из библиотеки
сайтов-образцов, подбирает настоящие картинки из открытых коллекций и гоняет
цикл «скриншот — правка».
Для дашбордов, приложений и презентаций не подходит.

Тяжёлый: ходит в API музеев и архивов за картинками. Закреплена октябрьская
версия, которой пользуюсь сам. Свежая 2.5.0 — уже другой скилл, файлов
в нём в сорок раз больше, его я ещё не разбирал.
