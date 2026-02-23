import "./contato.css";
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPlayCircle
} from "react-icons/fa";

export default function Contato() {
  return (
    <section className="contato" id="contato">
      <div className="contato-container">

        {/* INFORMAÇÕES */}
        <div className="contato-info">
          <h2>Fale Conosco</h2>

          <p>
            Atendimento personalizado para te ajudar a encontrar
            a fragrância perfeita.
          </p>

          <div className="contato-links">
            <a
              href="https://wa.me/558589411912"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp />
              <span> 85 8941-1912</span>
            </a>

            <a
              href="https://www.instagram.com/bussolacosmeticoseacessorios/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
              <span>@bussolacosmeticoseacessorios</span>
            </a>

            <a
              href="https://www.tiktok.com/@bssola.cosmticos?_r=1&_t=ZS-94AKv9oEbhv"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok />
              <span>Bussola Cosméticos</span>
            </a>

            <a
              href="https://k.kwai.com/u/@bussolacosmeticos/CcIARzX2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaPlayCircle />
              <span>Bussola Cosméticos</span>
            </a>

            <a href="mailto:bussolacosmeticoseacessorios@outlook.com">
              <FaEnvelope />
              <span>contato@bussolacosmeticos.com</span>
            </a>
          </div>
        </div>

        {/* MAPA */}
      <div className="contato-mapa">
  <div className="mapa-header">
    <FaMapMarkerAlt />
    <span>Onde Estamos</span>
  </div>

  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.9740453451736!2d-38.309013024152954!3d-4.02570804475863!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7b89f8225d76209%3A0x68d898971080858f!2sB%C3%BAssola%20Cosmeticos%20e%20Acess%C3%B3rios!5e0!3m2!1spt-BR!2sbr!4v1771864308455!5m2!1spt-BR!2sbr"
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    allowFullScreen
    title="Localização Bússola Cosméticos"
  ></iframe>

  <p className="endereco-texto">
    Rua Aprigio Epifanio - Epifânio, Pindoretama - CE, 62860-000
  </p>
</div>

      </div>
    </section>
  );
}