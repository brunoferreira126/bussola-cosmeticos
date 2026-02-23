import "./catalogo.css";

import campanhaImg from "../assets/icons/catalogo.png";

export default function Catalogo() {
  return (
    <section
      className="catalogo"
      id="catalogo"
      style={{ backgroundImage: `url(${campanhaImg})` }}
    >
      <div className="catalogo-overlay"></div>

      <div className="catalogo-content">
        <h2>Catálogo Completo</h2>

        <p>
          Explore nossa seleção completa de perfumes importados,
          árabes, autocuidado e acessórios exclusivos.
        </p>

        <a
          href="https://drive.google.com/SEU-LINK-CATALOGO-GERAL"
          target="_blank"
          className="btn-gold btn-catalogo"
        >
          Acessar Catálogo no Drive
        </a>
      </div>
    </section>
  );
}