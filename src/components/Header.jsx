import { useState } from "react";
import "./header.css";
import logoImg from "../assets/icons/logo-bussola.png";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <img src={logoImg} alt="Bússola" className="header-logo" />

        <nav id="menu-principal" className={`header-nav ${open ? "open" : ""}`}>
           <a href="#campanha" onClick={() => setOpen(false)}>Início</a>
          <a href="#sobre" onClick={() => setOpen(false)}>Sobre</a>
          <a href="#catalogo-rota-alegria" onClick={() => setOpen(false)}>Presentes</a>
          <a href="#contato" onClick={() => setOpen(false)}>Contatos</a>
        </nav>

        <button
          className={`menu-toggle ${open ? "open" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="menu-principal"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
