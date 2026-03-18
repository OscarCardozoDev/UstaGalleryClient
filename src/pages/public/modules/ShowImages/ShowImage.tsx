import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProductById,
  getProductByAuthor,
} from "../../../../services/products";
import { getAuthorDetail } from "../../../../services/users";
import { getAllStyles } from "../../../../services/styles";
import type { Product } from "../../../../interfaces/products";
import type { Style } from "../../../../interfaces/styles";
import ImageViewer from "../../../components/ImageViewer";
import GalleryCard from "../../components/GalleryCard/GalleryCard";
import styles from "./ShowImage.module.css";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────

interface AuthorDetail {
  uid: string;
  name: string;
  lastName: string;
  username: string;
  description?: string | null;
  photoId?: string | null;
  photo?: { uid: string; url?: string } | null;
}

// ─────────────────────────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────────────────────────

export default function ShowImage() {
  const { uid } = useParams<{ uid: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [allStyles, setAllStyles] = useState<Style[]>([]);
  const [author, setAuthor] = useState<AuthorDetail | null>(null);
  const [authorProducts, setAuthorProducts] = useState<Product[]>([]);
  const [loadingAuthor, setLoadingAuthor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArtistInfo, setShowArtistInfo] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Cargar producto y estilos
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      if (!uid) {
        setError("No se proporcionó un ID de producto");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [productData, stylesData] = await Promise.all([
          getProductById(uid),
          getAllStyles(),
        ]);

        setProduct(productData);
        setAllStyles(stylesData);
      } catch (err) {
        setError((err as Error).message || "Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  // ─────────────────────────────────────────────────────────────
  // Cargar autor principal al abrir el panel
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!showArtistInfo || !product || author) return;

    const mainAuthor = product.authors.find((a) => a.isAuthor);
    if (!mainAuthor) return;

    const fetchAuthor = async () => {
      setLoadingAuthor(true);
      try {
        const [authorData, productsData] = await Promise.all([
          getAuthorDetail(mainAuthor.userId),
          getProductByAuthor(mainAuthor.userId),
        ]);
        setAuthor(authorData);
        setAuthorProducts(
          Array.isArray(productsData) ? productsData : [productsData],
        );
      } catch (err) {
        console.error("Error al cargar el autor:", err);
      } finally {
        setLoadingAuthor(false);
      }
    };

    fetchAuthor();
  }, [showArtistInfo, product, author]);

  // ─────────────────────────────────────────────────────────────
  // Estados de carga
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.pinterestImage}>
        <div style={{ margin: "auto", color: "black" }}>
          Cargando producto...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.pinterestImage}>
        <div style={{ margin: "auto", color: "red" }}>
          {error || "Producto no encontrado"}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Formatear precio
  // ─────────────────────────────────────────────────────────────

  const formattedPrice = product.price
    ? `$${parseFloat(product.price).toLocaleString("es-ES")}`
    : null;

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className={styles.pinterestImage}>
      <div className={styles.imageContainer}>
        <div className={styles.imagePlaceholder}>
          {product.photos ? (
            <ImageViewer images={product.photos} baseUrl={BASE_URL} />
          ) : (
            <p>No hay imagen disponible</p>
          )}
        </div>
      </div>

      <div
        className={`${styles.descriptionContainer} ${
          showArtistInfo ? styles.showArtistInfo : ""
        }`}
      >
        <div className={styles.mainInfo}>
          <h2 className={styles.title}>{product.name}</h2>

          <p className={styles.description}>{product.description}</p>

          {formattedPrice && <p className={styles.price}>{formattedPrice}</p>}

          <div className={styles.categories}>
            {allStyles.map((style) => (
              <div key={style.uid} className={styles.categoryChip}>
                {style.name}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.artistInfo}>
          {loadingAuthor && (
            <p className={styles.description}>Cargando artista...</p>
          )}

          {!loadingAuthor && author && (
            <>
              {/* ── Cabecera: foto + nombre/descripción ── */}
              <div className={styles.authorHeader}>
                <div className={styles.authorAvatar}>
                  {author.photo?.url ? (
                    <img
                      className={styles.authorAvatarImage}
                      src={`${BASE_URL}${author.photo.url}`}
                      alt={author.name}
                    />
                  ) : (
                    <div className={styles.authorAvatarFallback}>
                      {author.name[0]}
                    </div>
                  )}
                </div>
                <div className={styles.authorMeta}>
                  <h3 className={styles.authorName}>
                    {author.name} {author.lastName}
                  </h3>
                  <p className={styles.authorUsername}>@{author.username}</p>
                  {author.description && (
                    <p className={styles.authorDescription}>
                      {author.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className={styles.authorDivider} />

              {/* Obras del autor */}
              {authorProducts.length > 0 && (
                <>
                  <p className={styles.authorWorksLabel}>Otras obras</p>
                  <RelatedWorks
                    products={authorProducts}
                    currentProductUid={uid || ""}
                  />
                </>
              )}
            </>
          )}

          {!loadingAuthor && !author && (
            <p className={styles.description}>
              No se encontró información del artista.
            </p>
          )}
        </div>

          <button
            className={styles.artistButton}
            onClick={() => setShowArtistInfo(!showArtistInfo)}
          >
            {showArtistInfo
              ? "Ver información de la obra"
              : "Ver información del artista"}
            <svg
              className={styles.arrowIcon}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente de Obras Relacionadas
// ─────────────────────────────────────────────────────────────

interface RelatedWorksProps {
  products: Product[];
  currentProductUid: string;
}

interface ImageWithOrientation {
  product: Product;
  orientation: "horizontal" | "vertical" | null;
}

const RelatedWorks = ({ products, currentProductUid }: RelatedWorksProps) => {
  const [images, setImages] = useState<ImageWithOrientation[]>([]);

  useEffect(() => {
    const filtered = products.filter((p) => p.uid !== currentProductUid);

    const loadImages = filtered.map(
      (product) =>
        new Promise<ImageWithOrientation>((resolve) => {
          const photo =
            product.photos?.find((p) => p.isMain)?.photo ??
            product.photos?.[0]?.photo;

          if (!photo) {
            resolve({ product, orientation: null });
            return;
          }

          const img = new Image();
          img.src = `${BASE_URL}${photo.url}`;
          img.onload = () => {
            resolve({
              product,
              orientation: img.width > img.height ? "horizontal" : "vertical",
            });
          };
          img.onerror = () => resolve({ product, orientation: null });
        }),
    );

    Promise.all(loadImages).then(setImages);
  }, [products, currentProductUid]);

  if (images.length === 0) return null;

  return (
    <div className={styles.imgContainer}>
      {images.map(({ product }) => (
        <GalleryCard key={product.uid} product={product} variant="carousel" />
      ))}
    </div>
  );
};
