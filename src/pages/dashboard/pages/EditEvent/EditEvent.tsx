import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sileo } from "sileo";
import ImageUploader from "../../../components/ImageUploader";
import type { ImageUploaderItem } from "../../../components/ImageUploader";
import {
  getEventById,
  updateEvent,
  addEventPhoto,
  removeEventPhoto,
  getAvailableProducts,
  updateEventProducts,
} from "../../../../services/events";
import type {
  Event,
  EventType,
  EventPhotoType,
  AvailableProduct,
} from "../../../../interfaces/events";
import styles from "./EditEvent.module.css";

// ─── Constantes ───────────────────────────────────────────────────────────────

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "EXHIBITION",  label: "Exposición" },
  { value: "WORKSHOP",    label: "Taller" },
  { value: "PERFORMANCE", label: "Presentación" },
  { value: "CONFERENCE",  label: "Conferencia" },
  { value: "OTHER",       label: "Otro" },
];

const PHOTO_TYPE_OPTIONS: { value: EventPhotoType; label: string }[] = [
  { value: "HERO",   label: "Portada (HERO)" },
  { value: "PROMO",  label: "Promocional" },
  { value: "MEMORY", label: "Recuerdo (post-evento)" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateInput(iso: string): string {
  return iso ? iso.split("T")[0] : "";
}

function toTimeInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function combineDatetime(date: string, time: string): string {
  if (!date) return "";
  return time ? `${date}T${time}:00.000Z` : `${date}T00:00:00.000Z`;
}

const convertFileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EditEvent() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  // ── Datos ──────────────────────────────────────────────────────────────────
  const [event, setEvent]                   = useState<Event | null>(null);
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([]);
  const [isFetching, setIsFetching]         = useState(true);

  // ── Formulario info ────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name:        "",
    description: "",
    eventType:   "EXHIBITION" as EventType,
    startDate:   "",
    startTime:   "",
    endDate:     "",
    endTime:     "",
    locationUrl: "",
    isVirtual:   false,
    streamingUrl:"",
  });

  // ── Fotos nuevas (subir) ───────────────────────────────────────────────────
  const [newPhotoItems, setNewPhotoItems]   = useState<ImageUploaderItem[]>([]);
  const [selectedPhotoType, setSelectedPhotoType] = useState<EventPhotoType>("PROMO");
  const [uploaderKey, setUploaderKey]       = useState(0);

  // ── Obras seleccionadas ────────────────────────────────────────────────────
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [requestingGroupId, setRequestingGroupId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]           = useState<"info" | "photos" | "products">("info");
  const [isLoadingInfo, setIsLoadingInfo]   = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // ── Carga inicial ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!uid) return;

    const load = async () => {
      setIsFetching(true);
      try {
        const data = await getEventById(uid);
        setEvent(data);

        setForm({
          name:         data.name,
          description:  data.description,
          eventType:    data.eventType,
          startDate:    toDateInput(data.startDate),
          startTime:    toTimeInput(data.startDate),
          endDate:      data.endDate ? toDateInput(data.endDate) : "",
          endTime:      data.endDate ? toTimeInput(data.endDate) : "",
          locationUrl:  data.locationUrl ?? "",
          isVirtual:    data.isVirtual,
          streamingUrl: data.streamingUrl ?? "",
        });

        // Preseleccionar obras actuales del evento
        const currentProductIds = data.products.map((p) => p.product.uid);
        setSelectedProducts(currentProductIds);

        // Cargar obras disponibles del primer grupo
        if (data.groups.length > 0) {
          const gid = data.groups[0].group.uid;
          setRequestingGroupId(gid);
          const prods = await getAvailableProducts(gid);
          setAvailableProducts(prods);
        }
      } catch (err) {
        sileo.error({ title: "No se pudo cargar el evento" });
      } finally {
        setIsFetching(false);
      }
    };

    load();
  }, [uid]);

  // ── Guardar info general ───────────────────────────────────────────────────

  const handleSaveInfo = async () => {
    if (!form.name.trim())        { sileo.warning({ title: "El nombre es requerido" }); return; }
    if (!form.description.trim()) { sileo.warning({ title: "La descripción es requerida" }); return; }
    if (!form.startDate)          { sileo.warning({ title: "La fecha de inicio es requerida" }); return; }
    if (form.isVirtual && !form.streamingUrl.trim())
      { sileo.warning({ title: "El link de streaming es requerido para eventos virtuales" }); return; }

    setIsLoadingInfo(true);
    try {
      await updateEvent(uid!, {
        name:        form.name.trim(),
        description: form.description.trim(),
        eventType:   form.eventType,
        startDate:   combineDatetime(form.startDate, form.startTime),
        endDate:     form.endDate ? combineDatetime(form.endDate, form.endTime) : undefined,
        locationUrl: form.locationUrl.trim() || undefined,
        isVirtual:   form.isVirtual,
        streamingUrl: form.isVirtual ? form.streamingUrl.trim() : undefined,
      });
      sileo.success({
        title: "Información actualizada",
        description: "El evento volvió a estado PENDIENTE para revisión del admin.",
      });
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "Error al guardar" });
    } finally {
      setIsLoadingInfo(false);
    }
  };

  // ── Subir fotos ────────────────────────────────────────────────────────────

  const handleUploadPhotos = async () => {
    const newItems = newPhotoItems.filter((i) => !i.isExisting && i.file);
    if (newItems.length === 0) { sileo.warning({ title: "Selecciona al menos una foto para subir" }); return; }

    setIsLoadingPhotos(true);
    try {
      for (const item of newItems) {
        const base64 = await convertFileToBase64(item.file!);
        await addEventPhoto(uid!, {
          base64,
          name: item.file!.name,
          folder: "events",
          photoType: selectedPhotoType,
        });
      }
      const updated = await getEventById(uid!);
      setEvent(updated);
      setNewPhotoItems([]);
      setUploaderKey((k) => k + 1);
      sileo.success({ title: `${newItems.length} foto(s) subidas correctamente` });
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "Error al subir fotos" });
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // ── Eliminar foto existente ────────────────────────────────────────────────

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await removeEventPhoto(uid!, photoId);
      setEvent((prev) =>
        prev
          ? { ...prev, photos: prev.photos.filter((p) => p.photo.uid !== photoId) }
          : prev
      );
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "Error al eliminar foto" });
    }
  };

  // ── Guardar obras ──────────────────────────────────────────────────────────

  const handleSaveProducts = async () => {
    if (!requestingGroupId) { sileo.warning({ title: "No hay grupo seleccionado" }); return; }

    setIsLoadingProducts(true);
    try {
      await updateEventProducts(uid!, {
        productIds: selectedProducts,
        groupId: requestingGroupId,
      });
      sileo.success({ title: "Obras actualizadas", description: "El evento volvió a PENDIENTE para revisión." });
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "Error al actualizar obras" });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const toggleProduct = (productUid: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productUid)
        ? prev.filter((id) => id !== productUid)
        : [...prev, productUid]
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (isFetching) {
    return (
      <div className={styles.card}>
        <div className={styles.cardContent}>
          <p className={styles.loadingText}>Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.card}>
        <div className={styles.cardContent}>
          <p className={styles.loadingText}>Evento no encontrado.</p>
          <button className={styles.submitButton} onClick={() => navigate(-1)}>Volver</button>
        </div>
      </div>
    );
  }

  const heroPhotos  = event.photos.filter((p) => p.photoType === "HERO");
  const promoPhotos = event.photos.filter((p) => p.photoType === "PROMO");
  const memPhotos   = event.photos.filter((p) => p.photoType === "MEMORY");

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>

        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>Editar evento</h2>
            <p className={styles.pageSubtitle}>{event.name}</p>
          </div>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Volver
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {(["info", "photos", "products"] as const).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "info"     && "📝 Información"}
              {tab === "photos"   && "🖼️ Fotos"}
              {tab === "products" && "🎨 Obras"}
            </button>
          ))}
        </div>

        {/* ══ TAB: Información general ══ */}
        {activeTab === "info" && (
          <div className={styles.formGrid}>

            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre <span className={styles.required}>*</span></label>
                <input className={styles.formInput} value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nombre del evento" disabled={isLoadingInfo} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción <span className={styles.required}>*</span></label>
                <textarea className={styles.formTextarea} rows={4} value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe el evento" disabled={isLoadingInfo} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tipo de evento</label>
                <select className={styles.formInput} value={form.eventType}
                  onChange={(e) => setForm((p) => ({ ...p, eventType: e.target.value as EventType }))}
                  disabled={isLoadingInfo}>
                  {EVENT_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>¿Evento virtual?</label>
                <div className={styles.checkboxWrapper}>
                  <input type="checkbox" id="isVirtual" className={styles.checkbox}
                    checked={form.isVirtual}
                    onChange={(e) => setForm((p) => ({ ...p, isVirtual: e.target.checked }))}
                    disabled={isLoadingInfo} />
                  <label htmlFor="isVirtual">Sí, es virtual o híbrido</label>
                </div>
              </div>
            </div>

            <div className={styles.formColumn}>
              <div className={styles.inlineGroup}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha de inicio <span className={styles.required}>*</span></label>
                  <input type="date" className={styles.formInput} value={form.startDate}
                    onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                    disabled={isLoadingInfo} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Hora de inicio</label>
                  <input type="time" className={styles.formInput} value={form.startTime}
                    onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                    disabled={isLoadingInfo} />
                </div>
              </div>

              <div className={styles.inlineGroup}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha de fin</label>
                  <input type="date" className={styles.formInput} value={form.endDate}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                    disabled={isLoadingInfo} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Hora de fin</label>
                  <input type="time" className={styles.formInput} value={form.endTime}
                    onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                    disabled={isLoadingInfo} />
                </div>
              </div>

              {!form.isVirtual && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>URL de ubicación (Google Maps)</label>
                  <input className={styles.formInput} value={form.locationUrl}
                    onChange={(e) => setForm((p) => ({ ...p, locationUrl: e.target.value }))}
                    placeholder="https://maps.google.com/..." disabled={isLoadingInfo} />
                </div>
              )}

              {form.isVirtual && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Link de streaming <span className={styles.required}>*</span></label>
                  <input className={styles.formInput} value={form.streamingUrl}
                    onChange={(e) => setForm((p) => ({ ...p, streamingUrl: e.target.value }))}
                    placeholder="https://meet.google.com/..." disabled={isLoadingInfo} />
                </div>
              )}

              <div className={styles.warningBox}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                Guardar cambios devolverá el evento a estado <strong>PENDIENTE</strong> para revisión del administrador.
              </div>

              <button className={styles.submitButton} onClick={handleSaveInfo} disabled={isLoadingInfo}>
                {isLoadingInfo ? "Guardando..." : "Guardar información"}
              </button>
            </div>
          </div>
        )}

        {/* ══ TAB: Fotos ══ */}
        {activeTab === "photos" && (() => {
          const allPhotos = event.photos;
          const currentPhoto = allPhotos[carouselIndex] ?? null;
          const PHOTO_TYPE_LABELS: Record<string, string> = {
            HERO: "Portada", PROMO: "Promocional", MEMORY: "Recuerdo",
          };
          return (
            <div className={styles.photosTab}>

              {/* ── Carrusel grande ── */}
              {allPhotos.length > 0 ? (
                <div className={styles.carouselSection}>
                  {/* Imagen principal */}
                  <div className={styles.carouselMain}>
                    <img
                      key={currentPhoto?.photo.uid}
                      src={currentPhoto?.photo.url}
                      alt="foto evento"
                      className={styles.carouselMainImage}
                    />

                    {/* Overlay: tipo + botón eliminar */}
                    <div className={styles.carouselOverlay}>
                      <span className={styles.carouselTypeBadge}>
                        {PHOTO_TYPE_LABELS[currentPhoto?.photoType ?? ""] ?? currentPhoto?.photoType}
                      </span>
                      <button
                        className={styles.carouselDeleteBtn}
                        onClick={() => {
                          handleDeletePhoto(currentPhoto!.photo.uid);
                          setCarouselIndex((i) => Math.max(0, i - 1));
                        }}
                        title="Eliminar esta foto"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6" />
                          <path strokeLinecap="round" d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                        Eliminar
                      </button>
                    </div>

                    {/* Flechas de navegación */}
                    {allPhotos.length > 1 && (
                      <>
                        <button
                          className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
                          onClick={() => setCarouselIndex((i) => (i - 1 + allPhotos.length) % allPhotos.length)}
                          aria-label="Anterior"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>
                        <button
                          className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
                          onClick={() => setCarouselIndex((i) => (i + 1) % allPhotos.length)}
                          aria-label="Siguiente"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Contador */}
                    <div className={styles.carouselCounter}>
                      {carouselIndex + 1} / {allPhotos.length}
                    </div>
                  </div>

                  {/* Miniaturas */}
                  <div className={styles.carouselThumbs}>
                    {allPhotos.map((p, i) => (
                      <div
                        key={p.photo.uid}
                        className={`${styles.carouselThumb} ${i === carouselIndex ? styles.carouselThumbActive : ""}`}
                        onClick={() => setCarouselIndex(i)}
                        title={PHOTO_TYPE_LABELS[p.photoType] ?? p.photoType}
                      >
                        <img src={p.photo.url} alt={`foto-${i}`} className={styles.carouselThumbImg} />
                        <span className={styles.carouselThumbBadge}>
                          {p.photoType === "HERO" ? "⭐" : p.photoType === "PROMO" ? "📸" : "🎞️"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.noPhotosState}>
                  <span>📷</span>
                  <p>Aún no hay fotos en este evento</p>
                </div>
              )}

              {/* ── Subir nuevas fotos ── */}
              <div className={styles.uploadPhotosSection}>
                <div className={styles.uploadPhotosSectionHeader}>
                  <h3 className={styles.photoGroupTitle}>Agregar fotos</h3>
                  <div className={styles.formGroup} style={{ flex: "0 0 200px" }}>
                    <select className={styles.formInput} value={selectedPhotoType}
                      onChange={(e) => setSelectedPhotoType(e.target.value as EventPhotoType)}>
                      {PHOTO_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.imageUploaderContainer}>
                  <ImageUploader
                    key={uploaderKey}
                    onChange={setNewPhotoItems}
                    limit={10}
                    hideMainSelector
                  />
                </div>

                <button
                  className={styles.submitButton}
                  onClick={handleUploadPhotos}
                  disabled={isLoadingPhotos || newPhotoItems.filter((i) => !i.isExisting).length === 0}
                >
                  {isLoadingPhotos ? "Subiendo..." : "Subir fotos seleccionadas"}
                </button>
              </div>
            </div>
          );
        })()}

        {/* ══ TAB: Obras ══ */}
        {activeTab === "products" && (() => {
          const inEvent   = availableProducts.filter((p) => selectedProducts.includes(p.uid));
          const notInEvent = availableProducts
            .filter((p) => !selectedProducts.includes(p.uid))
            .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()));
          const allFiltered = availableProducts.filter((p) =>
            p.name.toLowerCase().includes(productSearch.toLowerCase())
          );

          return (
            <div className={styles.productsTab}>

              {/* Selector de grupo (multi-grupo) */}
              {event.groups.length > 1 && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Grupo</label>
                  <select className={styles.formInput} value={requestingGroupId}
                    onChange={async (e) => {
                      const gid = e.target.value;
                      setRequestingGroupId(gid);
                      try {
                        const prods = await getAvailableProducts(gid);
                        setAvailableProducts(prods);
                        setSelectedProducts([]);
                      } catch (err) {
                        sileo.error({ title: err instanceof Error ? err.message : "Error al cargar obras del grupo" });
                      }
                    }}>
                    {event.groups.map(({ group }) => (
                      <option key={group.uid} value={group.uid}>{group.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* ── Obras en el evento ── */}
              {inEvent.length > 0 && (
                <div className={styles.productsSection}>
                  <div className={styles.productsSectionHeader}>
                    <h3 className={styles.productsSectionTitle}>En el evento</h3>
                    <span className={styles.sectionCount}>{inEvent.length}</span>
                  </div>
                  <div className={styles.productsGrid}>
                    {inEvent.map((product) => {
                      const heroUrl = product.photos[0]?.photo.url ?? "";
                      const authors = product.authors
                        .filter((a) => a.isAuthor)
                        .map((a) => `${a.user.name} ${a.user.lastName}`)
                        .join(", ");
                      return (
                        <div
                          key={product.uid}
                          className={`${styles.productCard} ${styles.productCardSelected}`}
                          onClick={() => toggleProduct(product.uid)}
                          title="Click para quitar del evento"
                        >
                          <div className={styles.productCardImage}>
                            {heroUrl
                              ? <img src={heroUrl} alt={product.name} className={styles.productCardImg} />
                              : <div className={styles.productCardPlaceholder}>🎨</div>
                            }
                            <div className={styles.productCardCheck}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <div className={styles.productCardInfo}>
                            <p className={styles.productCardName}>{product.name}</p>
                            <p className={styles.productCardAuthor}>{authors}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Buscador ── */}
              <div className={styles.productsSectionHeader}>
                <h3 className={styles.productsSectionTitle}>
                  Obras disponibles
                  <span className={styles.sectionCount} style={{ marginLeft: 8 }}>
                    {availableProducts.length}
                  </span>
                </h3>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Buscar por nombre..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  {productSearch && (
                    <button className={styles.clearSearch} onClick={() => setProductSearch("")}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid de obras NO en el evento (filtradas por búsqueda) */}
              {availableProducts.length === 0 ? (
                <div className={styles.productsEmpty}>
                  <span>🎨</span>
                  <p>No hay obras APPROVED disponibles en este grupo</p>
                </div>
              ) : notInEvent.length > 0 ? (
                <div className={styles.productsGrid}>
                  {notInEvent.map((product) => {
                    const heroUrl = product.photos[0]?.photo.url ?? "";
                    const authors = product.authors
                      .filter((a) => a.isAuthor)
                      .map((a) => `${a.user.name} ${a.user.lastName}`)
                      .join(", ");
                    return (
                      <div
                        key={product.uid}
                        className={styles.productCard}
                        onClick={() => toggleProduct(product.uid)}
                        title="Click para agregar al evento"
                      >
                        <div className={styles.productCardImage}>
                          {heroUrl
                            ? <img src={heroUrl} alt={product.name} className={styles.productCardImg} />
                            : <div className={styles.productCardPlaceholder}>🎨</div>
                          }
                          <div className={styles.productCardAddIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
                              <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                        <div className={styles.productCardInfo}>
                          <p className={styles.productCardName}>{product.name}</p>
                          <p className={styles.productCardAuthor}>{authors}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : productSearch && allFiltered.length === 0 ? (
                <div className={styles.productsEmpty}>
                  <span>🔍</span>
                  <p>No se encontraron obras con ese nombre</p>
                </div>
              ) : (
                <div className={styles.productsEmpty}>
                  <span>✅</span>
                  <p>Todas las obras disponibles ya están en el evento</p>
                </div>
              )}

              <div className={styles.warningBox}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                Guardar devolverá el evento a <strong>PENDIENTE</strong> para revisión.
              </div>

              <button className={styles.submitButton} onClick={handleSaveProducts} disabled={isLoadingProducts}>
                {isLoadingProducts
                  ? "Guardando..."
                  : `Guardar obras (${selectedProducts.length} seleccionadas)`}
              </button>
            </div>
          );
        })()}

      </div>
    </div>
  );
}