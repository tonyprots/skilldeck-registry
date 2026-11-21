---
name: last30days
title: "Что пишут о теме за 30 дней"
summary: "Собирает свежие посты и обсуждения с Reddit, X, YouTube, Hacker News и других площадок и сводит их в обзор."
origin: curated
author:
  name: Matt Van Horn
  url: https://github.com/mvanhorn
source:
  repo: mvanhorn/last30days-skill
  path: skills/last30days
  commit: "8ede659374b2"
license: MIT
agents: [claude-code, codex]
roles: [researcher, marketer]
tasks: [research, marketing]
scan:
  date: "2026-11-21"
  files: 197
  scripts: 167
  runs_commands: true
  network:
    - "api.ashbyhq.com"
    - "api.bsky.app"
    - "api.exa.ai"
    - "api.github.com"
    - "api.groq.com"
    - "api.ht-ml.app"
    - "api.lever.co"
    - "api.openai.com"
    - "api.parallel.ai"
    - "api.perplexity.ai"
    - "api.scrapecreators.com"
    - "api.search.brave.com"
    - "api.smartrecruiters.com"
    - "api.stocktwits.com"
    - "api.x.ai"
    - "apply.workable.com"
    - "boards-api.greenhouse.io"
    - "bsky.app"
    - "bsky.social"
    - "careers.kula.ai"
    - "dev.to"
    - "di.gg"
    - "dripstack.xyz"
    - "exa.ai"
    - "gamma-api.polymarket.com"
    - "generativelanguage.googleapis.com"
    - "github.com"
    - "google.serper.dev"
    - "hacker-news.firebaseio.com"
    - "hn.algolia.com"
    - "host.docker.internal"
    - "html.duckduckgo.com"
    - "jobs.apple.com"
    - "jobs.smartrecruiters.com"
    - "join.disneycareers.com"
    - "news.ycombinator.com"
    - "openrouter.ai"
    - "polymarket.com"
    - "r.jina.ai"
    - "reddit.com"
    - "scrapecreators.com"
    - "search.brave.com"
    - "search.parallel.ai"
    - "stocktwits.com"
    - "truthsocial.com"
    - "www.amazon.com"
    - "www.amazon.jobs"
    - "www.instagram.com"
    - "www.linkedin.com"
    - "www.reddit.com"
    - "www.startpage.com"
    - "www.wikidata.org"
    - "www.youtube.com"
    - "x.com"
    - "xquik.com"
  outside_folder: true
  hidden_unicode:
    - "scripts/lib/render.py"
  note: "Скрытый юникод в scripts/lib/render.py — склейка ZWJ внутри эмодзи в таблице источников, не спрятанный текст."
draft: true
---
197 файлов, 167 скриптов.
Тяжёлый: свой движок на Python, обращения к десяткам сайтов, для большинства источников нужны ключи API.

Черновик редакции по SKILL.md. «Зачем он мне» — после отбора.
