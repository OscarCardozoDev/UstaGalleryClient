// Welcome.jsx — USTA Gallery
// Colores y fuentes via clases Tailwind (tailwind.config.js)
// Layout y efectos via Welcome.module.css
// Animaciones de entrada con Framer Motion

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Welcome.module.css";
import { getGalleryProducts } from "../../../../services/products";
import { getHomeEvents } from "../../../../services/events";
import type { ProductGallery } from "../../../../interfaces/products";
import type { EventHome } from "../../../../interfaces/events";

/* ── Variantes de animación ─────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { delay, duration: 1.1, ease: "easeOut" as const },
  }),
};

const slideLeft = {
  hidden:  { opacity: 0, x: -40 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { delay, duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const slideRight = {
  hidden:  { opacity: 0, x: 40 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { delay, duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const scaleIn = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: (delay = 0) => ({
    opacity: 1, scale: 1,
    transition: { delay, duration: 1.0, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/* ── Componente principal ───────────────────────────────── */
export default function Welcome() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventHome[]>([]);
  const [products, setProducts] = useState<ProductGallery[]>([]);

  useEffect(() => {
    getHomeEvents({ limit: 3 }).then(setEvents).catch(() => {});
    getGalleryProducts({ limit: 3 }).then(setProducts).catch(() => {});
  }, []);

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-CO", { month: "short", day: "numeric" }).toUpperCase()
      + " — "
      + d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`${styles.root} bg-neutral`}>

      {/* ════════════════════════════════════════════════════
          DESKTOP LAYOUT (≥ 768px)
      ════════════════════════════════════════════════════ */}
      <section className={styles.desktopHero}>

        {/* Fondo */}
        <motion.div
          className={styles.bgImage}
          variants={fadeIn} initial="hidden" animate="visible" custom={0}
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSxJskcBghXTd-7rMj3mjcfLmQBxa2PX2h0nmVjo9wvMgnpvEJEdJ4o7pG3wLv1UdiKiIYHNW-KoVbWDY7xySK-M7ld3MLhLJOIT5rmgppESvNH-3rzNLG038WpUrL3pEAfN4vl4zyX7EAPltKUrIBHXSGgUL07jOL0MjUvw2qmOK7Rn5PfE7sNR-TpnzpQgQCsiNEtpVL4QqTAa2es3DWcdSVn9QTE4G4GU8n140tBosaXL_buhaw5ZQvMXop0DyqXp2jcri0KA"
            alt="Gallery interior with marble sculptures"
          />
          <div className={styles.bgOverlay} />
        </motion.div>

        {/* Título central */}
        <div className={styles.centerTitle}>
          <motion.h1
            className={`${styles.mainHeadline} font-serif italic text-primary`}
            variants={fadeUp} initial="hidden" animate="visible" custom={0.15}
          >
            USTA GALLERY
          </motion.h1>
          <motion.span
            className={styles.goldLine}
            variants={scaleIn} initial="hidden" animate="visible" custom={0.55}
          />
          <motion.p
            className="font-sans text-[0.65rem] tracking-[0.4em] uppercase text-tertiary mt-5"
            variants={fadeUp} initial="hidden" animate="visible" custom={0.65}
          >
            Excelencia curatorial desde 1924
          </motion.p>
        </div>

        {/* Panel izquierdo — Newest Acquisitions */}
        <motion.div
          className={styles.leftPanel}
          variants={slideLeft} initial="hidden" animate="visible" custom={0.55}
        >
          <div className={`${styles.glassCard} bg-neutral/70 p-8 space-y-4`}>
            <span className="font-sans text-[0.6rem] tracking-[0.15em] uppercase text-tertiary block mb-5">
              Nuevas Adquisiciones
            </span>

            <div className="space-y-5">
              {products.length === 0 ? (
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.12em] text-tertiary">
                  Sin obras disponibles
                </p>
              ) : (
                products.slice(0, 2).map((product, i) => (
                  <div
                    key={product.uid}
                    className={`cursor-pointer pb-2${i < products.slice(0, 2).length - 1 ? " border-b border-neutral-200 pb-4" : ""}`}
                  >
                    <p className="font-serif italic text-xl text-primary leading-tight">
                      {product.name}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              className={`${styles.viewAllBtn} font-sans text-[0.6rem] tracking-[0.2em] uppercase text-primary mt-3`}
              onClick={() => navigate("/gallery")}
            >
              Ver Todo
              <span className="material-symbols-outlined text-[0.6rem]">&gt;</span>
            </button>
          </div>
        </motion.div>

        {/* Panel derecho — Upcoming Events */}
        <motion.div
          className={styles.rightPanel}
          variants={slideRight} initial="hidden" animate="visible" custom={0.7}
        >
          <div className={styles.eventsContainer}>
            {events.length === 0 ? (
              <div className={styles.eventItem}>
                <span className="font-sans text-[0.6rem] tracking-[0.12em] uppercase text-tertiary block mb-1">
                  Próximos Eventos
                </span>
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.15em] text-tertiary">
                  Sin eventos próximos
                </p>
              </div>
            ) : (
              events.map((event, i) => (
                <div key={event.uid} className={styles.eventItem}>
                  {i === 0 && (
                    <span className="font-sans text-[0.6rem] tracking-[0.12em] uppercase text-tertiary block mb-1">
                      Próximos Eventos
                    </span>
                  )}
                  <h3 className="font-serif italic text-[1.75rem] text-primary leading-tight mb-1">
                    {event.name}
                  </h3>
                  <p className="font-sans text-[0.6rem] uppercase tracking-[0.15em] text-tertiary">
                    {formatEventDate(event.startDate)}
                  </p>
                </div>
              ))
            )}
          </div>

          <button
            className={`${styles.reserveBtn} w-full py-4 mt-6 bg-primary text-neutral font-sans text-[0.6rem] tracking-[0.18em] uppercase border-none cursor-pointer hover:bg-primary-800 transition-colors duration-400`}
            onClick={() => navigate("/events")}
          >
            Ver Eventos
          </button>
        </motion.div>

        {/* Explore anchor */}
        <motion.div
          className={styles.exploreAnchor}
          variants={fadeIn} initial="hidden" animate="visible" custom={1.1}
        >
          <span className="font-sans text-[0.55rem] uppercase tracking-[0.35em] text-primary">
            Explorar
          </span>
          <div className={`${styles.exploreLine} text-primary`} />
        </motion.div>
      </section>


      {/* ════════════════════════════════════════════════════
          MOBILE LAYOUT (< 768px)
      ════════════════════════════════════════════════════ */}
      <div className={styles.mobileLayout}>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className={`${styles.mobileHero} bg-neutral`}>
          <div className={`${styles.mobileBgDecor} bg-neutral-100`} />

          <div className={styles.mobileGrid}>

            {/* Imagen principal */}
            <motion.div
              className={styles.primaryImage}
              variants={scaleIn} initial="hidden" animate="visible" custom={0.1}
            >
              <div className={`${styles.primaryImageFrame} shadow-brand-md`}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAhpxJr_SCP2OEKM4nGCwOYN7szn3_0JDf3DeC-3uQfLzlFV5uK8O_bXsd7DPPw_nYygTtVN-Hor74UBHEVozRxmkm74_8Jnn7oabWJavEJtSED94JSRrdri6D7Qd3nNJAviAQ5jcpGgYZVARP1A5omzG1Za99Ewtgk3153mn7-Z5hAf3Fkq9hq3WkeEw2XbovdFUbZ-g68ALmjfPHdb7-G75nPGPkpUofBXUZMAwRJRn0FiKxDWclYsY3a-JWlhC3v1agI0i8YA"
                  alt="Abstract expressionist oil painting"
                  className="grayscale-[20%]"
                />
              </div>

              <motion.div
                className={`${styles.exhibitionTag} bg-neutral-100 p-4 max-w-[10rem] shadow-brand-sm`}
                variants={fadeUp} initial="hidden" animate="visible" custom={0.55}
              >
                <span className="font-sans text-[0.55rem] tracking-[0.2em] uppercase text-tertiary block mb-1">
                  Exposición Actual
                </span>
                <p className="font-serif italic text-lg leading-tight text-primary">
                  {products[0]?.name ?? "Galería USTA"}
                </p>
              </motion.div>
            </motion.div>

            {/* Imagen secundaria */}
            <motion.div
              className={styles.secondaryImage}
              variants={scaleIn} initial="hidden" animate="visible" custom={0.25}
            >
              <div className={`${styles.secondaryImageFrame} shadow-brand-sm`}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuADVoZKdVMlyrxfd-v2tObpJuNtCYg63rdpTvrWmvVDd2uXQ4jpvbg3ScUqFenmskZHyBYL1GYbriFSv_kmWj569bjYd71V3023BnU881IZ-bvrJRdAr5818rIJUz2rMGo2eP09nRCyJxvU8esRCp2kYu762p1leDRJXTjzkgLVwtix5hIbc2s8Pb9zyPjfjHBdzG4x49NDjjUme9e5pvMC_RxLYVLt0p32k-EPtlH2jz-t25Vkuj1zkv_9QOXIFvEeWHsuw0G0PQ"
                  alt="Sculptural texture in ivory"
                />
              </div>
              <p className="font-serif text-2xl font-extralight tracking-tighter text-primary opacity-15 text-right mt-2">
                2024
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              className={styles.mobileCta}
              variants={fadeUp} initial="hidden" animate="visible" custom={0.5}
            >
              <h2 className="font-serif italic text-fluid-2xl text-primary leading-none mb-4">
                Arte <br />Curado.
              </h2>
              <p className="font-sans text-sm text-tertiary leading-relaxed max-w-[240px] mb-8">
                Descubre un santuario digital para obras maestras contemporáneas y voces emergentes.
              </p>
              <button className={`${styles.collectionBtn} bg-primary text-neutral px-8 py-4`} onClick={() => navigate("/gallery")}>
                <span className="font-sans text-[0.7rem] tracking-[0.2em] uppercase">
                  Colección
                </span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </motion.div>
          </div>

          {/* Scroll hint */}
          <motion.div
            className={styles.scrollHint}
            variants={fadeIn} initial="hidden" animate="visible" custom={1.0}
          >
            <span className="font-sans text-[0.55rem] uppercase tracking-[0.3em] text-primary">
              Explorar
            </span>
            <span className="material-symbols-outlined text-primary">expand_more</span>
          </motion.div>
        </section>

        {/* ── Newest Works ─────────────────────────────────── */}
        <section className="bg-neutral-100 py-24 px-6 border-t border-secondary/30">
          <div className="max-w-sm mx-auto">
            <motion.div
              className="flex items-baseline justify-between mb-12"
              variants={fadeUp} initial="hidden"
              whileInView="visible" viewport={{ once: true, margin: "-80px" }}
              custom={0}
            >
              <h3 className="font-serif italic text-fluid-xl text-primary">
                Últimas Obras
              </h3>
            </motion.div>

            <div className="flex flex-col gap-16">
              {products.length === 0 ? (
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.15em] text-tertiary text-center py-8">
                  Sin obras disponibles
                </p>
              ) : (
                products.slice(0, 3).map((product, i) => {
                  const mainPhoto = product.photos.find(p => p.isMain) ?? product.photos[0];
                  const offsetClass = i === 1 ? styles.galleryItemOffset : i === 2 ? styles.galleryItemRight : "";
                  const frameShape = i === 0 ? "portrait" : i === 1 ? "square" : "tall";
                  return (
                    <motion.div
                      key={product.uid}
                      className={offsetClass}
                      variants={fadeUp} initial="hidden"
                      whileInView="visible" viewport={{ once: true, margin: "-60px" }}
                      custom={0.05}
                    >
                      <div className={`${styles.galleryImageFrame} ${frameShape} shadow-brand-sm`}>
                        {mainPhoto ? (
                          <img src={mainPhoto.photo.url} alt={product.name} className="grayscale" />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                            <span className="material-symbols-outlined text-tertiary text-4xl">image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-end pt-5 pb-4 border-b border-neutral-200 mt-6">
                        <div>
                          <h4 className="font-serif italic text-xl text-primary">{product.name}</h4>
                        </div>
                        <span className="font-serif italic text-lg text-primary/30">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <motion.button
              className="block mx-auto mt-20 px-12 py-5 bg-transparent border border-primary/20 font-sans text-[0.65rem] tracking-[0.3em] uppercase text-primary hover:bg-primary hover:text-neutral transition-all duration-500"
              variants={fadeUp} initial="hidden"
              whileInView="visible" viewport={{ once: true, margin: "-40px" }}
              custom={0.05}
              onClick={() => navigate("/gallery")}
            >
              Ver Galería
            </motion.button>
          </div>
        </section>

        {/* ── Upcoming Events (mobile) ──────────────────────── */}
        <section className="bg-neutral py-24 px-6 border-t border-secondary/30">
          <div className="max-w-sm mx-auto">
            <motion.div
              className="flex items-baseline justify-between mb-12"
              variants={fadeUp} initial="hidden"
              whileInView="visible" viewport={{ once: true, margin: "-80px" }}
              custom={0}
            >
              <h3 className="font-serif italic text-fluid-xl text-primary">
                Próximos Eventos
              </h3>
            </motion.div>

            <div className="flex flex-col gap-0">
              {events.length === 0 ? (
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.15em] text-tertiary py-8">
                  Sin eventos próximos
                </p>
              ) : (
                events.slice(0, 3).map((event, i) => {
                  const heroPhoto = event.photos.find(p => p.photoType === "HERO") ?? event.photos[0];
                  return (
                    <motion.div
                      key={event.uid}
                      className="flex gap-5 py-7 border-b border-neutral-200"
                      variants={fadeUp} initial="hidden"
                      whileInView="visible" viewport={{ once: true, margin: "-60px" }}
                      custom={i * 0.1}
                    >
                      <div className="flex-shrink-0 w-20 h-20 overflow-hidden bg-neutral-100">
                        {heroPhoto ? (
                          <img src={heroPhoto.photo.url} alt={event.name} className="w-full h-full object-cover grayscale-[20%]" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-tertiary text-2xl">event</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-serif italic text-lg text-primary leading-tight">{event.name}</h4>
                        <p className="font-sans text-[0.6rem] uppercase tracking-[0.12em] text-tertiary mt-1">
                          {formatEventDate(event.startDate)}
                        </p>
                        <p className="font-sans text-[0.55rem] uppercase tracking-[0.1em] text-tertiary/60 mt-0.5">
                          {event.eventType}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <motion.button
              className="block mx-auto mt-14 px-12 py-5 bg-primary text-neutral font-sans text-[0.65rem] tracking-[0.3em] uppercase hover:bg-primary-800 transition-all duration-500"
              variants={fadeUp} initial="hidden"
              whileInView="visible" viewport={{ once: true, margin: "-40px" }}
              custom={0.05}
              onClick={() => navigate("/events")}
            >
              Ver Eventos
            </motion.button>
          </div>
        </section>

        <div className={styles.goldAccentStrip} />
      </div>

    </div>
  );
}