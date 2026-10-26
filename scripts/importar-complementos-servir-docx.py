"""Acrescenta ofertas do Word de 26/10 sem alterar o catalogo anterior.

Requer Pillow. Reexecutar ignora este mesmo lote, sem duplicar registros.
Para corrigir legenda/preco depois da importacao, edite o JSON do catalogo.
"""
from io import BytesIO
import importlib.util
import json
from pathlib import Path
import re
import sys
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from PIL import Image

# Reaproveita somente funcoes de limpeza, nomes e compressao. O main antigo
# reconstrui o catalogo do zero e NAO deve ser executado nesta importacao.
spec = importlib.util.spec_from_file_location(
    "servir_helpers", Path(__file__).with_name("importar-servir-direcao.py")
)
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)
ROOT, SOURCE, DEST, NS = helpers.ROOT, helpers.SOURCE, helpers.DEST, helpers.NS
CATALOG = ROOT / "src/data/servirDirecaoCatalogo.json"
PREFIX = "servir-complementos-20261026-"

# Associacao imagem/legenda revisada na ordem do Word. Precos em centavos.
# Acessorios compartilhados aparecem nas duas abas, sem duplicar cadastros.
OFFERS = [
    {"image": 3, "title": "Caixinhas de som compactas", "value": 5999, "note": "cada", "check": "3 OPÇÕES"},
    {"image": 6, "title": "Relógios digitais", "value": 7999, "from": True, "check": "RELÓGIOS"},
    {"image": 5, "title": "Mochilas", "value": 5999, "from": True, "check": "MOCHILAS"},
    {"image": 4, "title": "Caixa de som Kapbom", "brand": "Kapbom", "value": 19999, "note": "cada", "check": "KAPBOM"},
    {"image": 2, "title": "Fones Bluetooth: 4 modelos", "value": 5999, "note": "cada", "check": "4 MODELOS"},
    {"image": 7, "title": "Combo masculino: Body Splash + carteira", "value": 9999, "note": "o combo", "genero": "masculino", "category": "kit", "check": "COMBO MASCULINO"},
    {"image": 1, "title": "Faqueiro Marcas que Ficam", "brand": "Kapbom", "value": 9999, "check": "FAQUEIRO"},
    {"image": 14, "title": "Rádio vintage", "brand": "Lehmox", "value": 9999, "check": "RÁDIO VINTAGE"},
    # R$89,99 e o preco final, confirmado pelo proprietario em 26/10/2026.
    {"image": 12, "title": "Lanterna tática", "value": 8999, "check": "LANTERNA"},
    {"image": 9, "title": "Fone Bluetooth para capacete Lehmox", "brand": "Lehmox", "value": 9999, "check": "CAPACETE"},
    {"image": 10, "title": "Rádio comunicador Lehmox", "brand": "Lehmox", "value": 15999, "check": "RÁDIO COMUNICADOR"},
    {"image": 8, "title": "Fones Bluetooth Skaiky ou Gold Pro", "brand": "Skaiky / Gold Pro", "value": 13899, "note": "cada", "check": "SKAIKY"},
    {"image": 13, "title": "Microfone de lapela Gold", "brand": "Gold", "value": 9999, "check": "MICROFONE DE LAPELA"},
    {"image": 11, "title": "Caixa de som Kapbom 100 W", "brand": "Kapbom", "value": 64899, "check": "SOM CERTO"},
]


def paragraphs_by_image(archive):
    """OOXML relaciona a imagem a cada bloco, mesmo com titulo no mesmo paragrafo."""
    rels = ET.fromstring(archive.read("word/_rels/document.xml.rels"))
    targets = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels}
    document = ET.fromstring(archive.read("word/document.xml"))
    groups, current = {}, None
    for paragraph in document.findall(".//w:body//w:p", NS):
        blips = paragraph.findall(".//a:blip", NS)
        if blips:
            if len(blips) != 1:
                raise ValueError("Paragrafo com mais de uma imagem; revise a associacao.")
            rid = blips[0].attrib.get(f"{{{NS['r']}}}embed")
            current = targets[rid]
            if current in groups:
                raise ValueError("Imagem repetida no Word; revise o documento.")
            groups[current] = []
        value = helpers.clean("".join(n.text or "" for n in paragraph.findall(".//w:t", NS)))
        value = re.sub(r"\s+", " ", value.replace("*", "")).strip()
        if current and value:
            groups[current].append(value)
    return groups


