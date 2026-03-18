import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ImageUploader from "../../../components/ImageUploader";
import { useAuth } from "../../../../context/AuthContext";
import { getStudentsByGroup } from "../../../../services/groups";
import { getAllStylesByGroup } from "../../../../services/styles";
import { getProductById, updateProduct } from "../../../../services/products";
import type { UpdateProductDto } from "../../../../interfaces/products";
import type { GroupStudent } from "../../../../interfaces/groups";
import type { Style } from "../../../../interfaces/styles";
import styles from "./UpdatePictures.module.css";

export default function EditProduct() {
  const { uid } = useParams<{ uid: string }>();
  const { user, currentGroup } = useAuth();

  // Estados de datos
  const [availableStyles, setAvailableStyles] = useState<Style[]>([]);
  const [students, setStudents] = useState<GroupStudent[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string; isMain: boolean }[]>([]);
  const [mainExistingIndex, setMainExistingIndex] = useState(0);
  const [replaceImages, setReplaceImages] = useState(false);

  // Estados de UI
  const [isStylesOpen, setIsStylesOpen] = useState(false);
  const [isAuthorsOpen, setIsAuthorsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);

  // Estado del formulario
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
          getAllStylesByGroup(currentGroup).catch(() => {
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

        // Pre-popular formulario con datos del producto
        setForm({
          name: product.name ?? "",
          description: product.description ?? "",
          madeAt: product.madeAt ? product.madeAt.split("T")[0] : "",
          price: product.price != null ? String(product.price) : "",
          styles: product.styles?.map((s: any) => s.uid ?? s) ?? [],
          authors: product.authors?.map((a: any) => a.userId ?? a.user?.uid ?? a) ?? [],
          isSold: product.isSold ?? false,
        });

        // Guardar imágenes existentes
        const imgs = product.images?.map((img: any) => ({
          url: img.url ?? img,
          isMain: img.isMain ?? false,
        })) ?? [];
        setExistingImages(imgs);
        const mainIdx = imgs.findIndex((i: { isMain: boolean }) => i.isMain);
        setMainExistingIndex(mainIdx >= 0 ? mainIdx : 0);
      } catch (err) {
        console.error("Error al cargar el producto:", err);
        setError("No se pudo cargar la información de la obra");
      } finally {
        setIsFetching(false);
      }
    };

    loadAll();
  }, [uid, currentGroup, user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleImages = (files: File[]) => setImageFiles(files);

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

  const convertFilesToBase64 = async (
    files: File[]
  ): Promise<{ base64: string; name: string }[]> => {
    return Promise.all(
      files.map(
        (file) =>
          new Promise<{ base64: string; name: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(",")[1];
              resolve({ base64, name: file.name });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "El nombre es requerido";
    if (!form.description.trim()) return "La descripción es requerida";
    if (!form.madeAt) return "La fecha de creación es requerida";
    if (!currentGroup) return "No se ha seleccionado un grupo";
    if (form.authors.length === 0) return "Debes tener al menos un autor";
    if (replaceImages && imageFiles.length === 0)
      return "Debes agregar al menos una imagen nueva";
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const payload: UpdateProductDto = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price ? parseFloat(form.price) : undefined,
        madeAt: form.madeAt,
        isSold: form.isSold,
        authors: form.authors.map((userId) => ({
          userId,
          isAuthor: userId === user?.uid,
        })),
        styles: form.styles.length > 0 ? form.styles : undefined,
      };

      if (replaceImages && imageFiles.length > 0) {
        const imagesBase64 = await convertFilesToBase64(imageFiles);
        (payload as any).images = imagesBase64.map((img, index) => ({
          base64: img.base64,
          name: img.name,
          folder: "products",
          isMain: index === 0,
        }));
      }

      await updateProduct(uid!, payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      setError(err instanceof Error ? err.message : "Error al actualizar la obra");
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

        {error && <div className={styles.errorMessage}>❌ {error}</div>}
        {success && (
          <div className={styles.successMessage}>✅ ¡Obra actualizada exitosamente!</div>
        )}

        <div className={styles.uploadGrid}>

          {/* ── COLUMNA IZQUIERDA: Imágenes ── */}
          <div className={styles.uploadSection}>
            <p className={styles.sectionTitle}>Imágenes</p>

            {/* Visor de imágenes existentes */}
            {!replaceImages && existingImages.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>

                {/* Imagen principal grande */}
                <div style={{
                  flex: 1,
                  borderRadius: "12px",
                  overflow: "hidden",
                  backgroundColor: "#000",
                  position: "relative",
                  minHeight: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <img
                    src={existingImages[mainExistingIndex]?.url}
                    alt="imagen-principal"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "#ffd700",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffd700" stroke="#ffd700" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Imagen principal
                  </div>
                </div>

                {/* Miniaturas */}
                {existingImages.length > 1 && (
                  <div style={{
                    display: "flex",
                    gap: "12px",
                    overflowX: "auto",
                    paddingBottom: "4px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#171717 #f0f0f0",
                  }}>
                    {existingImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setMainExistingIndex(i)}
                        onMouseEnter={() => setHoveredImg(i)}
                        onMouseLeave={() => setHoveredImg(null)}
                        style={{
                          position: "relative",
                          minWidth: "100px",
                          width: "100px",
                          height: "100px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          cursor: "pointer",
                          flexShrink: 0,
                          boxShadow: mainExistingIndex === i
                            ? "0 0 0 3px #171717"
                            : "0 2px 8px rgba(0,0,0,0.1)",
                          transform: hoveredImg === i ? "translateY(-4px)" : "translateY(0)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <img
                          src={img.url}
                          alt={`miniatura-${i}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {/* Botón estrella */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setMainExistingIndex(i); }}
                          style={{
                            position: "absolute",
                            top: "6px",
                            left: "6px",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            border: "none",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2,
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24"
                            fill={mainExistingIndex === i ? "#ffd700" : "none"}
                            stroke={mainExistingIndex === i ? "#ffd700" : "white"}
                            strokeWidth="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Toggle reemplazar imágenes */}
            <div className={styles.checkboxWrapper} style={{ marginTop: "16px" }}>
              <input
                type="checkbox"
                id="replaceImages"
                className={styles.checkbox}
                checked={replaceImages}
                onChange={(e) => {
                  setReplaceImages(e.target.checked);
                  if (!e.target.checked) {
                    setImageFiles([]);
                    setUploaderKey((k) => k + 1);
                  }
                }}
                disabled={isLoading}
              />
              <label htmlFor="replaceImages" style={{ fontSize: "15px", color: "#1a1a1a", cursor: "pointer" }}>
                Reemplazar imágenes actuales
              </label>
            </div>

            {/* Uploader — solo si se quieren reemplazar */}
            {replaceImages && (
              <div className={styles.imageUploaderContainer} style={{ marginTop: "12px" }}>
                <ImageUploader key={uploaderKey} onChange={handleImages} />
              </div>
            )}
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

            {/* Select de estilos */}
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

            {/* Select de autores */}
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