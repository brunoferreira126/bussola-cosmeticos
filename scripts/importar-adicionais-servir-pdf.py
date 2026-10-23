"""Acrescenta as ofertas do PDF sem substituir as 20 ofertas originais.

Requer pypdf e Pillow. Originais nunca sao modificados.
Reexecutar atualiza somente registros desse lote, identificados por importKey.
Para manutencao cotidiana, edite src/data/servirDirecaoCatalogo.json.
"""
from io import BytesIO
import importlib.util
import json
from pathlib import Path
import re
import sys
import unicodedata
from pypdf import PdfReader
from PIL import Image

# Reutiliza a compressao WebP, precos em centavos e nomes do importador original.
spec = importlib.util.spec_from_file_location(
    "servir_imagens", Path(__file__).with_name("importar-servir-direcao.py")
)
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)
ROOT, SOURCE, DEST = helpers.ROOT, helpers.SOURCE, helpers.DEST
CATALOG = ROOT / "src/data/servirDirecaoCatalogo.json"

# Paginas/fotos conferidas visualmente. "pair" e preco do par, nao unitario.
# "unissex" e selecao compartilhada nas duas abas, sem duplicar registros.
OFFERS = [
    {"page": 40, "title": "Perfumes femininos Paris Elysees", "brand": "Paris Elysees", "genero": "feminino", "value": 11999, "note": "cada", "check": "paris elysees"},
    {"page": 42, "title": "Perfumes Wepink", "brand": "Wepink", "genero": "feminino", "value": 13999, "from": True, "check": "we pink"},
    {"page": 44, "title": "Body Splash Barbour's", "brand": "Barbour's", "genero": "unissex", "value": 6499, "note": "cada", "category": "body-splash", "check": "barbour"},
    {"page": 46, "title": "Combo Body Splash Brand Collection", "brand": "Brand Collection", "genero": "feminino", "value": 9999, "pair": True, "category": "body-splash", "check": "brand collection"},
    {"page": 48, "title": "Combo Body Splash Yara + Sabah", "brand": "Sele\u00e7\u00e3o \u00e1rabe", "genero": "feminino", "value": 9999, "pair": True, "category": "body-splash", "check": "yara"},
    {"page": 50, "title": "Combo 2 Body Splash de 100 ml", "brand": "Sele\u00e7\u00e3o B\u00fassola", "genero": "feminino", "value": 9999, "pair": True, "category": "body-splash", "check": "100 ml"},
    {"page": 52, "title": "Shagaf Al Ward, Leen ou Amnia", "brand": "Al Wataniah", "genero": "feminino", "value": 28999, "note": "cada", "check": "shagaf"},
    {"page": 54, "title": "Combo Asad Tradicional + Asad Bourbon", "brand": "Body Splash", "genero": "masculino", "value": 9999, "pair": True, "category": "body-splash", "check": "bourbon"},
    {"page": 56, "title": "Produtos selecionados + miniatura 25 ml", "brand": "Sele\u00e7\u00e3o B\u00fassola", "genero": "masculino", "value": 9999, "from": True, "note": "com brinde", "category": "kit", "check": "brinde"},
    {"page": 58, "title": "Fresh Rave, Salvo Elixir, Silver Scent ou Lapidus", "brand": "Sele\u00e7\u00e3o importada", "genero": "masculino", "value": 26999, "note": "cada", "check": "salvo"},
    {"page": 60, "title": "Carregador port\u00e1til Peining 10.000 mAh", "brand": "Peining", "genero": "unissex", "value": 8999, "category": "acessorio", "check": "peining"},
    {"page": 62, "title": "Perfumes masculinos Paris Elysees", "brand": "Paris Elysees", "genero": "masculino", "value": 11999, "note": "cada", "check": "paris elysees"},
    {"page": 64, "title": "Eudora H Flow ou H Energy", "brand": "Eudora", "genero": "masculino", "value": 9999, "note": "cada", "check": "h flow"},
    {"page": 66, "title": "Club 6", "brand": "Eudora", "genero": "masculino", "value": 9999, "old": 19999, "check": "club 6"},
    {"page": 68, "title": "Homem Sagaz", "brand": "Natura", "genero": "masculino", "value": 16899, "old": 25000, "check": "homem sagaz"},
    {"page": 70, "title": "Homem Tradicional, Elo, Verum ou Essence", "brand": "Natura", "genero": "masculino", "value": 15999, "old": 25000, "note": "cada", "check": "verum"},
    {"page": 72, "title": "Egeo Bomb Black, Quasar ou Arbo", "brand": "O Botic\u00e1rio", "genero": "masculino", "value": 14999, "note": "cada", "check": "quasar clash"},
    {"page": 74, "title": "Combo perfume masculino + bon\u00e9", "brand": "Sele\u00e7\u00e3o B\u00fassola", "genero": "masculino", "value": 9999, "note": "o combo", "category": "kit", "check": "bone"},
    {"page": 76, "title": "Combo Homem Sagaz + Biografia 100 ml", "brand": "Natura", "genero": "masculino", "value": 9999, "pair": True, "category": "kit", "check": "biografia"},
    {"page": 78, "title": "Kaiak Tradicional ou Aventura", "brand": "Natura", "genero": "masculino", "value": 11899, "old": 20000, "note": "cada", "check": "kaiak"},
]


