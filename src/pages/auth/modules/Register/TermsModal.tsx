import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import styles from "./TermsModal.module.css";

export default function TermsModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  const handleKnowMore = () => {
    onClose();
    navigate("/terms");
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>

        <h2>Términos y Condiciones</h2>
        <p className={styles.demoTag}>Aplicación de demostración académica</p>

        <div className={styles.body}>
          <p>
            <strong>UstaGallery</strong> es un prototipo desarrollado con fines académicos para
            la Universidad Santo Tomás – Tunja. No representa un servicio comercial ni garantiza
            disponibilidad continua.
          </p>
          <p>
            Los derechos de autor del software corresponden a <strong>Oscar Cardozo</strong> como
            autor y a la <strong>Universidad Santo Tomás</strong> como institución patrocinadora.
            © 2026. Todos los derechos reservados.
          </p>
          <p>
            Al registrarte aceptas que tu información se usa únicamente dentro de esta plataforma
            y no será compartida con terceros.
          </p>
        </div>

        <button className={styles.knowMoreBtn} onClick={handleKnowMore}>
          Conocer más
        </button>
      </div>
    </div>,
    document.body
  );
}
