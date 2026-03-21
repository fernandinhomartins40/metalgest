from __future__ import annotations

import argparse
import json
import re
import sys
import time
import unicodedata
from pathlib import Path

import translators as ts


ROOT = Path(__file__).resolve().parents[1]
CACHE_PATH = ROOT / "uploads" / "translation_cache.json"
SEPARATOR = "\n__XSEP123__\n"

LANG_CONFIG = {
    "en": {
        "locale": "en-GB",
        "summary_title": "Contents",
    },
    "es": {
        "locale": "es-ES",
        "summary_title": "Contenido",
    },
}

TITLE_OVERRIDES = {
    "doce habito de ser util.md": {
        "en": "The Sweet Habit of Being Useful",
        "es": "El Dulce Hábito de Ser Útil",
    },
    "elhijo.md": {
        "en": "THE SON — THE MONARCH'S LEGACY",
        "es": "EL HIJO — EL LEGADO DEL MONARCA",
    },
}

HEADING_OVERRIDES = {
    "doce habito de ser util.md": {
        "en": {
            "Prólogo: O Espelho e a Máscara": "Prologue: The Mirror and the Mask",
            "Parte I: A Queda da Helena Invisível": "Part I: The Fall of the Invisible Helena",
            "Capítulo 1: A Assessora Fantasma": "Chapter 1: The Ghost Advisor",
            "Capítulo 2: O Seguro do Carro": "Chapter 2: Car Insurance",
            "Capítulo 3: A Lasanha da Discórdia": "Chapter 3: The Lasagna of Discord",
            "Capítulo 4: O Ano em que Tudo Ruiu": "Chapter 4: The Year Everything Fell Apart",
            "Capítulo 5: O Refúgio dos Invisíveis": "Chapter 5: The Refuge of the Invisible",
            "Capítulo 6: A Gráfica dos Invisíveis": "Chapter 6: The Print Shop of the Invisible",
            "Capítulo 7: O Castelo de Areia": "Chapter 7: The Sandcastle",
            "Capítulo 8: A Noite da Mala": "Chapter 8: The Night of the Suitcase",
            "Capítulo 9: A Política do Cesto de Lixo": "Chapter 9: The Politics of the Wastebasket",
            "Capítulo 10: As Boas Meninas Não Fazem Barulho": "Chapter 10: Good Girls Don't Make Noise",
            "Capítulo 11: O Vídeo da Lasanha": "Chapter 11: The Lasagna Video",
            "Capítulo 12: Simone na Fazenda": "Chapter 12: Simone at the Finance Department",
            "Capítulo 13: O Divórcio das Expectativas": "Chapter 13: The Divorce of Expectations",
            "Capítulo 14: O Plano das Invisíveis": "Chapter 14: The Plan of the Invisible Women",
            "Parte II: A Construção da Helena Protagonista": "Part II: The Making of Helena the Protagonist",
            "Capítulo 15: O Lançamento": "Chapter 15: The Launch",
            "Capítulo 16: O Golpe no Passado": "Chapter 16: The Blow to the Past",
            "Capítulo 17: O Golpe Baixo": "Chapter 17: The Low Blow",
            "Capítulo 18: A Primeira Ameaça": "Chapter 18: The First Threat",
            "Capítulo 19: O Exército de Formigas": "Chapter 19: The Army of Ants",
            "Capítulo 20: A Voz das Ruas": "Chapter 20: The Voice of the Streets",
            "Capítulo 21: O Debate Decisivo": "Chapter 21: The Decisive Debate",
            "Capítulo 22: A Queda do Império": "Chapter 22: The Fall of the Empire",
            "Capítulo 23: A Noite das Panelas": "Chapter 23: The Night of the Pots and Pans",
            "Capítulo 24: A Madrugada do Silêncio Rompido": "Chapter 24: The Dawn of Broken Silence",
            "Capítulo 25: O Peso da Faixa": "Chapter 25: The Weight of the Sash",
            "Capítulo 26: O Gabinete Vazio": "Chapter 26: The Empty Office",
            "Capítulo 27: A Cidade Quando Chove": "Chapter 27: The City When It Rains",
            "Capítulo 28: O Preço da Caneta": "Chapter 28: The Price of the Pen",
            "Capítulo 29: Um Ano de Governo": "Chapter 29: One Year in Office",
            "Capítulo 30: O Conselho das Cozinhas": "Chapter 30: The Council of Kitchens",
            "Capítulo 31: Simone Fecha a Conta": "Chapter 31: Simone Closes the Books",
            "Capítulo 32: A Obra Lenta": "Chapter 32: The Slow Work",
            "Capítulo 33: A Mulher que Anda Sozinha": "Chapter 33: The Woman Who Walks Alone",
            "Capítulo 34: A Cidade Aprende a Cobrar": "Chapter 34: The City Learns to Demand",
            "Capítulo 35: O Refúgio Outra Vez": "Chapter 35: The Refuge Once More",
            "Capítulo 36: O Que Mudou na Cidade": "Chapter 36: What Changed in the City",
            "Epílogo: A Mulher que Ficou": "Epilogue: The Woman Who Stayed",
        },
        "es": {
            "Prólogo: O Espelho e a Máscara": "Prólogo: El Espejo y la Máscara",
            "Parte I: A Queda da Helena Invisível": "Parte I: La caída de Helena invisible",
            "Capítulo 1: A Assessora Fantasma": "Capítulo 1: La asesora fantasma",
            "Capítulo 2: O Seguro do Carro": "Capítulo 2: El seguro del auto",
            "Capítulo 3: A Lasanha da Discórdia": "Capítulo 3: La lasaña de la discordia",
            "Capítulo 4: O Ano em que Tudo Ruiu": "Capítulo 4: El año en que todo se derrumbó",
            "Capítulo 5: O Refúgio dos Invisíveis": "Capítulo 5: El refugio de las invisibles",
            "Capítulo 6: A Gráfica dos Invisíveis": "Capítulo 6: La imprenta de las invisibles",
            "Capítulo 7: O Castelo de Areia": "Capítulo 7: El castillo de arena",
            "Capítulo 8: A Noite da Mala": "Capítulo 8: La noche de la maleta",
            "Capítulo 9: A Política do Cesto de Lixo": "Capítulo 9: La política del cesto de basura",
            "Capítulo 10: As Boas Meninas Não Fazem Barulho": "Capítulo 10: Las niñas buenas no hacen ruido",
            "Capítulo 11: O Vídeo da Lasanha": "Capítulo 11: El video de la lasaña",
            "Capítulo 12: Simone na Fazenda": "Capítulo 12: Simone en Hacienda",
            "Capítulo 13: O Divórcio das Expectativas": "Capítulo 13: El divorcio de las expectativas",
            "Capítulo 14: O Plano das Invisíveis": "Capítulo 14: El plan de las invisibles",
            "Parte II: A Construção da Helena Protagonista": "Parte II: La construcción de Helena protagonista",
            "Capítulo 15: O Lançamento": "Capítulo 15: El lanzamiento",
            "Capítulo 16: O Golpe no Passado": "Capítulo 16: El golpe al pasado",
            "Capítulo 17: O Golpe Baixo": "Capítulo 17: El golpe bajo",
            "Capítulo 18: A Primeira Ameaça": "Capítulo 18: La primera amenaza",
            "Capítulo 19: O Exército de Formigas": "Capítulo 19: El ejército de hormigas",
            "Capítulo 20: A Voz das Ruas": "Capítulo 20: La voz de las calles",
            "Capítulo 21: O Debate Decisivo": "Capítulo 21: El debate decisivo",
            "Capítulo 22: A Queda do Império": "Capítulo 22: La caída del imperio",
            "Capítulo 23: A Noite das Panelas": "Capítulo 23: La noche de las cacerolas",
            "Capítulo 24: A Madrugada do Silêncio Rompido": "Capítulo 24: La madrugada del silencio roto",
            "Capítulo 25: O Peso da Faixa": "Capítulo 25: El peso de la banda",
            "Capítulo 26: O Gabinete Vazio": "Capítulo 26: El despacho vacío",
            "Capítulo 27: A Cidade Quando Chove": "Capítulo 27: La ciudad cuando llueve",
            "Capítulo 28: O Preço da Caneta": "Capítulo 28: El precio de la pluma",
            "Capítulo 29: Um Ano de Governo": "Capítulo 29: Un año de gobierno",
            "Capítulo 30: O Conselho das Cozinhas": "Capítulo 30: El consejo de las cocinas",
            "Capítulo 31: Simone Fecha a Conta": "Capítulo 31: Simone cierra las cuentas",
            "Capítulo 32: A Obra Lenta": "Capítulo 32: La obra lenta",
            "Capítulo 33: A Mulher que Anda Sozinha": "Capítulo 33: La mujer que camina sola",
            "Capítulo 34: A Cidade Aprende a Cobrar": "Capítulo 34: La ciudad aprende a exigir",
            "Capítulo 35: O Refúgio Outra Vez": "Capítulo 35: El refugio otra vez",
            "Capítulo 36: O Que Mudou na Cidade": "Capítulo 36: Lo que cambió en la ciudad",
            "Epílogo: A Mulher que Ficou": "Epílogo: La mujer que se quedó",
        },
    },
    "elhijo.md": {
        "en": {
            "PRÓLOGO — A Última Promessa no Telhado": "PROLOGUE — The Last Promise on the Rooftop",
            "PARTE I — O FILHO DO SEGREDO": "PART I — The Son of the Secret",
            "INTERLÚDIO I — A FUGA DE CAMILA": "INTERLUDE I — Camila's Escape",
            "CAPÍTULO 1 — A Caixa que Não Deveria Ser Aberta": "CHAPTER 1 — The Box That Should Not Be Opened",
            "INTERLÚDIO II — LITTLE HAVANA, QUARENTA ANOS": "INTERLUDE II — Little Havana, Forty Years",
            "CAPÍTULO 2 — Minha Rainha Verdadeira": "CHAPTER 2 — My True Queen",
            "CAPÍTULO 3 — O Nome Proibido": "CHAPTER 3 — The Forbidden Name",
            "CAPÍTULO 4 — Sangue no DNA": "CHAPTER 4 — Blood in the DNA",
            "CAPÍTULO 5 — O Menino nas Montanhas": "CHAPTER 5 — The Boy in the Mountains",
            "INTERLÚDIO III — DON ROBERTO E A PALAVRA DADA": "INTERLUDE III — Don Roberto and the Promise Kept",
            "PARTE II — A MONTANHA E O NOME": "PART II — The Mountain and the Name",
            "CAPÍTULO 6 — Cofre 17": "CHAPTER 6 — Box 17",
            "CAPÍTULO 7 — Don Roberto, o Último Leal": "CHAPTER 7 — Don Roberto, the Last Loyal Man",
            "CAPÍTULO 8 — O Despertar do Leão": "CHAPTER 8 — The Awakening of the Lion",
            "CAPÍTULO 9 — A Mulher que Sabia Demais": "CHAPTER 9 — The Woman Who Knew Too Much",
            "INTERLÚDIO IV — A MULHER QUE ESCOLHEU FICAR": "INTERLUDE IV — The Woman Who Chose to Stay",
            "CAPÍTULO 10 — Caçada em Medellín": "CHAPTER 10 — The Hunt in Medellín",
            "CAPÍTULO 11 — O Refúgio do Cartel": "CHAPTER 11 — The Cartel's Refuge",
            "INTERLÚDIO V — O DISCÍPULO DE MONTÓYA": "INTERLUDE V — Montoya's Disciple",
            "PARTE III — O SISTEMA ADORMECIDO": "PART III — The Sleeping System",
            "CAPÍTULO 12 — O Arquivo Morto": "CHAPTER 12 — The Dead File",
            "CAPÍTULO 13 — O Cerco": "CHAPTER 13 — The Siege",
            "CAPÍTULO 14 — Fogo na Montanha": "CHAPTER 14 — Fire on the Mountain",
            "CAPÍTULO 15 — O Exército Invisível": "CHAPTER 15 — The Invisible Army",
            "CAPÍTULO 16 — Sangue e Herança": "CHAPTER 16 — Blood and Inheritance",
            "CAPÍTULO 17 — A Primeira Ofensiva": "CHAPTER 17 — The First Offensive",
            "INTERLÚDIO VI — ESTEBAN ANTES DA CICATRIZ": "INTERLUDE VI — Esteban Before the Scar",
            "CAPÍTULO 18 — O Homem Sem Rosto": "CHAPTER 18 — The Faceless Man",
            "CAPÍTULO 19 — A Traição Interna": "CHAPTER 19 — The Internal Betrayal",
            "CAPÍTULO 20 — O Confronto Público": "CHAPTER 20 — The Public Confrontation",
            "CAPÍTULO 21 — O Encontro": "CHAPTER 21 — The Meeting",
            "CAPÍTULO 22 — O Arquivo Escondido": "CHAPTER 22 — The Hidden File",
            "CAPÍTULO 23 — O Último Telhado": "CHAPTER 23 — The Last Rooftop",
            "CAPÍTULO 24 — A Escolha": "CHAPTER 24 — The Choice",
            "CAPÍTULO 25 — O Legado": "CHAPTER 25 — The Legacy",
            "PARTE IV — O QUE SOBRA DEPOIS DO IMPÉRIO": "PART IV — What Remains After the Empire",
            "CAPÍTULO 26 — O Dinheiro Sem Dono": "CHAPTER 26 — Money With No Owner",
            "CAPÍTULO 27 — Voltar a Miami": "CHAPTER 27 — Returning to Miami",
            "CAPÍTULO 28 — Valeria Aprende a Ficar": "CHAPTER 28 — Valeria Learns to Stay",
            "CAPÍTULO 29 — O Menino da Quadra": "CHAPTER 29 — The Boy on the Court",
            "CAPÍTULO 30 — O Nome que Restou": "CHAPTER 30 — The Name That Remained",
            "PARTE V — O QUE OS MORTOS NÃO CONTROLAM": "PART V — What the Dead Do Not Control",
            "CAPÍTULO 31 — O Apartamento de Coral Gables": "CHAPTER 31 — The Coral Gables Apartment",
            "CAPÍTULO 32 — O Caderno de Camila": "CHAPTER 32 — Camila's Notebook",
            "CAPÍTULO 33 — Os Filhos da Guerra": "CHAPTER 33 — The Children of the War",
            "CAPÍTULO 34 — Don Roberto Fecha a Porta": "CHAPTER 34 — Don Roberto Closes the Door",
            "CAPÍTULO 35 — O Preço da Luz": "CHAPTER 35 — The Price of Light",
            "CAPÍTULO 36 — Voltar à Montanha": "CHAPTER 36 — Returning to the Mountain",
            "CAPÍTULO 37 — O País que Aprende Devagar": "CHAPTER 37 — The Country That Learns Slowly",
            "EPÍLOGO": "EPILOGUE",
        },
        "es": {
            "PRÓLOGO — A Última Promessa no Telhado": "PRÓLOGO — La última promesa en el tejado",
            "PARTE I — O FILHO DO SEGREDO": "PARTE I — EL HIJO DEL SECRETO",
            "INTERLÚDIO I — A FUGA DE CAMILA": "INTERLUDIO I — La huida de Camila",
            "CAPÍTULO 1 — A Caixa que Não Deveria Ser Aberta": "CAPÍTULO 1 — La caja que no debería abrirse",
            "INTERLÚDIO II — LITTLE HAVANA, QUARENTA ANOS": "INTERLUDIO II — Little Havana, cuarenta años",
            "CAPÍTULO 2 — Minha Rainha Verdadeira": "CAPÍTULO 2 — Mi reina verdadera",
            "CAPÍTULO 3 — O Nome Proibido": "CAPÍTULO 3 — El nombre prohibido",
            "CAPÍTULO 4 — Sangue no DNA": "CAPÍTULO 4 — Sangre en el ADN",
            "CAPÍTULO 5 — O Menino nas Montanhas": "CAPÍTULO 5 — El niño en las montañas",
            "INTERLÚDIO III — DON ROBERTO E A PALAVRA DADA": "INTERLUDIO III — Don Roberto y la palabra dada",
            "PARTE II — A MONTANHA E O NOME": "PARTE II — La montaña y el nombre",
            "CAPÍTULO 6 — Cofre 17": "CAPÍTULO 6 — Cofre 17",
            "CAPÍTULO 7 — Don Roberto, o Último Leal": "CAPÍTULO 7 — Don Roberto, el último leal",
            "CAPÍTULO 8 — O Despertar do Leão": "CAPÍTULO 8 — El despertar del león",
            "CAPÍTULO 9 — A Mulher que Sabia Demais": "CAPÍTULO 9 — La mujer que sabía demasiado",
            "INTERLÚDIO IV — A MULHER QUE ESCOLHEU FICAR": "INTERLUDIO IV — La mujer que eligió quedarse",
            "CAPÍTULO 10 — Caçada em Medellín": "CAPÍTULO 10 — Cacería en Medellín",
            "CAPÍTULO 11 — O Refúgio do Cartel": "CAPÍTULO 11 — El refugio del cartel",
            "INTERLÚDIO V — O DISCÍPULO DE MONTÓYA": "INTERLUDIO V — El discípulo de Montoya",
            "PARTE III — O SISTEMA ADORMECIDO": "PARTE III — El sistema dormido",
            "CAPÍTULO 12 — O Arquivo Morto": "CAPÍTULO 12 — El archivo muerto",
            "CAPÍTULO 13 — O Cerco": "CAPÍTULO 13 — El cerco",
            "CAPÍTULO 14 — Fogo na Montanha": "CAPÍTULO 14 — Fuego en la montaña",
            "CAPÍTULO 15 — O Exército Invisível": "CAPÍTULO 15 — El ejército invisible",
            "CAPÍTULO 16 — Sangue e Herança": "CAPÍTULO 16 — Sangre y herencia",
            "CAPÍTULO 17 — A Primeira Ofensiva": "CAPÍTULO 17 — La primera ofensiva",
            "INTERLÚDIO VI — ESTEBAN ANTES DA CICATRIZ": "INTERLUDIO VI — Esteban antes de la cicatriz",
            "CAPÍTULO 18 — O Homem Sem Rosto": "CAPÍTULO 18 — El hombre sin rostro",
            "CAPÍTULO 19 — A Traição Interna": "CAPÍTULO 19 — La traición interna",
            "CAPÍTULO 20 — O Confronto Público": "CAPÍTULO 20 — El enfrentamiento público",
            "CAPÍTULO 21 — O Encontro": "CAPÍTULO 21 — El encuentro",
            "CAPÍTULO 22 — O Arquivo Escondido": "CAPÍTULO 22 — El archivo escondido",
            "CAPÍTULO 23 — O Último Telhado": "CAPÍTULO 23 — El último tejado",
            "CAPÍTULO 24 — A Escolha": "CAPÍTULO 24 — La elección",
            "CAPÍTULO 25 — O Legado": "CAPÍTULO 25 — El legado",
            "PARTE IV — O QUE SOBRA DEPOIS DO IMPÉRIO": "PARTE IV — Lo que queda después del imperio",
            "CAPÍTULO 26 — O Dinheiro Sem Dono": "CAPÍTULO 26 — El dinero sin dueño",
            "CAPÍTULO 27 — Voltar a Miami": "CAPÍTULO 27 — Volver a Miami",
            "CAPÍTULO 28 — Valeria Aprende a Ficar": "CAPÍTULO 28 — Valeria aprende a quedarse",
            "CAPÍTULO 29 — O Menino da Quadra": "CAPÍTULO 29 — El niño de la cancha",
            "CAPÍTULO 30 — O Nome que Restou": "CAPÍTULO 30 — El nombre que quedó",
            "PARTE V — O QUE OS MORTOS NÃO CONTROLAM": "PARTE V — Lo que los muertos no controlan",
            "CAPÍTULO 31 — O Apartamento de Coral Gables": "CAPÍTULO 31 — El apartamento de Coral Gables",
            "CAPÍTULO 32 — O Caderno de Camila": "CAPÍTULO 32 — El cuaderno de Camila",
            "CAPÍTULO 33 — Os Filhos da Guerra": "CAPÍTULO 33 — Los hijos de la guerra",
            "CAPÍTULO 34 — Don Roberto Fecha a Porta": "CAPÍTULO 34 — Don Roberto cierra la puerta",
            "CAPÍTULO 35 — O Preço da Luz": "CAPÍTULO 35 — El precio de la luz",
            "CAPÍTULO 36 — Voltar à Montanha": "CAPÍTULO 36 — Volver a la montaña",
            "CAPÍTULO 37 — O País que Aprende Devagar": "CAPÍTULO 37 — El país que aprende despacio",
            "EPÍLOGO": "EPÍLOGO",
        },
    },
}

