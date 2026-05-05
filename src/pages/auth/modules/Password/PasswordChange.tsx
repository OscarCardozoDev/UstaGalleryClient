import { useState } from "react";
import { forgotPassword, resetPassword } from "../../../../services/auth";
import styles from "./PasswordChange.module.css";

interface PasswordChangeProps {
    open: boolean;
    onClose: () => void;
}

export default function PasswordChange({ open, onClose }: PasswordChangeProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [mail, setMail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const handleClose = () => {
        setStep(1);
        setMail("");
        setCode("");
        setNewPassword("");
        setLoading(false);
        setError(null);
        onClose();
    };

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await forgotPassword(mail);
            setStep(2);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al enviar el código");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await resetPassword(mail, code, newPassword);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cambiar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.backdrop} onClick={handleClose} />
            <div className={styles.modal}>
                <h6 className={styles.title}>Recuperar Contraseña</h6>

                {step === 1 ? (
                    <form onSubmit={handleSendCode}>
                        <p className={styles.stepHint}>
                            Ingresa tu correo y te enviaremos un código de verificación.
                        </p>
                        <div className={styles.formGroup}>
                            <label htmlFor="reset-email">Correo electrónico</label>
                            <input
                                id="reset-email"
                                type="email"
                                className={styles.input}
                                value={mail}
                                onChange={(e) => setMail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        <button
                            type="submit"
                            className={styles.closeButton}
                            disabled={loading}
                        >
                            {loading ? "" : "Enviar código"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <p className={styles.stepHint}>
                            Ingresa el código enviado a <strong>{mail}</strong> y tu nueva contraseña.
                        </p>
                        <div className={styles.formGroup}>
                            <label htmlFor="reset-code">Código de verificación</label>
                            <input
                                id="reset-code"
                                type="text"
                                className={styles.input}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                pattern="\d{6}"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="reset-password">Nueva contraseña</label>
                            <input
                                id="reset-password"
                                type="password"
                                className={styles.input}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={6}
                                required
                                disabled={loading}
                            />
                        </div>
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        <button
                            type="submit"
                            className={styles.closeButton}
                            disabled={loading}
                        >
                            {loading ? "" : "Cambiar contraseña"}
                        </button>
                        <button
                            type="button"
                            className={styles.backLink}
                            onClick={() => {
                                setStep(1);
                                setError(null);
                                setCode("");
                                setNewPassword("");
                            }}
                            disabled={loading}
                        >
                            Volver
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
