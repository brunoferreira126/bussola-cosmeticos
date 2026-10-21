"""Importa as ofertas do Word, preserva as fotos e produz WebP responsivo.

Manutencao cotidiana: edite src/data/servirDirecaoCatalogo.json diretamente.
Este importador so e necessario para reconstruir os arquivos a partir do Word.
Requer Pillow; os documentos e as fotos de origem nunca sao modificados.
"""

from io import BytesIO
import json
from pathlib import Path
import re
import sys
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "servir com dire\u00e7\u00e3o"
DEST = ROOT / "public/campanhas/servir-com-direcao"
NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}

# Associacao editorial conferida com a ordem das imagens no Word, nao com seus
# nomes numericos: image17 e a primeira oferta, por exemplo. Precos em centavos
# evitam erros de ponto flutuante nos selos de desconto e na formatacao.
OFFERS = [
    (17, "Celebre Sua For\u00e7a", "O Botic\u00e1rio", 9999, None),
    (7, "Imensi Alive", "Eudora", 14899, 22999),
    (9, "Egeo Vanilla Obsession 90 ml", "O Botic\u00e1rio", 13999, None),
    (14, "Egeo Dolce 90 ml", "O Botic\u00e1rio", 13999, None),
    (4, "Il\u00eda Ser", "Natura", 14899, 21990),
    (5, "Il\u00eda Secreto", "Natura", 14899, None),
    (10, "Aura Alba", "Natura", 28999, 34990),
    (15, "Il\u00eda Tradicional", "Natura", 14899, None),
    (3, "Accordes Tradicional ou Harmonia", "O Botic\u00e1rio", 22499, None),
    (16, "Linda Tradicional", "O Botic\u00e1rio", 18499, None),
    (6, "Liz", "O Botic\u00e1rio", 15999, None),
    (8, "Glamour, Secret Black ou Intense", "O Botic\u00e1rio", 17999, None),
    (1, "Golden Gardenia ou Sevilla Dourada", "O Botic\u00e1rio", 21999, None),
    (18, "Her Code: Tradicional, Touch ou Cl\u00edmax", "O Botic\u00e1rio", 23499, None),
    (2, "Linha Coffee", "O Botic\u00e1rio", 20999, 24999),
    (20, "Una Parfum", "Natura", 24999, 35000),
    (12, "Rouge, Indulgent ou Absolut", "Eau de Parfum", 20999, 24999),
    (11, "Linha Essencial Feminina", "Natura", 19999, None),
    # R$ 149,90 confirmado pelo proprietario: o Word tinha dois precos.
    (19, "Ella \u00danica ou Ella Radiance 100 ml", "Ella", 14990, 19999),
    (13, "Body Splash Wepink", "Wepink", 9999, None),
]


def clean(text):
    """Remove somente emojis decorativos, preservando acentos e paragrafos."""
    return re.sub(r"[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u200D]", "", text).strip()


def money(cents):
    return f"R$ {cents // 100},{cents % 100:02d}"


def slug(text):
    import unicodedata
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")


def save_webp(source, target, width, quality):
    """Apenas orientacao, tamanho e compressao; nao recria rotulos ou produtos."""
    image = ImageOps.exif_transpose(source).copy()
    image.thumbnail((width, width * 3), Image.Resampling.LANCZOS)
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    image.save(target, "WEBP", quality=quality, method=6)
    return image.size


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    with ZipFile(next(SOURCE.glob("*.docx"))) as archive:
        relationships = ET.fromstring(archive.read("word/_rels/document.xml.rels"))
        targets = {rel.attrib["Id"]: rel.attrib["Target"] for rel in relationships}
        document = ET.fromstring(archive.read("word/document.xml"))
        groups = {}
        current = None
        for paragraph in document.findall(".//w:body//w:p", NS):
            text = clean("".join(node.text or "" for node in paragraph.findall(".//w:t", NS)))
            blips = paragraph.findall(".//a:blip", NS)
            if blips:
                relation = blips[0].attrib.get(f"{{{NS['r']}}}embed")
                current = targets.get(relation)
                groups[current] = []
            # A legenda Wepink aparece duas vezes no Word. A primeira nao tem
            # foto; interrompemos Ella ali para nao misturar duas ofertas.
            if text.startswith("BODY SPLASH WE PINK") and not blips:
                current = None
            if current and text:
                groups[current].append(text)

        products = []
        for index, (image_no, title, brand, cents, old_cents) in enumerate(OFFERS, 1):
            media = f"media/image{image_no}.jpg"
            paragraphs = groups[media]
            # O primeiro texto e o titulo (ou preco, no Imensi); esses campos
            # ja tem lugar proprio no card e no cabecalho dos detalhes.
            paragraphs = paragraphs[2:] if image_no == 7 else paragraphs[1:]
            if paragraphs and re.match(r"^(POR APENAS|DE R\$|QUALQUER UMA POR|POR R\$)", paragraphs[0]):
                paragraphs = paragraphs[1:]
            description = "\n\n".join(paragraphs)
            if image_no == 19:
                description = description.replace("159,90", "149,90")
            if image_no == 20:
                description = description.replace("100,00", "100,01")
            filename = f"{index:02d}-{slug(title)}"
            with Image.open(BytesIO(archive.read(f"word/{media}"))) as photo:
                width, height = save_webp(photo, DEST / f"{filename}.webp", 960, 87)
                save_webp(photo, DEST / f"{filename}-480.webp", 480, 84)
            base = f"/campanhas/servir-com-direcao/{filename}"
            profiles = ["perfume" if image_no != 13 else "body-splash", "presentear"]
            if cents <= 10000:
                profiles.append("ate-100")
            if old_cents:
                profiles.append("condicao-especial")
            product = {
                "numero": index,
                "title": title,
                "brand": brand,
                "genero": "feminino",
                "category": "body-splash" if image_no == 13 else "perfume",
                "price": f"2 por {money(cents)}" if image_no == 13 else money(cents),
                "priceValue": cents,
                "priceNote": "o par" if image_no == 13 else ("cada" if image_no in (3, 8, 1, 18, 2, 20, 12, 11, 19) else ""),
                "summary": paragraphs[0] if paragraphs else title,
                "description": description,
                "profiles": profiles,
                "image": f"{base}.webp",
                "thumbnail": f"{base}-480.webp",
                "width": width,
                "height": height,
                "alt": f"{title}, foto original da sele\u00e7\u00e3o Servir com Dire\u00e7\u00e3o da B\u00fassola",
            }
            if old_cents:
                product["oldPrice"] = money(old_cents)
                product["oldPriceValue"] = old_cents
            products.append(product)

    logo = next(SOURCE.glob("*.png"))
    with Image.open(logo) as image:
        save_webp(image, DEST / "logo-servir-direcao.webp", 1000, 92)
    # A marca do cabecalho nao depende da campanha; o PNG de origem permanece.
    brand_dest = ROOT / "public/marca"
    brand_dest.mkdir(exist_ok=True)
    with Image.open(ROOT / "src/assets/icons/logo-bussola.png") as image:
        save_webp(image, brand_dest / "logo-bussola.webp", 480, 92)
    target = ROOT / "src/data/servirDirecaoCatalogo.json"
    target.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(file.stat().st_size for file in DEST.glob("*.webp"))
    print(f"{len(products)} ofertas importadas; {total / 1024:.0f} KB de imagens responsivas.")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
