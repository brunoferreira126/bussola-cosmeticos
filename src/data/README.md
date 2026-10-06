# Manutenção dos catálogos

Os títulos, preços, descrições e caminhos das imagens ficam nesta pasta para
que possam ser alterados sem procurar dentro do componente visual.

## Arquivos principais

- `saoJoaoCatalogo.json`: produtos exibidos na aba **São João**.
- `oportunidadesCatalogo.json`: produtos exibidos na aba **Oportunidades**.
- `diaDosPaisCatalogo.json`: produtos exibidos na campanha **Dia dos Pais**.
- `agostoDirecaoCatalogo.json`: arquivo legado da campanha Agosto com Direção.
- `condicoesEspeciaisCatalogo.json`: produtos em condição especial exibidos
  logo no começo da landing page.
- `mesClienteCatalogo.json`: arquivo legado da campanha **Mês do Cliente**.
- `rotaAlegriaCatalogo.json`: produtos da campanha atual **Rota da Alegria**.

## Como alterar uma legenda

1. Abra o arquivo do catálogo desejado no Visual Studio Code.
2. Procure pelo nome atual do produto com `Ctrl + F`.
3. Altere somente o conteúdo depois de `title`, `price`, `alt` ou
   `summary` ou `description`, mantendo as aspas e a vírgula do JSON.
4. Salve o arquivo e confira a página local.

## Significado de cada campo

- `numero`: ordem do produto no catálogo.
- `title`: nome exibido no card e no modal.
- `price`: preço destacado no card.
- `oldPrice`: preço anterior, usado apenas quando a oferta tem comparação.
- `badge`: selo curto exibido nos produtos em condição especial.
- `category`: filtro ao qual o produto pertence.
- `profiles`: perfis da busca guiada em que o produto aparece primeiro.
- `image`: caminho da imagem dentro da pasta `public/campanhas`.
- `images`: lista de imagens quando uma mesma linha de produto tem mais de
  uma arte.
- `alt`: descrição curta da imagem para acessibilidade.
- `summary`: texto curto exibido no card do produto.
- `description`: legenda completa aberta pelo botão de detalhes.

As imagens de São João ficam em `public/campanhas/sao-joao`, as imagens da
aba Oportunidades ficam em `public/campanhas/oportunidades`, as imagens do Dia
dos Pais ficam em `public/campanhas/dia-dos-pais`, as imagens antigas do Mês
do Cliente ficam em `public/campanhas/mes-cliente` e a campanha atual fica em
`public/campanhas/rota-da-alegria`.

## Perfis do Dia dos Pais

Use estes valores dentro de `profiles` para controlar a busca guiada:

- `classico`
- `vaidoso`
- `pratico`
- `moderno`
- `executivo`
- `simples`
- `aventureiro`
- `experiente`
- `pai-mae`
- `marido-pai`

## Campanha Rota da Alegria

O catálogo ativo da campanha fica em `rotaAlegriaCatalogo.json`.
As imagens ficam em `/public/campanhas/rota-da-alegria/`.
A logo da campanha fica em `/public/campanhas/rota-da-alegria/logo-rota-da-alegria.png`.
Para alterar título, preço, resumo, descrição, categoria ou opções do guia,
edite o JSON e mantenha os campos `profiles` alinhados com as opções de
"Qual presente você quer encontrar?" em `Campanha.jsx`.

Perfis usados na busca guiada da Rota da Alegria:

- `crianca`
- `cheirinho`
- `presente-pronto`
- `cuidado`
- `diversao`
- `utilidade`
- `ate-100`
