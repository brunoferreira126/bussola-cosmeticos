import { useEffect, useMemo, useState } from "react";

// MANUTENCAO DOS CATALOGOS:
// Edite titulos, precos e legendas nos arquivos dentro de src/data.
// O arquivo src/data/README.md explica cada campo e o caminho das imagens.
import produtosDiaDosPais from "../data/diaDosPaisCatalogo.json";
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
  { nome: "CapitÃ£o", faixa: "10-14", descricao: "Recompensas maiores." },
  { nome: "Comandante", faixa: "15-19", descricao: "Beneficios especiais." },
  { nome: "Embaixador", faixa: "20+", descricao: "Status maximo do clube." },
];

// Recompensas exibidas como trilha de gamificacao.
const recompensas = [
  { meta: "3 indicaÃ§Ãµes", premio: "Brinde especial" },
  { meta: "5 indicaÃ§Ãµes", premio: "10% de benefÃ­cio" },
  { meta: "10 indicaÃ§Ãµes", premio: "20% de benefÃ­cio" },
  { meta: "15 indicaÃ§Ãµes", premio: "Presente especial" },
  { meta: "20 indicaÃ§Ãµes", premio: "Embaixador BÃºssola" },
];

// Itens do menu demonstrativo do dashboard do cliente.
const menuCliente = [
  "Minha Conta",
  "Cashback",
  "IndicaÃ§Ãµes",
  "HistÃ³rico",
  "BenefÃ­cios",
  "PromoÃ§Ãµes",
];

// Cada aba controla seus prÃ³prios textos, produtos e filtros. Centralizar essa
// configuraÃ§Ã£o evita duplicar a grade e o modal de produtos no JSX.
const catalogos = {
  diaDosPais: {
    label: "Dia dos Pais",
    kicker: "PresentÃ£o para o Papai",
    titulo: "Presentes guiados pelo jeito do seu pai",
    descricao:
      "Escolha um perfil para ver primeiro as opÃ§Ãµes que mais combinam, sem perder o acesso ao catÃ¡logo completo.",
    produtos: produtosDiaDosPais,
    filtros: [
      { label: "Todos", value: "todos" },
      { label: "Perfumaria", value: "perfumaria" },
      { label: "Tecnologia", value: "tecnologia" },
      { label: "AcessÃ³rios", value: "acessorios" },
      { label: "Cuidados", value: "cuidados" },
      { label: "Presentes", value: "presentes" },
    ],
  },
};

// A ordem deste array tambÃ©m define a ordem visual das abas.
const abasCatalogo = [
  { label: "Dia dos Pais", value: "diaDosPais" },
];

// Perfis usados na busca guiada. O value deve bater com o campo profiles do JSON.
const perfisPais = [
  {
    value: "classico",
    nome: "Pai ClÃ¡ssico",
    chamada: "O pai que nunca sai de moda",
    texto: "Tradicional, elegante e seguro nas escolhas.",
    direcao: "Perfumes marcantes, kits completos e presentes sofisticados.",
  },
  {
    value: "vaidoso",
    nome: "Pai Vaidoso",
    chamada: "O pai que gosta de se cuidar",
    texto: "Usa perfume, valoriza aparÃªncia e gosta de novidades.",
    direcao: "FragrÃ¢ncias, cuidados masculinos e acessÃ³rios de estilo.",
  },
  {
    value: "pratico",
    nome: "Pai PrÃ¡tico",
    chamada: "O pai que gosta de soluÃ§Ãµes",
    texto: "Prefere utilidade, funcionalidade e custo-benefÃ­cio.",
    direcao: "Kits prontos, tecnologia Ãºtil, acessÃ³rios e rotina.",
  },
  {
    value: "moderno",
    nome: "Pai Moderno",
    chamada: "O pai conectado com as novidades",
    texto: "Antenado, tecnolÃ³gico e aberto a experiÃªncias diferentes.",
    direcao: "Smartwatch, fones, acessÃ³rios tecnolÃ³gicos e perfumes atuais.",
  },
  {
    value: "executivo",
    nome: "Pai Executivo",
    chamada: "O pai que transmite presenÃ§a",
    texto: "Profissional, elegante e cuidadoso com a imagem.",
    direcao: "Perfumes premium, kits sofisticados e acessÃ³rios elegantes.",
  },
  {
    value: "simples",
    nome: "Pai Simples",
    chamada: "O pai que valoriza o carinho",
    texto: "NÃ£o precisa de luxo para sentir o amor no gesto.",
    direcao: "Presentes acessÃ­veis, Ãºteis e preparados com cuidado.",
  },
  {
    value: "aventureiro",
    nome: "Pai Aventureiro",
    chamada: "O pai que vive experiÃªncias",
    texto: "Gosta de viajar, sair e estar sempre em movimento.",
    direcao: "Mochilas, tecnologia portÃ¡til e itens para fora de casa.",
  },
  {
    value: "experiente",
    nome: "Pai Experiente",
    chamada: "O pai que jÃ¡ conquistou muito",
    texto: "Valoriza qualidade, conforto e escolhas diferenciadas.",
    direcao: "Linhas premium, kits especiais e produtos de maior valor percebido.",
  },
  {
    value: "pai-mae",
    nome: "Pai MÃ£e",
    chamada: "Quem ama em dobro",
    texto: "Cuidou, protegeu e assumiu dois papÃ©is com dedicaÃ§Ã£o.",
    direcao: "Presentes com carinho, reconhecimento e valor emocional.",
  },
  {
    value: "marido-pai",
    nome: "Meu Marido, Meu Pai",
    chamada: "O homem que constrÃ³i uma histÃ³ria comigo",
    texto: "Presente para reconhecer o pai dos filhos e parceiro de caminhada.",
    direcao: "Perfumes marcantes, kits sofisticados e acessÃ³rios de presenÃ§a.",
  },
];

