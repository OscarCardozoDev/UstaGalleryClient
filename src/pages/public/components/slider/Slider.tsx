import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import styles from "./Slider.module.css";

interface SliderProps {
  images: string[];
  scrollAmount?: number;
  autoScrollDelay?: number;
}

const Slider: React.FC<SliderProps> = ({
  images,
  scrollAmount,
  autoScrollDelay = 3000,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-80, 0, 80], [0.7, 1, 0.7]);

  // ── Helpers ────────────────────────────────────────────
  const getItemWidth = useCallback((): number => {
    if (scrollAmount) return scrollAmount;
    const container = containerRef.current;
    if (!container) return 300;
    const item = container.querySelector<HTMLElement>("[data-slider-item]");
    if (!item) return 300;
    return item.getBoundingClientRect().width + 20;
  }, [scrollAmount]);

  const scrollTo = useCallback((direction: "left" | "right") => {
    const amount = getItemWidth();
    containerRef.current?.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }, [getItemWidth]);

  // ── Active dot tracker ─────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const itemW = getItemWidth();
      if (itemW <= 0) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const scrolled = maxScroll - el.scrollLeft;
      const idx = Math.round(scrolled / itemW);
      setActiveIndex(Math.max(0, Math.min(idx, images.length - 1)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [getItemWidth, images.length]);

  // ── Auto-scroll ────────────────────────────────────────
  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => scrollTo("right"), autoScrollDelay);
    return () => clearInterval(interval);
  }, [autoScrollDelay, isDragging, scrollTo]);

  // ── Pointer drag ──────────────────────────────────────
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const SWIPE_THRESHOLD = 40;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartScroll.current = containerRef.current?.scrollLeft ?? 0;
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const delta = e.clientX - dragStartX.current;
    dragX.set(delta);
    containerRef.current.scrollLeft = dragStartScroll.current - delta;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) < SWIPE_THRESHOLD) {
      const itemW = getItemWidth();
      const el = containerRef.current;
      if (el) {
        const nearest = Math.round(el.scrollLeft / itemW) * itemW;
        animate(el.scrollLeft, nearest, {
          duration: 0.3,
          onUpdate: (v) => { el.scrollLeft = v; },
        });
      }
    }
    animate(dragX, 0, { duration: 0.3, ease: [0.16, 1, 0.3, 1] });
  };

  return (
    <div className={styles.wrapper}>
      <motion.button
        aria-label="Anterior"
        className={styles.arrowLeft}
        onClick={() => scrollTo("left")}
        whileTap={{ scale: 0.92 }}
      >
        ‹
      </motion.button>

      <div className={styles.sliderContainer} ref={containerRef}>
        <motion.div
          className={`${styles.sliderTrack} ${isDragging ? styles.isDragging : ""}`}
          style={{ opacity: dragOpacity }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {images.map((src, i) => (
            <motion.div
              key={i}
              data-slider-item
              className={styles.sliderItem}
              initial={{
                x: -48 - i * 10,
                opacity: 0,
                clipPath: "inset(0 100% 0 0 round 12px)",
              }}
              animate={{
                x: 0,
                opacity: 1,
                clipPath: "inset(0 0% 0 0 round 12px)",
              }}
              transition={{
                delay: 0.15 + i * 0.07,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <img
                src={src}
                alt={`slide-${i}`}
                className={styles.sliderImage}
                draggable={false}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.button
        aria-label="Siguiente"
        className={styles.arrowRight}
        onClick={() => scrollTo("right")}
        whileTap={{ scale: 0.92 }}
      >
        ›
      </motion.button>

      <div className={styles.swipeHint} aria-hidden>
        {images.map((_, i) => (
          <span
            key={i}
            className={`${styles.swipeDot} ${i === activeIndex ? styles.active : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;  