import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/siderbar/Sidebar";
import Topbar from "../components/topbar/Topbar";
import LoadingScreen from "../components/Loanding/LoadingScreen";
import { useAuth } from "../../../context/AuthContext";
import styles from "./Dashboard.module.css";

interface Props {
  children: ReactNode;
}

function DashboardContent({ children }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { isLoading, error, user } = useAuth();

  // Mostrar loading mientras se carga el usuario
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Mostrar error si no se pudo cargar el usuario
  if (error || !user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#171717',
        color: '#fff',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>Error al cargar usuario</h2>
        <p>{error || 'No se pudo autenticar'}</p>
        <button 
          onClick={() => navigate('/auth')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#fff',
            color: '#171717',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Volver al login
        </button>
      </div>
    );
  }

  // Renderizar dashboard normal
  return (
    <div style={{
      backgroundColor: "#171717",
      display: "flex",
      height: "100vh",
      overflow: "hidden"
    }}>
      {/* Overlay móvil — cierra sidebar al tocar fuera */}
      {open && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setOpen(false)}
        />
      )}

      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className={`${styles.mainWrapper} ${open ? styles.mainShifted : ""}`}>
        <div style={{
          padding: 30,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          overflow: "hidden"
        }}>
          <Topbar onMenuClick={() => setOpen(!open)} />

          <div
            className={styles.customScrollbar}
            style={{
              backgroundColor: "#f8f5f8",
              borderEndEndRadius: 20,
              borderEndStartRadius: 20,
              padding: 30,
              overflow: 'auto',
              flexGrow: 1,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: Props) {
  return (
    <>
      <DashboardContent>{children}</DashboardContent>
    </>
  );
}
