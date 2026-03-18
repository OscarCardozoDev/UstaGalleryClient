// auth/layout/AuthLayout.tsx
import { useState } from "react";
import styles from "./AuthLayout.module.css";
import Grainient from "./../components/Background/Grainient";
import Stepper, { Step } from "../components/Stepper/Stepper";
import { SecondaryBoton } from "../components/Botones/Botones";
import RegisterForm from "../modules/Register/Register.form";
import LoginForm from "../modules/Login/Login.form";
import EmailVerification from "../modules/EmailVerification/EmailVerification";
import ProfileRequired from "../modules/UserCreation/UserCreation";
import GroupSelection from "../modules/GroupSelection/GroupSelection";
import { useNavigate } from "react-router-dom";

export default function AuthLayout() {
  const navigate = useNavigate();

  const [openSnackbar, setOpenSnackbar]     = useState(false);
  const [errorMessages, setErrorMessages]   = useState<string[]>([]);
  const [isLogin, setIsLogin]               = useState(true);   // desktop cover side
  const [activeTab, setActiveTab]           = useState<"login" | "register">("login"); // tablet/mobile tab
  const [showForms, setShowForms]           = useState(true);
  const [expandCover, setExpandCover]       = useState(false);
  const [currentStep, setCurrentStep]       = useState(1);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setErrorMessages([]);
  };

  const handleProfileRequired = (step: number) => {
    setShowForms(false);
    setCurrentStep(step);
    setTimeout(() => setExpandCover(true), 600);
  };

  const grainientProps = {
    color1: "#7a7fff", color2: "#121217", color3: "#e5f2ff",
    timeSpeed: 0.3, colorBalance: 0.16,
    warpStrength: 4, warpFrequency: 7.1, warpSpeed: 5, warpAmplitude: 51,
    blendAngle: -21, blendSoftness: 0.28, rotationAmount: 30,
    noiseScale: 2, grainAmount: 0.1, grainScale: 2, grainAnimated: false,
    contrast: 1.25, gamma: 0.9, saturation: 1,
    centerX: -0.02, centerY: 0.25, zoom: 0.65,
  };

  return (
    <div className={styles.root}>

      {/* ── Snackbar ───────────────────────────────────────── */}
      {openSnackbar && (
        <div className={styles.snackbar}>
          <div className={styles.snackbarInner}>
            <div className={styles.snackbarMessages}>
              {errorMessages.map((msg, i) => <span key={i}>{msg}</span>)}
            </div>
            <button onClick={handleCloseSnackbar} className={styles.snackbarClose} aria-label="Cerrar">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Grainient — siempre de fondo ───────────────────── */}
      <div className={styles.grainientBg}>
        <Grainient {...grainientProps} />
      </div>

      {/* ── Cover deslizante (desktop) — siempre montado para que la transición CSS funcione ── */}
      <div className={`${styles.desktopCover} ${!isLogin ? styles.coverActive : ""} ${expandCover ? styles.coverExpanded : ""}`}>
        <div className={styles.coverGrainient}>
          <Grainient {...grainientProps} />
        </div>
        {!expandCover && (
          <CoverText isLogin={isLogin} isHide={showForms} toggleCover={() => setIsLogin(p => !p)} />
        )}
        {expandCover && (
          <div className={styles.heroImage}>
            <img src="/src/assets/bgHero.png" alt="Hero Background" />
          </div>
        )}
      </div>

      {/* ── Stepper post-login (aparece encima con fade-in tras expansión) ── */}
      {expandCover && (
        <div className={styles.stepperWrapper}>
          <Stepper initialStep={currentStep} key={currentStep} footerClassName="hidden" disableStepIndicators={true}>
            <Step>
              <EmailVerification
                onVerified={(ok) => { if (ok) setTimeout(() => setCurrentStep(2), 100); }}
                isVerified={false}
              />
            </Step>
            <Step>
              <ProfileRequired
                onUserCreated={() => setTimeout(() => setCurrentStep(3), 100)}
                isCreated={false}
              />
            </Step>
            <Step>
              <GroupSelection onGroupsSelected={() => navigate("/dashboard")} />
            </Step>
          </Stepper>
        </div>
      )}

      {/* ── Formularios (se mantiene montado durante la animación, fadeOut primero) ── */}
      {!expandCover && (
        <div className={`${styles.formsArea} ${!showForms ? styles.fadeOut : ""}`}>
          <div className={styles.tabBar}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "login" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Ingresar
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "register" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Registro
            </button>
          </div>

          {/* Panel Login */}
          <div className={`${styles.formPanel} ${styles.loginPanel} ${activeTab !== "login" ? styles.panelHidden : ""}`}>
            <LoginForm
              setOpenSnackbar={setOpenSnackbar}
              setErrorMessages={setErrorMessages}
              onProfileRequired={handleProfileRequired}
            />
          </div>

          {/* Panel Register */}
          <div className={`${styles.formPanel} ${styles.registerPanel} ${activeTab !== "register" ? styles.panelHidden : ""}`}>
            <RegisterForm
              setOpenSnackbar={setOpenSnackbar}
              setErrorMessages={setErrorMessages}
              onProfileRequired={handleProfileRequired}
            />
          </div>

        </div>
      )}
    </div>
  );
}

/* ── Cover Text (desktop only) ──────────────────────────── */
function CoverText({ isLogin, isHide, toggleCover }: {
  isLogin: boolean; isHide: boolean; toggleCover: () => void;
}) {
  const [fading, setFading] = useState(false);
  const loginContent   = { title: "Tu Arte, Nuestra Pasión",        subtitle: "Déjanos ser el escenario de tu talento. Regístrate y transforma tus obras en una experiencia visual única.", button: "Forma Parte" };
  const registerContent = { title: "Conéctate a tu Mundo Creativo", subtitle: "Accede a tu espacio personal y da vida a tus obras. Inicia sesión para compartir tu talento con el mundo.",  button: "Acceder" };
  const [current, setCurrent] = useState(isLogin ? loginContent : registerContent);

  const handleClick = () => {
    setFading(true);
    toggleCover();
    setTimeout(() => setCurrent(isLogin ? registerContent : loginContent), 750);
    setTimeout(() => setFading(false), 750);
  };

  return (
    <div className={`${styles.coverText} ${(fading || !isHide) ? styles.fadeOut : styles.fadeIn}`}>
      <h1>{current.title}</h1>
      <p>{current.subtitle}</p>
      <SecondaryBoton text={current.button} onClick={handleClick} />
    </div>
  );
}