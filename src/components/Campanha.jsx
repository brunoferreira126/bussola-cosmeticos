import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowRight,
  FaChevronDown,
  FaCompass,
  FaExpand,
  FaMars,
  FaSearch,
  FaTimes,
  FaUndo,
  FaVenus,
  FaWhatsapp,
} from "react-icons/fa";
import produtos from "../data/servirDirecaoCatalogo.json";
import "./campanha.css";

// CAMPANHA ATIVA: SERVIR COM DIRECAO.
// Nomes, precos, legendas, genero e fotos: src/data/servirDirecaoCatalogo.json.
// Genero: "feminino", "masculino" ou "unissex" (compartilhado nas duas abas).
// Nenhum produto ou preco das campanhas anteriores e reaproveitado.
const WHATSAPP = "5585984241536";
const ITENS_POR_PAGINA = 6;
const PUBLICOS = [
  {
    value: "feminino",
    label: "Feminino",
    icon: <FaVenus aria-hidden="true" />,
  },
  {
    value: "masculino",
    label: "Masculino",
    icon: <FaMars aria-hidden="true" />,
  },
];
const PERFIS = [
  { value: "perfume", label: "Perfumes e fragrâncias" },
  { value: "body-splash", label: "Body Splash" },
  { value: "presentear", label: "Um presente especial" },
  { value: "ate-100", label: "Opções até R$ 100" },
  { value: "condicao-especial", label: "Ofertas com desconto" },
  { value: "utilidade", label: "Acessórios e praticidade" },
];

