import Header from "./components/Header";
import Hero from "./components/Hero";
import Sobre from "./components/Sobre";
import Campanha from "./components/Campanha";
import Indicacoes from "./components/Indicacoes";
import Categorias from "./components/Categorias";
import Catalogo from "./components/Catalogo";
import Contato from "./components/Contato";
import Footer from "./components/Footer";

// Importa layout global
import "./styles/layout.css";

export default function App() {
  return (
    <>
      <Header />
      <Campanha/>
      <Indicacoes />
      <Hero />
      <Sobre />
      
   
    
      <Contato />
      <Footer />
    </>
  );
}
