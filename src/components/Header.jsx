import { useState } from "react";
import "./header.css";
import logoImg from "../assets/icons/logo-bussola.png";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <img src={logoImg} alt="Bússola" className="header-logo" />

        <nav className={`header-nav ${open ? "open" : ""}`}>
           <a href="#inicio" onClick={() => setOpen(false)}>Página Inicial</a>
          <a href="#sobre" onClick={() => setOpen(false)}>Sobre</a>
          
          <a href="#campanha" onClick={() => setOpen(false)}>Campanha</a>
          <a href="#categorias" onClick={() => setOpen(false)}>Catálogo</a>
          <a href="#contato" onClick={() => setOpen(false)}>Contatos</a>
        </nav>

        <button
          className={`menu-toggle ${open ? "open" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}