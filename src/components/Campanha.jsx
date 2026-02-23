import "./campanha.css";
import campanhaImg from "../assets/icons/campanha.jpg";

export default function Campanha() {
  return (
    <section
      className="campanha"
      style={{ backgroundImage: `url(${campanhaImg})` }}
    >
      {/* OVERLAYS */}
      <div className="campanha-overlay"></div>
      <div className="campanha-glow"></div>

      {/* CONTEÚDO */}
      <div className="campanha-content">
        <span className="campanha-tag">Campanha Especial</span>

        <h2>Dia da Mulher</h2>

        <p>
          Uma fragrância é mais do que um presente.<br />
          É presença, elegância e memória.
        </p>

        <div className="campanha-buttons">
          <a
            href="https://wa.me/558589411912"
            target="_blank"
            rel="noreferrer"
            className="btn-gold"
          >
            Comprar pelo WhatsApp
          </a>

          <a
            href="https://drive.google.com/drive/folders/1DNUeQ5arinCPO1jF6kc7jtZ4aaRXoXyb"
            target="_blank"
            rel="noreferrer"
            className="btn-outline"
          >
            Compre Agora o Presente Perfeito
          </a>
        </div>
      </div>
    </section>
  );
}