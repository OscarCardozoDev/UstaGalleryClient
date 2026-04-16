import { useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // useLayoutEffect: corre sincrónicamente antes del paint
  // evita el flash de tema incorrecto y el warning de setState en useEffect
  useLayoutEffect(() => {
    const stored = localStorage.getItem("usta-theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const initial = stored ?? preferred;
    document.documentElement.setAttribute("data-theme", initial);
    setTheme(initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("usta-theme", next);
  };

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <motion.button
      className={styles.toggle}
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      /* Entrada desde abajo al montar */
      initial={{ opacity: 0, y: 24, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
    >
      {/* Track */}
      <motion.span
        className={styles.track}
        animate={{ backgroundColor: isDark ? "#233457" : "#D9E1F0" }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Thumb */}
        <motion.span
          className={styles.thumb}
          animate={{
            x: isDark ? 22 : 0,
            backgroundColor: isDark ? "#c9a84c" : "#5073B9",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
      </motion.span>

      {/* Ícono — sol / luna con crossfade */}
      <span className={styles.icon} aria-hidden>
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0,   scale: 1   }}
              exit={{    opacity: 0, rotate:  30, scale: 0.6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={styles.iconInner}
            >
              🌙
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 30,  scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0,   scale: 1   }}
              exit={{    opacity: 0, rotate: -30, scale: 0.6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={styles.iconInner}
            >
              ☀️
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}