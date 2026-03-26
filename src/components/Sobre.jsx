import { useEffect, useRef } from "react";
import "./sobre.css";
import lojaImg from "../assets/icons/sobre.png";

export default function Sobre() {
  const sobreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sobreRef.current.classList.add("visible");
        }
      },
      { threshold: 0.3 }
    );

    if (sobreRef.current) observer.observe(sobreRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="sobre" className="sobre" ref={sobreRef}>
      <div className="sobre-divider" />

      <div className="sobre-container">
        {/* VISUAL CARD */}
        <div className="sobre-visual">
          <img src={lojaImg} alt="Bússola Cosméticos & Acessórios" />
          <span className="sobre-caption">
            Loja física • Atendimento personalizado
          </span>
        </div>

        {/* CONTEÚDO */}
        <div className="sobre-text">
          <span className="sobre-intro">
            A direção certa para o seu autocuidado
          </span>

          <h2>Mais do que cosméticos.<br />Uma experiência.</h2>

          <p className="sobre-manifesto">
            Cada fragrância, cada presente e cada detalhe da Bússola
            existe para transmitir intenção, cuidado e significado.
          </p>

          <div className="sobre-highlights">
            <span>Perfumes marcantes</span>
            <span>Autocuidado masculino & feminino</span>
            <span>Cestas e boxes exclusivos</span>
            <span>Kits personalizados</span>
          </div>

          <p className="sobre-fecho">
            Porque presentear não é apenas entregar algo.<br />
            É marcar momentos e criar memórias.
          </p>

          <a
            href="https://drive.google.com/drive/folders/1DNUeQ5arinCPO1jF6kc7jtZ4aaRXoXyb?hl=pt-br"
            target="_blank"
            rel="noreferrer"
            className="btn-gold"
          >
           Ofertas Exclusivas Limitadas
          </a>
        </div>
      </div>
    </section>
  );
}