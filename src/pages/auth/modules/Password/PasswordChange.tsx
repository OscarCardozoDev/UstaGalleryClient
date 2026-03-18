// auth/modules/PasswordChange.tsx
import styles from "./PasswordChange.module.css";

interface PasswordChangeProps {
    open: boolean;
    onClose: () => void;
}

export default function PasswordChange({ open, onClose }: PasswordChangeProps) {
    if (!open) return null;

    return (
        <div className={styles.modalOverlay}>
            {/* Backdrop */}
            <div 
                className={styles.backdrop}
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className={styles.modal}>
                <h6 className={styles.title}>
                    Recuperar Contraseña
                </h6>

                <p className={styles.message}>
                    Por favor, contacta al administrador para recuperar tu contraseña.
                </p>

                <button 
                    className={styles.closeButton}
                    onClick={onClose}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}