# Manutenção dos catálogos

Os títulos, preços, descrições e caminhos das imagens ficam nesta pasta para
que possam ser alterados sem procurar dentro do componente visual.

## Arquivos principais

- `saoJoaoCatalogo.json`: produtos exibidos na aba **São João**.
- `oportunidadesCatalogo.json`: produtos exibidos na aba **Oportunidades**.

## Como alterar uma legenda

1. Abra o arquivo do catálogo desejado no Visual Studio Code.
2. Procure pelo nome atual do produto com `Ctrl + F`.
3. Altere somente o conteúdo depois de `title`, `price`, `alt` ou
   `description`, mantendo as aspas e a vírgula do JSON.
4. Salve o arquivo e confira a página local.

## Significado de cada campo

- `numero`: ordem do produto no catálogo.
- `title`: nome exibido no card e no modal.
- `price`: preço destacado no card.
- `category`: filtro ao qual o produto pertence.
- `image`: caminho da imagem dentro da pasta `public/campanhas`.
- `alt`: descrição curta da imagem para acessibilidade.
- `description`: legenda completa aberta pelo botão de detalhes.

As imagens de São João ficam em `public/campanhas/sao-joao` e as imagens da
aba Oportunidades ficam em `public/campanhas/oportunidades`.
