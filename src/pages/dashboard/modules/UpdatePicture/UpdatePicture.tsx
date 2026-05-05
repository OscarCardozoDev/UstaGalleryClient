import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ImageUploader from "../../../components/ImageUploader";
import { useAuth } from "../../../../context/AuthContext";
import { getStudentsByGroup } from "../../../../services/groups";
import { getAllStylesByGroup } from "../../../../services/styles";
import { getProductById, updateProduct } from "../../../../services/products";
import type { UpdateProductDto, UpdateProductImageDto } from "../../../../interfaces/products";
import type { GroupStudent } from "../../../../interfaces/groups";
import type { Style } from "../../../../interfaces/styles";
import { sileo } from "sileo";
import styles from "./UpdatePictures.module.css";

export default function EditProduct() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { user, currentGroup } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL; 

  // ── Estados de datos ──────────────────────────────────────────────────────
  const [availableStyles, setAvailableStyles] = useState<Style[]>([]);
  const [students, setStudents] = useState<GroupStudent[]>([]);
  const [imageItems, setImageItems] = useState<UpdateProductImageDto[]>([]);
  const [existingImages, setExistingImages] = useState<{ uid: string; url: string; isMain: boolean }[]>([]);

  // ── Estados de UI ─────────────────────────────────────────────────────────
  const [isStylesOpen, setIsStylesOpen] = useState(false);
  const [isAuthorsOpen, setIsAuthorsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "",
    description: "",
    madeAt: "",
    price: "",
    styles: [] as string[],
    authors: [] as string[],
    isSold: false,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CARGA INICIAL
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!currentGroup || !uid) return;

    const loadAll = async () => {
      setIsFetching(true);
      try {
        const [product, stylesData, groupStudents] = await Promise.all([
          getProductById(uid),
          getAllStylesByGroup("ARTES").catch(() => {
            const stored = localStorage.getItem("styles");
            return stored ? (JSON.parse(stored) as Style[]) : [];
          }),
          getStudentsByGroup(currentGroup).catch(() =>
            user
              ? [{ user: { uid: user.uid, name: user.name, lastName: user.lastName } }]
              : []
          ),
        ]);

        setAvailableStyles(stylesData);
        setStudents(groupStudents);

        setForm({
          name: product.name ?? "",
          description: product.description ?? "",
          madeAt: product.madeAt ? product.madeAt.split("T")[0] : "",
          price: product.price != null ? String(product.price) : "",
          styles: product.styles?.map((s: any) => s.styleId ?? s.uid ?? s) ?? [],
          authors: product.authors?.map((a: any) => a.userId ?? a.user?.uid ?? a) ?? [],
          isSold: product.isSold ?? false,
        });

        // Guardar imágenes existentes con uid para pasarlas al uploader
        const imgs = product.photos?.map((p: any) => ({
          uid: p.photo?.uid ?? p.uid,
          url: `${BASE_URL}${p.photo?.url ?? p.url}`, 
          isMain: p.isMain ?? false,
        })) ?? [];
        setExistingImages(imgs);

      } catch (err) {
        console.error("Error al cargar el producto:", err);
        sileo.error({ title: "No se pudo cargar la información de la obra" });
      } finally {
        setIsFetching(false);
      }
    };

    loadAll();
  }, [uid, currentGroup, user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleInputChange = (
    field: keyof typeof form,
    value: string | string[] | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleStyle = (styleUid: string) => {
    setForm((prev) => ({
      ...prev,
      styles: prev.styles.includes(styleUid)
        ? prev.styles.filter((s) => s !== styleUid)
        : [...prev.styles, styleUid],
    }));
  };

  const toggleAuthor = (authorId: string) => {
    if (user && authorId === user.uid) return;
    setForm((prev) => ({
      ...prev,
      authors: prev.authors.includes(authorId)
        ? prev.authors.filter((id) => id !== authorId)
        : [...prev.authors, authorId],
    }));
  };

  const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "El nombre es requerido";
    if (!form.description.trim()) return "La descripción es requerida";
    if (!form.madeAt) return "La fecha de creación es requerida";
    if (!currentGroup) return "No se ha seleccionado un grupo";
    if (form.authors.length === 0) return "Debes tener al menos un autor";
    if (imageItems.length === 0 && existingImages.length === 0) return "Debes tener al menos una imagen";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      sileo.warning({ title: validationError });
      return;
    }

    setIsLoading(true);

    try {
      // Construir images[] para el backend
      const imagesPayload = await Promise.all(
        imageItems.map(async (item) => {
          if (item.isExisting) {
            return {
              uid: item.uid,
              isMain: item.isMain,
              isExisting: true as const,
            };
          }
          const base64 = await convertFileToBase64(item.file!);
          return {
            base64,
            name: item.file!.name,
            folder: "products",
            isMain: item.isMain,
            isExisting: false as const,
          };
        })
      );
      const payload: UpdateProductDto = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price ? parseFloat(form.price) : undefined,
        madeAt: form.madeAt,
        isSold: form.isSold,
        authors: form.authors.map((userId) => ({
          userId,
          isAuthor: true,
        })),
        styles: form.styles.length > 0 ? form.styles : undefined,
        images: imagesPayload as UpdateProductDto["images"],
      };
      await updateProduct(uid!, payload);
      sileo.success({ title: "¡Obra actualizada exitosamente!" });
      navigate("/dashboard/your-gallery");
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      sileo.error({ title: err instanceof Error ? err.message : "Error al actualizar la obra" });
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════════

  if (isFetching) {
    return (
      <div className={styles.uploadCard}>
        <div className={styles.uploadCardContent}>
          <p style={{ textAlign: "center", color: "#666", padding: "64px 0", fontSize: "16px" }}>
            Cargando información de la obra...
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className={styles.uploadCard}>
      <div className={styles.uploadCardContent}>
        <h2 className={styles.uploadTitle}>Editar obra</h2>

        <div className={styles.uploadGrid}>

          {/* ── COLUMNA IZQUIERDA: Imágenes ── */}
          <div className={styles.uploadSection}>
            <p className={styles.sectionTitle}>Imágenes</p>
            <div className={styles.imageUploaderContainer}>
              <ImageUploader
                existingImages={existingImages}
                onChange={setImageItems}
              />
            </div>
          </div>

          {/* ── COLUMNA DERECHA: Formulario ── */}
          <div className={styles.uploadForm}>

            {/* Nombre */}
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Nombre <span className={styles.required}>*</span>
              </label>
              <input
                id="name"
                type="text"
                className={styles.formInput}
                value={form.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nombre de la obra"
                disabled={isLoading}
              />
            </div>

            {/* Descripción */}
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.formLabel}>
                Descripción <span className={styles.required}>*</span>
              </label>
              <textarea
                id="description"
                className={styles.formTextarea}
                value={form.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe tu obra"
                rows={4}
                disabled={isLoading}
              />
            </div>

            {/* Fecha */}
            <div className={styles.formGroup}>
              <label htmlFor="madeAt" className={styles.formLabel}>
                Fecha de creación <span className={styles.required}>*</span>
              </label>
              <input
                id="madeAt"
                type="date"
                className={styles.formInput}
                value={form.madeAt}
                onChange={(e) => handleInputChange("madeAt", e.target.value)}
                disabled={isLoading}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Estilos */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Estilos</label>
              <div className={styles.selectContainer}>
                <div
                  className={styles.selectTrigger}
                  onClick={() => !isLoading && setIsStylesOpen(!isStylesOpen)}
                >
                  <span className={styles.selectValue}>
                    {form.styles.length > 0
                      ? availableStyles
                          .filter((s) => form.styles.includes(s.uid))
                          .map((s) => s.name)
                          .join(", ")
                      : "Selecciona estilos"}
                  </span>
                  <svg
                    className={`${styles.selectIcon} ${isStylesOpen ? styles.rotate : ""}`}
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {isStylesOpen && (
                  <div className={styles.selectDropdown}>
                    {availableStyles.length > 0 ? (
                      availableStyles.map((style) => (
                        <div
                          key={style.uid}
                          className={styles.selectOption}
                          onClick={() => toggleStyle(style.uid)}
                        >
                          <div className={styles.checkboxWrapper}>
                            <input
                              type="checkbox"
                              checked={form.styles.includes(style.uid)}
                              readOnly
                              className={styles.checkbox}
                            />
                            <span>{style.name}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.selectOptionEmpty}>No hay estilos disponibles</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Autores */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Autores <span className={styles.required}>*</span>
              </label>
              <div className={styles.selectContainer}>
                <div
                  className={styles.selectTrigger}
                  onClick={() => !isLoading && setIsAuthorsOpen(!isAuthorsOpen)}
                >
                  <span className={styles.selectValue}>
                    {form.authors.length > 0
                      ? `${form.authors.length} autor(es) seleccionado(s)`
                      : "Selecciona autores"}
                  </span>
                  <svg
                    className={`${styles.selectIcon} ${isAuthorsOpen ? styles.rotate : ""}`}
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {isAuthorsOpen && (
                  <div className={styles.selectDropdown}>
                    {students.length > 0 ? (
                      students.map((student) => {
                        const isCurrentUser = user && student.user.uid === user.uid;
                        const isSelected = form.authors.includes(student.user.uid);
                        return (
                          <div
                            key={student.user.uid}
                            className={`${styles.selectOption} ${isCurrentUser ? styles.disabled : ""}`}
                            onClick={() => toggleAuthor(student.user.uid)}
                          >
                            <div className={styles.checkboxWrapper}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className={styles.checkbox}
                                disabled={!!isCurrentUser}
                              />
                              <span>
                                {student.user.name} {student.user.lastName}
                                {isCurrentUser && " (Tú)"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.selectOptionEmpty}>No hay estudiantes disponibles</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Precio */}
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.formLabel}>
                Precio (opcional)
              </label>
              <input
                id="price"
                type="number"
                className={styles.formInput}
                value={form.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </div>

            {/* Vendida */}
            <div className={styles.formGroup}>
              <div className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  id="isSold"
                  className={styles.checkbox}
                  checked={form.isSold}
                  onChange={(e) => handleInputChange("isSold", e.target.checked)}
                  disabled={isLoading}
                />
                <label htmlFor="isSold" style={{ fontSize: "15px", color: "#1a1a1a", cursor: "pointer" }}>
                  Marcar como vendida
                </label>
              </div>
            </div>

            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}