import { useState } from "react";
import "./header.css";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Copia WebP leve; a marca original em PNG continua preservada. */}
        <img src="/marca/logo-bussola.webp" alt="Bússola" className="header-logo" width="480" height="320" />

        <nav id="menu-principal" className={`header-nav ${open ? "open" : ""}`}>
           <a href="#campanha" onClick={() => setOpen(false)}>Início</a>
          <a href="#sobre" onClick={() => setOpen(false)}>Sobre</a>
          <a href="#catalogo-servir-direcao" onClick={() => setOpen(false)}>Produtos</a>
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
