import { useState, useEffect } from "react";
import ImageUploader from "../../../components/ImageUploader";
import { useAuth } from "../../../../context/AuthContext";
import { getStudentsByGroup } from "../../../../services/groups";
import { getAllStylesByGroup } from "../../../../services/styles";
import { createProduct } from "../../../../services/products";
import type { CreateProductDto } from "../../../../interfaces/products";
import type { GroupStudent } from "../../../../interfaces/groups";
import type { Style } from "../../../../interfaces/styles";
import styles from "./UploadPictures.module.css";

export default function UploadPictures() {
  const { user, currentGroup } = useAuth();

  // Estados de datos
  const [availableStyles, setAvailableStyles] = useState<Style[]>([]);
  const [students, setStudents] = useState<GroupStudent[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Estados de UI
  const [isStylesOpen, setIsStylesOpen] = useState(false);
  const [isAuthorsOpen, setIsAuthorsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Estado del formulario
  // Agrega un estado para la key
  const [uploaderKey, setUploaderKey] = useState(0);
  const [form, setForm] = useState({
    name: "",
    description: "",
    madeAt: "",
    price: "",
    styles: [] as string[],
    authors: [] as string[],
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EFECTOS DE CARGA INICIAL
  // ═══════════════════════════════════════════════════════════════════════════

  // Cargar usuario actual
  useEffect(() => {
    if (!currentGroup) return;

    const loadCurrentUser = async () => {
      try {
        setForm((prev) => ({
          ...prev,
          authors: user?.uid ? [user.uid] : [],
        }));
      } catch (err) {
        console.error("Error al cargar usuario actual:", err);
        setError("No se pudo cargar tu información de usuario");
      }
    };

    const loadStyles = async () => {
      try {
        const stylesData = await getAllStylesByGroup(currentGroup);
        setAvailableStyles(stylesData);
      } catch (err) {
        console.error("Error al cargar estilos:", err);
        // No es crítico, usar estilos del localStorage como fallback
        const storedStyles = localStorage.getItem("styles");
        if (storedStyles) {
          setAvailableStyles(JSON.parse(storedStyles));
        }
      }
    };

  const loadStudents = async () => {
    try {
      const groupStudents = await getStudentsByGroup(currentGroup);
      setStudents(groupStudents);
    } catch (err) {
      console.error("Error al cargar estudiantes del grupo:", err);
      if (user) {
        // El fallback también debe seguir la estructura GroupStudent
        setStudents([
          {
            user: {
              uid: user.uid,
              name: user.name,
              lastName: user.lastName,
            },
          },
        ]);
      }
    }
  };

    loadCurrentUser();
    loadStyles();
    loadStudents();
  }, [currentGroup, user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleImages = (files: File[]) => {
    setImageFiles(files);
  };

  const handleInputChange = (
    field: keyof typeof form,
    value: string | string[],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleStyle = (style: string) => {
    setForm((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }));
  };

  const toggleAuthor = (authorId: string) => {
    // No permitir eliminar al usuario actual
    if (user && authorId === user.uid) return;

    setForm((prev) => ({
      ...prev,
      authors: prev.authors.includes(authorId)
        ? prev.authors.filter((id) => id !== authorId)
        : [...prev.authors, authorId],
    }));
  };

  const convertFilesToBase64 = async (
    files: File[],
  ): Promise<{ base64: string; name: string }[]> => {
    const promises = files.map((file) => {
      return new Promise<{ base64: string; name: string }>(
        (resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve({ base64, name: file.name });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        },
      );
    });

    return Promise.all(promises);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) {
      return "El nombre es requerido";
    }
    if (!form.description.trim()) {
      return "La descripción es requerida";
    }
    if (!form.madeAt) {
      return "La fecha de creación es requerida";
    }
    if (!currentGroup) {
      return "No se ha seleccionado un grupo";
    }
    if (imageFiles.length === 0) {
      return "Debes agregar al menos una imagen";
    }
    if (form.authors.length === 0) {
      return "Debes tener al menos un autor";
    }
    return null;
  };

  const handleSubmit = async () => {
    // Resetear estados
    setError(null);
    setSuccess(false);

    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Convertir imágenes a base64
      const imagesBase64 = await convertFilesToBase64(imageFiles);

      if (!currentGroup) {
        setError("No se ha seleccionado un grupo");
        return;
      }

      // Construir payload
      const payload: CreateProductDto = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price ? parseFloat(form.price) : undefined,
        madeAt: form.madeAt,
        isSold: false,
        groupId: currentGroup,
        authors: form.authors.map((userId) => ({
          userId,
          isAuthor: userId === user?.uid,
        })),
        styles: form.styles.length > 0 ? form.styles : undefined,
        images: imagesBase64.map((img, index) => ({
          base64: img.base64,
          name: img.name,
          folder: "products",
          isMain: index === 0,
        })),
      };
      
      // Enviar al backend
      await createProduct(payload);

      // Éxito
      setSuccess(true);

      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        setForm({
          name: "",
          description: "",
          madeAt: "",
          price: "",
          styles: [],
          authors: user ? [user.uid] : [],
        });
        setImageFiles([]);
        setSuccess(false);
        setUploaderKey(prev => prev + 1);
      }, 2000);
    } catch (err) {
      console.error("Error al crear producto:", err);
      setError(err instanceof Error ? err.message : "Error al guardar la obra");
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className={styles.uploadCard}>
      <div className={styles.uploadCardContent}>
        {/* Mensajes de feedback */}
        {error && <div className={styles.errorMessage}>❌ {error}</div>}

        {success && (
          <div className={styles.successMessage}>
            ✅ ¡Obra guardada exitosamente!
          </div>
        )}

        <div className={styles.uploadGrid}>
          {/* PREVIEW / IMAGEN */}
          <div className={styles.uploadSection}>
            <div className={styles.imageUploaderContainer}>
              <ImageUploader key={uploaderKey} onChange={handleImages} />
            </div>
          </div>

          {/* FORMULARIO */}
          <div className={styles.uploadForm}>
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

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.formLabel}>
                Descripción <span className={styles.required}>*</span>
              </label>
              <textarea
                id="description"
                className={styles.formTextarea}
                value={form.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe tu obra"
                rows={4}
                disabled={isLoading}
              />
            </div>

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

            {/* SELECT DE ESTILOS */}
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
                          .filter((s) => form.styles.includes(s.uid))  // filtra los seleccionados
                          .map((s) => s.name)                           // muestra sus nombres
                          .join(", ")
                      : "Selecciona estilos"}
                  </span>
                  <svg
                    className={`${styles.selectIcon} ${isStylesOpen ? styles.rotate : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {isStylesOpen && (
                  <div className={styles.selectDropdown}>
                    {availableStyles.length > 0 ? (
                      availableStyles.map((style) => (
                        <div
                          key={style.name}
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
                      <div className={styles.selectOptionEmpty}>
                        No hay estilos disponibles
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SELECT DE AUTORES */}
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
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {isAuthorsOpen && (
                  <div className={styles.selectDropdown}>
                    {students.length > 0 ? (
                      students.map((student) => {
                        const isCurrentUserStudent =
                          user && student.user.uid === user.uid;
                        const isSelected = form.authors.includes(
                          student.user.uid,
                        );

                        return (
                          <div
                            key={student.user.uid}
                            className={`${styles.selectOption} ${
                              isCurrentUserStudent ? styles.disabled : ""
                            }`}
                            onClick={() => toggleAuthor(student.user.uid)}
                          >
                            <div className={styles.checkboxWrapper}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className={styles.checkbox}
                                disabled={!!isCurrentUserStudent}
                              />
                              <span>
                                {student.user.name} {student.user.lastName}{" "}
                                {/* ← corregido */}
                                {isCurrentUserStudent && " (Tú)"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.selectOptionEmpty}>
                        No hay estudiantes disponibles
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

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

            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar obra"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
