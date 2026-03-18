// Register.form.tsx
import { useState } from "react";
import { Register } from "../../../../services/auth";
import styles from "./RegisterForm.module.css";

const TERMS_URL = "https://tu-sitio.com/terminos"; // 🔗 Cambia esta URL

export default function RegisterForm({
    setOpenSnackbar,
    setErrorMessages,
    onProfileRequired
}: {
    setOpenSnackbar: (open: boolean) => void;
    setErrorMessages: (messages: string[]) => void;
    onProfileRequired: (step: number) => void;
}) {
    const [correo_usuario, setEmail]         = useState("");
    const [password_usuario, setPassword]    = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [loading, setLoading]              = useState(false);
    const [acceptedTerms, setAcceptedTerms]  = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!acceptedTerms) {
            setErrorMessages(["Debes aceptar los Términos y Condiciones para continuar."]);
            setOpenSnackbar(true);
            return;
        }

        setLoading(true);
        try {
            if (password_usuario !== confirm_password) throw new Error("Las contraseñas no coinciden");

            const userAuth = await Register({ mail: correo_usuario, password: password_usuario });
            console.log(userAuth);

            if (!userAuth) throw new Error("No se pudo registrar el usuario");
            else onProfileRequired(1);

        } catch (err) {
            setErrorMessages([(err as Error).message || "No se pudo registrar el usuario"]);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.registerFormContainer}>
            <div className={styles.logoVertical}>REGISTER</div>

            <form onSubmit={handleSubmit} className={`${styles.form} ${loading ? styles.loading : ""}`}>
                <h1>Crea tu Cuenta</h1>

                <div className={styles.formGroup}>
                    <label htmlFor="register-email">
                        Correo Electrónico <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="email" id="register-email" name="email"
                        value={correo_usuario} onChange={(e) => setEmail(e.target.value)} required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="register-password">
                        Contraseña <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="password" id="register-password" name="password"
                        value={password_usuario} onChange={(e) => setPassword(e.target.value)}
                        required autoComplete="new-password"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="register-confirm-password">
                        Confirmar Contraseña <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="password" id="register-confirm-password" name="confirm_password"
                        value={confirm_password} onChange={(e) => setConfirmPassword(e.target.value)}
                        required autoComplete="new-password"
                    />
                </div>

                <div className={styles.termsWrapper}>
                    <input
                        type="checkbox" id="register-terms" className={styles.termsCheckbox}
                        checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                    <label htmlFor="register-terms" className={styles.termsLabel}>
                        He leído y acepto los{" "}
                        <a href={TERMS_URL} target="_blank" rel="noopener noreferrer"
                           className={styles.termsLink} onClick={(e) => e.stopPropagation()}>
                            Términos y Condiciones
                        </a>
                    </label>
                </div>

                <button type="submit" disabled={loading || !acceptedTerms}>
                    {loading ? "" : "Crear Cuenta"}
                </button>
            </form>
        </div>
    );
}