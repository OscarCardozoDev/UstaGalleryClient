// Header.tsx — USTA Gallery
// Muestra logo + nav + estado de autenticación.
// Conectado  → avatar con dropdown (perfil, galería, logout)
// Desconectado → botón LOGIN

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../context/AuthContext"; // ← ajusta la ruta si es distinta
import styles from "./Header.module.css";

/* ── Animaciones ─────────────────────────────────────────── */
const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -6,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/* ── Íconos Material Symbols (inline para no añadir deps) ── */
const Icon = ({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) => <span className={`material-symbols-outlined ${className}`}>{name}</span>;

/* ════════════════════════════════════════════════════════════
   COMPONENTE
════════════════════════════════════════════════════════════ */
export default function Header() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Cierra dropdown al hacer click fuera */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Cierra dropdown al cambiar de ruta */
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  /* ── Render ──────────────────────────────────────────── */
  return (
    <header className={`${styles.header} bg-neutral/80`}>
      <button
        className={`${styles.logo} transition-all duration-300 ${
          location.pathname === "/"
            ? "opacity-0 -translate-y-2 pointer-events-none"
            : "opacity-100 translate-y-0"
        } font-serif italic text-2xl tracking-tighter text-primary`}
        onClick={() => navigate("/")}
      >
        USTA GALLERY
      </button>

      {/* Nav central */}
      <nav className={styles.nav}>
        <button
          onClick={() => navigate("/gallery")}
          className={`
            ${styles.navLink}
            ${isActive("/gallery") ? styles.navLinkActive : ""}
            font-sans text-[0.9rem] tracking-[0.12em] uppercase
            ${isActive("/gallery") ? "text-primary" : "text-tertiary hover:text-primary"}
            bg-transparent border-none cursor-pointer transition-colors duration-200
          `}
        >
          Galería
        </button>
      </nav>

      {/* Zona derecha */}
      <div className={styles.actions}>
        {/* ── Usuario NO conectado ─────────────────────── */}
        {!user && (
          <button
            className={`${styles.loginBtn} font-sans text-[0.65rem] tracking-[0.12em] uppercase text-primary hover:text-neutral`}
            onClick={() => navigate("/auth")}
          >
            Login
          </button>
        )}

        {/* ── Usuario conectado → Avatar + Dropdown ────── */}
        {user && (
          <div className={styles.avatarWrapper} ref={dropdownRef}>
            {/* Botón avatar */}
            <button
              className={styles.avatarBtn}
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Abrir menú de usuario"
              aria-expanded={open}
            >
              {user.photo ? (
                <img
                  src={`${BASE_URL}${user.photo.url}`}
                  alt={`${user.name} ${user.lastName}`}
                />
              ) : (
                <div className={`${styles.avatarFallback} bg-neutral-100`}>
                  <Icon
                    name="person"
                    className="text-tertiary"
                    // Material Symbols — tamaño reducido
                  />
                </div>
              )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  className={`${styles.dropdown} bg-neutral`}
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  role="menu"
                >
                  {/* Cabecera con datos del usuario */}
                  <div className={styles.dropdownHeader}>
                    <p className="font-sans text-[1rem] font-semibold text-primary truncate">
                      {user.name} {user.lastName}
                    </p>
                    <p className="font-sans text-[0.8rem] text-tertiary truncate mt-0.5">
                      @{user.username}
                    </p>
                  </div>

                  {/* Ir al dashboard */}
                  <button
                    className={`${styles.dropdownItem} text-primary`}
                    onClick={() => {
                      navigate("/dashboard");
                      setOpen(false);
                    }}
                    role="menuitem"
                  >
                    <span className="font-sans text-[0.9rem] tracking-wide">
                      Dashboard
                    </span>
                  </button>

                  <div className={styles.dropdownDivider} />

                  {/* Logout */}
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <span className="font-sans text-[0.9rem] tracking-wide text-[#ba1a1a]">
                      Cerrar sesión
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
