import "./hero.css";

import heroBg from "../assets/icons/hero.jpg";
import logoImg from "../assets/icons/logo-bussola.png";
import modelImg from "../assets/icons/perfumes.png";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="hero"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* OVERLAYS CINEMATOGRÁFICOS */}
      <div className="hero-overlay"></div>
      <div className="hero-particles"></div>
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
            A escolha certa <br />
            guiada com precisão
          </h1>

          <p>
            Importados, árabes e linhas exclusivas <br />
            Masculino • Feminino • Autocuidado
          </p>

          <div className="hero-buttons">

            {/*
            BOTÃO CATÁLOGO TEMPORARIAMENTE DESATIVADO

            <a
              href="https://drive.google.com/drive/folders/1DNUeQ5arinCPO1jF6kc7jtZ4aaRXoXyb?hl=pt-br"
              target="_blank"
              rel="noreferrer"
              className="btn-gold"
            >
              Nossos Produtos
            </a>
            */}

            <a
              href="https://wa.me/558584241536"
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp"
            >
              Fale Conosco
            </a>

          </div>
        </div>

        {/* IMAGEM DO MODELO */}
        <div className="hero-model">
          <img
            src={modelImg}
            alt="Perfumes Bússola Cosméticos & Acessórios"
          />
        </div>
      </div>
    </section>
  );
}