LINE_OVERRIDES = {
    "en": {
        "FIM": "END",
    },
    "es": {
        "FIM": "FIN",
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Translate markdown books from Portuguese to English or Spanish.")
    parser.add_argument("--source", required=True, help="Source markdown file.")
    parser.add_argument("--target", required=True, choices=sorted(LANG_CONFIG.keys()), help="Target language code.")
    parser.add_argument("--output", default=None, help="Output markdown path.")
    parser.add_argument("--max-chars", type=int, default=1000, help="Maximum chunk size sent to the translator.")
    parser.add_argument("--service", default="bing", help="Translation backend from the translators package.")
    return parser.parse_args()


def load_cache() -> dict[str, str]:
    if CACHE_PATH.exists():
        return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    return {}


def save_cache(cache: dict[str, str]) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")


def normalize_marker(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii").upper().strip()


def split_sentences(text: str) -> list[str]:
    return re.split(r'(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-ÝÁÉÍÓÚÑÜ"“”])', text)


def split_long_text(text: str, max_chars: int) -> list[str]:
    if len(text) <= max_chars:
        return [text]

    sentences = split_sentences(text)
    if len(sentences) == 1:
        sentences = re.split(r"(?<=[,;:])\s+", text)

    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        candidate = sentence if not current else f"{current} {sentence}"
        if len(candidate) <= max_chars:
            current = candidate
            continue
        if current:
            chunks.append(current)
        if len(sentence) <= max_chars:
            current = sentence
            continue
        words = sentence.split()
        current_word_chunk = ""
        for word in words:
            word_candidate = word if not current_word_chunk else f"{current_word_chunk} {word}"
            if len(word_candidate) <= max_chars:
                current_word_chunk = word_candidate
            else:
                if current_word_chunk:
                    chunks.append(current_word_chunk)
                current_word_chunk = word
        current = current_word_chunk

    if current:
        chunks.append(current)
    return chunks


def fix_spacing(text: str) -> str:
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"\(\s+", "(", text)
    text = re.sub(r"\s+\)", ")", text)
    return text.strip()


def translate_chunk(service: str, target: str, text: str, cache: dict[str, str], cache_key: str) -> str:
    if cache_key in cache:
        return cache[cache_key]

    last_error: Exception | None = None
    for attempt in range(5):
        try:
            translated = ts.translate_text(
                text,
                translator=service,
                from_language="pt",
                to_language=target,
            )
            cache[cache_key] = translated
            return translated
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            time.sleep(2.0 * (attempt + 1))

    raise RuntimeError(f"Failed to translate chunk after retries: {text[:120]!r}") from last_error


def translate_text(
    text: str,
    service: str,
    target: str,
    cache: dict[str, str],
    max_chars: int,
) -> str:
    if not text.strip():
        return text

    chunks = split_long_text(text, max_chars=max_chars)
    translated_chunks: list[str] = []
    for chunk in chunks:
        cache_key = f"{service}::{target}::{chunk}"
        translated_chunks.append(translate_chunk(service, target, chunk, cache, cache_key).strip())
    return fix_spacing(" ".join(translated_chunks))


def translate_batch_texts(
    texts: list[str],
    service: str,
    target: str,
    cache: dict[str, str],
) -> list[str]:
    if not texts:
        return []

    joined = SEPARATOR.join(texts)
    batch_key = f"{service}::{target}::BATCH::{joined}"
    try:
        translated_joined = translate_chunk(service, target, joined, cache, batch_key)
        parts = [part.strip("\n") for part in translated_joined.split("__XSEP123__")]
        if len(parts) != len(texts):
            raise RuntimeError(
                f"Batch translation separator mismatch: expected {len(texts)} parts, got {len(parts)}"
            )
    except Exception:  # noqa: BLE001
        if len(texts) == 1:
            single_key = f"{service}::{target}::LINE::{texts[0]}"
            translated = translate_chunk(service, target, texts[0], cache, single_key)
            return [fix_spacing(translated)]
        middle = len(texts) // 2
        left = translate_batch_texts(texts[:middle], service, target, cache)
        right = translate_batch_texts(texts[middle:], service, target, cache)
        return left + right

    cleaned = [fix_spacing(part) for part in parts]
    for source_text, translated_text in zip(texts, cleaned, strict=True):
        cache[f"{service}::{target}::LINE::{source_text}"] = translated_text
    return cleaned


def translate_line(
    line: str,
    source_name: str,
    service: str,
    target: str,
    cache: dict[str, str],
    max_chars: int,
) -> str:
    if not line.strip():
        return line

    if line in LINE_OVERRIDES[target]:
        return LINE_OVERRIDES[target][line]

    if line in HEADING_OVERRIDES.get(source_name, {}).get(target, {}):
        return HEADING_OVERRIDES[source_name][target][line]

    if line.startswith("— "):
        translated = translate_text(line[2:], service, target, cache, max_chars)
        return f"— {translated}"

    return translate_text(line, service, target, cache, max_chars)


def default_output_path(source: Path, target: str) -> Path:
    suffix = f".{target}.md"
    if source.suffix.lower() == ".md":
        return source.with_name(f"{source.stem}{suffix}")
    return source.with_name(source.name + suffix)


def main() -> None:
    args = parse_args()
    source = Path(args.source).resolve()
    target = args.target
    config = LANG_CONFIG[target]
    output = Path(args.output).resolve() if args.output else default_output_path(source, target)
    partial_output = output.with_name(output.name + ".partial")

    source_name = source.name
    lines = source.read_text(encoding="utf-8").splitlines()
    cache = load_cache()

    translated_lines = [""] * len(lines)
    title_done = False

    batch_items: list[tuple[int, str]] = []

    def flush_batch() -> None:
        nonlocal batch_items
        if not batch_items:
            return

        uncached_items: list[tuple[int, str]] = []
        for idx, text in batch_items:
            cache_key = f"{args.service}::{target}::LINE::{text}"
            if cache_key in cache:
                translated_lines[idx] = cache[cache_key]
            else:
                uncached_items.append((idx, text))

        if uncached_items:
            translated = translate_batch_texts(
                [text for _, text in uncached_items],
                service=args.service,
                target=target,
                cache=cache,
            )
            for (idx, _), translated_text in zip(uncached_items, translated, strict=True):
                translated_lines[idx] = translated_text

        batch_items = []

    for index, line in enumerate(lines):
        if not title_done and line.strip() and source_name in TITLE_OVERRIDES and target in TITLE_OVERRIDES[source_name]:
            flush_batch()
            translated_lines[index] = TITLE_OVERRIDES[source_name][target]
            title_done = True
        elif not line.strip():
            flush_batch()
            translated_lines[index] = line
        elif line in LINE_OVERRIDES[target] or line in HEADING_OVERRIDES.get(source_name, {}).get(target, {}) or line.startswith("— "):
            flush_batch()
            translated_lines[index] = translate_line(
                line=line,
                source_name=source_name,
                service=args.service,
                target=target,
                cache=cache,
                max_chars=args.max_chars,
            )
        else:
            projected = len(SEPARATOR.join([text for _, text in batch_items] + [line]))
            if batch_items and projected > args.max_chars:
                flush_batch()
            batch_items.append((index, line))

        if (index + 1) % 20 == 0 or index + 1 == len(lines):
            flush_batch()
            print(f"[{target}] {source.name}: {index + 1}/{len(lines)}")
            save_cache(cache)
            partial_output.write_text(("\n".join(translated_lines)).lstrip("\n") + "\n", encoding="utf-8")
            sys.stdout.flush()

    flush_batch()
    output.write_text(("\n".join(translated_lines)).lstrip("\n") + "\n", encoding="utf-8")
    if partial_output.exists():
        partial_output.unlink()
    save_cache(cache)
    print(f"OUTPUT: {output}")


if __name__ == "__main__":
    main()
