import { useState, useEffect } from "react";

interface ImageData {
  photo: {
    uid: string;
    name: string;
    url: string;
  };
  isMain?: boolean;
}

interface Props {
  images: ImageData[];
  baseUrl?: string; // URL base para construir las URLs completas
}

export default function ImageViewer({ images, baseUrl = "" }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);

  // Ordenar imágenes: la imagen principal primero
  const sortedImages = [...images].sort((a, b) => {
    if (a.isMain) return -1;
    if (b.isMain) return 1;
    return 0;
  });

  // Resetear el índice seleccionado cuando cambian las imágenes
  useEffect(() => {
    setSelectedIndex(0);
    setLoadedImages(new Set());
  }, [images]);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    const timer = setTimeout(() => {
      setShowTooltip(index);
    }, 500); // Mostrar tooltip después de 500ms
    setTooltipTimer(timer);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setShowTooltip(null);
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      setTooltipTimer(null);
    }
  };

  const getImageUrl = (imageData: ImageData) => {
    return `${baseUrl}${imageData.photo.url}`;
  };

  if (sortedImages.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
          borderRadius: "12px",
          padding: "48px",
        }}
      >
        <div style={{ color: "#666", fontSize: "16px" }}>
          No hay imágenes disponibles
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: "16px",
        padding: "40px",
      }}
    >
      {/* Vista previa grande de la imagen seleccionada */}
      <div
        style={{
          flex: 1,
          borderRadius: "12px",
          backgroundColor: "#000",
          position: "relative",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Skeleton loader */}
        {!loadedImages.has(selectedIndex) && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
              backgroundSize: "200% 100%",
              animation: "loading 1.5s ease-in-out infinite",
            }}
          />
        )}

        <img
          src={getImageUrl(sortedImages[selectedIndex])}
          alt={sortedImages[selectedIndex].photo.name}
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

        {/* Indicador de imagen principal */}
        {sortedImages[selectedIndex].isMain && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              color: "black",
              padding: "8px 16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <img
              src="/logoFav.png"
              alt="logo"
              style={{
                width: "20px",
                height: "20px",
                objectFit: "contain",
              }}
            />
            Imagen principal
          </div>
        )}
      </div>

      {/* Miniaturas en slider horizontal */}
      {sortedImages.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            paddingBottom: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              scrollbarWidth: "thin",
              scrollbarColor: "#171717 #f0f0f0",
              paddingBottom: "4px",
              flex: 1,
            }}
          >
            {sortedImages.map((imageData, index) => (
              <div
                key={imageData.photo.uid}
                style={{
                  position: "relative",
                  minWidth: "120px",
                  width: "120px",
                  height: "120px",
                  borderRadius: "15px",
                  boxShadow:
                    selectedIndex === index
                      ? "0 0 0 3px #171717"
                      : "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  transform:
                    hoveredIndex === index
                      ? "translateY(-4px)"
                      : "translateY(0)",
                  cursor: "pointer",
                  backgroundColor: "#e0e0e0",
                }}
                onClick={() => setSelectedIndex(index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Skeleton loader para miniatura */}
                {!loadedImages.has(index) && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "loading 1.5s ease-in-out infinite",
                    }}
                  />
                )}

                <img
                  src={getImageUrl(imageData)}
                  alt={imageData.photo.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "15px",
                    objectFit: "cover",
                    opacity: loadedImages.has(index) ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                  onLoad={() => handleImageLoad(index)}
                />

                {/* Indicador de imagen principal en miniatura */}
                {imageData.isMain && (
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        top: "-112px",
                        left: "8px",
                        backgroundColor: "rgba(206, 206, 206, 0.7)",
                        border: "none",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                    >
                      <img
                        src="/logoFav.png"
                        alt="main"
                        style={{
                          width: "18px",
                          height: "18px",
                          objectFit: "contain",
                        }}
                      />
                    </div>

                    {/* Tooltip */}
                    {showTooltip === index && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-140px",
                          left: "8px",
                          backgroundColor: "rgba(0, 0, 0, 0.9)",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                          pointerEvents: "none",
                          zIndex: 10,
                        }}
                      >
                        Imagen Principal
                        <div
                          style={{
                            position: "absolute",
                            bottom: "-4px",
                            left: "12px",
                            width: 0,
                            height: 0,
                            borderLeft: "4px solid transparent",
                            borderRight: "4px solid transparent",
                            borderTop: "4px solid rgba(0, 0, 0, 0.9)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        div::-webkit-scrollbar {
          height: 8px;
        }
        div::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb {
          background: #171717;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #110f0fff;
        }
      `}</style>
    </div>
  );
}