import "./sobre.css";
import lojaImg from "../assets/icons/sobre.png";

export default function Sobre() {
  return (
    <section id="sobre" className="sobre">
      <div className="sobre-divider"></div>

      <div className="sobre-container">
        {/* IMAGEM DA LOJA */}
        <div className="sobre-image">
          <img src={lojaImg} alt="Loja Bússola Cosméticos & Acessórios" />
        </div>

        {/* TEXTO */}
        <div className="sobre-text">
          <h2>Sobre a Loja</h2>

          <p>
            Uma loja criada para quem sabe escolher.
            Trabalhamos com perfumes importados, árabes
            e produtos de autocuidado masculino e feminino.
          </p>

          <a href="#campanha" className="btn-gold">
            Ver Ofertas
          </a>
        </div>
      </div>
    </section>
  );
}