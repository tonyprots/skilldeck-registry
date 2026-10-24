# Skilldeck — реестр

Данные каталога [skilldeck.ru](https://skilldeck.ru): отобранные скиллы для
Claude Code и Codex. Сайт собирается из этого репозитория. Код самих
скиллов здесь не лежит, только карточки со ссылкой на репозиторий автора
и закреплённым коммитом.

## Что внутри

- `skills/<имя>/entry.md` — карточка: фронтматтер по схеме
  `schema/entry.schema.json`, в теле — «Зачем он мне». Карточки с
  `draft: true` — кандидаты, на сайт не попадают.
- `tasks.yaml` — задачи, под которые ставят скиллы.
- `protocol.md` — как скиллы попадают в каталог и что проверяет разбор кода.
- `stats.json` — снимок звёзд GitHub с датой.
- `scripts/` — проверка (`validate.mjs`), сборка `index.json`
  (`build-index.mjs`), приём скилла (`intake.mjs`), снимок звёзд
  (`github-stats.mjs`).

## Проверка

```bash
npm ci
npm run validate               # всё, включая черновики
npm run validate -- --production  # то, что уходит на сайт
```

## Предложить скилл

[Заявка по шаблону](https://github.com/tonyprots/skilldeck-registry/issues/new?template=skill.yml):
новый скилл или правка карточки. Каждую заявку смотрит человек.
