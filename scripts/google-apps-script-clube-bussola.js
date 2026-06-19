/* eslint-disable no-unused-vars */
/* global SpreadsheetApp, Utilities, ContentService */

const ABA_CLIENTES = "clientes";

function doPost(event) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_CLIENTES);

  if (!sheet) {
    return responder({ ok: false, erro: "Aba clientes nao encontrada." });
  }

  const dados = JSON.parse(event.postData.contents || "{}");
  const id = Utilities.getUuid();

  sheet.appendRow([
    id,
    dados.nome || "",
    dados.email || "",
    dados.whatsapp || "",
    dados.nascimento || "",
    dados.cidade || "",
    dados.dataCadastro || new Date().toISOString(),
    dados.codigoIndicacao || "",
    "Explorador",
    dados.origem || "Landing page",
  ]);

  return responder({ ok: true, id });
}

function doGet() {
  return responder({
    ok: true,
    mensagem: "Clube Bussola ativo.",
  });
}

function responder(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
