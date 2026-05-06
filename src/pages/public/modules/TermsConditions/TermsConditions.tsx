import { useNavigate } from "react-router-dom";
import styles from "./TermsConditions.module.css";

export default function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <header className={styles.header}>
          <p className={styles.demoTag}>Aplicación de demostración académica</p>
          <h1>Términos y Condiciones</h1>
          <p className={styles.lastUpdate}>Última actualización: mayo 2026</p>
        </header>

        <section className={styles.section}>
          <h2>1. Aviso de Demo</h2>
          <p>
            <strong>UstaGallery</strong> es un prototipo de software desarrollado con fines
            exclusivamente académicos en el marco del proyecto de grado de la Universidad Santo
            Tomás – Tunja. Esta aplicación <strong>no constituye un servicio comercial</strong>,
            no garantiza disponibilidad continua y puede ser modificada o discontinuada en
            cualquier momento sin previo aviso. El uso de la plataforma implica la aceptación de
            su naturaleza experimental.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Derechos de Autor</h2>
          <p>
            El diseño, desarrollo y código fuente de <strong>UstaGallery</strong> son propiedad
            intelectual de <strong>Oscar Cardozo</strong> como autor creador del proyecto.
            La <strong>Universidad Santo Tomás – Tunja</strong> actúa como institución
            patrocinadora y co-titular de los derechos derivados del proyecto de grado.
          </p>
          <p>
            © 2026 Oscar Cardozo / Universidad Santo Tomás. Todos los derechos reservados.
            Queda prohibida la reproducción, distribución o modificación del software sin
            autorización expresa de los titulares.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Limitación de Responsabilidad</h2>
          <p>
            Al tratarse de una demostración académica, los titulares no asumen responsabilidad
            por pérdida de datos, interrupciones del servicio, inexactitudes en la información
            mostrada ni por cualquier daño derivado del uso de la plataforma. El uso es bajo
            responsabilidad exclusiva del usuario.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Protección de Datos</h2>
          <p>
            El registro está restringido a correos institucionales con dominio
            <strong> @usantoto.edu.co</strong>. La información personal recopilada (correo y
            contraseña) se utiliza únicamente para la autenticación dentro de la plataforma y
            <strong> no será compartida con terceros</strong> bajo ninguna circunstancia.
            Los datos pueden ser eliminados previa solicitud al administrador.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Contacto</h2>
          <p>
            Para dudas, solicitudes de eliminación de datos o reporte de problemas, contactar a:
          </p>
          <p className={styles.contact}>
            Oscar Cardozo — <a href="mailto:oscar.cardozo30@hotmail.com">oscar.cardozo30@hotmail.com</a>
          </p>
          <p className={styles.contact}>
            Universidad Santo Tomás – Tunja — <a href="https://www.ustatunja.edu.co" target="_blank" rel="noopener noreferrer">ustatunja.edu.co</a>
          </p>
        </section>

        <footer className={styles.footer}>
          © 2026 Oscar Cardozo / Universidad Santo Tomás. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