def description(lines, offer):
    # Titulo/preco possuem campos proprios. Remove somente a primeira linha,
    # o cabecalho repetido da campanha e hashtags; preserva toda a legenda util.
    body = [line for line in lines[1:]
            if not line.startswith("#")
            and not re.match(r"^(?:CAMPANHA )?SERVIR COM DIREÇÃO\s*\|", line)
            and line != "CAMPANHA SERVIR COM DIREÇÃO"]
    result = "\n\n".join(body)
    # Marcas conferidas nos rotulos das fotos: o Word usava variantes por engano.
    if offer["image"] == 4:
        result = result.replace("Capbom", "Kapbom")
    if offer["image"] == 9:
        result = result.replace("Lexin", "Lehmox")
    if offer["image"] == 10:
        result = result.replace("Lemox", "Lehmox")
    return result


def main():
    source = SOURCE / "bussola arquivos que faltam.docx"
    if not source.is_file():
        raise SystemExit("Word nao encontrado; nenhum produto foi alterado.")
    before = json.loads(CATALOG.read_text(encoding="utf-8"))
    keys = [item.get("importKey") for item in before if item.get("importKey")]
    if len(keys) != len(set(keys)):
        raise SystemExit("Chaves de importacao duplicadas; catalogo nao alterado.")
    products = list(before)
    next_id = max(item["numero"] for item in before) + 1
    added = []
    with ZipFile(source) as archive:
        groups = paragraphs_by_image(archive)
        # Valida todos os vinculos antes de criar imagens ou gravar o JSON.
        for offer in OFFERS:
            media = f"media/image{offer['image']}.jpg"
            if media not in groups or offer["check"] not in groups[media][0].upper():
                raise SystemExit(f"Legenda ou imagem mudou: {media}. Revise o mapeamento.")
            archive.getinfo("word/" + media)
        for offer in OFFERS:
            key = PREFIX + f"image{offer['image']}"
            if key in keys:
                continue  # Nem registros antigos nem este lote sao sobrescritos.
            media = f"media/image{offer['image']}.jpg"
            legend = description(groups[media], offer)
            filename = f"{next_id:02d}-{helpers.slug(offer['title'])}"
            full, thumb = DEST / f"{filename}.webp", DEST / f"{filename}-480.webp"
            if full.exists() or thumb.exists():
                raise SystemExit(f"Arquivo ja existente: {filename}; sobrescrita bloqueada.")
            profiles = ["utilidade", "presentear"]
            if offer.get("category") == "kit":
                profiles.append("body-splash")
            if offer["value"] <= 10000:
                profiles.append("ate-100")
            with Image.open(BytesIO(archive.read("word/" + media))) as photo:
                width, height = helpers.save_webp(photo, full, 960, 87)
                helpers.save_webp(photo, thumb, 480, 84)
            base = f"/campanhas/servir-com-direcao/{filename}"
            product = {
                "numero": next_id, "importKey": key, "title": offer["title"],
                "brand": offer.get("brand", "Seleção Bússola"),
                "genero": offer.get("genero", "unissex"),
                "category": offer.get("category", "acessorio"),
                "price": ("A partir de " if offer.get("from") else "") + helpers.money(offer["value"]),
                "priceValue": offer["value"], "priceNote": offer.get("note", ""),
                "summary": legend.split("\n\n")[0], "description": legend,
                "profiles": profiles, "image": base + ".webp", "thumbnail": base + "-480.webp",
                "width": width, "height": height,
                "alt": f"{offer['title']}, foto original da campanha Servir com Direção da Bússola",
            }
            products.append(product)
            added.append(product)
            next_id += 1

    # Protecao append-only: mesmos IDs, ordem e todos os campos anteriores.
    assert products[:len(before)] == before, "Produto anterior alterado."
    assert len({p["numero"] for p in products}) == len(products), "ID duplicado."
    assert len([p for p in products if p.get("importKey", "").startswith(PREFIX)]) == len(OFFERS)
    if added:
        CATALOG.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    size = sum((ROOT / "public" / p["thumbnail"].lstrip("/")).stat().st_size for p in added)
    print(f"{len(added)} novas ofertas; {len(products)} no total. {len(before)} anteriores preservadas.")
    print(f"Miniaturas novas: {size / 1024:.0f} KB no total.")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
