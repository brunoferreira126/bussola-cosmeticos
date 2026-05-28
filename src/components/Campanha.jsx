import { useMemo, useState } from "react";
import produtosNamorados from "../data/namoradosCatalogo.json";
import "./campanha.css";

// WhatsApp da loja. Mantendo em uma constante fica facil trocar depois.
const WHATSAPP_NUMERO = "5585984241536";

// Imagem leve em WebP gerada a partir da capa do arquivo Kit Encanto.
const CAPA_CATALOGO = "/campanhas/dia-dos-namorados/capa-kit-encanto.webp";

// Lista de filtros que aparecem no topo do catalogo.
const filtros = [
  { label: "Todos", value: "todos" },
  { label: "Kits", value: "kit" },
  { label: "Boxes", value: "box" },
  { label: "Cestas", value: "cesta" },
  { label: "Estojos", value: "estojo" },
  { label: "Masculinos", value: "masculino" },
];

// Define uma categoria simples com base no titulo e na descricao do produto.
function obterCategoria(produto) {
  const titulo = produto.title.toLowerCase();
  const texto = `${produto.title} ${produto.description}`.toLowerCase();

  if (texto.includes("masculin") || texto.includes("homem") || texto.includes("malbec")) {
    return "masculino";
  }

  if (titulo.includes("cesta")) return "cesta";
  if (titulo.includes("estojo")) return "estojo";
  if (titulo.includes("box")) return "box";
  if (titulo.includes("kit")) return "kit";

  return "todos";
}

// Monta a mensagem pronta para abrir o WhatsApp com o produto escolhido.
function criarLinkWhatsApp(produto) {
  const mensagem = `Olá! Vim pelo catálogo do Dia dos Namorados e quero saber mais sobre: ${produto.title} - ${produto.price}`;

  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
}

export default function Campanha() {
  // Guarda o texto digitado na busca.
  const [busca, setBusca] = useState("");

  // Guarda o filtro ativo selecionado pelo cliente.
  const [filtroAtivo, setFiltroAtivo] = useState("todos");

  // Guarda qual produto foi aberto para leitura completa.
  const [produtoAberto, setProdutoAberto] = useState(null);

  // Prepara os produtos com categoria uma unica vez por renderizacao relevante.
  const produtos = useMemo(() => {
    return produtosNamorados.map((produto) => ({
      ...produto,
      categoria: obterCategoria(produto),
    }));
  }, []);

  // Filtra por categoria e tambem pelo que o cliente digitou na busca.
  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return produtos.filter((produto) => {
      const bateFiltro =
        filtroAtivo === "todos" || produto.categoria === filtroAtivo;

      const bateBusca =
        !termo ||
        produto.title.toLowerCase().includes(termo) ||
        produto.description.toLowerCase().includes(termo);

      return bateFiltro && bateBusca;
    });
  }, [busca, filtroAtivo, produtos]);

  // Destaca os primeiros produtos do catalogo no resumo da campanha.
  const destaques = produtos.slice(0, 3);

  return (
    <section className="campanha" id="campanha">
      {/* Fundo visual da campanha; a imagem fica em public para nao pesar o bundle. */}
      <div
        className="campanha-hero"
        style={{ backgroundImage: `url(${CAPA_CATALOGO})` }}
      >
        <div className="campanha-overlay" />

        <div className="campanha-container">
          <div className="campanha-content">
            <span className="campanha-tag">Especial Dia dos Namorados</span>

            <h2>Catálogo de presentes prontos para encantar</h2>

            <p>
              Kits, boxes, cestas e perfumes selecionados para transformar o
              presente em uma experiencia completa de carinho, beleza e perfume.
            </p>

            <div className="campanha-stats" aria-label="Resumo do catálogo">
              <span>
                <strong>{produtos.length}</strong>
                opções
              </span>
              <span>
                <strong>WebP</strong>
                imagens leves
              </span>
              <span>
                <strong>WhatsApp</strong>
                pedido direto
              </span>
            </div>

            <div className="campanha-buttons">
              <a
                href={`https://wa.me/${WHATSAPP_NUMERO}`}
                target="_blank"
                rel="noreferrer"
                className="btn-gold"
              >
                Comprar no WhatsApp
              </a>

              <a href="#catalogo-namorados" className="btn-outline">
                Ver catálogo
              </a>
            </div>
          </div>

          <div className="campanha-destaques" aria-label="Destaques do catálogo">
            {destaques.map((produto) => (
              <article className="destaque-card" key={produto.title}>
                <img src={produto.image} alt={produto.alt} loading="eager" />
                <div>
                  <span>{produto.price}</span>
                  <strong>{produto.title}</strong>
                </div>
              </article>
            ))}
          </div>

          <a href="#catalogo-namorados" className="campanha-mobile-atalho">
            Ver as 44 opções do catálogo completo
          </a>
        </div>
      </div>

      {/* Catalogo online. As imagens usam lazy loading para carregar aos poucos. */}
      <div className="catalogo-namorados" id="catalogo-namorados">
        <div className="catalogo-topo">
          <div>
            <span className="catalogo-kicker">Kit Encanto e campanha 2026</span>
            <h3>Escolha o presente por estilo, preço ou nome</h3>
          </div>

          <label className="catalogo-busca">
            <span>Buscar presente</span>
            <input
              type="search"
              placeholder="Ex.: Eudora, Natura, cesta..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </label>
        </div>

        <div className="catalogo-filtros" aria-label="Filtros do catálogo">
          {filtros.map((filtro) => (
            <button
              type="button"
              key={filtro.value}
              className={filtroAtivo === filtro.value ? "ativo" : ""}
              onClick={() => setFiltroAtivo(filtro.value)}
            >
              {filtro.label}
            </button>
          ))}
        </div>

        <div className="catalogo-grade">
          {produtosFiltrados.map((produto) => (
            <article className="produto-card" key={produto.title}>
              <div className="produto-imagem">
                <img
                  src={produto.image}
                  alt={produto.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="produto-info">
                <span className="produto-categoria">{produto.categoria}</span>
                <h4>{produto.title}</h4>
                <p>{produto.description}</p>

                <div className="produto-rodape">
                  <strong>{produto.price}</strong>

                  <a
                    href={criarLinkWhatsApp(produto)}
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
            Nenhum presente encontrado com esse filtro.
          </div>
        )}
      </div>

      {produtoAberto && (
        <div
          className="produto-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Descrição completa de ${produtoAberto.title}`}
        >
          {/* Fecha o modal quando o cliente clica fora do conteudo. */}
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
              <span className="produto-categoria">{produtoAberto.categoria}</span>
              <h3>{produtoAberto.title}</h3>
              <strong>{produtoAberto.price}</strong>
              <p>{produtoAberto.description}</p>

              <a
                href={criarLinkWhatsApp(produtoAberto)}
                target="_blank"
                rel="noreferrer"
                className="produto-whatsapp"
              >
                Pedir este presente no WhatsApp
              </a>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
