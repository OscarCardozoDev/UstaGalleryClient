import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [activeView, setActiveView] = useState<'artwork' | 'artist'>('artwork');
  const navigate = useNavigate();

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

      setProduct(null);
      setAuthor(null);
      setAuthorProducts([]);
      setError(null);
      setActiveView('artwork');

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
  // Cargar autor cuando se cambia a vista de artista
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeView !== 'artist' || !product || author) return;

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
  }, [activeView, product, author]);

  // ─────────────────────────────────────────────────────────────
  // Estados de carga
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p className="text-primary-700 font-sans text-sm tracking-wider">Cargando obra...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p className="text-red-600 font-sans">{error || "Producto no encontrado"}</p>
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
  // Obtener autor principal
  // ─────────────────────────────────────────────────────────────

  const mainAuthor = product.authors.find((a) => a.isAuthor);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      {/* Side Navigation Rail */}
      <aside className={styles.sideRail}>
        <div className={styles.railButtons}>
          <button
            className={`${styles.railButton} ${activeView === 'artwork' ? styles.railButtonActive : ''}`}
            onClick={() => setActiveView('artwork')}
            title="Ver información de la obra"
          >
            <span className={styles.railIcon}><img src="/public/logos/art.public.png" alt="obra-de-adrte" width={40} height={40} /></span>
            <span className={styles.railLabel}>Obra</span>
          </button>

          <button
            className={`${styles.railButton} ${activeView === 'artist' ? styles.railButtonActive : ''}`}
            onClick={() => setActiveView('artist')}
            title="Ver información del artista"
          >
            <span className={styles.railIcon}><img src="/public/logos/artist.public.png" alt="artista-de-adrte" width={40} height={40} /></span>
            <span className={styles.railLabel}>Artista</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas - Artwork Viewport */}
      <main className={styles.mainCanvas}>
        <section className={styles.artworkViewport}>
          {/* Main Image - Hero */}
          <div className={styles.heroImage}>
            {product.photos ? (
              <ImageViewer images={product.photos} baseUrl={BASE_URL} />
            ) : (
              <div className={styles.noImage}>
                <p className="text-tertiary-500">No hay imagen disponible</p>
              </div>
            )}
            <div className={styles.imageLabel}>
              <span className="text-primary-950 font-sans">Vista Principal</span>
            </div>
          </div>

          {/* Supporting Info Bar */}
          <div className={styles.supportingInfo}>
            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Técnica</p>
              <p className={styles.infoValue}>
                {product.technique || "No especificada"}
              </p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Disponibilidad</p>
              <p className={styles.infoValue}>
                {product.isAvailable ? "Disponible" : "No Disponible"}
              </p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Referencia</p>
              <p className={styles.infoValue}>#{product.uid.slice(0, 8)}</p>
            </div>
          </div>
        </section>

        {/* Information Panel */}
        <section className={styles.infoPanel}>
          <div className={styles.infoPanelContent}>
            {activeView === 'artwork' ? (
              <>
                {/* Artwork Info */}
                <header className={styles.header}>
                  <div className={styles.headerDivider}>
                    <div className={styles.dividerLine}></div>
                    <span className="text-tertiary-600 font-sans">Obra Destacada</span>
                  </div>
                  <h1 className={styles.title}>{product.name}</h1>
                </header>

                <div className={styles.artworkDetails}>
                  <div className={styles.metadataGrid}>
                    <div className={styles.metadataItem}>
                      <span className={styles.metadataLabel}>Año</span>
                      <p className={styles.metadataValue}>
                        {new Date(product.madeAt).getFullYear()}
                      </p>
                    </div>
                    {formattedPrice && (
                      <div className={styles.metadataItem}>
                        <span className={styles.metadataLabel}>Precio</span>
                        <p className={`${styles.metadataValue} text-gold`}>
                          {formattedPrice}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={styles.descriptionSection}>
                    <p className="text-primary-800 leading-relaxed text-lg font-light font-sans">
                      {product.description}
                    </p>
                  </div>

                  {allStyles.length > 0 && (
                    <div className={styles.stylesSection}>
                      <span className={styles.stylesLabel}>Estilos</span>
                      <div className={styles.styleChips}>
                        {allStyles.map((style) => (
                          <div key={style.uid} className={styles.styleChip}>
                            {style.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.actionButtons}>
                    <button className={styles.primaryButton}>
                      Consultar Detalles
                      <span className={styles.buttonIcon}>→</span>
                    </button>
                    <button 
                      className={styles.secondaryButton}
                      onClick={() => setActiveView('artist')}
                    >
                      Ver Biografía del Artista
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Artist Info */}
                <header className={styles.header}>
                  <div className={styles.headerDivider}>
                    <div className={styles.dividerLine}></div>
                    <span className="text-tertiary-600 font-sans">Información del Artista</span>
                  </div>
                  {loadingAuthor ? (
                    <div className={styles.artistLoading}>
                      <div className={styles.spinner}></div>
                      <p className="text-tertiary-600">Cargando artista...</p>
                    </div>
                  ) : author ? (
                    <>
                      <div className={styles.artistHeader}>
                        <div className={styles.artistAvatar}>
                          {author.photo?.url ? (
                            <img
                              className={styles.avatarImage}
                              src={`${BASE_URL}${author.photo.url}`}
                              alt={author.name}
                            />
                          ) : (
                            <div className={styles.avatarFallback}>
                              {author.name[0]}
                            </div>
                          )}
                        </div>
                        <div className={styles.artistMeta}>
                          <h1 className={styles.artistName}>
                            {author.name} {author.lastName}
                          </h1>
                          <p className={styles.artistUsername}>@{author.username}</p>
                        </div>
                      </div>

                      {author.description && (
                        <div className={styles.artistBio}>
                          <p className="text-primary-700 leading-relaxed font-light font-serif text-xl italic">
                            "{author.description}"
                          </p>
                        </div>
                      )}

                      {authorProducts.length > 0 && (
                        <>
                          <div className={styles.divider}></div>
                          <div className={styles.artistWorks}>
                            <p className={styles.worksLabel}>Otras Obras del Artista</p>
                            <RelatedWorks
                              products={authorProducts}
                              currentProductUid={uid || ""}
                            />
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <p className="text-tertiary-600">
                      No se encontró información del artista.
                    </p>
                  )}
                </header>
              </>
            )}

            {/* Footer */}
            <footer className={styles.footer}>
              <div className={styles.footerContent}>
                <span className="text-tertiary-500">© 2024 USTA GALLERY</span>
                <div className={styles.footerIcons}>
                  <button className={styles.iconButton} title="Compartir">
                    ↗
                  </button>
                  <button className={styles.iconButton} title="Favorito">
                    ♥
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </main>

      {/* Floating Back Button */}
      <div className={styles.floatingButton}>
        <button className={styles.backButton} onClick={() => navigate("/gallery")}>
          <span className={styles.backButtonLabel}>Volver a Galería</span>
          <span className={styles.backButtonIcon}>⊞</span>
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

const RelatedWorks = ({ products, currentProductUid }: RelatedWorksProps) => {
  const filtered = products.filter((p) => p.uid !== currentProductUid);

  if (filtered.length === 0) return null;

  return (
    <div className={styles.relatedGrid}>
      {filtered.slice(0, 6).map((product) => (
        <GalleryCard key={product.uid} product={product} variant="carousel" />
      ))}
    </div>
  );
};