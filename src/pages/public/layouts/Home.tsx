import styles from "./Home.module.css";
import Hero from "../modules/hero/Hero";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const widthButton = 250;
  const heightHeader = 90;

    return (
      <>  
      <header className={styles.header} style={{ height: heightHeader }}>
        <ul className={styles.headerList}>
          <li onClick={() => navigate("/")}>Inicio</li>
          <li onClick={() => navigate("/gallery")}>Galeria</li>
          <li onClick={() => navigate("/events")}>Eventos</li>
          <li onClick={() => navigate("/news")}>Noticias</li>
        </ul>

        <button className={styles.headerButton} style={{ width: widthButton }} onClick={() => navigate("/auth")}>Login</button>
      </header>
      
      <main className={styles.main}>
        <Hero 
          widthHeader={widthButton} 
          heightHeader={heightHeader}
          heightCarrusel={300} 
          widthCarrusel={400} 
          positionYCarrusel={525} 
        />
      </main>
      </>
    )
  }
  
  export default Home
  
  