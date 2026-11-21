---
name: security-audit
title: "Аудит безопасности кода"
summary: "Ищет уязвимости на реальных границах доверия и для каждой даёт доказательство из кода, безопасное воспроизведение и минимальную правку."
origin: curated
author:
  name: Cloudflare
  url: https://github.com/cloudflare
source:
  repo: cloudflare/security-audit-skill
  path: skills/security-audit
  commit: "c1c8a8c14710"
license: MIT
agents: [claude-code, codex]
roles: [developer]
tasks: [security, coding]
scan:
  date: "2026-11-21"
  files: 20
  scripts: 4
  runs_commands: true
  network: []
  outside_folder: true
  hidden_unicode: []
draft: true
---
20 файлов, 4 скрипта.
По умолчанию только советует; полный аудит с записью файлов запускается по прямой просьбе.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
