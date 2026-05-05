import { useState, useEffect, useRef } from "react";
import ImageUploader from "../../../components/ImageUploader";
import type { ImageUploaderItem } from "../../../components/ImageUploader";
import { useAuth } from "../../../../context/AuthContext";
import { createEvent, getAvailableProducts, sendInvitation } from "../../../../services/events";
import { getAllGroups } from "../../../../services/groups";
import type {
  CreateEventDto,
  EventType,
  AvailableProduct,
} from "../../../../interfaces/events";
import type { GroupWithRelations } from "../../../../interfaces/groups";
import styles from "./CreateEvent.module.css";
import { sileo } from "sileo";

// ─── Constantes ───────────────────────────────────────────────────────────────

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "EXHIBITION", label: "Exposición" },
  { value: "WORKSHOP",   label: "Taller" },
  { value: "PERFORMANCE", label: "Presentación" },
  { value: "CONFERENCE", label: "Conferencia" },
  { value: "OTHER",      label: "Otro" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Tipo interno del formulario ──────────────────────────────────────────────

interface FormState {
  name: string;
  description: string;
  eventType: EventType;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  locationUrl: string;
  isVirtual: boolean;
  streamingUrl: string;
  productIds: string[];
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  eventType: "EXHIBITION",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  locationUrl: "",
  isVirtual: false,
  streamingUrl: "",
  productIds: [],
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CreateEvent() {
  const { user, currentGroup } = useAuth();

  const isAdmin = user?.userType?.name?.toLowerCase() === "administrador";

  // Formulario
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [imageItems, setImageItems] = useState<ImageUploaderItem[]>([]);

  // Grupo seleccionado para el evento
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    isAdmin ? "" : (currentGroup ?? ""),
  );
  const [allGroups, setAllGroups] = useState<GroupWithRelations[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // Obras disponibles
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([]);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  // Tipo de evento dropdown
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);

  // UI
  const [isLoading, setIsLoading] = useState(false);

  // ── Sincronizar selectedGroupId con currentGroup para profesores ──────────

  useEffect(() => {
    if (!isAdmin && currentGroup) {
      setSelectedGroupId(currentGroup);
    }
  }, [isAdmin, currentGroup]);

  // ── Cargar todos los grupos si es admin ───────────────────────────────────

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      setIsLoadingGroups(true);
      try {
        const data = await getAllGroups();
        setAllGroups(data);
      } catch {
        sileo.error({ title: "No se pudieron cargar los grupos" });
      } finally {
        setIsLoadingGroups(false);
      }
    };
    load();
  }, [isAdmin]);

  // ── Cerrar dropdowns al click fuera ───────────────────────────────────────

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setIsProductsOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Cargar obras disponibles cuando cambia el grupo seleccionado ──────────

  useEffect(() => {
    if (!selectedGroupId) {
      setAvailableProducts([]);
      return;
    }
    const load = async () => {
      setIsLoadingProducts(true);
      setForm((prev) => ({ ...prev, productIds: [] }));
      try {
        const data = await getAvailableProducts(selectedGroupId);
        setAvailableProducts(data);
      } catch {
        // silencioso — no es crítico para crear el evento
      } finally {
        setIsLoadingProducts(false);
      }
    };
    load();
  }, [selectedGroupId]);

  // ── Handlers de formulario ─────────────────────────────────────────────────

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleProduct = (uid: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(uid)
        ? prev.productIds.filter((id) => id !== uid)
        : [...prev.productIds, uid],
    }));
  };

  // ── Validación ────────────────────────────────────────────────────────────

  const validate = (): string | null => {
    if (!form.name.trim())        return "El nombre del evento es requerido.";
    if (!form.description.trim()) return "La descripción es requerida.";
    if (!form.startDate)          return "La fecha de inicio es requerida.";
    if (!selectedGroupId)         return "Debes seleccionar un grupo para el evento.";
    if (!user)                    return "No hay sesión activa.";
    if (form.isVirtual && !form.streamingUrl.trim())
      return "El link de streaming es requerido para eventos virtuales.";
    if (!form.isVirtual && !form.locationUrl.trim())
      return "El enlace de ubicación es requerido para eventos presenciales.";
    return null;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { sileo.warning({ title: validationError }); return; }

    setIsLoading(true);

    try {
      const toISO = (date: string, time: string) =>
        time ? `${date}T${time}:00.000Z` : `${date}T00:00:00.000Z`;

      const coverItem = imageItems.find((i) => i.isMain) ?? imageItems[0];
      let coverPhoto: CreateEventDto["coverPhoto"] | undefined;

      if (coverItem?.file) {
        const base64 = await fileToBase64(coverItem.file);
        coverPhoto = {
          base64,
          name: coverItem.file.name,
          folder: "events",
          photoType: "HERO",
        };
      }

      const payload: CreateEventDto = {
        name:        form.name.trim(),
        description: form.description.trim(),
        eventType:   form.eventType,
        startDate:   toISO(form.startDate, form.startTime),
        endDate:     form.endDate ? toISO(form.endDate, form.endTime) : undefined,
        locationUrl: !form.isVirtual ? form.locationUrl.trim() : undefined,
        isVirtual:   form.isVirtual,
        streamingUrl: form.isVirtual ? form.streamingUrl.trim() : undefined,
        createdById: user!.uid,
        // Admin creates without direct group association; invitation handles it.
        // Professor associates their group directly.
        groupIds:    isAdmin ? [] : [selectedGroupId],
        productIds:  form.productIds.length > 0 ? form.productIds : undefined,
        coverPhoto,
      };

      const { uid: newEventUid } = await createEvent(payload);

      // Admin flow: send invitation to the selected group
      if (isAdmin) {
        await sendInvitation(newEventUid, { groupId: selectedGroupId });
        sileo.success({
          title: "¡Evento creado!",
          description: "Se envió la invitación al grupo seleccionado.",
        });
      } else {
        sileo.success({
          title: "¡Evento creado!",
          description: "Está pendiente de aprobación.",
        });
      }

      setForm(EMPTY_FORM);
      setImageItems([]);
      setUploaderKey((k) => k + 1);
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "Error al crear el evento." });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const selectedTypeLabel =
    EVENT_TYPE_OPTIONS.find((o) => o.value === form.eventType)?.label ?? "Exposición";

  const selectedProductsLabel =
    form.productIds.length > 0
      ? `${form.productIds.length} obra${form.productIds.length !== 1 ? "s" : ""} seleccionada${form.productIds.length !== 1 ? "s" : ""}`
      : "Selecciona obras (opcional)";

  // Opciones de grupo para el selector
  const groupOptions: { uid: string; name: string }[] = isAdmin
    ? allGroups.map((g) => ({ uid: g.uid, name: g.name }))
    : (user?.groups ?? []);

  return (
    <div className={styles.uploadCard}>
      <div className={styles.uploadCardContent}>

        <div className={styles.uploadGrid}>

          {/* ══ Columna izquierda: imagen de portada ══ */}
          <div className={styles.uploadSection}>
            <h2 className={styles.sectionTitle}>Imagen de portada</h2>
            <p className={styles.sectionHint}>
              Esta será la foto HERO del evento. Puedes agregar fotos promocionales después desde el panel de gestión.
            </p>
            <div className={styles.imageUploaderContainer}>
              <ImageUploader
                key={uploaderKey}
                limit={1}
                onChange={setImageItems}
              />
            </div>
          </div>

          {/* ══ Columna derecha: formulario ══ */}
          <div className={styles.uploadForm}>

            {/* Nombre */}
            <div className={styles.formGroup}>
              <label htmlFor="ev-name" className={styles.formLabel}>
                Nombre del evento <span className={styles.required}>*</span>
              </label>
              <input
                id="ev-name"
                type="text"
                className={styles.formInput}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ej: Exposición Semestral 2025"
                disabled={isLoading}
              />
            </div>

            {/* Descripción */}
            <div className={styles.formGroup}>
              <label htmlFor="ev-desc" className={styles.formLabel}>
                Descripción <span className={styles.required}>*</span>
              </label>
              <textarea
                id="ev-desc"
                className={styles.formTextarea}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe el evento, su propósito y lo que los asistentes pueden esperar…"
                rows={4}
                disabled={isLoading}
              />
            </div>

            {/* Tipo de evento */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tipo de evento</label>
              <div className={styles.selectContainer} ref={typeRef}>
                <div
                  className={styles.selectTrigger}
                  onClick={() => !isLoading && setIsTypeOpen((v) => !v)}
                >
                  <span className={styles.selectValue}>{selectedTypeLabel}</span>
                  <svg
                    className={`${styles.selectIcon} ${isTypeOpen ? styles.rotate : ""}`}
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {isTypeOpen && (
                  <div className={styles.selectDropdown}>
                    {EVENT_TYPE_OPTIONS.map((opt) => (
                      <div
                        key={opt.value}
                        className={`${styles.selectOption} ${form.eventType === opt.value ? styles.selectOptionActive : ""}`}
                        onClick={() => { set("eventType", opt.value); setIsTypeOpen(false); }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selector de grupo */}
            <div className={styles.formGroup}>
              <label htmlFor="ev-group" className={styles.formLabel}>
                Grupo encargado <span className={styles.required}>*</span>
                {isAdmin && (
                  <span className={styles.optionalTag}>
                    se enviará invitación
                  </span>
                )}
              </label>
              <select
                id="ev-group"
                className={styles.formInput}
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                disabled={isLoading || isLoadingGroups}
              >
                {(isAdmin || groupOptions.length > 1) && (
                  <option value="">
                    {isLoadingGroups ? "Cargando grupos…" : "Selecciona un grupo"}
                  </option>
                )}
                {groupOptions.map((g) => (
                  <option key={g.uid} value={g.uid}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fechas */}
            <div className={styles.dateGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="ev-start-date" className={styles.formLabel}>
                  Fecha de inicio <span className={styles.required}>*</span>
                </label>
                <input
                  id="ev-start-date"
                  type="date"
                  className={styles.formInput}
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  min={todayISO()}
                  disabled={isLoading}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ev-start-time" className={styles.formLabel}>Hora de inicio</label>
                <input
                  id="ev-start-time"
                  type="time"
                  className={styles.formInput}
                  value={form.startTime}
                  onChange={(e) => set("startTime", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ev-end-date" className={styles.formLabel}>Fecha de fin</label>
                <input
                  id="ev-end-date"
                  type="date"
                  className={styles.formInput}
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                  min={form.startDate || todayISO()}
                  disabled={isLoading}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ev-end-time" className={styles.formLabel}>Hora de fin</label>
                <input
                  id="ev-end-time"
                  type="time"
                  className={styles.formInput}
                  value={form.endTime}
                  onChange={(e) => set("endTime", e.target.value)}
                  disabled={isLoading || !form.endDate}
                />
              </div>
            </div>

            {/* Toggle virtual / presencial */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Modalidad</label>
              <div className={styles.toggleRow}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${!form.isVirtual ? styles.toggleBtnActive : ""}`}
                  onClick={() => set("isVirtual", false)}
                  disabled={isLoading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Presencial
                </button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${form.isVirtual ? styles.toggleBtnActive : ""}`}
                  onClick={() => set("isVirtual", true)}
                  disabled={isLoading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.07A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8h12a2 2 0 012 2v4a2 2 0 01-2 2H3a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                  </svg>
                  Virtual
                </button>
              </div>
            </div>

            {/* URL de ubicación o streaming */}
            {!form.isVirtual ? (
              <div className={styles.formGroup}>
                <label htmlFor="ev-location" className={styles.formLabel}>
                  Enlace de Google Maps <span className={styles.required}>*</span>
                </label>
                <input
                  id="ev-location"
                  type="url"
                  className={styles.formInput}
                  value={form.locationUrl}
                  onChange={(e) => set("locationUrl", e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div className={styles.formGroup}>
                <label htmlFor="ev-stream" className={styles.formLabel}>
                  Link de streaming <span className={styles.required}>*</span>
                </label>
                <input
                  id="ev-stream"
                  type="url"
                  className={styles.formInput}
                  value={form.streamingUrl}
                  onChange={(e) => set("streamingUrl", e.target.value)}
                  placeholder="https://meet.google.com/..."
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Obras del grupo (opcional) */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Obras a exhibir
                <span className={styles.optionalTag}>opcional</span>
              </label>
              <div className={styles.selectContainer} ref={productsRef}>
                <div
                  className={styles.selectTrigger}
                  onClick={() => !isLoading && !isLoadingProducts && selectedGroupId && setIsProductsOpen((v) => !v)}
                >
                  <span className={styles.selectValue}>
                    {!selectedGroupId
                      ? "Selecciona un grupo primero"
                      : isLoadingProducts
                        ? "Cargando obras…"
                        : selectedProductsLabel}
                  </span>
                  <svg
                    className={`${styles.selectIcon} ${isProductsOpen ? styles.rotate : ""}`}
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {isProductsOpen && (
                  <div className={styles.selectDropdown}>
                    {availableProducts.length > 0 ? (
                      availableProducts.map((product) => {
                        const heroUrl = product.photos[0]?.photo.url ?? null;
                        const isSelected = form.productIds.includes(product.uid);

                        return (
                          <div
                            key={product.uid}
                            className={styles.productOption}
                            onClick={() => toggleProduct(product.uid)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className={styles.checkbox}
                            />
                            {heroUrl && (
                              <img
                                src={heroUrl}
                                alt={product.name}
                                className={styles.productThumb}
                              />
                            )}
                            <span className={styles.productName}>{product.name}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.selectOptionEmpty}>
                        No hay obras aprobadas en este grupo
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tags de obras seleccionadas */}
              {form.productIds.length > 0 && (
                <div className={styles.selectedTags}>
                  {form.productIds.map((pid) => {
                    const product = availableProducts.find((p) => p.uid === pid);
                    if (!product) return null;
                    return (
                      <span key={pid} className={styles.tag}>
                        {product.name}
                        <button
                          type="button"
                          className={styles.tagRemove}
                          onClick={() => toggleProduct(pid)}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Creando evento…" : "Crear evento"}
            </button>

            <p className={styles.submitHint}>
              {isAdmin
                ? "El grupo recibirá una invitación para participar en el evento."
                : "El evento quedará en estado "}
              {!isAdmin && <strong>Pendiente</strong>}
              {!isAdmin && " hasta que un administrador lo apruebe."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
