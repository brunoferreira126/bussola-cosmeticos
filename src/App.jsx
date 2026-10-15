import Header from "./components/Header";
import Sobre from "./components/Sobre";
import Campanha from "./components/Campanha";
import Contato from "./components/Contato";
import Footer from "./components/Footer";

// Importa layout global
import "./styles/layout.css";

export default function App() {
  return (
    <>
      <Header />
      <Campanha/>
      <Sobre />
      
   
    
      <Contato />
      <Footer />
    </>
  );
}
