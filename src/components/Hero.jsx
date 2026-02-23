import "./hero.css";

import heroBg from "../assets/icons/hero.jpg";
import logoImg from "../assets/icons/logo-bussola.png"; // LOGO PNG
import modelImg from "../assets/icons/perfumes.png";   // RAPAZ + PERFUMES PNG

export default function Hero() {
  return (
    <section
      id="inicio" className="hero"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Overlays cinematográficos */}
      <div className="hero-overlay"></div>
      <div className="hero-vignette"></div>

      <div className="hero-container">
        {/* TEXTO */}
        <div className="hero-text">
          <img
            src={logoImg}
            alt="Bússola Cosméticos & Acessórios"
            className="hero-logo"
          />

          <h1>
            Perfumes que <br />
            marcam presença
          </h1>

          <p>
            Importados, árabes e linhas exclusivas <br />
            Masculino • Feminino • Autocuidado
          </p>

          <div className="hero-buttons">
            <a
              href="LINK_DO_DRIVE"
              target="_blank"
              className="btn-gold"
            >
              Ver Catálogo
            </a>

            <a
              href="https://wa.me/558589411912"
              target="_blank"
              className="btn-whatsapp"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>

        {/* IMAGEM DO MODELO */}
        <div className="hero-model">
          <img src={modelImg} alt="Modelo com perfumes Bússola" />
        </div>
      </div>
    </section>
  );
}