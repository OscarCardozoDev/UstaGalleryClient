import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useAuth } from "../../../../context/AuthContext";
import styles from "./Header.module.css";

const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -6,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const drawerVariants: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { type: "tween" as const, duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    x: "-100%",
    transition: { type: "tween" as const, duration: 0.2, ease: "easeIn" },
  },
};

const Icon = ({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) => <span className={`material-symbols-outlined ${className}`}>{name}</span>;

export default function Header() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setOpen(false);
    setMobileOpen(false);
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);
  const isHome = location.pathname === "/";

  return (
    <>
      <header className={`${styles.header} bg-neutral/80`}>
        {/* Hamburger — mobile only */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo: siempre visible en móvil, oculto en home solo en desktop */}
        <button
          className={`${styles.logo} transition-all duration-300 ${
            isHome
              ? "md:opacity-0 md:-translate-y-2 md:pointer-events-none opacity-100"
              : "opacity-100 translate-y-0"
          } font-serif italic text-2xl tracking-tighter text-primary`}
          onClick={() => navigate("/")}
        >
          USTA GALLERY
        </button>

        {/* Nav central — desktop */}
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
          <button
            onClick={() => navigate("/events")}
            className={`
              ${styles.navLink}
              ${isActive("/events") ? styles.navLinkActive : ""}
              font-sans text-[0.9rem] tracking-[0.12em] uppercase
              ${isActive("/events") ? "text-primary" : "text-tertiary hover:text-primary"}
              bg-transparent border-none cursor-pointer transition-colors duration-200
            `}
          >
            Eventos
          </button>
        </nav>

        {/* Zona derecha */}
        <div className={styles.actions}>
          {!user && (
            <button
              className={`${styles.loginBtn} font-sans text-[0.65rem] tracking-[0.12em] uppercase text-primary hover:text-neutral`}
              onClick={() => navigate("/auth")}
            >
              Login
            </button>
          )}

          {user && (
            <div className={styles.avatarWrapper} ref={dropdownRef}>
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
                    <Icon name="person" className="text-tertiary" />
                  </div>
                )}
              </button>

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
                    <div className={styles.dropdownHeader}>
                      <p className="font-sans text-[1rem] font-semibold text-primary truncate">
                        {user.name} {user.lastName}
                      </p>
                      <p className="font-sans text-[0.8rem] text-tertiary truncate mt-0.5">
                        @{user.username}
                      </p>
                    </div>

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

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className={styles.mobileDrawer}
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className={styles.drawerTop}>
                <span className="font-serif italic text-xl tracking-tighter text-primary">
                  USTA GALLERY
                </span>
                <button
                  className={styles.drawerClose}
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar menú"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className={styles.drawerNav}>
                <button
                  className={`${styles.drawerLink} ${isHome ? styles.drawerLinkActive : ""}`}
                  onClick={() => navigate("/")}
                >
                  Inicio
                </button>
                <button
                  className={`${styles.drawerLink} ${isActive("/gallery") ? styles.drawerLinkActive : ""}`}
                  onClick={() => navigate("/gallery")}
                >
                  Galería
                </button>
                <button
                  className={`${styles.drawerLink} ${isActive("/events") ? styles.drawerLinkActive : ""}`}
                  onClick={() => navigate("/events")}
                >
                  Eventos
                </button>
              </nav>

              <div className={styles.drawerFooter}>
                {!user && (
                  <button
                    className={styles.drawerLoginBtn}
                    onClick={() => navigate("/auth")}
                  >
                    Login
                  </button>
                )}
                {user && (
                  <div className={styles.drawerUser}>
                    <div className={styles.drawerUserInfo}>
                      <p className="font-sans text-[0.95rem] font-semibold text-primary truncate">
                        {user.name} {user.lastName}
                      </p>
                      <p className="font-sans text-[0.75rem] text-tertiary truncate">
                        @{user.username}
                      </p>
                    </div>
                    <button
                      className={styles.drawerLink}
                      onClick={() => navigate("/dashboard")}
                    >
                      Dashboard
                    </button>
                    <button
                      className={`${styles.drawerLink} ${styles.drawerLinkDanger}`}
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