def normalized(text):
    text = unicodedata.normalize("NFD", text)
    return "".join(c for c in text if not unicodedata.combining(c)).lower()


def paragraphs(page):
    # Layout preserva paragrafos, em vez de colocar cada palavra numa linha.
    text = page.extract_text(extraction_mode="layout") or ""
    return [part for block in re.split(r"\n\s*\n", text)
            if (part := re.sub(r"\s+", " ", helpers.clean(block).replace("*", "")).strip().lstrip("! "))]


def description_for(reader, offer):
    index = offer["page"] - 1
    body = paragraphs(reader.pages[index])[1:]  # titulo/preco tem campos proprios
    following = paragraphs(reader.pages[index + 1])
    # Reune frases quebradas entre paginas, como "We" / "Pink".
    if body and following and not body[-1].endswith((".", "!", "?", ":")):
        body[-1] += " " + following.pop(0)
    body.extend(following)
    # O PDF termina estas frases incompletas; omite so o fragmento sem inventar.
    if offer["page"] == 70:
        body = [p for p in body if not p.startswith("SERVIR COM DIRE\u00c7\u00c3O \u00e9 isso:")]
    if offer["page"] == 72:
        body = [p for p in body if not p.startswith("Qual combina mais com voc\u00ea?")]
    if offer["page"] == 52:
        body = [p.replace("Al Word", "Al Ward").replace("Al WATANIAH", "Al Wataniah") for p in body]
    return "\n\n".join(body)


def main():
    pdfs = list(SOURCE.glob("*.pdf"))
    if len(pdfs) != 1:
        raise SystemExit("Mantenha um unico PDF de origem na pasta servir com direcao.")
    reader = PdfReader(pdfs[0])
    if len(reader.pages) < 79:
        raise SystemExit("Estrutura do PDF mudou; confira o mapeamento de paginas.")
    existing = json.loads(CATALOG.read_text(encoding="utf-8"))
    updated = [dict(item) for item in existing]
    originals = {item["numero"]: item for item in existing if not item.get("importKey")}
    next_id = max(item["numero"] for item in existing) + 1
    DEST.mkdir(parents=True, exist_ok=True)
    for offer in OFFERS:
        page = offer["page"]
        key = f"servir-adicionais-20261023-p{page}"
        text = " ".join(reader.pages[i].extract_text() or "" for i in (page - 1, page))
        if offer["check"] not in normalized(re.sub(r"\s+", " ", text)):
            raise SystemExit(f"Oferta divergente na pagina {page}; JSON nao gravado.")
        images = list(reader.pages[page - 1].images)
        if len(images) != 1:
            raise SystemExit(f"Confira as fotos da pagina {page}.")
        current = next((item for item in updated if item.get("importKey") == key), None)
        number = current["numero"] if current else next_id
        if current is None:
            next_id += 1
        name = f"{number:02d}-{helpers.slug(offer['title'])}"
        with Image.open(BytesIO(images[0].data)) as photo:
            width, height = helpers.save_webp(photo, DEST / f"{name}.webp", 960, 87)
            helpers.save_webp(photo, DEST / f"{name}-480.webp", 480, 84)
        base = f"/campanhas/servir-com-direcao/{name}"
        category = offer.get("category", "perfume")
        profiles = ["presentear", "utilidade" if category == "acessorio"
                    else ("body-splash" if category == "body-splash" else "perfume")]
        if offer["value"] <= 10000:
            profiles.append("ate-100")
        if offer.get("old"):
            profiles.append("condicao-especial")
        price = helpers.money(offer["value"])
        if offer.get("pair"):
            price = f"2 por {price}"
        if offer.get("from"):
            price = f"A partir de {price}"
        description = description_for(reader, offer)
        product = {
            "numero": number, "importKey": key, "title": offer["title"],
            "brand": offer["brand"], "genero": offer["genero"],
            "category": category, "price": price, "priceValue": offer["value"],
            "priceNote": "o par" if offer.get("pair") else offer.get("note", ""),
            "summary": description.split("\n\n")[0], "description": description,
            "profiles": profiles, "image": f"{base}.webp",
            "thumbnail": f"{base}-480.webp", "width": width, "height": height,
            "alt": f"{offer['title']}, foto original da campanha Servir com Dire\u00e7\u00e3o da B\u00fassola",
        }
        if offer.get("old"):
            product.update(oldPrice=helpers.money(offer["old"]), oldPriceValue=offer["old"])
        if current is None:
            updated.append(product)
        else:
            current.update(product)
    # Inclui novos IDs sem tocar nas ofertas anteriores, inclusive Ella R$149,90.
    for number, original in originals.items():
        if next(item for item in updated if item["numero"] == number) != original:
            raise SystemExit(f"Registro original {number} alterado; gravacao cancelada.")
    if len({item["numero"] for item in updated}) != len(updated):
        raise SystemExit("IDs repetidos; gravacao cancelada.")
    CATALOG.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts = {g: sum(item["genero"] == g for item in updated)
              for g in ("feminino", "masculino", "unissex")}
    print(f"{len(updated)} ofertas. Por cadastro: {counts}. Originais preservados.")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
