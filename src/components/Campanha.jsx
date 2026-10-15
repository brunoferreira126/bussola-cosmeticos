import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowRight, FaChild, FaChevronDown, FaCompass, FaGraduationCap, FaLayerGroup, FaSearch, FaTimes, FaUndo, FaWhatsapp } from "react-icons/fa";
import produtosKids from "../data/rotaAlegriaCatalogo.json";
import produtosProfessores from "../data/professoresCatalogo.json";
import "./campanha.css";

// MANUTENCAO: textos e precos continuam nos dois JSONs de src/data.
// A ordem inicial destaca professores; a colecao Kids preserva os produtos antigos.
const PRODUTOS = [...produtosProfessores, ...produtosKids];
const WHATSAPP = "5585984241536";
const ITENS_POR_PAGINA = 6;
const COLECOES = [
  { value: "professores", label: "Professores", icon: <FaGraduationCap aria-hidden="true" /> },
  { value: "kids", label: "Kids", icon: <FaChild aria-hidden="true" /> },
  { value: "todos", label: "Todos", icon: <FaLayerGroup aria-hidden="true" /> },
];

// Os valores correspondem a profiles nos JSONs. A escolha prioriza os matches
// no catalogo completo, mantendo os outros presentes acessiveis pelo Ver mais.
const PERFIS = [
  { value: "professor", label: "Presentear um professor" },
  { value: "crianca", label: "Presentear uma criança" },
  { value: "cheirinho", label: "Perfumes e fragrâncias" },
  { value: "presente-pronto", label: "Kits e presentes prontos" },
  { value: "cuidado", label: "Cuidado e rotina" },
  { value: "diversao", label: "Diversão e tecnologia" },
  { value: "utilidade", label: "Algo útil para o dia a dia" },
  { value: "ate-100", label: "Presentes até R$ 100" },
];

