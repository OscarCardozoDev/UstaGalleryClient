import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sileo } from "sileo";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Topbar.module.css";

interface Props {
  onMenuClick: () => void;
}

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

/* ── Íconos ── */
const Icon = ({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) => <span className={`material-symbols-outlined ${className}`}>{name}</span>;

export default function Topbar({ onMenuClick }: Props) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <header className="bg-[#f8f5f8] rounded-tl-[20px] rounded-tr-[20px] border-b-2 border-[#dddddd]">
      <div className="flex items-center px-4 py-3 w-full justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-700"
            aria-label="Abrir menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="ml-4 text-[#171717] text-2xl font-semibold">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              sileo.error({
                title: "Something went wrong",
                description: "Please try again later.",
              })
            }
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-700"
            aria-label="Test notification"
          >
            Silio
          </button>

          <div className={styles.avatarWrapper} ref={dropdownRef}>
            <button
              className={styles.avatarBtn}
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Abrir menú de usuario"
              aria-expanded={open}
            >
              {user?.photo ? (
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
                      {user?.name} {user?.lastName}
                    </p>
                    <p className="font-sans text-[0.8rem] text-tertiary truncate mt-0.5">
                      @{user?.username}
                    </p>
                  </div>

                  <button
                    className={`${styles.dropdownItem} text-primary`}
                    onClick={() => {
                      navigate("/");
                      setOpen(false);
                    }}
                    role="menuitem"
                  >
                    <span className="font-sans text-[0.9rem] tracking-wide">
                      Inicio
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
        </div>
      </div>
    </header>
  );
}
