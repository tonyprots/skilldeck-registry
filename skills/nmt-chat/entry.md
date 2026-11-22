---
name: nmt-chat
title: "Next Move Theory: продуктовые решения по канону Замесина"
summary: "Набор из восьми скиллов с каноном методологии: советник, диагностика, рынок, ценность, PRD, выход на рынок, разбор интервью."
origin: curated
author:
  name: Иван Замесин
  url: https://github.com/zamesin
source:
  repo: zamesin/Next-Move-Theory-Canon-and-Skills
  path: Skills/claude/nmt-chat
  commit: "f8e87d10255b"
license: CC-BY-NC-SA-4.0
agents: [claude-code, codex]
roles: [product, founder, marketer]
tasks: [product]
set_head: "Советник: отвечает на вопросы и ведёт к нужному скиллу набора"
includes: [nmt-diagnose, nmt-market-research, nmt-craft-value-proposition, nmt-product-requirements, nmt-craft-go-to-market, nmt-analyze-interviews, nmt-update]
install:
  command: |
    git clone https://github.com/zamesin/Next-Move-Theory-Canon-and-Skills /tmp/nmt
    git -C /tmp/nmt checkout f8e87d10255b
    bash /tmp/nmt/install.sh --target .
  note: "Запускать из корня проекта: канон ляжет в Next-Move-Theory-Canon/, скиллы — в .claude/skills и .agents/skills, установщик допишет короткий блок в CLAUDE.md и AGENTS.md."
scan:
  date: "2026-11-14"
  files: 1
  scripts: 0
  runs_commands: true
  network: [nextmovetheory.com]
  outside_folder: false
  hidden_unicode: []
  note: "Команды и сеть нашли глазами, а не шаблоном: в конце работы каждый скилл просит агента отправить curl на nextmovetheory.com/version с именем скилла и установленной версией. Отключается строкой update-check: off в .nmt-config или переменной DO_NOT_TRACK. Установщик автора кладёт канон и скиллы в проект и дописывает блок в CLAUDE.md и AGENTS.md."
compare:
  pick: "продуктовые решения нужно принимать по методологии Next Move Theory, а не по классическому JTBD"
  how: "Восемь скиллов на каноне Замесина: советник ведёт разговор и передаёт задачи скиллам диагностики, рынка, ценности и PRD"
  gives: "Ответы в чате, у скиллов набора — отчёты, PRD и тексты лендинга"
  needs: "Git и bash для установщика автора"
---

Ставлю, когда надо решить, что делать с продуктом: оценить рынок под идею,
выбрать сегмент, собрать ценностное предложение и PRD. Скиллы читают канон
Замесина — тезисы методологии лежат рядом в проекте, — а не то, что модель
помнит про JTBD, поэтому термины не съезжают в JTBD Кристенсена. Чаще всего
беру исследование рынка и диагностику, с советником спорю, когда гипотезу
надо проверить на прочность.

Не брать ради быстрого ответа: рынок и ценность — длинные отчёты, а глубокий
режим гоняет субагентов и веб. Ставится в проект, а не глобально. Лицензия
некоммерческая: применять методологию можно где угодно, перепродавать сам
текст канона нельзя.
