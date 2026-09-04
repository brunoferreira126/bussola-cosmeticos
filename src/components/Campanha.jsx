import { useEffect, useMemo, useState } from "react";

// MANUTENCAO DOS CATALOGOS:
// Edite titulos, precos e legendas nos arquivos dentro de src/data.
// O arquivo src/data/README.md explica cada campo e o caminho das imagens.
import produtosMesCliente from "../data/mesClienteCatalogo.json";
import "./campanha.css";

// Numero oficial da loja no formato internacional exigido pelo WhatsApp.
const WHATSAPP_NUMERO = "5585984241536";

// Mantem todo o codigo do Clube guardado, mas fora da landing page por agora.
const EXIBIR_CLUBE_BUSSOLA = false;

// URL futura do Google Apps Script. Quando estiver preenchida no Netlify,
// o formulario envia os dados direto para uma planilha no Drive.
const CLUBE_ENDPOINT = import.meta.env.VITE_CLUBE_BUSSOLA_ENDPOINT || "";

// Beneficios usados para explicar a progressao do Clube Bussola.
const niveis = [
  { nome: "Explorador", faixa: "0-4", descricao: "Primeiros passos no clube." },
  { nome: "Navegador", faixa: "5-9", descricao: "Mais vantagens e prioridade." },
  { nome: "Capitão", faixa: "10-14", descricao: "Recompensas maiores." },
  { nome: "Comandante", faixa: "15-19", descricao: "Beneficios especiais." },
  { nome: "Embaixador", faixa: "20+", descricao: "Status maximo do clube." },
];

// Recompensas exibidas como trilha de gamificacao.
const recompensas = [
  { meta: "3 indicações", premio: "Brinde especial" },
  { meta: "5 indicações", premio: "10% de benefício" },
  { meta: "10 indicações", premio: "20% de benefício" },
  { meta: "15 indicações", premio: "Presente especial" },
  { meta: "20 indicações", premio: "Embaixador Bússola" },
];

// Itens do menu demonstrativo do dashboard do cliente.
const menuCliente = [
  "Minha Conta",
  "Cashback",
  "Indicações",
  "Histórico",
  "Benefícios",
  "Promoções",
];

// Cada aba controla seus próprios textos, produtos e filtros. Centralizar essa
// configuração evita duplicar a grade e o modal de produtos no JSX.
const catalogos = {
  mesCliente: {
    label: "Mês do Cliente",
    kicker: "Mês do Cliente",
    titulo: "Escolha pelo que faz sentido para você",
    descricao:
      "A vitrine organiza primeiro as opções que combinam com sua intenção: perfume, presente, autocuidado, benefícios e achados até R$ 100.",
    produtos: produtosMesCliente,
    filtros: [
      { label: "Todos", value: "todos" },
      { label: "Perfumaria", value: "perfumaria" },
      { label: "Presentes", value: "presentes" },
      { label: "Autocuidado", value: "autocuidado" },
      { label: "Acessórios", value: "acessorios" },
      { label: "Infantil", value: "infantil" },
    ],
  },
};

// A ordem deste array também define a ordem visual das abas.
const abasCatalogo = [
  { label: "Mês do Cliente", value: "mesCliente" },
];

// Opções da busca guiada. O value deve bater com o campo profiles do JSON.
const opcoesBuscaCliente = [
  {
    value: "perfume",
    nome: "Um perfume para marcar presença",
    chamada: "Fragrâncias escolhidas pelo estilo e pela ocasião",
    texto: "Perfumes femininos, masculinos e linhas especiais para quem quer se sentir bem lembrado.",
    direcao: "A Bússola mostra primeiro fragrâncias de presença, opções sofisticadas e oportunidades com ótimo valor.",
  },
  {
    value: "presente",
    nome: "Um presente para alguém especial",
    chamada: "Escolhas prontas para encantar sem perder tempo",
    texto: "Kits, estojos e combinações com boa apresentação para transformar o gesto em carinho.",
    direcao: "As primeiras opções priorizam kits completos, presentes prontos e produtos com aparência de presente especial.",
  },
  {
    value: "autocuidado",
    nome: "Algo para cuidar de mim",
    chamada: "Rotina mais cheirosa, prática e gostosa",
    texto: "Hidratantes, sabonetes, linhas de cabelo, body splash e cuidados para usar todos os dias.",
    direcao: "A vitrine começa por combos de autocuidado, linhas corporais e produtos que valorizam a rotina.",
  },
  {
    value: "ate-100",
    nome: "Uma oportunidade até R$ 100",
    chamada: "Boas escolhas com preço fácil de decidir",
    texto: "Produtos com valor acessível, benefícios de leve dois e achados para comprar agora.",
    direcao: "As sugestões até R$ 100 aparecem primeiro para facilitar a compra rápida sem abrir mão de qualidade.",
  },
  {
    value: "beneficio",
    nome: "Uma condição realmente vantajosa",
    chamada: "Produtos com bônus, leve dois ou economia clara",
    texto: "Opções pensadas para o cliente sentir que aproveitou uma oportunidade de verdade.",
    direcao: "A Bússola destaca ofertas com benefício percebido, combos especiais e oportunidades que fazem o dinheiro render.",
  },
  {
    value: "impacto",
    nome: "Algo para impressionar",
    chamada: "Presentes e produtos com mais presença visual",
    texto: "Linhas premium, perfumes árabes, relógios e escolhas com maior percepção de valor.",
    direcao: "Os produtos de impacto aparecem primeiro para quem quer uma compra marcante e com aparência sofisticada.",
  },
  {
    value: "rotina",
    nome: "Algo útil para o dia a dia",
    chamada: "Itens funcionais que acompanham a rotina",
    texto: "Acessórios, cuidados práticos e produtos fáceis de usar em casa, no trabalho ou na viagem.",
    direcao: "A seleção prioriza itens versáteis, funcionais e fáceis de encaixar na rotina.",
  },
];

