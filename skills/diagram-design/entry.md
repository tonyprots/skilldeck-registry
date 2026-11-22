---
name: diagram-design
title: "Схемы и диаграммы в HTML, SVG и PNG"
summary: "Архитектура, блок-схемы, последовательности, Санки, Гант, карты Уордли и ещё три десятка форм; перерисовывает draw.io, Mermaid и Excalidraw."
origin: curated
author:
  name: Cathryn Lavery
  url: https://github.com/cathrynlavery
source:
  repo: cathrynlavery/diagram-design
  path: skills/diagram-design
  commit: "550fd66edff0"
license: MIT
agents: [claude-code, codex]
roles: [developer, analyst, product, manager]
tasks: [diagrams]
scan:
  date: "2026-10-19"
  files: 287
  scripts: 6
  runs_commands: false
  network: []
  outside_folder: false
  hidden_unicode: []
compare:
  pick: "схема нужна в документ или на сайт в своей палитре, в том числе диаграмма Санки, Ганта или карта Уордли"
  how: "Рисует SVG по редакционной дизайн-системе: 45 видов схем, импорт из draw.io, Mermaid и Excalidraw"
  gives: "Один HTML-файл со встроенным SVG, по запросу PNG и SVG"
  needs: "Python 3 для проверок и импорта; Playwright для экспорта в PNG"
---

Беру, когда схема нужна в документ или на сайт. На выходе чистый HTML, SVG
и PNG в нейтральном оформлении, а старую схему из draw.io, Mermaid или
Excalidraw он перерисовывает сам. Под свою палитру настраивается профилем,
править сам скилл не нужно.

Не брать, если схему потом будут двигать руками в редакторе: это код,
в Miro её не перетащишь. С русскими подписями я его отдельно не проверял.
