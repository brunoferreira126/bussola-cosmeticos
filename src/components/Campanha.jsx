import { useEffect, useMemo, useState } from "react";

// MANUTENCAO DOS CATALOGOS:
// Edite titulos, precos e legendas nos arquivos dentro de src/data.
// O arquivo src/data/README.md explica cada campo e o caminho das imagens.
import produtosAgostoDirecao from "../data/agostoDirecaoCatalogo.json";
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
  agostoDirecao: {
    label: "Agosto com Direção",
    kicker: "Agosto com Direção",
    titulo: "Presentes guiados pelo que você procura",
    descricao:
      "Escolha uma intenção para ver primeiro as opções que mais combinam, sem perder o acesso ao catálogo completo.",
    produtos: produtosAgostoDirecao,
    filtros: [
      { label: "Todos", value: "todos" },
      { label: "Perfumaria", value: "perfumaria" },
      { label: "Presentes", value: "presentes" },
      { label: "Infantil", value: "infantil" },
      { label: "Cuidados", value: "cuidados" },
      { label: "Acessórios", value: "acessorios" },
    ],
  },
};

// A ordem deste array também define a ordem visual das abas.
const abasCatalogo = [
  { label: "Agosto com Direção", value: "agostoDirecao" },
];

// Perfis usados na busca guiada. O value deve bater com o campo profiles do JSON.
const perfisPais = [
  {
    value: "surpreender",
    nome: "Surpreender quem ama",
    chamada: "Presentes com presença, carinho e memória",
    texto: "Flores, cestas e combinações especiais para transformar o gesto em surpresa.",
    direcao: "Flores de cetim, cestas personalizadas, chocolates e perfumes prontos para encantar.",
  },
  {
    value: "infantil",
    nome: "Presente infantil",
    chamada: "Mimos delicados para crianças e bebês",
    texto: "Kits suaves, práticos e bonitos para presentear com cuidado.",
    direcao: "Colônias, kits infantis, cuidados para cabelo e nécessaires para a rotina dos pequenos.",
  },
  {
    value: "presente-pronto",
    nome: "Presente pronto",
    chamada: "Escolhas certeiras para quem está sem ideia",
    texto: "Combinações já montadas para comprar sem complicação.",
    direcao: "Estojos, cestas e kits completos que facilitam a escolha e já chegam com boa apresentação.",
  },
  {
    value: "perfume-feminino",
    nome: "Perfume feminino até R$ 149",
    chamada: "Fragrâncias femininas com ótimo custo-benefício",
    texto: "Opções para autoestima, presença e rotina.",
    direcao: "Fragrâncias femininas em condição especial para presentear ou renovar a coleção.",
  },
  {
    value: "perfume-masculino",
    nome: "Perfume masculino até R$ 149",
    chamada: "Presença masculina sem passar do orçamento",
    texto: "Perfumes marcantes, práticos e fáceis de acertar.",
    direcao: "Fragrâncias masculinas de presença para rotina, trabalho e ocasiões especiais.",
  },
  {
    value: "se-presentear",
    nome: "Quero me presentear",
    chamada: "Escolhas para valorizar você",
    texto: "Perfumes e acessórios para autocuidado, estilo e conquista pessoal.",
    direcao: "Fragrâncias, relógios e acessórios para quem decidiu escolher a si mesmo também.",
  },
];

// Tradução visual dos slugs usados no JSON para rótulos melhores nos cards.
const categoriasCatalogo = {
  acessorios: "Acessórios",
  cuidados: "Cuidados",
  infantil: "Infantil",
  perfumaria: "Perfumaria",
  presentes: "Presentes",
  tecnologia: "Tecnologia",
};

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
    "Vim pela campanha de Agosto com Direção da Bússola.",
  ].join("\n");
}

