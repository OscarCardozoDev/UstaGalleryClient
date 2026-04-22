import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "../Password/PasswordChange";
import { Login } from "../../../../services/auth";
import { getCurrentUser } from '../../../../services/users';
import styles from "./LoginForm.module.css";
import { useAuth } from "../../../../context/AuthContext";

export default function LoginForm({
  setOpenSnackbar,
  onProfileRequired,
}: {
  setOpenSnackbar: (
    type: "error" | "success" | "warning",
    message: { title: string; description: string },
  ) => void;
  onProfileRequired?: (step: number) => void;
}) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [correo_usuario, setEmail] = useState("");
  const [password_usuario, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openForgotPasswordModal, setOpenForgotPasswordModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userAuth = await Login({
        mail: correo_usuario,
        password: password_usuario,
      });
      if (!userAuth) {
        setOpenSnackbar("error", {
          title: "Error de autenticación",
          description: "El correo o la contraseña están mal, prueba otra vez",
        });
        return;
      }

      const { hasProfile, hasGroup } = userAuth;
      if (!hasProfile) {
        onProfileRequired?.(2);
      } else if (!hasGroup) {
        onProfileRequired?.(3);
      } else {
        const session = await getCurrentUser();
        await login(session);

        setOpenSnackbar("success", {
          title: "Autenticación exitosa",
          description: `Bienvenido de nuevo ${session.username}`,
        });
        navigate("/dashboard");
      }
    } catch (err) {
      setOpenSnackbar("error", {
        title: "Error de autenticación",
        description:
          err instanceof Error ? err.message : "Hubo un error, prueba otra vez",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginFormContainer}>
      <div className={styles.logoVertical}>LOGIN</div>

      <form
        onSubmit={handleSubmit}
        className={`${styles.form} ${loading ? styles.loading : ""}`}
      >
        <h1>Ingresa a la Galería</h1>

        <div className={styles.formGroup}>
          <label htmlFor="login-email">
            Correo Electrónico <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="login-email"
            name="email"
            value={correo_usuario}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="login-password">
            Contraseña <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            id="login-password"
            name="password"
            value={password_usuario}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <hr />

        <div className={styles.forgotPasswordWrapper}>
          <button
            type="button"
            onClick={() => setOpenForgotPasswordModal(true)}
            className={styles.forgotPasswordText}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "" : "Ingresar"}
        </button>
      </form>

      <ForgotPasswordModal
        open={openForgotPasswordModal}
        onClose={() => setOpenForgotPasswordModal(false)}
      />
    </div>
  );
}