function normalizarBusca(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function linkWhatsApp(produto) {
  const mensagem = produto
    ? `Olá! Vim pela campanha Servir com Direção da Bússola e quero saber mais sobre ${produto.title} - ${produto.price}.`
    : "Olá! Vim pela campanha Servir com Direção e gostaria de conhecer as opções masculinas da Bússola.";
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

export default function Campanha() {
  const [publico, setPublico] = useState("feminino");
  const [busca, setBusca] = useState("");
  const [perfil, setPerfil] = useState("");
  const [limite, setLimite] = useState(ITENS_POR_PAGINA);
  const [produtoAberto, setProdutoAberto] = useState(null);
  const dialogRef = useRef(null);
  const origemDoFoco = useRef(null);

  // Genero e busca filtram. O guia prioriza matches, sem esconder as demais
  // ofertas da mesma selecao; a ordem do Word e mantida entre equivalentes.
  const selecao = useMemo(
    () =>
      produtos.filter(
        (item) => item.genero === publico || item.genero === "unissex",
      ),
    [publico],
  );
  const resultados = useMemo(() => {
    const termo = normalizarBusca(busca.trim());
    return selecao
      .filter(
        (item) =>
          !termo ||
          normalizarBusca(
            [item.title, item.brand, item.summary, item.description].join(" "),
          ).includes(termo),
      )
      .sort((a, b) => {
        const prioridade = perfil
          ? Number(Boolean(b.profiles?.includes(perfil))) -
            Number(Boolean(a.profiles?.includes(perfil)))
          : 0;
        // Matches do guia primeiro; depois produtos da aba. Linhas e acessorios
        // compartilhados permanecem acessiveis ao final, sem duplicar ofertas.
        return (
          prioridade ||
          Number(a.genero === "unissex") - Number(b.genero === "unissex")
        );
      });
  }, [selecao, busca, perfil]);

  // O dialog nativo contem o foco e aceita Escape. O fundo nao rola enquanto
  // ele esta aberto; ao fechar, o foco e devolvido ao card que o abriu.
  useEffect(() => {
    if (!produtoAberto) return;
    const dialog = dialogRef.current;
    const overflowAnterior = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflowAnterior;
      origemDoFoco.current?.focus({ preventScroll: true });
    };
  }, [produtoAberto]);

  function mudarPublico(value) {
    setPublico(value);
    setBusca("");
    setPerfil("");
    setLimite(ITENS_POR_PAGINA);
  }

  function abrirProduto(produto) {
    origemDoFoco.current = document.activeElement;
    setProdutoAberto(produto);
  }

  const visiveis = resultados.slice(0, limite);

  return (
    <section className="servir-page" id="campanha">
      {/* Uma unica abertura; nao ha uma vitrine extra antes dos produtos. */}
      <div className="servir-brand">
        <h1 className="servir-sr-only">Servir com Direção Bússola</h1>
        <img
          src="/campanhas/servir-com-direcao/logo-servir-direcao.webp"
          className="servir-logo"
          alt="Servir com Direção"
          width="1000"
          height="667"
          fetchPriority="high"
          decoding="async"
        />
        <p className="servir-mensagem">
          Quem faz a vida acontecer
          <br />
          <strong>merece ser valorizado.</strong>
        </p>
        <p className="servir-convite">
          Uma homenagem aos servidores. Uma campanha para todos.
        </p>
      </div>

      <div className="servir-catalogo" id="catalogo-servir-direcao">
        {/* Links compartilhados da campanha antiga continuam chegando a vitrine. */}
        <span
          id="catalogo-rota-alegria"
          className="servir-anchor"
          aria-hidden="true"
        />
        <div className="servir-catalogo-heading">
          <div>
            <span className="servir-eyebrow">
              ESCOLHAS REAIS. CUIDADAS PELA BÚSSOLA.
            </span>
            <h2>Seu próximo favorito está aqui.</h2>
          </div>
          <span className="servir-campanha-label">
            <FaCompass aria-hidden="true" /> Servir com Direção
          </span>
        </div>

        <div
          className="servir-publicos"
          role="group"
          aria-label="Escolher seleção de produtos"
        >
          {PUBLICOS.map(({ value, label, icon }) => (
            <button
              type="button"
              key={value}
              aria-pressed={publico === value}
              onClick={() => mudarPublico(value)}
            >
              {icon}
              <span>{label}</span>
              <FaArrowRight
                className="servir-publico-arrow"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        {selecao.length > 0 ? (
          <>
            <div className="servir-tools">
              <label className="servir-field">
                <FaSearch aria-hidden="true" />
                <span className="servir-sr-only">Buscar produto</span>
                <input
                  type="search"
                  placeholder="Buscar por nome ou marca"
                  value={busca}
                  onChange={(event) => {
                    setBusca(event.target.value);
                    setLimite(ITENS_POR_PAGINA);
                  }}
                />
              </label>
              <div className="servir-guide">
                <label className="servir-field">
                  <FaCompass aria-hidden="true" />
                  <span className="servir-sr-only">O que você procura?</span>
                  <select
                    value={perfil}
                    onChange={(event) => {
                      setPerfil(event.target.value);
                      setLimite(ITENS_POR_PAGINA);
                    }}
                  >
                    <option value="">O que você procura?</option>
                    {PERFIS.map((opcao) => (
                      <option key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </option>
                    ))}
                  </select>
                </label>
                {perfil && (
                  <button
                    className="servir-clear"
                    type="button"
                    title="Limpar escolha"
                    aria-label="Limpar escolha"
                    onClick={() => {
                      setPerfil("");
                      setLimite(ITENS_POR_PAGINA);
                    }}
                  >
                    <FaUndo aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="servir-resultados" aria-live="polite">
              <h3>
                Seleção {publico === "feminino" ? "feminina" : "masculina"}
              </h3>
              <span>
                {resultados.length}{" "}
                {resultados.length === 1 ? "opção" : "opções"}
              </span>
            </div>
            <div className="servir-grid">
              {visiveis.map((produto) => (
                <article className="servir-product" key={produto.numero}>
                  <button
                    type="button"
                    className="servir-product-photo"
                    aria-label={`Ver detalhes de ${produto.title}`}
                    onClick={() => abrirProduto(produto)}
                  >
                    {produto.oldPriceValue > produto.priceValue && (
                      <span className="servir-discount">
                        {Math.floor(
                          (1 - produto.priceValue / produto.oldPriceValue) *
                            100,
                        )}
                        % OFF
                      </span>
                    )}
                    <img
                      src={produto.thumbnail || produto.image}
                      alt={produto.alt}
                      width={produto.width}
                      height={produto.height}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="servir-photo-action">
                      <FaExpand aria-hidden="true" />
                    </span>
                  </button>
                  <div className="servir-product-info">
                    <span className="servir-product-brand">
                      {produto.brand}
                    </span>
                    <h4>{produto.title}</h4>
                    <div className="servir-price-block">
                      <span className="servir-old-price">
                        {produto.oldPrice ? (
                          <>
                            <span className="servir-sr-only">De </span>
                            <s>{produto.oldPrice}</s>
                          </>
                        ) : (
                          "\u00a0"
                        )}
                      </span>
                      <div className="servir-price">
                        <strong>{produto.price}</strong>
                        {produto.priceNote && <span>{produto.priceNote}</span>}
                      </div>
                    </div>
                    <a
                      href={linkWhatsApp(produto)}
                      target="_blank"
                      rel="noreferrer"
                      className="servir-whatsapp"
                    >
                      <FaWhatsapp aria-hidden="true" /> Quero esse
                      <span className="servir-sr-only">: {produto.title}</span>
                    </a>
                    <button
                      type="button"
                      className="servir-details"
                      onClick={() => abrirProduto(produto)}
                    >
                      Ver detalhes
                      <span className="servir-sr-only">
                        {" "}
                        de {produto.title}
                      </span>
                      <FaArrowRight aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {resultados.length === 0 ? (
              <div className="servir-empty">
                <h3>Nenhum produto encontrado.</h3>
                <p>Tente outro nome ou consulte toda a seleção.</p>
                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setPerfil("");
                    setLimite(ITENS_POR_PAGINA);
                  }}
                >
                  Limpar busca
                </button>
              </div>
            ) : (
              <div className="servir-more">
                <span>
                  {visiveis.length} de {resultados.length} opções
                </span>
                {limite < resultados.length && (
                  <button
                    type="button"
                    onClick={() =>
                      setLimite((atual) => atual + ITENS_POR_PAGINA)
                    }
                  >
                    Ver mais produtos
                    <FaChevronDown aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="servir-empty servir-em-breve">
            <FaMars aria-hidden="true" />
            <h3>A seleção masculina está chegando.</h3>
            <p>
              Enquanto isso, a equipe Bússola ajuda você a encontrar a
              fragrância certa.
            </p>
            <a
              href={linkWhatsApp()}
              target="_blank"
              rel="noreferrer"
              className="servir-whatsapp"
            >
              <FaWhatsapp aria-hidden="true" /> Consultar opções masculinas
            </a>
          </div>
        )}

        {/* A historia da campanha fica acessivel sem atrasar a escolha. */}
        <details className="servir-manifesto">
          <summary>
            Uma homenagem que abraça toda Pindoretama
            <FaChevronDown aria-hidden="true" />
          </summary>
          <div>
            <h3>
              Nasceu para reconhecer quem serve.
              <br />
              Cresceu para valorizar quem faz a vida acontecer.
            </h3>
            <p>
              A Servir com Direção homenageia o Dia do Servidor Público,
              celebrado em 28 de outubro, e quem dedica seus dias a cuidar,
              ensinar e atender.
            </p>
            <p>
              Mas esse reconhecimento é para todos: comerciantes,
              empreendedores, trabalhadores, mães e cada pessoa que faz
              Pindoretama acontecer. As oportunidades da campanha são abertas a
              você, independentemente da profissão.
            </p>
            <p>
              Servir com propósito. Valorizar com carinho. Essa é a nossa
              direção.
            </p>
          </div>
        </details>
      </div>

      {/* A foto grande so carrega ao abrir. Texto completo com rolagem propria. */}
      {produtoAberto && (
        <dialog
          className="servir-dialog"
          ref={dialogRef}
          aria-labelledby="servir-produto-titulo"
          onCancel={() => setProdutoAberto(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setProdutoAberto(null);
          }}
        >
          <div className="servir-dialog-layout">
            <button
              type="button"
              className="servir-dialog-close"
              aria-label="Fechar detalhes"
              title="Fechar detalhes"
              onClick={() => setProdutoAberto(null)}
            >
              <FaTimes aria-hidden="true" />
            </button>
            <div className="servir-dialog-media">
              <img
                src={produtoAberto.image}
                alt={produtoAberto.alt}
                width={produtoAberto.width}
                height={produtoAberto.height}
              />
              <a
                href={produtoAberto.image}
                target="_blank"
                rel="noreferrer"
                aria-label="Ampliar foto original"
                title="Ampliar foto original"
              >
                <FaExpand aria-hidden="true" />
              </a>
            </div>
            <div className="servir-dialog-info">
              <span className="servir-product-brand">
                {produtoAberto.brand}
              </span>
              <h2 id="servir-produto-titulo">{produtoAberto.title}</h2>
              {produtoAberto.oldPrice && (
                <s className="servir-old-price">{produtoAberto.oldPrice}</s>
              )}
              <div className="servir-price">
                <strong>{produtoAberto.price}</strong>
                <span>{produtoAberto.priceNote}</span>
              </div>
              <p>{produtoAberto.description}</p>
              <a
                href={linkWhatsApp(produtoAberto)}
                target="_blank"
                rel="noreferrer"
                className="servir-whatsapp"
              >
                <FaWhatsapp aria-hidden="true" /> Pedir pelo WhatsApp
              </a>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
