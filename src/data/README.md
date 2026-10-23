# Manutenção dos catálogos

Os títulos, preços, descrições e caminhos das imagens ficam nesta pasta para
que possam ser alterados sem procurar dentro do componente visual.

## Campanha atual: Servir com Direção

**Edite `src/data/servirDirecaoCatalogo.json` para trocar nomes, valores e legendas.**
Esse é o único catálogo que a página carrega atualmente. As campanhas anteriores
estão preservadas, mas não são misturadas às novas ofertas.

- `title`, `brand`: nome e marca no card.
- `price`: preço exibido; `priceValue`: o mesmo valor em centavos.
- `oldPrice`, `oldPriceValue`: opcionais, somente quando existe preço anterior.
- `priceNote`: `cada`, `o par` ou vazio.
- `description`: legenda completa exibida em **Ver detalhes**.
- `genero`: `feminino`, `masculino` ou `unissex`; o último aparece nas duas abas.
- `profiles`: prioridades do guia: `perfume`, `body-splash`, `presentear`,
  `ate-100`, `condicao-especial` ou `utilidade`.
- `image`: foto maior; `thumbnail`: miniatura leve; `width` e `height`: dimensões.
- `numero`: identificador único, inclusive entre as duas seleções.

As duas seleções já têm produtos. Novos registros usam IDs únicos e fotos em
`public/campanhas/servir-com-direcao/`. Itens compartilhados, como carregador
portátil e seleção Barbour's, aparecem nas duas abas sem duplicar o cadastro.

### Produtos adicionais de 23/10/2026

O PDF da pasta `servir com direção` trouxe 20 ofertas adicionais. Para
reimportar esse lote, execute `scripts/importar-adicionais-servir-pdf.py` com
Python, pypdf e Pillow. O script tem o mapeamento de páginas e valores revisados;
não tenta adivinhar preços. Reexecutá-lo atualiza somente os registros desse
lote, identificados por `importKey`, sem duplicar produtos nem substituir as
20 ofertas originais. Preserve alterações manuais desses novos registros antes
de reimportar. As fotos originais do PDF são extraídas e convertidas em WebP.

Os textos das páginas 71 e 73 terminavam com frases incompletas no arquivo de
origem; apenas esses fragmentos finais foram omitidos, sem inventar informação.
O visual preto e dourado e o carregamento de seis itens por vez permanecem iguais.

O componente fica em `src/components/Campanha.jsx`, e o visual em
`src/components/campanha.css`. Os comentários explicam os filtros, o guia,
a paginação e o modal. Não é necessário editar esses arquivos para trocar legenda.

O importador `scripts/importar-servir-direcao.py` permite reconstruir catálogo e
WebP a partir do Word (Python com Pillow). Ele não modifica a origem; porém,
reexecutá-lo substitui o JSON gerado, então preserve edições manuais antes disso.

Antes de publicar, execute `node scripts/verificar-catalogo-servir.mjs` e
`npm run build -- --configLoader runner`. A marca leve do cabeçalho fica em
`public/marca/logo-bussola.webp`, independente das pastas de campanha.

Conferências desta importação: Ella Única/Radiance por **R$ 149,90**, confirmado
pelo proprietário; legenda Wepink duplicada no Word consolidada em uma oferta.

## Arquivos principais

- `saoJoaoCatalogo.json`: produtos exibidos na aba **São João**.
- `oportunidadesCatalogo.json`: produtos exibidos na aba **Oportunidades**.
- `diaDosPaisCatalogo.json`: produtos exibidos na campanha **Dia dos Pais**.
- `agostoDirecaoCatalogo.json`: arquivo legado da campanha Agosto com Direção.
- `condicoesEspeciaisCatalogo.json`: produtos em condição especial exibidos
  logo no começo da landing page.
- `mesClienteCatalogo.json`: arquivo legado da campanha **Mês do Cliente**.
- `rotaAlegriaCatalogo.json`: arquivo preservado da campanha **Rota da Alegria**.
- `professoresCatalogo.json`: oito presentes do **Dia dos Professores**,
  exibidos antes dos produtos da Rota da Alegria, sem substituir os kids.

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
"O que você procura?" em `Campanha.jsx`.

Perfis usados na busca guiada da Rota da Alegria:

- `professor`
- `crianca`
- `cheirinho`
- `presente-pronto`
- `cuidado`
- `diversao`
- `utilidade`
- `ate-100`

## Destaque Dia dos Professores

Para corrigir nomes, preços e legendas desta ação, edite
`src/data/professoresCatalogo.json`. Os itens antigos continuam intactos em
`rotaAlegriaCatalogo.json`. O componente combina os dois arquivos, priorizando
professores na listagem inicial e permitindo selecionar o filtro **Kids**.

As fotos otimizadas e a logo com transparência ficam em
`public/campanhas/rota-da-alegria/professores/`. O PNG original continua na pasta
`rota da alegria`; a página carrega uma versão WebP mais leve.

- `colecao: "professores"` coloca o produto no filtro **Para professores**.
- `profiles: ["professor", ...]` inclui o produto na busca guiada por professor.
- Os números 50 a 57 são identificadores únicos; não reutilize os números dos
  49 itens anteriores.
- O Word recebido reutiliza a mesma imagem no **Combo elegante e marcante** e
  na **Cestinha Body Splash + Loção Hidratante**. A associação foi preservada;
  para trocar a foto de uma oferta, altere somente o campo `image` desse item.

## Layout simplificado da Rota da Alegria

- `src/components/Campanha.jsx`: tela atual, coleções Professores/Kids/Todos,
  busca pelo nome, seletor de perfil, paginação e janela de descrição completa.
- `src/components/campanha.css`: estilos isolados da tela atual. A logo principal
  fica em `public/campanhas/rota-da-alegria/logo-rota-alegria.webp`.
- Os cards mostram foto, título e preço. Os campos `summary` e `description`
  continuam nos JSONs; `description` aparece na janela de detalhes.
- A escolha de perfil coloca as sugestões compatíveis primeiro no catálogo
  completo. As coleções Professores e Kids mostram somente o público escolhido.
- `CampanhaLegado.jsx` e `campanha-legado.css`: versão anterior e código do Clube
  preservados para consulta. Esses arquivos não são carregados na página atual.
