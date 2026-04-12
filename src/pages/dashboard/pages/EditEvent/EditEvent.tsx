import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]           = useState<"info" | "photos" | "products">("info");
  const [isLoadingInfo, setIsLoadingInfo]   = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [success, setSuccess]               = useState<string | null>(null);

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
        setError("No se pudo cargar el evento");
      } finally {
        setIsFetching(false);
      }
    };

    load();
  }, [uid]);

  // ── Guardar info general ───────────────────────────────────────────────────

  const handleSaveInfo = async () => {
    setError(null);
    setSuccess(null);

    if (!form.name.trim())        return setError("El nombre es requerido");
    if (!form.description.trim()) return setError("La descripción es requerida");
    if (!form.startDate)          return setError("La fecha de inicio es requerida");
    if (form.isVirtual && !form.streamingUrl.trim())
      return setError("El link de streaming es requerido para eventos virtuales");

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
      setSuccess("ℹ️ Información actualizada. El evento volvió a estado PENDIENTE para revisión del admin.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsLoadingInfo(false);
    }
  };

  // ── Subir fotos ────────────────────────────────────────────────────────────

  const handleUploadPhotos = async () => {
    setError(null);
    setSuccess(null);

    const newItems = newPhotoItems.filter((i) => !i.isExisting && i.file);
    if (newItems.length === 0) return setError("Selecciona al menos una foto para subir");

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

      // Recargar evento para mostrar fotos actualizadas
      const updated = await getEventById(uid!);
      setEvent(updated);

      // Limpiar uploader
      setNewPhotoItems([]);
      setUploaderKey((k) => k + 1);
      setSuccess(`✅ ${newItems.length} foto(s) subida(s) correctamente.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir fotos");
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // ── Eliminar foto existente ────────────────────────────────────────────────

  const handleDeletePhoto = async (photoId: string) => {
    setError(null);
    try {
      await removeEventPhoto(uid!, photoId);
      setEvent((prev) =>
        prev
          ? { ...prev, photos: prev.photos.filter((p) => p.photo.uid !== photoId) }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar foto");
    }
  };

  // ── Guardar obras ──────────────────────────────────────────────────────────

  const handleSaveProducts = async () => {
    setError(null);
    setSuccess(null);
    if (!requestingGroupId) return setError("No hay grupo seleccionado");

    setIsLoadingProducts(true);
    try {
      await updateEventProducts(uid!, {
        productIds: selectedProducts,
        groupId: requestingGroupId,
      });
      setSuccess("✅ Obras actualizadas. El evento volvió a PENDIENTE.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar obras");
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

        {/* Feedback */}
        {error   && <div className={styles.errorMessage}>❌ {error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        {/* Tabs */}
        <div className={styles.tabs}>
          {(["info", "photos", "products"] as const).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => { setActiveTab(tab); setError(null); setSuccess(null); }}
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
        {activeTab === "photos" && (
          <div className={styles.photosTab}>

            {/* Fotos existentes por tipo */}
            {[
              { type: "HERO" as const,   label: "Portada", list: heroPhotos },
              { type: "PROMO" as const,  label: "Promocionales", list: promoPhotos },
              { type: "MEMORY" as const, label: "Recuerdo", list: memPhotos },
            ].map(({ type, label, list }) =>
              list.length > 0 ? (
                <div key={type} className={styles.photoGroup}>
                  <div className={styles.photoGroupHeader}>
                    <h3 className={styles.photoGroupTitle}>{label}</h3>
                    <span className={styles.sectionCount}>{list.length}</span>
                  </div>
                  <div className={styles.photoGrid}>
                    {list.map((p) => (
                      <div key={p.photo.uid} className={styles.photoItem}>
                        <img src={p.photo.url} alt="foto" className={styles.photoThumb} />
                        <button
                          className={styles.deletePhotoBtn}
                          onClick={() => handleDeletePhoto(p.photo.uid)}
                          title="Eliminar foto"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                          </svg>
                        </button>
                        {type === "HERO" && (
                          <span className={styles.heroBadge}>HERO</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}

            {/* Subir nuevas fotos */}
            <div className={styles.uploadPhotosSection}>
              <h3 className={styles.photoGroupTitle}>Agregar fotos</h3>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tipo de foto</label>
                <select className={styles.formInput} value={selectedPhotoType}
                  onChange={(e) => setSelectedPhotoType(e.target.value as EventPhotoType)}>
                  {PHOTO_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
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
        )}

        {/* ══ TAB: Obras ══ */}
        {activeTab === "products" && (
          <div className={styles.productsTab}>

            {/* Selector de grupo */}
            {event.groups.length > 1 && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Grupo (gestionar obras de)</label>
                <select className={styles.formInput} value={requestingGroupId}
                  onChange={async (e) => {
                    const gid = e.target.value;
                    setRequestingGroupId(gid);
                    const prods = await getAvailableProducts(gid);
                    setAvailableProducts(prods);
                  }}>
                  {event.groups.map(({ group }) => (
                    <option key={group.uid} value={group.uid}>{group.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.productsInfo}>
              <span>{selectedProducts.length} obra(s) seleccionada(s)</span>
            </div>

            {/* Selector personalizado de obras */}
            <div className={styles.selectContainer}>
              <div
                className={styles.selectTrigger}
                onClick={() => setIsProductsOpen(!isProductsOpen)}
              >
                <span className={styles.selectValue}>
                  {selectedProducts.length > 0
                    ? `${selectedProducts.length} obra(s) seleccionada(s)`
                    : "Selecciona las obras para este evento"}
                </span>
                <svg className={`${styles.selectIcon} ${isProductsOpen ? styles.rotate : ""}`}
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {isProductsOpen && (
                <div className={styles.selectDropdown}>
                  {availableProducts.length > 0 ? (
                    availableProducts.map((product) => {
                      const heroUrl = product.photos[0]?.photo.url ?? "";
                      const isSelected = selectedProducts.includes(product.uid);
                      return (
                        <div
                          key={product.uid}
                          className={styles.productOption}
                          onClick={() => toggleProduct(product.uid)}
                        >
                          {heroUrl && (
                            <img src={heroUrl} alt={product.name} className={styles.productOptionImg} />
                          )}
                          <div className={styles.productOptionInfo}>
                            <span className={styles.productOptionName}>{product.name}</span>
                            <span className={styles.productOptionAuthor}>
                              {product.authors.filter((a) => a.isAuthor).map((a) => `${a.user.name} ${a.user.lastName}`).join(", ")}
                            </span>
                          </div>
                          <input type="checkbox" checked={isSelected} readOnly
                            className={styles.checkbox} />
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.selectOptionEmpty}>
                      No hay obras APPROVED disponibles en este grupo
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.warningBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              Actualizar las obras también devolverá el evento a <strong>PENDIENTE</strong>.
            </div>

            <button className={styles.submitButton} onClick={handleSaveProducts} disabled={isLoadingProducts}>
              {isLoadingProducts ? "Guardando..." : "Guardar obras"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
