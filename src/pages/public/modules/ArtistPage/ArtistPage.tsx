import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuthorDetail } from "../../../../services/users";
import { getProductByAuthor } from "../../../../services/products";
import type { AuthorDetail } from "../../../../interfaces/users";
import type { Product } from "../../../../interfaces/products";
import styles from "./ArtistPage.module.css";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ArtistPage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  const [author, setAuthor] = useState<AuthorDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [worksError, setWorksError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!uid) {
      setError("No se proporcionó un artista");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setWorksError(null);

    const [authorResult, productsResult] = await Promise.allSettled([
      getAuthorDetail(uid),
      getProductByAuthor(uid),
    ]);

    if (authorResult.status === "rejected") {
      setError((authorResult.reason as Error).message || "Error al cargar el artista");
      setLoading(false);
      return;
    }

    setAuthor(authorResult.value);

    if (productsResult.status === "rejected") {
      setWorksError("Error al cargar las obras");
    } else {
      const data = productsResult.value;
      setProducts(Array.isArray(data) ? data : [data]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [uid]);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Cargando artista...</p>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorText}>{error || "Artista no encontrado"}</p>
        <button className={styles.retryButton} onClick={fetchData}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backButtonWrapper}>
        <button className={styles.backButton} onClick={() => navigate("/gallery")}>
          ← Back to directory
        </button>
      </div>

      <HeroSection author={author} />
      <WorksSection products={products} worksError={worksError} />

      {/*
        TODO: Exhibition History — uncomment when getEventsByArtist endpoint is available

        <section className={styles.exhibitionsSection}>
          <div className={styles.exhibitionsSectionHeader}>
            <h2>Exhibition History</h2>
            <div className={styles.dividerLine}></div>
          </div>
          <div className={styles.exhibitionsList}>
            List of exhibitions with year, title, venue...
          </div>
        </section>
      */}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection({ author }: { author: AuthorDetail }) {
  const photoUrl = author.photo?.url ? `${BASE_URL}${author.photo.url}` : null;

  return (
    <section className={styles.hero}>
      <div className={styles.heroLeft}>
        <h1 className={styles.artistName}>
          {author.name}
          <br />
          {author.lastName}
        </h1>

        {author.description && (
          <div className={styles.bioCard}>
            <div className={styles.bioCardAccent} />
            <p className={styles.bioDescription}>"{author.description}"</p>
            <p className={styles.artistUsername}>@{author.username}</p>
          </div>
        )}
      </div>

      <div className={styles.heroRight}>
        <div className={styles.photoContainer}>
          {photoUrl ? (
            <img
              className={styles.artistPhoto}
              src={photoUrl}
              alt={`${author.name} ${author.lastName}`}
            />
          ) : (
            <div className={styles.photoFallback}>{author.name[0]}</div>
          )}
        </div>
        <div className={styles.photoAccent} />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Works Section
// ─────────────────────────────────────────────────────────────────────────────

function WorksSection({
  products,
  worksError,
}: {
  products: Product[];
  worksError: string | null;
}) {
  return (
    <section className={styles.worksSection}>
      <div className={styles.worksSectionHeader}>
        <h2 className={styles.worksSectionTitle}>Selected Works</h2>
        <span className={styles.worksSectionMeta}>
          {products.length} {products.length === 1 ? "obra" : "obras"}
        </span>
      </div>

      {worksError ? (
        <p className={styles.worksErrorText}>{worksError}</p>
      ) : products.length === 0 ? (
        <p className={styles.emptyWorks}>Sin obras disponibles</p>
      ) : products.length >= 4 ? (
        <BentoWorks products={products} />
      ) : (
        <div className={styles.uniformGrid}>
          {products.map((p) => (
            <WorkCard key={p.uid} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bento Grid (≥4 products)
// ─────────────────────────────────────────────────────────────────────────────

function BentoWorks({ products }: { products: Product[] }) {
  const [featured, second, third, panoramic, ...rest] = products;

  return (
    <>
      <div className={styles.bentoGrid}>
        <WorkCard product={featured} variant="featured" />
        {second && <WorkCard key={second.uid} product={second} />}
        {third && <WorkCard key={third.uid} product={third} />}
      </div>

      <WorkCard product={panoramic} variant="panoramic" />

      {rest.length > 0 && (
        <div className={styles.restGrid}>
          {rest.map((p) => (
            <WorkCard key={p.uid} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Work Card
// ─────────────────────────────────────────────────────────────────────────────

interface WorkCardProps {
  product: Product;
  variant?: "featured" | "panoramic" | "normal";
}

function WorkCard({ product, variant = "normal" }: WorkCardProps) {
  const photo = product.photos?.[0]?.photo;
  const imageSrc = photo?.url ? `${BASE_URL}${photo.url}` : null;
  const year = new Date(product.madeAt).getFullYear();

  if (variant === "panoramic") {
    return (
      <Link to={`/show-picture/${product.uid}`} className={styles.workCardPanoramic}>
        {imageSrc ? (
          <img className={styles.workCardImage} src={imageSrc} alt={product.name} loading="lazy" />
        ) : (
          <div className={styles.noImagePlaceholder}>Sin imagen</div>
        )}
        <div className={styles.workCardOverlay}>
          <div className={styles.workCardInfo}>
            <h3 className={styles.workCardTitle}>{product.name}</h3>
            <p className={styles.workCardYear}>{year}</p>
          </div>
        </div>
      </Link>
    );
  }

  const cardClass = [
    styles.workCard,
    variant === "featured" ? styles.workCardFeatured : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link to={`/show-picture/${product.uid}`} className={cardClass}>
      {imageSrc ? (
        <img className={styles.workCardImage} src={imageSrc} alt={product.name} loading="lazy" />
      ) : (
        <div className={styles.noImagePlaceholder}>Sin imagen</div>
      )}
      <div className={styles.workCardOverlay}>
        <div className={styles.workCardInfo}>
          <h3 className={styles.workCardTitle}>{product.name}</h3>
          <p className={styles.workCardYear}>{year}</p>
        </div>
      </div>
    </Link>
  );
}
