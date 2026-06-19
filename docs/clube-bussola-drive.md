# Clube Bussola no Google Drive

Este guia prepara a primeira fase sem custo do Clube Bussola usando Google
Sheets e Google Apps Script.

## 1. Criar a planilha

No email da Bussola, crie uma planilha chamada:

`Clube Bussola - Base`

Crie estas abas exatamente com estes nomes:

- `clientes`
- `indicacoes`
- `compras`
- `cashback`
- `configuracoes`

## 2. Cabecalhos recomendados

### clientes

`id | nome | email | telefone | data_nascimento | cidade | data_cadastro | codigo_indicacao | nivel | origem`

### indicacoes

`id | cliente_origem | cliente_indicado | status | data`

### compras

`id | cliente_id | produto | categoria | valor | data`

### cashback

`id | cliente_id | valor | data_geracao | data_expiracao | status`

### configuracoes

`chave | valor`

## 3. Apps Script

Abra a planilha, clique em `Extensoes > Apps Script` e cole o conteudo do
arquivo:

`scripts/google-apps-script-clube-bussola.js`

Depois publique como aplicativo da web:

- Executar como: `Eu`
- Quem tem acesso: `Qualquer pessoa`

Copie a URL gerada.

## 4. Netlify

No Netlify, adicione uma variavel de ambiente:

`VITE_CLUBE_BUSSOLA_ENDPOINT`

Valor:

`URL_DO_APPS_SCRIPT`

Depois faca um novo deploy.

## 5. Como funciona

Quando a variavel existe, o formulario da landing page envia os dados para a
aba `clientes`.

Quando a variavel nao existe, o formulario abre o WhatsApp com os dados do
cliente para a equipe nao perder o cadastro.
