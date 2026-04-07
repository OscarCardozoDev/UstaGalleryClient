import { useState, useEffect } from "react";

const MAX_SIZE_MB = 2;

// ── Tipos exportados para usar en el padre ────────────────────────────────────
export interface ImageUploaderItem {
  uid?: string;       // presente si isExisting === true
  file?: File;        // presente si isExisting === false
  isMain: boolean;
  isExisting: boolean;
}

interface ExistingImage {
  uid: string;
  url: string;
  isMain: boolean;
}

interface PreviewItem {
  uid?: string;
  src: string;
  isMain: boolean;
  isExisting: boolean;
  file?: File;
}

interface Props {
  onChange: (items: ImageUploaderItem[]) => void;
  existingImages?: ExistingImage[];
  /** Número máximo de imágenes permitidas. Por defecto: 5 */
  limit?: number;
}

export default function ImageUploader({ onChange, existingImages = [], limit = 5 }: Props) {
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  // ── Carga inicial de imágenes existentes ─────────────────────────────────
  useEffect(() => {
    if (existingImages.length === 0) return;

    const initial: PreviewItem[] = existingImages.map((img) => ({
      uid: img.uid,
      src: img.url,
      isMain: img.isMain,
      isExisting: true,
    }));

    const hasMain = initial.some((i) => i.isMain);
    if (!hasMain && initial.length > 0) initial[0].isMain = true;

    setItems(initial);
    setSelectedIndex(0);
  },[existingImages]);

  // ── Notifica al padre con el estado completo ──────────────────────────────
  const notify = (updated: PreviewItem[]) => {
    onChange(
      updated.map((item) => ({
        uid: item.uid,
        file: item.file,
        isMain: item.isMain,
        isExisting: item.isExisting,
      }))
    );
  };

  // ── Agregar imágenes nuevas ───────────────────────────────────────────────
  const handleAdd = (newFiles: File[]) => {
    setSizeError(null);

    const oversized = newFiles.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      setSizeError(`${oversized.length} imagen(es) superan ${MAX_SIZE_MB}MB y fueron omitidas.`);
    }

    const valid = newFiles.filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024);
    const toAdd = valid.slice(0, limit - items.length);
    if (toAdd.length === 0) return;

    const newItems: PreviewItem[] = toAdd.map((file) => ({
      src: URL.createObjectURL(file),
      isMain: false,
      isExisting: false,
      file,
    }));

    const updated = [...items, ...newItems];
    if (!updated.some((i) => i.isMain)) updated[0].isMain = true;

    setItems(updated);
    notify(updated);
  };

  // ── Eliminar imagen ───────────────────────────────────────────────────────
  const handleRemove = (index: number) => {
    const wasMain = items[index].isMain;
    const updated = items.filter((_, i) => i !== index);
    if (wasMain && updated.length > 0) updated[0].isMain = true;

    setSelectedIndex(Math.max(0, index >= updated.length ? updated.length - 1 : index));
    setItems(updated);
    notify(updated);
  };

  // ── Marcar como principal ─────────────────────────────────────────────────
  const handleSetMain = (index: number) => {
    const updated = items.map((item, i) => ({ ...item, isMain: i === index }));
    setItems(updated);
    notify(updated);
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  };

  const canAddMore = items.length < limit;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "12px" }}>

      {/* ── Info + error ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#888" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
          </svg>
          Máximo {limit} imágenes · {MAX_SIZE_MB}MB por imagen
        </div>

        {sizeError && (
          <div style={{
            backgroundColor: "#fff3f3",
            border: "1px solid #ffcdd2",
            borderRadius: "8px",
            padding: "7px 12px",
            fontSize: "12px",
            color: "#c62828",
            display: "flex",
            alignItems: "center",
            gap: "7px",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" strokeLinecap="round" />
            </svg>
            {sizeError}
          </div>
        )}
      </div>

      {/* ── Estado vacío ── */}
      {items.length === 0 ? (
        <label style={{
          flex: 1,
          border: "2px dashed #e0e0e0",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          cursor: "pointer",
          backgroundColor: "#fafafa",
          transition: "all 0.2s ease",
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#171717";
            e.currentTarget.style.backgroundColor = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e0e0e0";
            e.currentTarget.style.backgroundColor = "#fafafa";
          }}
        >
          <div style={{
            backgroundColor: "#171717",
            color: "white",
            padding: "12px 32px",
            borderRadius: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "15px",
            fontWeight: 500,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Subir imágenes
          </div>
          <span style={{ fontSize: "13px", color: "#999" }}>
            Hasta {limit} imágenes · {MAX_SIZE_MB}MB c/u
          </span>
          <input hidden type="file" multiple accept="image/*"
            onChange={(e) => handleAdd(Array.from(e.target.files ?? []))} />
        </label>

      ) : (
        <>
          {/* ── Imagen principal grande ── */}
          <div style={{
            flex: 1,
            borderRadius: "12px",
            backgroundColor: "#000",
            position: "relative",
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
            {!loadedImages.has(selectedIndex) && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
              }} />
            )}

            <img
              src={items[selectedIndex]?.src}
              alt="preview-principal"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                opacity: loadedImages.has(selectedIndex) ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
              onLoad={() => handleImageLoad(selectedIndex)}
            />

            {/* Badge imagen principal */}
            {items[selectedIndex]?.isMain && (
              <div style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                backgroundColor: "rgba(0,0,0,0.65)",
                color: "#ffd700",
                padding: "7px 14px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "13px",
                fontWeight: 500,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffd700" stroke="#ffd700" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Imagen principal
              </div>
            )}

            {/* Badge nueva / existente */}
            <div style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              backgroundColor: items[selectedIndex]?.isExisting
                ? "rgba(0,0,0,0.55)"
                : "rgba(46,125,50,0.85)",
              color: "white",
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "20px",
            }}>
              {items[selectedIndex]?.isExisting ? "Existente" : "Nueva"}
            </div>
          </div>

          {/* ── Miniaturas + botón agregar ── */}
          <div style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-end",
            flexShrink: 0,
            overflowX: "auto",
            paddingBottom: "4px",
            scrollbarWidth: "thin",
            scrollbarColor: "#171717 #f0f0f0",
          }}>
            {items.map((item, index) => (
              <div key={index} style={{ display: "flex", flexDirection: "column", gap: "5px", flexShrink: 0 }}>

                {/* Checkbox imagen principal */}
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: item.isMain ? 600 : 400,
                  color: item.isMain ? "#171717" : "#777",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}>
                  <input
                    type="checkbox"
                    checked={item.isMain}
                    onChange={() => handleSetMain(index)}
                    style={{ accentColor: "#171717", cursor: "pointer" }}
                  />
                  {item.isMain ? "⭐ Principal" : "Principal"}
                </label>

                {/* Miniatura */}
                <div
                  style={{
                    position: "relative",
                    width: "100px",
                    height: "100px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxShadow: selectedIndex === index
                      ? "0 0 0 3px #171717"
                      : "0 2px 8px rgba(0,0,0,0.1)",
                    transform: hoveredIndex === index ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.2s ease",
                    backgroundColor: "#e0e0e0",
                  }}
                  onClick={() => setSelectedIndex(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {!loadedImages.has(index) && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s ease-in-out infinite",
                    }} />
                  )}

                  <img
                    src={item.src}
                    alt={`miniatura-${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: loadedImages.has(index) ? 1 : 0,
                      transition: "opacity 0.3s ease",
                    }}
                    onLoad={() => handleImageLoad(index)}
                  />

                  {hoveredIndex === index && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        backgroundColor: "rgba(211,47,47,0.9)",
                        border: "none",
                        borderRadius: "50%",
                        width: "26px",
                        height: "26px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(183,28,28,1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(211,47,47,0.9)")}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                        <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Celda agregar más */}
            {canAddMore && (
              <div style={{ display: "flex", flexDirection: "column", gap: "5px", flexShrink: 0 }}>
                <div style={{ height: "18px" }} />
                <label style={{
                  width: "100px",
                  height: "100px",
                  border: "2px dashed #ccc",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  cursor: "pointer",
                  color: "#888",
                  fontSize: "11px",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#171717";
                    e.currentTarget.style.color = "#171717";
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#ccc";
                    e.currentTarget.style.color = "#888";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
                    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                  </svg>
                  <span>Agregar</span>
                  <span style={{ fontSize: "10px", color: "#aaa" }}>({limit - items.length} restantes)</span>
                  <input hidden type="file" multiple accept="image/*"
                    onChange={(e) => handleAdd(Array.from(e.target.files ?? []))} />
                </label>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        div::-webkit-scrollbar { height: 6px; }
        div::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 4px; }
        div::-webkit-scrollbar-thumb { background: #171717; border-radius: 4px; }
        div::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
}