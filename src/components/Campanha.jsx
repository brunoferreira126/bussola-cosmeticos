import { useEffect, useState } from "react";
import "./campanha.css";

// IMPORTANDO TODAS AS IMAGENS
import img10 from "../assets/icons/campanha/perfume-10-png.png";
import img11 from "../assets/icons/campanha/perfume-11-png.png";
import img12 from "../assets/icons/campanha/perfume-12-png.png";
import img13 from "../assets/icons/campanha/perfume-13-png.png";
import img14 from "../assets/icons/campanha/perfume-14-png.png";
import img15 from "../assets/icons/campanha/perfume-15-png.png";
import img16 from "../assets/icons/campanha/perfume-16-png.png";
import img17 from "../assets/icons/campanha/perfume-17-png.png";
import img18 from "../assets/icons/campanha/perfume-18-png.png";
import img19 from "../assets/icons/campanha/perfume-19-png.png";
import img20 from "../assets/icons/campanha/perfume-20-png.png";
import img21 from "../assets/icons/campanha/perfume-21-png.png";
import img22 from "../assets/icons/campanha/perfume-22-png.png";
import img23 from "../assets/icons/campanha/perfume-23-png.png";

// ARRAY COM TODAS
const imagens = [
  img10, img11, img12, img13, img14,
  img15, img16, img17, img18, img19,
  img20, img21, img22, img23
];

export default function Campanha() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % imagens.length);
    }, 2500); // mais rápido (fica mais dinâmico)

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="campanha">
      <div className="campanha-overlay"></div>

      <div className="campanha-container">
        {/* TEXTO */}
        <div className="campanha-content">
          <span className="campanha-tag">Reta Final do Mês</span>

          <h2>Ofertas Imperdíveis</h2>

          <p>
            Perfumes exclusivos, produtos de autocuidado e acessórios com condições especiais.<br />
            Aproveite antes que acabe.
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
              href="https://drive.google.com/drive/folders/1DNUeQ5arinCPO1jF6kc7jtZ4aaRXoXyb"
              target="_blank"
              className="btn-outline"
            >
              Ver Catálogo
            </a>
          </div>
        </div>

        {/* CARROSSEL */}
        <div className="campanha-carousel">
          {imagens.map((img, i) => (
            <img
              key={i}
              src={img}
              className={i === index ? "active" : ""}
              alt="Perfume"
            />
          ))}
        </div>
      </div>
    </section>
  );
}