// Monta a mensagem de compra para produtos de qualquer uma das abas.
function criarLinkProduto(produto) {
  const mensagem = `Olá! Vim pela campanha de Agosto com Direção da Bússola e quero saber mais sobre: ${produto.title} - ${produto.price}`;

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
  // Define qual conjunto de produtos está visível sem trocar de página.
  const [abaCatalogo, setAbaCatalogo] = useState("agostoDirecao");

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
  const perfilAtual = perfisPais.find((perfil) => perfil.value === perfilSelecionado);

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

  function selecionarPerfilPai(perfil) {
    setPerfilSelecionado(perfil);
    setPerfilMenuAberto(false);
    setBuscaCatalogo("");
    setFiltroCatalogo("todos");
    setProdutoAberto(null);

    window.setTimeout(() => {
      document
        .getElementById("catalogo-agosto-direcao")
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
      origem: "Campanha Agosto com Direção - Clube Bússola",
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
    campanha/catalogo de Agosto com Direção, que e a prioridade comercial imediata.

    Importante para a proxima alteracao:
    antes de mexer novamente nessa secao, perguntar ao Bruno o que faremos com
    o Clube Bussola.
  */

  if (!EXIBIR_CLUBE_BUSSOLA) return (
    <section className="campanha clube-bussola" id="campanha">
      <div className="clube-hero campanha-agosto-direcao-hero">
        <div className="pais-overlay" />

        <div className="clube-hero-texto">
          <div className="pais-logo-area agosto-logo-area">
            {/* Logo oficial da campanha: PNG enviado pelo cliente com animação leve. */}
            <img
              className="pais-logo agosto-logo"
              src="/campanhas/agosto-direcao/logo-agosto-direcao.webp"
              alt="Agosto com Direção"
              loading="eager"
              decoding="async"
            />
            <span className="pais-logo-brilho" aria-hidden="true" />
          </div>

          <h2>Escolha com direção.</h2>

          <p>
            Responda uma pergunta e veja as melhores opções primeiro.
          </p>

          <div className="clube-acoes">
            <a href="#guia-agosto-direcao" className="btn-gold">
              Começar escolha
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
                "Olá! Quero ver as ofertas de Agosto com Direção da Bússola.",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              WhatsApp
            </a>
          </div>
        </div>

      </div>

      <section className="guia-pais" id="guia-agosto-direcao">
        <div className="guia-pais-palco">
          <div className="guia-pais-topo">
            <span className="catalogo-kicker">Guia de presentes</span>
            <span className="guia-pais-chamada">Escolha a direção do presente</span>
            <h3>O que você procura?</h3>
            <p>
              Selecione a intenção que mais combina com a sua busca e veja
              primeiro as sugestões mais certeiras. A vitrine completa continua
              disponível para quem quiser explorar todas as opções.
            </p>
          </div>

          <div className="guia-pais-consultor">
            <div className="guia-pais-cabecalho">
              <span>Escolha guiada</span>
              <strong>Escolha uma intenção e chegue mais rápido ao presente ideal.</strong>
            </div>

            <button
              type="button"
              className="guia-pais-trigger"
              aria-expanded={perfilMenuAberto}
              aria-controls="opcoes-perfil-pai"
              onClick={() => setPerfilMenuAberto((aberto) => !aberto)}
            >
              <span>{perfilAtual ? "Direção selecionada" : "Toque para responder"}</span>
              <strong>{perfilAtual ? perfilAtual.nome : "O que você procura?"}</strong>
              <small>
                {perfilAtual
                  ? perfilAtual.chamada
                  : "Abra as opções e escolha a direção que mais combina com o que você procura."}
              </small>
              <b>{perfilMenuAberto ? "Fechar opções" : "Ver opções"}</b>
            </button>

            {perfilMenuAberto && (
              <div
                className="guia-pais-opcoes"
                id="opcoes-perfil-pai"
                aria-label="Opções de busca"
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
                <span>{totalRecomendados} opções para {perfilAtual.nome}</span>
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
                <span>Catálogo completo logo abaixo</span>
                <strong>
                  Escolha uma opção para a Bússola organizar primeiro os
                  produtos que mais combinam com o que você procura.
                </strong>
              </>
            )}
          </div>

          <div className="guia-pais-catalogo-chamada">
            <span>Próximo passo</span>
            <strong>
              {perfilAtual
                ? "As sugestões aparecem primeiro, mas todas as opções continuam disponíveis para comparar."
                : "A escolha guiada não limita a vitrine. Ela apenas ajuda você a começar melhor."}
            </strong>
            <a href="#catalogo-agosto-direcao">Ver catálogo completo</a>
          </div>
        </div>
      </section>

      <section
        className="catalogo-sao-joao catalogo-agosto-direcao"
        id="catalogo-agosto-direcao"
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
                placeholder="Ex.: perfume, infantil, surpresa..."
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
          <span className="campanha-tag">Agosto com Direção no Clube Bússola</span>

          <h2>Compre, indique, acompanhe sua evolução e desbloqueie benefícios.</h2>

          <p>
            O Clube Bússola nasce como um programa de relacionamento para
            cashback, indicações, recompra e campanhas sazonais. No Agosto com Direção, o
            cliente já entra entendendo que cada compra pode aproximar de novas
            recompensas.
          </p>

          <div className="clube-acoes">
            <a href="#clube-cadastro" className="btn-gold">
              Entrar no Clube
            </a>

            <a href="#catalogo-agosto-direcao" className="btn-outline">
              Ver ofertas de Agosto com Direção
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
          <span className="catalogo-kicker">Pré-cadastro Agosto com Direção</span>
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
        className="catalogo-sao-joao catalogo-agosto-direcao"
        id="catalogo-agosto-direcao"
      >
        <div className="catalogo-topo">
          <div>
            <span className="catalogo-kicker">Agosto com Direção</span>
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

        <div className="catalogo-filtros" aria-label="Filtros do catálogo de Agosto com Direção">
          {catalogos.agostoDirecao.filtros.map((filtro) => (
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