function normalizarBusca(texto = "") {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function linkWhatsApp(produto) {
  const mensagem = `Olá! Vim pela Rota da Alegria da Bússola e quero este presente: ${produto.title} - ${produto.price}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

// O texto original e preservado no JSON. Na leitura, removemos apenas os
// pictogramas das legendas antigas para manter o mesmo acabamento visual.
function legendaLegivel(texto) {
  return texto.replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, "").trim();
}

export default function Campanha() {
  const [colecao, setColecao] = useState("professores");
  const [busca, setBusca] = useState("");
  const [perfil, setPerfil] = useState("");
  const [limite, setLimite] = useState(ITENS_POR_PAGINA);
  const [produtoAberto, setProdutoAberto] = useState(null);
  const dialogRef = useRef(null);

  const resultados = useMemo(() => {
    const termo = normalizarBusca(busca.trim());
    return PRODUTOS.filter((produto) => {
      const pertence = colecao === "todos"
        || (colecao === "professores" && produto.colecao === "professores")
        || (colecao === "kids" && produto.profiles?.includes("crianca"));
      const texto = normalizarBusca([produto.title, produto.summary, produto.description].join(" "));
      return pertence && (!termo || texto.includes(termo));
    }).sort((a, b) => {
      if (!perfil) return 0;
      return Number(Boolean(b.profiles?.includes(perfil))) - Number(Boolean(a.profiles?.includes(perfil)));
    });
  }, [colecao, busca, perfil]);

  // O dialog nativo prende o foco, aceita Escape e devolve o foco ao card.
  // A rolagem do fundo e restaurada ao fechar, inclusive ao desmontar a pagina.
  useEffect(() => {
    if (!produtoAberto) return;
    const dialog = dialogRef.current;
    const rolagemAnterior = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = rolagemAnterior;
    };
  }, [produtoAberto]);

  function escolherColecao(value) {
    setColecao(value);
    setBusca("");
    setPerfil("");
    setLimite(ITENS_POR_PAGINA);
  }

  function escolherPerfil(value) {
    setPerfil(value);
    setColecao("todos");
    setBusca("");
    setLimite(ITENS_POR_PAGINA);
  }

  const visiveis = resultados.slice(0, limite);
  const imagensAbertas = produtoAberto?.images?.length
    ? produtoAberto.images : [produtoAberto?.image];

  return (
    <section className="rota-page" id="campanha">
      {/* Uma unica abertura: a Rota e a marca principal da campanha. */}
      <div className="rota-brand">
        <h1 className="rota-sr-only">Rota da Alegria Bússola</h1>
        <img
          src="/campanhas/rota-da-alegria/logo-rota-alegria.webp"
          className="rota-brand-logo"
          alt="Rota da Alegria"
          width="768"
          height="512"
          fetchPriority="high"
          decoding="async"
        />
        <p><span>Presente guiado.</span> <strong>Sem dúvida.</strong></p>
      </div>

      {/* Colecoes, busca guiada e produtos ocupam a mesma vitrine. */}
      <div className="rota-catalogo" id="catalogo-rota-alegria">
        <div className="rota-catalogo-heading">
          <h2>Escolha seu presente</h2>
          <button
            type="button"
            className="rota-professores-logo"
            onClick={() => escolherColecao("professores")}
            title="Ver presentes para professores"
          >
            <img
              src="/campanhas/rota-da-alegria/professores/logo-professores.webp"
              alt="Especial Dia dos Professores na Bússola"
              width="1400"
              height="700"
              decoding="async"
            />
          </button>
        </div>

        <div className="rota-colecoes" aria-label="Escolher presentes">
          {COLECOES.map(({ value, label, icon }) => (
            <button
              type="button"
              key={value}
              aria-pressed={colecao === value}
              className={colecao === value ? "ativo" : ""}
              onClick={() => escolherColecao(value)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="rota-tools">
          <label className="rota-field">
            <FaSearch aria-hidden="true" />
            <span className="rota-sr-only">Buscar produto</span>
            <input
              type="search"
              placeholder="Buscar um produto"
              value={busca}
              onChange={(event) => {
                setBusca(event.target.value);
                setLimite(ITENS_POR_PAGINA);
              }}
            />
          </label>

          <div className="rota-guide">
            <label className="rota-field">
              <FaCompass aria-hidden="true" />
              <span className="rota-sr-only">O que você procura?</span>
              <select value={perfil} onChange={(event) => escolherPerfil(event.target.value)}>
                <option value="">O que você procura?</option>
                {PERFIS.map((opcao) => <option key={opcao.value} value={opcao.value}>{opcao.label}</option>)}
              </select>
            </label>
            {perfil && (
              <button className="rota-clear" type="button" title="Limpar escolha" aria-label="Limpar escolha" onClick={() => escolherPerfil("")}>
                <FaUndo aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="rota-grid" aria-live="polite">
          {visiveis.map((produto) => (
            <article className="rota-product" key={produto.numero}>
              <button
                type="button"
                className="rota-product-photo"
                aria-label={`Ver detalhes de ${produto.title}`}
                onClick={() => setProdutoAberto(produto)}
              >
                <img src={produto.image} alt={produto.alt} loading="lazy" decoding="async" />
              </button>
              <div className="rota-product-info">
                <h3>{produto.title}</h3>
                <strong className="rota-price">{produto.price}</strong>
                <a href={linkWhatsApp(produto)} target="_blank" rel="noreferrer" className="rota-whatsapp">
                  <FaWhatsapp aria-hidden="true" /> Comprar
                  <span className="rota-sr-only"> {produto.title} pelo WhatsApp</span>
                </a>
                <button type="button" className="rota-details" onClick={() => setProdutoAberto(produto)}>
                  Ver detalhes
                  <span className="rota-sr-only"> de {produto.title}</span>
                  <FaArrowRight aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {resultados.length === 0 && (
          <div className="rota-empty">
            <p>Não encontramos esse produto.</p>
            <button type="button" onClick={() => escolherColecao("todos")}>Ver todos os presentes</button>
          </div>
        )}

        {resultados.length > 0 && (
          <div className="rota-more">
            <span>{visiveis.length} de {resultados.length} presentes</span>
            {limite < resultados.length && (
              <button type="button" onClick={() => setLimite((atual) => atual + ITENS_POR_PAGINA)}>
                Ver mais presentes <FaChevronDown aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* As legendas completas ficam nesta leitura sob demanda, fora da grade. */}
      {produtoAberto && (
        <dialog
          className="rota-dialog"
          ref={dialogRef}
          aria-labelledby="rota-produto-titulo"
          onCancel={() => setProdutoAberto(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setProdutoAberto(null);
          }}
        >
          <div className="rota-dialog-layout">
            <button type="button" className="rota-dialog-close" aria-label="Fechar detalhes" title="Fechar detalhes" onClick={() => setProdutoAberto(null)}>
              <FaTimes aria-hidden="true" />
            </button>
            <div className="rota-dialog-media" data-multiple={imagensAbertas.length > 1}>
              {imagensAbertas.map((imagem) => <img src={imagem} alt={produtoAberto.alt} key={imagem} />)}
            </div>
            <div className="rota-dialog-info">
              <h2 id="rota-produto-titulo">{produtoAberto.title}</h2>
              <strong className="rota-price">{produtoAberto.price}</strong>
              <p>{legendaLegivel(produtoAberto.description)}</p>
              <a href={linkWhatsApp(produtoAberto)} target="_blank" rel="noreferrer" className="rota-whatsapp">
                <FaWhatsapp aria-hidden="true" /> Pedir pelo WhatsApp
              </a>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