// Tradução visual dos slugs usados no JSON para rótulos melhores nos cards.
const categoriasCatalogo = {
  acessorios: "Acessórios",
  autocuidado: "Autocuidado",
  cuidados: "Cuidados",
  infantil: "Infantil",
  perfumaria: "Perfumaria",
  presentes: "Presentes",
  tecnologia: "Tecnologia",
};

// Produtos marcados como destaque no JSON abrem a página com intenção de venda rápida.
// O primeiro destaque vira a peça principal; os demais formam a vitrine de decisão.
const destaquesMesCliente = produtosMesCliente.filter((produto) => produto.highlight);
const destaquePrincipalCliente = destaquesMesCliente[0] || produtosMesCliente[0];
const destaquesRapidosCliente = destaquesMesCliente
  .filter((produto) => produto.numero !== destaquePrincipalCliente?.numero)
  .slice(0, 9);

/*
 * O Clube Bússola continua abaixo deste catálogo, preservado e oculto pela
 * constante EXIBIR_CLUBE_BUSSOLA. Antes de reativá-lo, alinhar as regras com
 * Bruno para não misturar o programa de benefícios com campanhas sazonais.
 */

// Exemplo visual de indicacoes para o cliente entender o funcionamento.
const indicacoesDemo = [
  { nome: "Maria", status: "Comprou", validada: true },
  { nome: "Pedro", status: "Cadastrado", validada: false },
  { nome: "Ana", status: "Comprou", validada: true },
];

// Mensagem de WhatsApp usada como fallback enquanto o Google Sheets nao estiver conectado.
function criarMensagemCadastro(dados) {
  return [
    "Olá! Quero entrar no Clube Bússola.",
    "",
    `Nome: ${dados.nome}`,
    `WhatsApp: ${dados.whatsapp}`,
    `Email: ${dados.email}`,
    `Cidade: ${dados.cidade || "Não informado"}`,
    `Nascimento: ${dados.nascimento || "Não informado"}`,
    "",
    "Vim pela campanha do Mês do Cliente da Bússola.",
  ].join("\n");
}

// Monta a mensagem de compra para produtos de qualquer uma das abas.
function criarLinkProduto(produto) {
  const mensagem = `Olá! Vim pela campanha do Mês do Cliente da Bússola e quero saber mais sobre: ${produto.title} - ${produto.price}`;

  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
}

// Alguns produtos de condição especial têm duas artes. Este helper deixa
// cards e modal usando a mesma regra sem duplicar condicionais no JSX.
function imagensProduto(produto) {
  return produto?.images?.length ? produto.images : [produto.image];
}

// Gera um codigo demonstrativo de indicacao a partir do nome digitado.
function gerarCodigoIndicacao(nome) {
  const base = nome
    .trim()
    .split(" ")[0]
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();

  return `${base || "CLIENTE"}315`;
}

