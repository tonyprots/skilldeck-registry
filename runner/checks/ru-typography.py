#!/usr/bin/env python3
"""Детерминированные проверки типографики русского текста для прогонов.

Считает нормы набора, а не поведение конкретного типографа: что осталось
в выходе агента, то и нарушение. Код (```…```, `…`) и адреса не проверяются.

  ru-typography.py violations <output>          нарушения типографики
  ru-typography.py preserved <input> <output>   текст не переписан
  ru-typography.py latin-quotes <output>        в латинском тексте нет «ёлочек»
  ru-typography.py --selftest                   чувствительность и специфичность

Печатает одну строку JSON: {"check", "pass", "value", "detail"}. Ненулевой
код выхода — сбой самой проверки (нет файла, битый вызов), не провал выхода.
"""
import difflib
import json
import re
import sys

NBSP = "\u00a0"
CYR = "А-Яа-яЁё"
LAT = "A-Za-z"
# Однобуквенные предлоги и союзы — после них неразрывный пробел (Мильчин, «Справочник
# издателя и автора»). Двухбуквенные не считаем: тут нормы расходятся.
SHORT = r"(?<![" + CYR + LAT + r"\d])([ВКСОУИАЯвксоуия])"
UNITS = r"(?:кг|г|км|м|см|мм|л|мл|мин|ч|руб\.|₽|тыс\.|млн|млрд|гг?\.)"
ZERO_WIDTH = "\u200b\u200c\u2060\ufeff"
# Латиница, которую принимают за кириллицу (Unicode TR39, только однозначные пары).
HOMO = "aceopxyACEHKMOPTXB"
HOMO_TO_CYR = str.maketrans("aceopxyACEHKMOPTXB", "асеорхуАСЕНКМОРТХВ")


def strip_code(text):
    """Код и адреса — не текст: убираем до подсчёта."""
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"`[^`\n]*`", " ", text)
    return re.sub(r"https?://\S+", " ", text)


def violations(text):
    t = strip_code(text)
    found = {
        # Прямые кавычки в русском тексте: должны быть «ёлочки» и „лапки“.
        "straight_quotes": len(re.findall(r'"', t)),
        # Три точки вместо многоточия.
        "three_dots": len(re.findall(r"(?<!\.)\.\.\.(?!\.)", t)),
        # Дефис или два дефиса вместо тире между словами.
        "hyphen_as_dash": len(re.findall(r"(?<=\S) (?:-|--) (?=\S)", t)),
        # Перед тире обычный пробел, а нужен неразрывный.
        "dash_without_nbsp": len(re.findall(r"(?<=\S) —", t)),
        # После однобуквенного предлога или союза обычный пробел.
        "short_word_space": len(re.findall(SHORT + r" (?=\S)", t)),
        # Число и единица разорваны обычным пробелом.
        "number_unit_space": len(re.findall(r"\d " + UNITS + r"(?![" + CYR + r"])", t)),
        # Знак номера отделён от числа обычным пробелом.
        "numero_space": len(re.findall(r"№ (?=\d)", t)),
        # Диапазон чисел через дефис вместо короткого тире.
        "range_hyphen": len(re.findall(r"(?<![\d-])\d{1,4}-\d{1,4}(?![\d-])", t)),
        # Невидимые символы: нулевой ширины и BOM.
        "zero_width": sum(t.count(c) for c in ZERO_WIDTH),
        # Слово из кириллицы с латинской буквой-двойником внутри.
        "homoglyph_words": len([w for w in re.findall(r"[" + CYR + LAT + r"]+", t)
                                 if re.search("[" + CYR + "]", w) and re.search("[" + HOMO + "]", w)]),
        # Вложенные ёлочки: внутри «…» нужны „лапки“.
        "nested_guillemets": nested_guillemets(t),
    }
    return found


def nested_guillemets(t):
    depth, bad = 0, 0
    for ch in t:
        if ch == "«":
            depth += 1
            if depth > 1:
                bad += 1
        elif ch == "»":
            depth = max(0, depth - 1)
    return bad


