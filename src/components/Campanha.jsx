import { useEffect, useMemo, useState } from "react";
import produtosSaoJoao from "../data/saoJoaoCatalogo.json";
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

// Filtros do novo catalogo de Sao Joao.
const filtrosCatalogo = [
  { label: "Todos", value: "todos" },
  { label: "Combos", value: "combo" },
  { label: "Masculinos", value: "masculino" },
  { label: "Femininos", value: "feminino" },
  { label: "Infantis", value: "infantil" },
  { label: "Oportunidades", value: "oportunidade" },
];

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
    "Vim pela campanha de São João.",
  ].join("\n");
}

// Monta a mensagem de compra de cada item do catalogo Sao Joao.
function criarLinkProduto(produto) {
  const mensagem = `Olá! Vim pelo Arraiá de Oportunidades da Bússola e quero saber mais sobre: ${produto.title} - ${produto.price}`;

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
  // Busca digitada pelo cliente dentro do catalogo Sao Joao.
  const [buscaCatalogo, setBuscaCatalogo] = useState("");

  // Filtro ativo do catalogo Sao Joao.
  const [filtroCatalogo, setFiltroCatalogo] = useState("todos");

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

  // Produtos filtrados sem recarregar a pagina.
  const produtosFiltrados = useMemo(() => {
    const termo = buscaCatalogo.trim().toLowerCase();

    return produtosSaoJoao.filter((produto) => {
      const bateFiltro =
        filtroCatalogo === "todos" || produto.category === filtroCatalogo;

      const bateBusca =
        !termo ||
        produto.title.toLowerCase().includes(termo) ||
        produto.description.toLowerCase().includes(termo);

      return bateFiltro && bateBusca;
    });
  }, [buscaCatalogo, filtroCatalogo]);

  // Sempre que buscar ou trocar filtro, volta para uma vitrine menor.
  useEffect(() => {
    setQuantidadeVisivel(6);
  }, [buscaCatalogo, filtroCatalogo]);

  const produtosVisiveis = produtosFiltrados.slice(0, quantidadeVisivel);
  const temMaisProdutos = quantidadeVisivel < produtosFiltrados.length;

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
      origem: "Campanha São João - Clube Bússola",
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
    campanha/catalogo de Sao Joao, que e a prioridade comercial imediata.

    Importante para a proxima alteracao:
    antes de mexer novamente nessa secao, perguntar ao Bruno o que faremos com
    o Clube Bussola.
  */

  if (!EXIBIR_CLUBE_BUSSOLA) return (
    <section className="campanha clube-bussola" id="campanha">
      <div
        className="clube-hero campanha-sao-joao-hero"
        style={{
          backgroundImage:
            "url(/campanhas/sao-joao/capa-sao-joao.webp)",
        }}
      >
        <div className="sao-joao-overlay" />

        <div className="bandeirinhas" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="clube-hero-texto">
          <span className="campanha-tag">Arraiá de Oportunidades</span>

          <h2>Catálogo São João Bússola</h2>

          <p>
            Combos, perfumes, kits e presentes escolhidos para quem quer chegar
            nos festejos com presença, cuidado e economia. Veja as primeiras
            ofertas e carregue mais quando quiser continuar.
          </p>

          <div className="clube-acoes">
            <a href="#catalogo-sao-joao" className="btn-gold">
              Ver ofertas
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
                "Olá! Quero ver as ofertas de São João da Bússola.",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              Chamar no WhatsApp
            </a>
          </div>

          <div className="sao-joao-selos" aria-label="Destaques da campanha">
            <span>Preços de arraiá</span>
            <span>Estoque limitado</span>
            <span>Pedido direto</span>
          </div>
        </div>

      </div>

      <section className="catalogo-sao-joao" id="catalogo-sao-joao">
        <div className="catalogo-topo">
          <div>
            <span className="catalogo-kicker">Catálogo atualizado</span>
            <h3>Escolha sua oferta de São João</h3>
            <p>
              Para facilitar a escolha, mostramos poucas ofertas primeiro.
              Depois é só tocar em <strong>Ver mais ofertas</strong> para
              continuar explorando.
            </p>
          </div>

          <label className="catalogo-busca">
            <span>Buscar oferta</span>
            <input
              type="search"
              placeholder="Ex.: combo, masculino, infantil..."
              value={buscaCatalogo}
              onChange={(event) => setBuscaCatalogo(event.target.value)}
            />
          </label>
        </div>

        <div className="catalogo-filtros" aria-label="Filtros do catálogo São João">
          {filtrosCatalogo.map((filtro) => (
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
          {produtosVisiveis.map((produto) => (
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
                <span className="produto-categoria">{produto.category}</span>
                <h4>{produto.title}</h4>
                <p>{produto.description}</p>

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

        {temMaisProdutos && (
          <div className="catalogo-ver-mais">
            <span>
              Mostrando {produtosVisiveis.length} de {produtosFiltrados.length} ofertas
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

  return (
    <section className="campanha clube-bussola" id="campanha">
      <div className="clube-hero">
        <div className="clube-hero-texto">
          <span className="campanha-tag">São João no Clube Bússola</span>

          <h2>Compre, indique, acompanhe sua evolução e desbloqueie benefícios.</h2>

          <p>
            O Clube Bússola nasce como um programa de relacionamento para
            cashback, indicações, recompra e campanhas sazonais. No São João, o
            cliente já entra entendendo que cada compra pode aproximar de novas
            recompensas.
          </p>

          <div className="clube-acoes">
            <a href="#clube-cadastro" className="btn-gold">
              Entrar no Clube
            </a>

            <a href="#catalogo-sao-joao" className="btn-outline">
              Ver ofertas São João
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
          <span className="catalogo-kicker">Pré-cadastro São João</span>
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

      <section className="catalogo-sao-joao" id="catalogo-sao-joao">
        <div className="catalogo-topo">
          <div>
            <span className="catalogo-kicker">Arraiá de Oportunidades</span>
            <h3>Catálogo São João Bússola</h3>
            <p>
              Combos, perfumes, kits e presentes escolhidos para quem quer
              chegar nos festejos com presença, cuidado e economia.
            </p>
          </div>

          <label className="catalogo-busca">
            <span>Buscar oferta</span>
            <input
              type="search"
              placeholder="Ex.: combo, masculino, infantil..."
              value={buscaCatalogo}
              onChange={(event) => setBuscaCatalogo(event.target.value)}
            />
          </label>
        </div>

        <div className="catalogo-filtros" aria-label="Filtros do catálogo São João">
          {filtrosCatalogo.map((filtro) => (
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
                <span className="produto-categoria">{produto.category}</span>
                <h4>{produto.title}</h4>
                <p>{produto.description}</p>

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