export default function Campanha() {
  // Define qual conjunto de produtos está visível sem trocar de página.
  const [abaCatalogo, setAbaCatalogo] = useState("mesCliente");

  // Busca digitada pelo cliente dentro da aba ativa.
  const [buscaCatalogo, setBuscaCatalogo] = useState("");

  // Categoria escolhida nos filtros da aba ativa.
  const [filtroCatalogo, setFiltroCatalogo] = useState("todos");

  // Perfil escolhido na busca guiada. Vazio significa catálogo sem priorização.
  const [perfilSelecionado, setPerfilSelecionado] = useState("");

  // Controla a abertura das opções para a busca guiada ocupar menos espaço.
  const [perfilMenuAberto, setPerfilMenuAberto] = useState(false);

  // Produto aberto no modal de descricao completa.
  const [produtoAberto, setProdutoAberto] = useState(null);

  // Controla quantas ofertas aparecem inicialmente para nao assustar o cliente.
  const [quantidadeVisivel, setQuantidadeVisivel] = useState(6);

  // Dados controlados do formulario de pre-cadastro.
  const [formulario, setFormulario] = useState({
    nome: "",
    whatsapp: "",
    email: "",
    cidade: "",
    nascimento: "",
  });

  // Mensagem de retorno exibida depois do envio.
  const [retorno, setRetorno] = useState("");

  // Evita duplo envio enquanto a requisicao estiver acontecendo.
  const [enviando, setEnviando] = useState(false);

  // Codigo demonstrativo muda conforme o nome informado.
  const codigoIndicacao = useMemo(
    () => gerarCodigoIndicacao(formulario.nome),
    [formulario.nome],
  );

  // A configuração ativa alimenta título, filtros e produtos da mesma grade.
  const catalogoAtual = catalogos[abaCatalogo];

  // Dados completos do perfil escolhido na busca guiada.
  const perfilAtual = opcoesBuscaCliente.find((perfil) => perfil.value === perfilSelecionado);

  // Conta quantas opções combinam com o perfil para reforçar a sensação de curadoria.
  const totalRecomendados = perfilSelecionado
    ? catalogoAtual.produtos.filter((produto) =>
        produto.profiles?.includes(perfilSelecionado),
      ).length
    : 0;


  // Filtra por busca/categoria e, quando há perfil, coloca os matches primeiro.
  const produtosFiltrados = useMemo(() => {
    const termo = buscaCatalogo.trim().toLowerCase();

    return catalogoAtual.produtos
      .filter((produto) => {
        const bateFiltro =
          filtroCatalogo === "todos" || produto.category === filtroCatalogo;

        const textoProduto = [
          produto.title,
          produto.summary,
          produto.description,
          categoriasCatalogo[produto.category],
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const bateBusca = !termo || textoProduto.includes(termo);

        return bateFiltro && bateBusca;
      })
      .sort((produtoA, produtoB) => {
        if (!perfilSelecionado) return produtoA.numero - produtoB.numero;

        const matchA = produtoA.profiles?.includes(perfilSelecionado) ? 1 : 0;
        const matchB = produtoB.profiles?.includes(perfilSelecionado) ? 1 : 0;

        return matchB - matchA || produtoA.numero - produtoB.numero;
      });
  }, [buscaCatalogo, catalogoAtual.produtos, filtroCatalogo, perfilSelecionado]);

  // Sempre que buscar ou trocar filtro, volta para uma vitrine menor.
  useEffect(() => {
    setQuantidadeVisivel(6);
  }, [abaCatalogo, buscaCatalogo, filtroCatalogo, perfilSelecionado]);

  const produtosVisiveis = produtosFiltrados.slice(0, quantidadeVisivel);
  const temMaisProdutos = quantidadeVisivel < produtosFiltrados.length;

  // Trocar de aba também limpa busca, filtro e modal para não carregar estado
  // de um catálogo no outro.
  function selecionarAbaCatalogo(novaAba) {
    setAbaCatalogo(novaAba);
    setBuscaCatalogo("");
    setFiltroCatalogo("todos");
    setPerfilSelecionado("");
    setPerfilMenuAberto(false);
    setProdutoAberto(null);
  }

  function selecionarPerfilCompra(perfil) {
    setPerfilSelecionado(perfil);
    setPerfilMenuAberto(false);
    setBuscaCatalogo("");
    setFiltroCatalogo("todos");
    setProdutoAberto(null);

    window.setTimeout(() => {
      document
        .getElementById("catalogo-mes-cliente")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function atualizarCampo(event) {
    const { name, value } = event.target;

    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: value,
    }));
  }

  async function enviarCadastro(event) {
    event.preventDefault();
    setEnviando(true);
    setRetorno("");

    const payload = {
      ...formulario,
      origem: "Campanha Mês do Cliente - Clube Bússola",
      codigoIndicacao,
      dataCadastro: new Date().toISOString(),
    };

    try {
      // Quando o Apps Script estiver ativo, o envio cai direto na planilha.
      if (CLUBE_ENDPOINT) {
        await fetch(CLUBE_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });

        setRetorno("Cadastro enviado. A equipe Bússola vai confirmar seus benefícios.");
      } else {
        // Fallback seguro: abre WhatsApp com os dados preenchidos.
        const mensagem = criarMensagemCadastro(formulario);
        window.open(
          `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`,
          "_blank",
          "noopener,noreferrer",
        );

        setRetorno("Abrimos o WhatsApp com seus dados para finalizar o cadastro.");
      }
    } catch {
      setRetorno("Não conseguimos enviar agora. Chame a Bússola pelo WhatsApp.");
    } finally {
      setEnviando(false);
    }
  }

  /*
    CLUBE BUSSOLA PAUSADO TEMPORARIAMENTE

    A estrutura de Clube Bussola, dashboard demonstrativo, indicacoes,
    cashback, formulario com Apps Script e documentacao do Drive continuam no
    projeto para retomarmos depois. Por agora, a landing page mostra somente a
    campanha/catalogo do Mês do Cliente, que e a prioridade comercial imediata.

    Importante para a proxima alteracao:
    antes de mexer novamente nessa secao, perguntar ao Bruno o que faremos com
    o Clube Bussola.
  */

  if (!EXIBIR_CLUBE_BUSSOLA) return (
    <section className="campanha clube-bussola mes-cliente-campanha" id="campanha">
      <div className="clube-hero campanha-mes-cliente-hero">
        <div className="pais-overlay cliente-overlay" />

        <div className="clube-hero-texto">
          <div className="pais-logo-area cliente-logo-area">
            {/* Logo oficial do Mês do Cliente, otimizada em WebP para abrir leve. */}
            <img
              className="pais-logo cliente-logo"
              src="/campanhas/mes-cliente/logo-mes-cliente.webp"
              alt="Mês do Cliente Bússola"
              loading="eager"
              decoding="async"
            />
            <span className="pais-logo-brilho cliente-logo-brilho" aria-hidden="true" />
          </div>

          <span className="campanha-tag">Mês do Cliente Bússola</span>
          <h2>Seu estilo, seu momento, nossa prioridade.</h2>

          <p>
            Uma curadoria para comprar melhor: escolha o que procura, veja as
            oportunidades certas primeiro e siga com acesso ao catálogo completo.
          </p>

          <div className="clube-acoes">
            <a href="#vitrine-mes-cliente" className="btn-gold">
              Ver destaques
            </a>

            <a href="#guia-mes-cliente" className="btn-outline">
              Escolha guiada
            </a>
          </div>
        </div>
      </div>

      <section
        className="condicoes-especiais mes-cliente-vitrine"
        id="vitrine-mes-cliente"
        aria-labelledby="vitrine-mes-cliente-titulo"
      >
        <div className="condicoes-topo">
          <span className="catalogo-kicker">Vitrine do cliente</span>
          <h3 id="vitrine-mes-cliente-titulo">
            Comece pelas oportunidades que merecem atenção agora.
          </h3>
          <p>
            Produtos com benefício real, preço fácil de decidir e escolhas que
            entregam presente, autocuidado e presença sem pesar na experiência.
          </p>
        </div>

        {destaquePrincipalCliente && (
          <div className="condicoes-palco cliente-destaques-palco">
            <article className="condicao-principal cliente-destaque-principal">
              <div className="condicao-principal-media cliente-destaque-media">
                <img
                  src={destaquePrincipalCliente.image}
                  alt={destaquePrincipalCliente.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="condicao-principal-info">
                <span>{destaquePrincipalCliente.badge}</span>
                <h4>{destaquePrincipalCliente.title}</h4>
                <p>{destaquePrincipalCliente.summary}</p>

                <div className="condicao-preco">
                  {destaquePrincipalCliente.oldPrice && (
                    <del>{destaquePrincipalCliente.oldPrice}</del>
                  )}
                  <strong>{destaquePrincipalCliente.price}</strong>
                </div>

                <div className="condicao-acoes">
                  <a
                    href={criarLinkProduto(destaquePrincipalCliente)}
                    target="_blank"
                    rel="noreferrer"
                    className="produto-whatsapp"
                  >
                    Quero aproveitar
                  </a>

                  <button
                    type="button"
                    className="produto-detalhes"
                    onClick={() => setProdutoAberto(destaquePrincipalCliente)}
                  >
                    Ler detalhes
                  </button>
                </div>
              </div>
            </article>

            <div
              className="condicoes-lista cliente-destaques-lista"
              aria-label="Destaques do Mês do Cliente"
            >
              {destaquesRapidosCliente.map((produto) => {
                const imagens = imagensProduto(produto);

                return (
                  <article className="condicao-card cliente-destaque-card" key={produto.numero}>
                    <button
                      type="button"
                      className={`condicao-card-media ${
                        imagens.length > 1 ? "tem-variantes" : ""
                      }`}
                      onClick={() => setProdutoAberto(produto)}
                    >
                      <img
                        src={imagens[0]}
                        alt={produto.alt}
                        loading="lazy"
                        decoding="async"
                      />

                      {imagens.length > 1 && <span>{imagens.length} versões</span>}
                    </button>

                    <div className="condicao-card-info">
                      <span>{produto.badge}</span>
                      <h4>{produto.title}</h4>
                      <p>{produto.summary}</p>

                      <div className="condicao-card-preco">
                        {produto.oldPrice && <del>{produto.oldPrice}</del>}
                        <strong>{produto.price}</strong>
                      </div>

                      <a
                        href={criarLinkProduto(produto)}
                        target="_blank"
                        rel="noreferrer"
                        className="produto-whatsapp"
                      >
                        Chamar agora
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="guia-pais guia-mes-cliente" id="guia-mes-cliente">
        <div className="guia-pais-palco">
          <div className="guia-pais-topo">
            <span className="catalogo-kicker">Busca guiada</span>
            <span className="guia-pais-chamada">A Bússola começa pela sua intenção</span>
            <h3>O que você procura?</h3>
            <p>
              Selecione uma intenção e o catálogo reorganiza as sugestões mais
              relevantes para aparecerem primeiro, sem esconder as demais opções.
            </p>
          </div>

          <div className="guia-pais-consultor">
            <div className="guia-pais-cabecalho">
              <span>Curadoria inteligente</span>
              <strong>Escolha uma intenção e chegue mais rápido ao produto certo.</strong>
            </div>

            <button
              type="button"
              className="guia-pais-trigger"
              aria-expanded={perfilMenuAberto}
              aria-controls="opcoes-mes-cliente"
              onClick={() => setPerfilMenuAberto((aberto) => !aberto)}
            >
              <span>{perfilAtual ? "Intenção selecionada" : "Toque para responder"}</span>
              <strong>{perfilAtual ? perfilAtual.nome : "O que você procura?"}</strong>
              <small>
                {perfilAtual
                  ? perfilAtual.chamada
                  : "Abra as opções e escolha o tipo de compra que mais combina com este momento."}
              </small>
              <b>{perfilMenuAberto ? "Fechar opções" : "Ver opções"}</b>
            </button>

            {perfilMenuAberto && (
              <div
                className="guia-pais-opcoes"
                id="opcoes-mes-cliente"
                aria-label="Opções da busca guiada"
              >
                {opcoesBuscaCliente.map((perfil) => (
                  <button
                    type="button"
                    key={perfil.value}
                    className={perfilSelecionado === perfil.value ? "ativo" : ""}
                    onClick={() => selecionarPerfilCompra(perfil.value)}
                  >
                    <span>{perfil.nome}</span>
                    <strong>{perfil.chamada}</strong>
                    <small>{perfil.texto}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="guia-pais-vitrine">
          <div className="guia-pais-resultado">
            {perfilAtual ? (
              <>
                <span>{totalRecomendados} opções para {perfilAtual.nome}</span>
                <strong>{perfilAtual.direcao}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setPerfilSelecionado("");
                    setPerfilMenuAberto(false);
                  }}
                >
                  Limpar escolha
                </button>
              </>
            ) : (
              <>
                <span>Catálogo completo logo abaixo</span>
                <strong>
                  A escolha guiada funciona como uma vitrine pessoal: ela muda a
                  ordem dos produtos, mas mantém todas as opções disponíveis.
                </strong>
              </>
            )}
          </div>

          <div className="guia-pais-catalogo-chamada">
            <span>Próximo passo</span>
            <strong>
              {perfilAtual
                ? "As sugestões compatíveis aparecem primeiro para acelerar a decisão."
                : "Comece pela intenção ou desça direto para comparar o catálogo completo."}
            </strong>
            <a href="#catalogo-mes-cliente">Ver catálogo completo</a>
          </div>
        </div>
      </section>

      <section
        className="catalogo-sao-joao catalogo-mes-cliente"
        id="catalogo-mes-cliente"
      >
        <div
          className="catalogo-abas"
          role="tablist"
          aria-label="Catálogos da Bússola"
        >
          {abasCatalogo.map((aba) => (
            <button
              type="button"
              role="tab"
              key={aba.value}
              id={`aba-${aba.value}`}
              aria-controls="painel-catalogo"
              aria-selected={abaCatalogo === aba.value}
              className={abaCatalogo === aba.value ? "ativo" : ""}
              onClick={() => selecionarAbaCatalogo(aba.value)}
            >
              {aba.label}
            </button>
          ))}
        </div>

        <div
          id="painel-catalogo"
          role="tabpanel"
          aria-labelledby={`aba-${abaCatalogo}`}
        >
          <div className="catalogo-topo">
            <div>
              <span className="catalogo-kicker">{catalogoAtual.kicker}</span>
              <h3>{catalogoAtual.titulo}</h3>
              <p>{catalogoAtual.descricao}</p>
            </div>

            <label className="catalogo-busca">
              <span>Buscar oferta</span>
              <input
                type="search"
                placeholder="Ex.: perfume, presente, refil, até 100..."
                value={buscaCatalogo}
                onChange={(event) => setBuscaCatalogo(event.target.value)}
              />
            </label>
          </div>

          {perfilAtual && (
            <div className="catalogo-prioridade">
              <span>
                Mostrando primeiro opções para <strong>{perfilAtual.nome}</strong>.
              </span>
              <button type="button" onClick={() => setPerfilSelecionado("")}>
                Limpar escolha
              </button>
            </div>
          )}

          <div
            className="catalogo-filtros"
            aria-label={`Filtros do catálogo ${catalogoAtual.label}`}
          >
            {catalogoAtual.filtros.map((filtro) => (
              <button
                type="button"
                key={filtro.value}
                className={filtroCatalogo === filtro.value ? "ativo" : ""}
                onClick={() => setFiltroCatalogo(filtro.value)}
              >
                {filtro.label}
              </button>
            ))}
          </div>

          <div className="catalogo-grade">
            {produtosVisiveis.map((produto) => {
              const produtoRecomendado =
                perfilSelecionado && produto.profiles?.includes(perfilSelecionado);

              return (
                <article
                  className={`produto-card ${
                    produtoRecomendado ? "produto-recomendado" : ""
                  }`}
                  key={`${abaCatalogo}-${produto.numero}`}
                >
                  <div className="produto-imagem produto-imagem-contain">
                    {produtoRecomendado && (
                      <span className="produto-match">Combina com sua busca</span>
                    )}
                    <img
                      src={produto.image}
                      alt={produto.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="produto-info">
                    <span className="produto-categoria">
                      {categoriasCatalogo[produto.category] || produto.category}
                    </span>
                    <h4>{produto.title}</h4>
                    <p>{produto.summary || produto.description}</p>

                    <div className="produto-rodape">
                      <strong>{produto.price}</strong>

                      <a
                        href={criarLinkProduto(produto)}
                        target="_blank"
                        rel="noreferrer"
                        className="produto-whatsapp"
                      >
                        Pedir no WhatsApp
                      </a>

                      <button
                        type="button"
                        className="produto-detalhes"
                        onClick={() => setProdutoAberto(produto)}
                      >
                        Ler descrição completa
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {produtosFiltrados.length === 0 && (
            <div className="catalogo-vazio">
              Nenhuma oferta encontrada com esse filtro.
            </div>
          )}

          {temMaisProdutos && (
            <div className="catalogo-ver-mais">
              <span>
                Mostrando {produtosVisiveis.length} de {produtosFiltrados.length}{" "}
                ofertas
              </span>

              <button
                type="button"
                className="btn-gold"
                onClick={() => setQuantidadeVisivel((atual) => atual + 6)}
              >
                Ver mais ofertas
              </button>
            </div>
          )}
        </div>
      </section>

      {produtoAberto && (
        <div
          className="produto-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Descrição completa de ${produtoAberto.title}`}
        >
          <button
            type="button"
            className="produto-modal-fundo"
            aria-label="Fechar detalhes"
            onClick={() => setProdutoAberto(null)}
          />

          <article className="produto-modal-card">
            <button
              type="button"
              className="produto-modal-fechar"
              aria-label="Fechar detalhes"
              onClick={() => setProdutoAberto(null)}
            >
              ×
            </button>

            <div
              className={`produto-modal-galeria ${
                imagensProduto(produtoAberto).length > 1 ? "tem-variantes" : ""
              }`}
            >
              {imagensProduto(produtoAberto).map((imagem, index) => (
                <img
                  src={imagem}
                  alt={`${produtoAberto.alt} ${index + 1}`}
                  key={imagem}
                />
              ))}
            </div>

            <div className="produto-modal-info">
              <span className="produto-categoria">
                {categoriasCatalogo[produtoAberto.category] || produtoAberto.category}
              </span>
              <h3>{produtoAberto.title}</h3>
              <strong>{produtoAberto.price}</strong>
              <p>{produtoAberto.description}</p>

              <a
                href={criarLinkProduto(produtoAberto)}
                target="_blank"
                rel="noreferrer"
                className="produto-whatsapp"
              >
                Pedir esta oferta no WhatsApp
              </a>
            </div>
          </article>
        </div>
      )}
    </section>
  );

  return (
    <section className="campanha clube-bussola" id="campanha">
      <div className="clube-hero">
        <div className="clube-hero-texto">
          <span className="campanha-tag">Mês do Cliente no Clube Bússola</span>

          <h2>Compre, indique, acompanhe sua evolução e desbloqueie benefícios.</h2>

          <p>
            O Clube Bússola nasce como um programa de relacionamento para
            cashback, indicações, recompra e campanhas sazonais. No Mês do Cliente, o
            cliente já entra entendendo que cada compra pode aproximar de novas
            recompensas.
          </p>

          <div className="clube-acoes">
            <a href="#clube-cadastro" className="btn-gold">
              Entrar no Clube
            </a>

            <a href="#catalogo-mes-cliente" className="btn-outline">
              Ver ofertas de Mês do Cliente
            </a>

            <a href="#clube-niveis" className="btn-outline">
              Ver benefícios
            </a>
          </div>
        </div>

        <aside className="dashboard-demo" aria-label="Resumo demonstrativo do cliente">
          <div className="dashboard-topo">
            <span>Olá, João</span>
            <strong>Bem-vindo ao Clube Bússola.</strong>
          </div>

          <div className="dashboard-resumo">
            <span>
              Cashback disponível
              <strong>R$ 15,00</strong>
            </span>

            <span>
              Indicações
              <strong>7</strong>
            </span>

            <span>
              Nível atual
              <strong>Navegador</strong>
            </span>
          </div>

          <div className="dashboard-progresso">
            <div>
              <span>Próximo nível</span>
              <strong>Capitão</strong>
            </div>
            <p>Faltam 3 indicações validadas.</p>
            <div className="barra-progresso">
              <span />
            </div>
          </div>

          <div className="dashboard-menu">
            {menuCliente.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </aside>
      </div>

      <div className="clube-grid">
        <section className="clube-card clube-explicacao">
          <span className="catalogo-kicker">Como funciona</span>
          <h3>Cadastro não gera ponto. Compra validada gera evolução.</h3>
          <p>
            O cliente gera um código, compartilha com amigos, o indicado se
            cadastra e o ponto só entra quando a compra é confirmada pela equipe.
            Isso mantém o clube justo, organizado e pronto para crescer.
          </p>

          <div className="fluxo-indicacao">
            <span>Gerou código</span>
            <span>Indicou</span>
            <span>Cadastrou</span>
            <span>Comprou</span>
            <span>Validou</span>
          </div>
        </section>

        <section className="clube-card clube-indicacao">
          <span className="catalogo-kicker">Indicação</span>
          <h3>Seu código aparece pronto para compartilhar.</h3>

          <div className="codigo-box">
            <small>Código exemplo</small>
            <strong>{codigoIndicacao}</strong>
            <span>bussola.com.br/indique/{codigoIndicacao}</span>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Olá!\n\nSou cliente da Bússola Cosméticos & Acessórios.\n\nUse meu código:\n\n${codigoIndicacao}\n\ne ganhe benefícios na sua compra.\n\nAcesse:\n\nbussola.com.br/indique/${codigoIndicacao}`,
            )}`}
            target="_blank"
            rel="noreferrer"
            className="btn-gold btn-compartilhar"
          >
            Compartilhar exemplo no WhatsApp
          </a>
        </section>
      </div>

      <section className="clube-niveis" id="clube-niveis">
        <div className="clube-secao-titulo">
          <span className="catalogo-kicker">Gamificação</span>
          <h3>Níveis que fazem o cliente querer voltar.</h3>
        </div>

        <div className="niveis-lista">
          {niveis.map((nivel) => (
            <article className="nivel-card" key={nivel.nome}>
              <strong>{nivel.nome}</strong>
              <span>{nivel.faixa} indicações</span>
              <p>{nivel.descricao}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="clube-recompensas">
        <div className="clube-secao-titulo">
          <span className="catalogo-kicker">Recompensas</span>
          <h3>Marcos simples, fáceis de entender e bons de compartilhar.</h3>
        </div>

        <div className="recompensas-lista">
          {recompensas.map((item) => (
            <article className="recompensa-card" key={item.meta}>
              <span>{item.meta}</span>
              <strong>{item.premio}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="clube-area-cliente">
        <div className="clube-card">
          <span className="catalogo-kicker">Painel de indicações</span>
          <h3>O cliente acompanha quem já comprou e quem ainda falta validar.</h3>

          <div className="indicacoes-lista">
            {indicacoesDemo.map((indicacao) => (
              <div className="indicacao-linha" key={indicacao.nome}>
                <strong>{indicacao.nome}</strong>
                <span>Status: {indicacao.status}</span>
                <em>{indicacao.validada ? "Validada" : "Aguardando compra"}</em>
              </div>
            ))}
          </div>
        </div>

        <div className="clube-card cashback-card">
          <span className="catalogo-kicker">Cashback</span>
          <h3>Saldo visível cria urgência de recompra.</h3>

          <div className="cashback-box">
            <span>Saldo disponível</span>
            <strong>R$ 25,00</strong>
            <small>Expira em 12 dias</small>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
              "Olá! Quero utilizar meu cashback do Clube Bússola.",
            )}`}
            target="_blank"
            rel="noreferrer"
            className="produto-whatsapp"
          >
            Utilizar na loja
          </a>
        </div>
      </section>

      <section className="clube-cadastro" id="clube-cadastro">
        <div className="clube-cadastro-texto">
          <span className="catalogo-kicker">Pré-cadastro Mês do Cliente</span>
          <h3>Comece pelo Drive agora. Depois evoluímos para login real.</h3>
          <p>
            Este formulário já está preparado para enviar dados para uma
            planilha do Google Sheets via Apps Script. Enquanto a integração não
            estiver ativada, ele abre o WhatsApp com os dados do cliente.
          </p>
        </div>

        <form className="clube-form" onSubmit={enviarCadastro}>
          <label>
            Nome
            <input
              name="nome"
              value={formulario.nome}
              onChange={atualizarCampo}
              placeholder="Nome do cliente"
              required
            />
          </label>

          <label>
            WhatsApp
            <input
              name="whatsapp"
              value={formulario.whatsapp}
              onChange={atualizarCampo}
              placeholder="85 99999-9999"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={atualizarCampo}
              placeholder="cliente@email.com"
              required
            />
          </label>

          <label>
            Cidade
            <input
              name="cidade"
              value={formulario.cidade}
              onChange={atualizarCampo}
              placeholder="Cidade"
            />
          </label>

          <label>
            Nascimento
            <input
              type="date"
              name="nascimento"
              value={formulario.nascimento}
              onChange={atualizarCampo}
            />
          </label>

          <button type="submit" className="btn-gold" disabled={enviando}>
            {enviando ? "Enviando..." : "Quero entrar no Clube"}
          </button>

          {retorno && <p className="form-retorno">{retorno}</p>}
        </form>
      </section>

      <section
        className="catalogo-sao-joao catalogo-mes-cliente"
        id="catalogo-mes-cliente"
      >
        <div className="catalogo-topo">
          <div>
            <span className="catalogo-kicker">Mês do Cliente</span>
            <h3>Presentes guiados pelo que você procura</h3>
            <p>
              Escolha um perfil para ver primeiro as opções que mais combinam,
              sem perder o acesso ao catálogo completo.
            </p>
          </div>

          <label className="catalogo-busca">
            <span>Buscar oferta</span>
            <input
              type="search"
              placeholder="Ex.: presente infantil, perfume feminino, surpresa..."
              value={buscaCatalogo}
              onChange={(event) => setBuscaCatalogo(event.target.value)}
            />
          </label>
        </div>

        <div className="catalogo-filtros" aria-label="Filtros do catálogo do Mês do Cliente">
          {catalogos.mesCliente.filtros.map((filtro) => (
            <button
              type="button"
              key={filtro.value}
              className={filtroCatalogo === filtro.value ? "ativo" : ""}
              onClick={() => setFiltroCatalogo(filtro.value)}
            >
              {filtro.label}
            </button>
          ))}
        </div>

        <div className="catalogo-grade">
          {produtosFiltrados.map((produto) => (
            <article className="produto-card" key={produto.numero}>
              <div className="produto-imagem produto-imagem-contain">
                <img
                  src={produto.image}
                  alt={produto.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="produto-info">
                <span className="produto-categoria">
                  {categoriasCatalogo[produto.category] || produto.category}
                </span>
                <h4>{produto.title}</h4>
                <p>{produto.summary || produto.description}</p>

                <div className="produto-rodape">
                  <strong>{produto.price}</strong>

                  <a
                    href={criarLinkProduto(produto)}
                    target="_blank"
                    rel="noreferrer"
                    className="produto-whatsapp"
                  >
                    Pedir no WhatsApp
                  </a>

                  <button
                    type="button"
                    className="produto-detalhes"
                    onClick={() => setProdutoAberto(produto)}
                  >
                    Ler descrição completa
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {produtosFiltrados.length === 0 && (
          <div className="catalogo-vazio">
            Nenhuma oferta encontrada com esse filtro.
          </div>
        )}
      </section>

      {produtoAberto && (
        <div
          className="produto-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Descrição completa de ${produtoAberto.title}`}
        >
          <button
            type="button"
            className="produto-modal-fundo"
            aria-label="Fechar detalhes"
            onClick={() => setProdutoAberto(null)}
          />

          <article className="produto-modal-card">
            <button
              type="button"
              className="produto-modal-fechar"
              aria-label="Fechar detalhes"
              onClick={() => setProdutoAberto(null)}
            >
              ×
            </button>

            <div
              className={`produto-modal-galeria ${
                imagensProduto(produtoAberto).length > 1 ? "tem-variantes" : ""
              }`}
            >
              {imagensProduto(produtoAberto).map((imagem, index) => (
                <img
                  src={imagem}
                  alt={`${produtoAberto.alt} ${index + 1}`}
                  key={imagem}
                />
              ))}
            </div>

            <div className="produto-modal-info">
              <span className="produto-categoria">{produtoAberto.category}</span>
              <h3>{produtoAberto.title}</h3>
              <strong>{produtoAberto.price}</strong>
              <p>{produtoAberto.description}</p>

              <a
                href={criarLinkProduto(produtoAberto)}
                target="_blank"
                rel="noreferrer"
                className="produto-whatsapp"
              >
                Pedir esta oferta no WhatsApp
              </a>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
