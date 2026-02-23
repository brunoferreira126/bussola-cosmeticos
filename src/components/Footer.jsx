import "./footer.css";
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";
import { FaPlayCircle } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* LOGO / SOBRE */}
        <div className="footer-col">
          <h3>Bússola Cosméticos</h3>
          <p>
            Perfumes, cosméticos e acessórios que valorizam sua essência.
            Atendimento personalizado e produtos selecionados.
          </p>
        </div>

        {/* LINKS */}
        <div className="footer-col">
          <h4>Links Rápidos</h4>
          <ul>
            <li><a href="#hero">Início</a></li>
            <li><a href="#sobre">Sobre</a></li>
            <li><a href="#campanhas">Campanhas</a></li>
            <li><a href="#contato">Contato</a></li>
          </ul>
        </div>

        {/* CONTATO */}
        <div className="footer-col">
          <h4>Contato</h4>
          <ul className="footer-contato">
            <li>
              <FaWhatsapp />
              <a href="https://wa.me/558589411912" target="_blank">
                (85) 8941-1912
              </a>
            </li>

            <li>
              <FaInstagram />
              <a
                href="https://www.instagram.com/bussolacosmeticoseacessorios/"
                target="_blank"
              >
                Instagram
              </a>
            </li>

            <li>
              <FaTiktok />
              <a
                href="https://www.tiktok.com/@bssola.cosmticos?_r=1&_t=ZS-94AKv9oEbhv"
                target="_blank"
              >
                TikTok
              </a>
            </li>

            <li>
              <FaPlayCircle />
              <a
                href="https://k.kwai.com/u/@bussolacosmeticos/CcIARzX2"
                target="_blank"
              >
                Kwai
              </a>
            </li>

            <li>
              <FaEnvelope />
              <a href="mailto:contato@bussolacosmeticos.com">
                contato@bussolacosmeticos.com
              </a>
            </li>

            <li>
              <FaMapMarkerAlt />
              <span>Pindoretama - CE</span>
            </li>
          </ul>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} Bússola Cosméticos. Todos os direitos reservados.
      </div>
    </footer>
  );
}