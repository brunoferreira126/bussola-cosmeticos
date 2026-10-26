// Verificacao local sem dependencias: node scripts/verificar-catalogo-servir.mjs
// Detecta imagens ausentes, IDs repetidos e valores incoerentes antes do deploy.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const products = JSON.parse(readFileSync(path.join(root, "src/data/servirDirecaoCatalogo.json"), "utf8"));
const money = (cents) => `R$ ${Math.floor(cents / 100)},${String(cents % 100).padStart(2, "0")}`;

assert.ok(products.length > 0, "Catalogo vazio");
assert.equal(new Set(products.map((item) => item.numero)).size, products.length, "IDs repetidos");
const importKeys = products.map((item) => item.importKey).filter(Boolean);
assert.equal(new Set(importKeys).size, importKeys.length, "Chaves de importacao repetidas");
for (const item of products) {
  assert.ok(item.title && item.description && item.brand, `Texto incompleto: ${item.numero}`);
  assert.ok(["feminino", "masculino", "unissex"].includes(item.genero), `Genero invalido: ${item.title}`);
  assert.ok(Number.isSafeInteger(item.priceValue) && item.priceValue > 0, `Preco invalido: ${item.title}`);
  assert.ok(item.price.includes(money(item.priceValue)), `Preco visivel diferente do numerico: ${item.title}`);
  assert.ok(!/[\uFFFD]|\u00c3[\u00a3\u00a7]/u.test(item.description), `Acentos invalidos: ${item.title}`);
  if (item.oldPriceValue) {
    assert.ok(item.oldPriceValue > item.priceValue, `Desconto invalido: ${item.title}`);
    assert.equal(item.oldPrice, money(item.oldPriceValue));
  }
  for (const image of [item.image, item.thumbnail]) {
    assert.ok(image?.startsWith("/campanhas/servir-com-direcao/"), `Caminho invalido: ${item.title}`);
    assert.ok(existsSync(path.join(root, "public", image)), `Foto ausente: ${image}`);
  }
}
// O Word tinha duplicidade Wepink e dois precos Ella; guarda essas correcoes.
assert.equal(products.filter((item) => item.title === "Body Splash Wepink").length, 1);
assert.equal(products.find((item) => item.title.startsWith("Ella ")).priceValue, 14990);
assert.ok(products.some((item) => item.genero === "masculino"), "Selecao masculina vazia");
const imported = products.filter((item) => item.importKey?.startsWith("servir-adicionais-20261023-"));
assert.equal(imported.length, 20, "Importacao adicional incompleta ou duplicada");
assert.equal(new Set(imported.map((item) => item.importKey)).size, imported.length);
// Lote do Word de 26/10: somente acrescimos, sem perder nenhum dos 40 IDs antigos.
for (let numero = 1; numero <= 40; numero += 1) {
  assert.ok(products.some((item) => item.numero === numero), `Produto anterior ausente: ${numero}`);
}
const additions = products.filter((item) => item.importKey?.startsWith("servir-complementos-20261026-"));
assert.equal(additions.length, 14, "Complementos do Word incompletos ou duplicados");
const lantern = additions.find((item) => item.importKey.endsWith("-image12"));
assert.equal(lantern.priceValue, 8999, "Preco final da lanterna confirmado pelo proprietario");
assert.ok(!lantern.oldPriceValue, "A lanterna nao tem preco anterior informado");
assert.equal(additions.filter((item) => item.genero === "unissex").length, 13);
assert.equal(additions.find((item) => item.category === "kit").genero, "masculino");
const shared = products.filter((item) => item.genero === "unissex");
assert.ok(shared.every((item) => item.profiles.includes("utilidade") || item.category === "body-splash"));
assert.ok(existsSync(path.join(root, "public/marca/logo-bussola.webp")));
console.log(`OK: ${products.length} produtos, precos, textos e imagens conferidos.`);
