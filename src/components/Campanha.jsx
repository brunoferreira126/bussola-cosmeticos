import "./campanha.css";

import campanhaImg from "../assets/icons/campanha.jpg";

export default function Campanha() {
  return (
    <section
      className="campanha"
      style={{ backgroundImage: `url(${campanhaImg})` }}
    >
      <div className="campanha-overlay"></div>

      <div className="campanha-content">
        <span className="campanha-tag">Especial</span>

        <h2>Dia da Mulher</h2>

        <p>
          Uma fragrância é mais do que um presente.  
          É presença, elegância e memória.
        </p>

        <div className="campanha-buttons">
          <a
            href="https://wa.me/558589411912"
            target="_blank"
            className="btn-gold"
          >
            Comprar pelo WhatsApp
          </a>

          <a
            href="#catalogo"
            className="btn-outline"
          >
            Ver Catálogo
          </a>
        </div>
      </div>
    </section>
  );
}