def normalize(text):
    """Текст без типографики: что останется, должно совпасть у входа и выхода."""
    t = text.lstrip("\ufeff")
    for c in ZERO_WIDTH:
        t = t.replace(c, "")
    t = re.sub(r"[«»„“”\"‘’'‚]", '"', t)
    t = re.sub(r"[—–‒‑‐-]+", "-", t)
    t = t.replace("…", "...")
    t = t.translate(HOMO_TO_CYR)
    t = re.sub(r"[\s\u00a0\u202f\u2009\u2007]+", " ", t)
    # Пробел вокруг тире и кавычек типограф вправе поправить — не считаем это переписыванием.
    t = re.sub(r' ?- ?', "-", t)
    t = re.sub(r' ?" ?', '"', t)
    return t.strip()


def preserved(src, out):
    a, b = normalize(src), normalize(out)
    ratio = difflib.SequenceMatcher(None, a, b, autojunk=False).ratio()
    detail = {"ratio": round(ratio, 4)}
    if a != b:
        sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
        diffs = [(a[i1:i2], b[j1:j2]) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal"]
        detail["first_diffs"] = [{"input": x[:60], "output": y[:60]} for x, y in diffs[:5]]
        detail["diff_count"] = len(diffs)
    return {"check": "preserved", "pass": a == b, "value": detail.get("diff_count", 0), "detail": detail}


def latin_quotes(text):
    t = strip_code(text)
    n = sum(t.count(c) for c in "«»„")
    return {"check": "latin-quotes", "pass": n == 0, "value": n, "detail": {"russian_quotes_in_latin_text": n}}


def report_violations(text):
    v = violations(text)
    n = sum(v.values())
    return {"check": "violations", "pass": n == 0, "value": n, "detail": {k: x for k, x in v.items() if x}}


def selftest():
    """Каждое правило ловит своё (чувствительность) и молчит на норме (специфичность)."""
    must_catch = {
        "straight_quotes": 'Он сказал "да".',
        "three_dots": "И тут...",
        "hyphen_as_dash": "Москва - столица.",
        "dash_without_nbsp": "Москва — столица.",
        "short_word_space": "Пошёл в лес.",
        "number_unit_space": "Весит 5 кг.",
        "numero_space": "Дом № 5.",
        "range_hyphen": "В 10-15 случаях.",
        "zero_width": "сло\u200bво",
        "homoglyph_words": "мoлоко",  # латинская o
        "nested_guillemets": "«Книга «Мастер» вышла»",
    }
    n = NBSP
    clean = (f"«Книга „Мастер“ вышла»,{n}— сказал он. Пошёл в{n}лес… Весит 5{n}кг, дом №{n}5, "
             f"в{n}10–15 случаях. Кто-то пришёл 2026-11-21. Код `a - b` и ```x = \"y\"``` не трогаем.")
    failed = []
    for rule, sample in must_catch.items():
        if violations(sample)[rule] < 1:
            failed.append(f"не ловит {rule}: {sample!r}")
    noisy = {k: v for k, v in violations(clean).items() if v}
    if noisy:
        failed.append(f"ложные срабатывания на норме: {noisy}")
    src = 'Он сказал "да" - и ушёл... В 10-15 случаях мoлоко.'
    fixed = f"Он сказал «да»{NBSP}— и ушёл… В{NBSP}10–15 случаях молоко."
    if not preserved(src, fixed)["pass"]:
        failed.append(f"preserved: типографская правка принята за переписывание {preserved(src, fixed)['detail']}")
    if preserved(src, f"Он ответил «нет»{NBSP}— и{NBSP}ушёл.")["pass"]:
        failed.append("preserved: не заметил переписанный текст")
    if latin_quotes('He said "yes".')["value"] or not latin_quotes("He said «yes».")["value"]:
        failed.append("latin-quotes: ошибается")
    for f in failed:
        print(f)
    print(f"selftest: правил {len(must_catch)}, провалов {len(failed)}")
    return 1 if failed else 0


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def main(argv):
    if argv[:1] == ["--selftest"]:
        return selftest()
    if len(argv) == 2 and argv[0] == "violations":
        res = report_violations(read(argv[1]))
    elif len(argv) == 3 and argv[0] == "preserved":
        res = preserved(read(argv[1]), read(argv[2]))
    elif len(argv) == 2 and argv[0] == "latin-quotes":
        res = latin_quotes(read(argv[1]))
    else:
        print(__doc__, file=sys.stderr)
        return 2
    print(json.dumps(res, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
