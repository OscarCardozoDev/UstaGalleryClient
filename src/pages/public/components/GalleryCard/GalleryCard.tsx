import { Link } from "react-router-dom";
import type { ProductGallery } from "../../../../interfaces/products";
import styles from "./GalleryCard.module.css";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface GalleryCardProps {
  product: ProductGallery;
  /** Clase CSS de posicionamiento en el grid, e.g. styles.pattern1Item1 */
  gridAreaClassName?: string;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const GalleryCard = ({ product, gridAreaClassName }: GalleryCardProps) => {
  const imageSrc = getImageSrc(product);

  return (
    <div className={`${styles.gridItem} ${gridAreaClassName ?? ""}`}>
      <Link to={`/show-picture/${product.uid}`} state={{ product }}>
        {imageSrc ? (
          <img src={imageSrc} alt={product.name} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder}>Sin imagen</div>
        )}

        <div className={styles.pinOverlay}>
          <h3>{product.name}</h3>
        </div>
      </Link>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Helper (colocado aquí para mantener el componente autónomo)
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL;

function getImageSrc(product: ProductGallery): string | null {
  const photo = product.photos?.[0]?.photo;
  if (!photo?.url) return null;
  return `${BASE_URL}${photo.url}`;
}

export default GalleryCard;
