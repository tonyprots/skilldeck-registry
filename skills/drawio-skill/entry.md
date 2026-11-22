---
name: drawio-skill
title: "Редактируемые схемы в draw.io"
summary: "Рисует в формате .drawio схемы архитектуры, UML, ERD, BPMN и сетей, и все их потом можно править руками. Умеет строить их по коду, схеме базы или API."
origin: curated
author:
  name: Agents365.ai
  url: https://github.com/Agents365-ai
source:
  repo: Agents365-ai/drawio-skill
  path: skills/drawio-skill
  commit: "6550495129d9"
license: MIT
agents: [claude-code, codex]
roles: [developer, analyst]
tasks: [diagrams]
scan:
  date: "2026-11-21"
  files: 80
  scripts: 46
  runs_commands: true
  network:
    - "api.github.com"
    - "app.diagrams.net"
    - "cdn.simpleicons.org"
    - "github.com"
    - "oieduardorabelo.github.io"
    - "raw.githubusercontent.com"
    - "simpleicons.org"
    - "viewer.diagrams.net"
  outside_folder: true
  hidden_unicode: []
todo: why
compare:
  pick: "схему потом будут править руками в draw.io или держать в синхроне с кодом и конфигами"
  how: "Вызывается командой. Пишет XML draw.io или собирает схему из Terraform, K8s, SQL и OpenAPI"
  gives: "Редактируемый файл .drawio и экспорт в PNG, SVG или PDF"
  needs: "Python 3; приложение draw.io для экспорта и Graphviz для раскладки — по желанию"
---
80 файлов, 46 скриптов.
Вызывается только командой: сам агент его не подхватывает.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
