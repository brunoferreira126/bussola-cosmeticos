import "./categorias.css";

import perfumes from "../assets/icons/perfumes.jpg";
import autocuidado from "../assets/icons/autocuidado.jpg";
import acessorios from "../assets/icons/acessorios.jpg";

export default function Categorias() {
  return (
    <section className="categorias" id="categorias">
      <div className="categorias-header">
        <h2>Nossos Produtos</h2>
        <p>Escolha a categoria e explore nosso catálogo exclusivo</p>
      </div>

      <div className="categorias-grid">
        <a
          href="https://drive.google.com/SEU-LINK-PERFUMES"
          target="_blank"
          className="categoria-card"
          style={{ backgroundImage: `url(${perfumes})` }}
        >
          <div className="categoria-overlay"></div>
          <h3>Perfumes Importados</h3>
        </a>

        <a
          href="https://drive.google.com/SEU-LINK-AUTOCUIDADO"
          target="_blank"
          className="categoria-card"
          style={{ backgroundImage: `url(${autocuidado})` }}
        >
          <div className="categoria-overlay"></div>
          <h3>Autocuidado</h3>
        </a>

        <a
          href="https://drive.google.com/SEU-LINK-ACESSORIOS"
          target="_blank"
          className="categoria-card"
          style={{ backgroundImage: `url(${acessorios})` }}
        >
          <div className="categoria-overlay"></div>
          <h3>Acessórios</h3>
        </a>
      </div>
    </section>
  );
}