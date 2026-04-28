import { useEffect, useMemo, useState } from "react";
import "./campanha.css";

/*
====================================================
CORREÇÃO DO CARROSSEL NÃO PASSANDO
PROBLEMA:
o array "imagens" estava recriando em toda renderização
e o useEffect reiniciava o setInterval.

SOLUÇÃO:
usar useMemo para estabilizar imagens.
====================================================
*/

const arquivos = import.meta.glob(
  "../assets/icons/campanha/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    import: "default",
  }
);

export default function Campanha() {
  /* TODAS IMAGENS */
  const todasImagens = useMemo(() => {
    return Object.entries(arquivos)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((item) => item[1]);
  }, []);

  /* CAPA */
  const capa = todasImagens[0];

  /* CARROSSEL FIXO */
  const imagens = useMemo(() => {
    return todasImagens.slice(1);
  }, [todasImagens]);

  const [index, setIndex] = useState(0);

  const [tempo, setTempo] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    acabou: false,
  });

  /* ===================================
     CARROSSEL FUNCIONANDO
  =================================== */
  useEffect(() => {
    if (imagens.length <= 1) return;

    const intervalo = setInterval(() => {
      setIndex((prev) => {
        if (prev >= imagens.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 2800);

    return () => clearInterval(intervalo);
  }, [imagens.length]);

  /* ===================================
     CONTADOR
  =================================== */
  useEffect(() => {
    const destino = new Date("2026-05-10T00:00:00");

    const atualizarTempo = () => {
      const agora = new Date();
      const diff = destino - agora;

      if (diff <= 0) {
        setTempo({
          dias: 0,
          horas: 0,
          minutos: 0,
          acabou: true,
        });
        return;
      }

      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutos = Math.floor((diff / (1000 * 60)) % 60);

      setTempo({
        dias,
        horas,
        minutos,
        acabou: false,
      });
    };

    atualizarTempo();

    const timer = setInterval(atualizarTempo, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="campanha"
      style={{
        backgroundImage: capa ? `url(${capa})` : "none",
      }}
    >
      <div className="campanha-overlay"></div>

      <div className="campanha-container">

        <div className="campanha-content">

          <span className="campanha-tag">
            Especial Dia das Mães
          </span>

          <div className="contador-box">
            {tempo.acabou ? (
              <>💐 É hoje! Garanta o presente dela</>
            ) : (
              <>
                Faltam <strong>{tempo.dias}</strong> dias •{" "}
                <strong>{tempo.horas}</strong> horas •{" "}
                <strong>{tempo.minutos}</strong> min
                <br />
                para o Dia das Mães
              </>
            )}
          </div>

          <h2>
            Melhor se antecipar
            <br />
            e garantir o presente dela
          </h2>

          <p>
            Perfumes, kits especiais e lembranças únicas
            para surpreender quem sempre cuidou de você.
          </p>

          <div className="campanha-alerta">
            Os melhores presentes acabam primeiro.
          </div>

          <div className="campanha-buttons">
            <a
              href="https://wa.me/558584241536"
              target="_blank"
              rel="noreferrer"
              className="btn-gold"
            >
              Comprar no WhatsApp
            </a>
          </div>

        </div>

        {/* CARROSSEL */}
        <div className="campanha-carousel">
          {imagens.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="Campanha"
              className={i === index ? "active" : ""}
            />
          ))}
        </div>

      </div>
    </section>
  );
}