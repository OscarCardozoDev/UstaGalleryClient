import type { ReactNode } from "react";
import styles from "./MainPage.module.css";
import Header from "../components/Header/Header";

function MainPage({ children }: { children: ReactNode }) {
    return (
      <>  
      <Header />
      
      <main className={styles.main}>
        {children}
      </main>
      </>
    )
  }
  
  export default MainPage;
  
  