// TraduÃ§Ã£o visual dos slugs usados no JSON para rÃ³tulos melhores nos cards.
const categoriasCatalogo = {
  acessorios: "AcessÃ³rios",
  cuidados: "Cuidados",
  perfumaria: "Perfumaria",
  presentes: "Presentes",
  tecnologia: "Tecnologia",
};

/*
 * O Clube BÃºssola continua abaixo deste catÃ¡logo, preservado e oculto pela
 * constante EXIBIR_CLUBE_BUSSOLA. Antes de reativÃ¡-lo, alinhar as regras com
 * Bruno para nÃ£o misturar o programa de benefÃ­cios com campanhas sazonais.
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
    "OlÃ¡! Quero entrar no Clube BÃºssola.",
    "",
    `Nome: ${dados.nome}`,
    `WhatsApp: ${dados.whatsapp}`,
    `Email: ${dados.email}`,
    `Cidade: ${dados.cidade || "NÃ£o informado"}`,
    `Nascimento: ${dados.nascimento || "NÃ£o informado"}`,
    "",
    "Vim pela campanha de Dia dos Pais da BÃºssola.",
  ].join("\n");
}

// Monta a mensagem de compra para produtos de qualquer uma das abas.
function criarLinkProduto(produto) {
  const mensagem = `OlÃ¡! Vim pela campanha de Dia dos Pais da BÃºssola e quero saber mais sobre: ${produto.title} - ${produto.price}`;

  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
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
  // Define qual conjunto de produtos estÃ¡ visÃ­vel sem trocar de pÃ¡gina.
  const [abaCatalogo, setAbaCatalogo] = useState("diaDosPais");

  // Busca digitada pelo cliente dentro da aba ativa.
  const [buscaCatalogo, setBuscaCatalogo] = useState("");

  // Categoria escolhida nos filtros da aba ativa.
  const [filtroCatalogo, setFiltroCatalogo] = useState("todos");

  // Perfil escolhido na busca guiada. Vazio significa catÃ¡logo sem priorizaÃ§Ã£o.
  const [perfilSelecionado, setPerfilSelecionado] = useState("");

  // Controla a abertura das opÃ§Ãµes para a busca guiada ocupar menos espaÃ§o.
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

  // A configuraÃ§Ã£o ativa alimenta tÃ­tulo, filtros e produtos da mesma grade.
  const catalogoAtual = catalogos[abaCatalogo];

  // Dados completos do perfil escolhido na busca guiada.
  const perfilAtual = perfisPais.find((perfil) => perfil.value === perfilSelecionado);

  // Conta quantas opÃ§Ãµes combinam com o perfil para reforÃ§ar a sensaÃ§Ã£o de curadoria.
  const totalRecomendados = perfilSelecionado
    ? catalogoAtual.produtos.filter((produto) =>
        produto.profiles?.includes(perfilSelecionado),
      ).length
    : 0;


  // Filtra por busca/categoria e, quando hÃ¡ perfil, coloca os matches primeiro.
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

  // Trocar de aba tambÃ©m limpa busca, filtro e modal para nÃ£o carregar estado
  // de um catÃ¡logo no outro.
  function selecionarAbaCatalogo(novaAba) {
    setAbaCatalogo(novaAba);
    setBuscaCatalogo("");
    setFiltroCatalogo("todos");
    setPerfilSelecionado("");
    setPerfilMenuAberto(false);
    setProdutoAberto(null);
  }

  function selecionarPerfilPai(perfil) {
    setPerfilSelecionado(perfil);
    setPerfilMenuAberto(false);
    setBuscaCatalogo("");
    setFiltroCatalogo("todos");
    setProdutoAberto(null);

    window.setTimeout(() => {
      document
        .getElementById("catalogo-dia-dos-pais")
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
      origem: "Campanha Dia dos Pais - Clube BÃºssola",
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

        setRetorno("Cadastro enviado. A equipe BÃºssola vai confirmar seus benefÃ­cios.");
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
      setRetorno("NÃ£o conseguimos enviar agora. Chame a BÃºssola pelo WhatsApp.");
    } finally {
      setEnviando(false);
    }
  }

  /*
    CLUBE BUSSOLA PAUSADO TEMPORARIAMENTE

    A estrutura de Clube Bussola, dashboard demonstrativo, indicacoes,
    cashback, formulario com Apps Script e documentacao do Drive continuam no
    projeto para retomarmos depois. Por agora, a landing page mostra somente a
    campanha/catalogo de Dia dos Pais, que e a prioridade comercial imediata.

    Importante para a proxima alteracao:
    antes de mexer novamente nessa secao, perguntar ao Bruno o que faremos com
    o Clube Bussola.
  */

  if (!EXIBIR_CLUBE_BUSSOLA) return (
    <section className="campanha clube-bussola" id="campanha">
      <div className="clube-hero campanha-dia-dos-pais-hero">
        <div className="pais-overlay" />

        <div className="clube-hero-texto">
          <div className="pais-logo-area">
            {/* Logo oficial da campanha: PNG enviado pelo cliente com animaÃ§Ã£o leve. */}
            <img
              className="pais-logo"
              src="/campanhas/dia-dos-pais/logo-dia-dos-pais.png"
              alt="PresentÃ£o para o Papai"
              loading="eager"
              decoding="async"
            />
            <span className="pais-logo-brilho" aria-hidden="true" />
          </div>

          <span className="campanha-tag">Dia dos Pais BÃºssola</span>

          <h2>Qual presente combina com o jeito do seu pai?</h2>

          <p>
            Responda uma pergunta simples, veja primeiro os presentes mais
            certeiros e continue explorando todas as opÃ§Ãµes da campanha.
          </p>

          <div className="clube-acoes">
            <a href="#guia-dia-dos-pais" className="btn-gold">
              Encontrar presente
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
                "OlÃ¡! Quero ver as ofertas de Dia dos Pais da BÃºssola.",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              Chamar no WhatsApp
            </a>
          </div>

          <div className="pais-selos" aria-label="Destaques da campanha">
            <span>Busca guiada</span>
            <span>Presentes por perfil</span>
            <span>Estoque limitado</span>
          </div>
        </div>

      </div>

      <section className="guia-pais" id="guia-dia-dos-pais">
        <div className="guia-pais-palco">
          <div className="guia-pais-topo">
            <span className="catalogo-kicker">Guia de presentes</span>
            <span className="guia-pais-chamada">Pergunta central da campanha</span>
            <h3>Qual o perfil do seu pai?</h3>
            <p>
              Selecione o jeito que mais combina com ele e veja primeiro os
              presentes mais certeiros. A vitrine completa continua disponÃ­vel
              para quem quiser explorar todas as opÃ§Ãµes.
            </p>
          </div>

          <div className="guia-pais-consultor">
            <div className="guia-pais-cabecalho">
              <span>Escolha guiada</span>
              <strong>Comece pelo perfil e chegue mais rÃ¡pido ao presente ideal.</strong>
            </div>

            <button
              type="button"
              className="guia-pais-trigger"
              aria-expanded={perfilMenuAberto}
              aria-controls="opcoes-perfil-pai"
              onClick={() => setPerfilMenuAberto((aberto) => !aberto)}
            >
              <span>{perfilAtual ? "Perfil selecionado" : "Toque para responder"}</span>
              <strong>{perfilAtual ? perfilAtual.nome : "Qual o perfil do seu pai?"}</strong>
              <small>
                {perfilAtual
                  ? perfilAtual.chamada
                  : "Abra a lista de perfis e escolha a opÃ§Ã£o que mais combina com ele."}
              </small>
              <b>{perfilMenuAberto ? "Fechar opÃ§Ãµes" : "Ver perfis"}</b>
            </button>

            {perfilMenuAberto && (
              <div
                className="guia-pais-opcoes"
                id="opcoes-perfil-pai"
                aria-label="Perfis de pai"
              >
                {perfisPais.map((perfil) => (
                  <button
                    type="button"
                    key={perfil.value}
                    className={perfilSelecionado === perfil.value ? "ativo" : ""}
                    onClick={() => selecionarPerfilPai(perfil.value)}
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
                <span>{totalRecomendados} recomendaÃ§Ãµes para {perfilAtual.nome}</span>
                <strong>{perfilAtual.direcao}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setPerfilSelecionado("");
                    setPerfilMenuAberto(false);
                  }}
                >
                  Limpar perfil
                </button>
              </>
            ) : (
              <>
                <span>CatÃ¡logo completo logo abaixo</span>
                <strong>
                  Escolha um perfil para a BÃºssola organizar primeiro os
                  presentes que mais combinam com ele.
                </strong>
              </>
            )}
          </div>

          <div className="guia-pais-catalogo-chamada">
            <span>PrÃ³ximo passo</span>
            <strong>
              {perfilAtual
                ? "As recomendaÃ§Ãµes aparecem primeiro, mas todas as opÃ§Ãµes continuam disponÃ­veis para comparar."
                : "A escolha guiada nÃ£o limita a vitrine. Ela apenas ajuda o cliente a comeÃ§ar melhor."}
            </strong>
            <a href="#catalogo-dia-dos-pais">Ver catÃ¡logo completo</a>
          </div>
        </div>
      </section>

      <section
        className="catalogo-sao-joao catalogo-dia-dos-pais"
        id="catalogo-dia-dos-pais"
      >
        <div
          className="catalogo-abas"
          role="tablist"
          aria-label="CatÃ¡logos da BÃºssola"
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
                placeholder="Ex.: perfume, smartwatch, pai prÃ¡tico..."
                value={buscaCatalogo}
                onChange={(event) => setBuscaCatalogo(event.target.value)}
              />
            </label>
          </div>

          {perfilAtual && (
            <div className="catalogo-prioridade">
              <span>
                Mostrando primeiro presentes para <strong>{perfilAtual.nome}</strong>.
              </span>
              <button type="button" onClick={() => setPerfilSelecionado("")}>
                Limpar escolha
              </button>
            </div>
          )}

          <div
            className="catalogo-filtros"
            aria-label={`Filtros do catÃ¡logo ${catalogoAtual.label}`}
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
                      <span className="produto-match">Combina com o perfil</span>
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
                        Ler descriÃ§Ã£o completa
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
          aria-label={`DescriÃ§Ã£o completa de ${produtoAberto.title}`}
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
              Ã—
            </button>

            <img src={produtoAberto.image} alt={produtoAberto.alt} />

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
          <span className="campanha-tag">Dia dos Pais no Clube BÃºssola</span>

          <h2>Compre, indique, acompanhe sua evoluÃ§Ã£o e desbloqueie benefÃ­cios.</h2>

          <p>
            O Clube BÃºssola nasce como um programa de relacionamento para
            cashback, indicaÃ§Ãµes, recompra e campanhas sazonais. No Dia dos Pais, o
            cliente jÃ¡ entra entendendo que cada compra pode aproximar de novas
            recompensas.
          </p>

          <div className="clube-acoes">
            <a href="#clube-cadastro" className="btn-gold">
              Entrar no Clube
            </a>

            <a href="#catalogo-dia-dos-pais" className="btn-outline">
              Ver ofertas de Dia dos Pais
            </a>

            <a href="#clube-niveis" className="btn-outline">
              Ver benefÃ­cios
            </a>
          </div>
        </div>

        <aside className="dashboard-demo" aria-label="Resumo demonstrativo do cliente">
          <div className="dashboard-topo">
            <span>OlÃ¡, JoÃ£o</span>
            <strong>Bem-vindo ao Clube BÃºssola.</strong>
          </div>

          <div className="dashboard-resumo">
            <span>
              Cashback disponÃ­vel
              <strong>R$ 15,00</strong>
            </span>

            <span>
              IndicaÃ§Ãµes
              <strong>7</strong>
            </span>

            <span>
              NÃ­vel atual
              <strong>Navegador</strong>
            </span>
          </div>

          <div className="dashboard-progresso">
            <div>
              <span>PrÃ³ximo nÃ­vel</span>
              <strong>CapitÃ£o</strong>
            </div>
            <p>Faltam 3 indicaÃ§Ãµes validadas.</p>
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
          <h3>Cadastro nÃ£o gera ponto. Compra validada gera evoluÃ§Ã£o.</h3>
          <p>
            O cliente gera um cÃ³digo, compartilha com amigos, o indicado se
            cadastra e o ponto sÃ³ entra quando a compra Ã© confirmada pela equipe.
            Isso mantÃ©m o clube justo, organizado e pronto para crescer.
          </p>

          <div className="fluxo-indicacao">
            <span>Gerou cÃ³digo</span>
            <span>Indicou</span>
            <span>Cadastrou</span>
            <span>Comprou</span>
            <span>Validou</span>
          </div>
        </section>

        <section className="clube-card clube-indicacao">
          <span className="catalogo-kicker">IndicaÃ§Ã£o</span>
          <h3>Seu cÃ³digo aparece pronto para compartilhar.</h3>

          <div className="codigo-box">
            <small>CÃ³digo exemplo</small>
            <strong>{codigoIndicacao}</strong>
            <span>bussola.com.br/indique/{codigoIndicacao}</span>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `OlÃ¡!\n\nSou cliente da BÃºssola CosmÃ©ticos & AcessÃ³rios.\n\nUse meu cÃ³digo:\n\n${codigoIndicacao}\n\ne ganhe benefÃ­cios na sua compra.\n\nAcesse:\n\nbussola.com.br/indique/${codigoIndicacao}`,
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
          <span className="catalogo-kicker">GamificaÃ§Ã£o</span>
          <h3>NÃ­veis que fazem o cliente querer voltar.</h3>
        </div>

        <div className="niveis-lista">
          {niveis.map((nivel) => (
            <article className="nivel-card" key={nivel.nome}>
              <strong>{nivel.nome}</strong>
              <span>{nivel.faixa} indicaÃ§Ãµes</span>
              <p>{nivel.descricao}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="clube-recompensas">
        <div className="clube-secao-titulo">
          <span className="catalogo-kicker">Recompensas</span>
          <h3>Marcos simples, fÃ¡ceis de entender e bons de compartilhar.</h3>
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
          <span className="catalogo-kicker">Painel de indicaÃ§Ãµes</span>
          <h3>O cliente acompanha quem jÃ¡ comprou e quem ainda falta validar.</h3>

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
          <h3>Saldo visÃ­vel cria urgÃªncia de recompra.</h3>

          <div className="cashback-box">
            <span>Saldo disponÃ­vel</span>
            <strong>R$ 25,00</strong>
            <small>Expira em 12 dias</small>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
              "OlÃ¡! Quero utilizar meu cashback do Clube BÃºssola.",
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
          <span className="catalogo-kicker">PrÃ©-cadastro Dia dos Pais</span>
          <h3>Comece pelo Drive agora. Depois evoluÃ­mos para login real.</h3>
          <p>
            Este formulÃ¡rio jÃ¡ estÃ¡ preparado para enviar dados para uma
            planilha do Google Sheets via Apps Script. Enquanto a integraÃ§Ã£o nÃ£o
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
        className="catalogo-sao-joao catalogo-dia-dos-pais"
        id="catalogo-dia-dos-pais"
      >
        <div className="catalogo-topo">
          <div>
            <span className="catalogo-kicker">PresentÃ£o para o Papai</span>
            <h3>Presentes guiados pelo jeito do seu pai</h3>
            <p>
              Escolha um perfil para ver primeiro as opÃ§Ãµes que mais combinam,
              sem perder o acesso ao catÃ¡logo completo.
            </p>
          </div>

          <label className="catalogo-busca">
            <span>Buscar oferta</span>
            <input
              type="search"
              placeholder="Ex.: perfume, smartwatch, pai prÃ¡tico..."
              value={buscaCatalogo}
              onChange={(event) => setBuscaCatalogo(event.target.value)}
            />
          </label>
        </div>

        <div className="catalogo-filtros" aria-label="Filtros do catÃ¡logo de Dia dos Pais">
          {catalogos.diaDosPais.filtros.map((filtro) => (
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
                    Ler descriÃ§Ã£o completa
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
          aria-label={`DescriÃ§Ã£o completa de ${produtoAberto.title}`}
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
              Ã—
            </button>

            <img src={produtoAberto.image} alt={produtoAberto.alt} />

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
