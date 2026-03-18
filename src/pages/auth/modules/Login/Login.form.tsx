// Login.form.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "../Password/PasswordChange";
import { Login } from "../../../../services/auth";
import styles from "./LoginForm.module.css";
export default function LoginForm({
    setOpenSnackbar,
    setErrorMessages,
    onProfileRequired
}: {
    setOpenSnackbar: (open: boolean) => void;
    setErrorMessages: (messages: string[]) => void;
    onProfileRequired?: (step: number) => void;
}) {
    const navigate = useNavigate();
    const [correo_usuario, setEmail]       = useState("");
    const [password_usuario, setPassword]  = useState("");
    const [loading, setLoading]            = useState(false);
    const [openForgotPasswordModal, setOpenForgotPasswordModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);

        try {
            const userAuth = await Login({ mail: correo_usuario, password: password_usuario });
            if (!userAuth) throw new Error("El correo o la contraseña están mal, prueba otra vez");

            const { hasProfile, hasGroup } = userAuth;
            if (!hasProfile) {
                onProfileRequired?.(2);
            } else if (!hasGroup) {
                onProfileRequired?.(3);
            } else {
                if (userAuth.user_type === "profesor")      navigate("/dashboard/docente");
                else if (userAuth.user_type === "artista")  navigate("/dashboard/estudiante");
                else                                         navigate("/dashboard");
            }
        } catch (err) {
            setErrorMessages([err instanceof Error ? err.message : "El correo o la contraseña están mal, prueba otra vez"]);
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginFormContainer}>
            <div className={styles.logoVertical}>LOGIN</div>

            <form onSubmit={handleSubmit} className={`${styles.form} ${loading ? styles.loading : ""}`}>
                <h1>Ingresa a la Galería</h1>

                <div className={styles.formGroup}>
                    <label htmlFor="login-email">
                        Correo Electrónico <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="email" id="login-email" name="email"
                        value={correo_usuario} onChange={(e) => setEmail(e.target.value)} required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="login-password">
                        Contraseña <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="password" id="login-password" name="password"
                        value={password_usuario} onChange={(e) => setPassword(e.target.value)} required
                    />
                </div>

                <hr />

                <div className={styles.forgotPasswordWrapper}>
                    <button type="button" onClick={() => setOpenForgotPasswordModal(true)} className={styles.forgotPasswordText}>
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "" : "Ingresar"}
                </button>
            </form>

            <ForgotPasswordModal open={openForgotPasswordModal} onClose={() => setOpenForgotPasswordModal(false)} />
        </div>
    );
}