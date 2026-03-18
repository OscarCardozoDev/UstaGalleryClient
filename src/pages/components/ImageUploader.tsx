import { useState } from "react";

interface Props {
  onChange: (files: File[]) => void;
}

export default function ImageUploader({ onChange }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);

  const handleChange = (newFiles: File[]) => {
    const allFiles = [...files, ...newFiles].slice(0, 5);
    setFiles(allFiles);
    onChange(allFiles); // ✅ Sí, aquí se envían las imágenes al padre

    const urls = allFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    onChange(newFiles); // ✅ También se actualiza el padre al eliminar
    
    if (mainImageIndex === index) {
      setMainImageIndex(0);
    } else if (mainImageIndex > index) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    const timer = setTimeout(() => {
      setShowTooltip(index);
    }, 2000);
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

  const canAddMore = files.length < 5;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      gap: '16px',
      overflow: 'hidden'
    }}>
      {previews.length === 0 ? (
        <div
          style={{
            border: '2px dashed #e0e0e0',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            backgroundColor: '#fafafa',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#171717';
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.backgroundColor = '#fafafa';
          }}
        >
          <label style={{ cursor: 'pointer' }}>
            <div
              style={{
                backgroundColor: '#171717',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#08080aff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#171717';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Subir imágenes
            </div>
            <input
              hidden
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                handleChange(Array.from(e.target.files ?? []))
              }
            />
          </label>
          <div style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>
            Hasta 5 imágenes
          </div>
        </div>
      ) : (
        <>
          {/* Vista previa grande de la imagen seleccionada */}
          <div style={{
            flex: 1,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#000',
            position: 'relative',
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={previews[mainImageIndex]}
              alt={`preview-main`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
            
            {/* Indicador de imagen principal */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#ffd700',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500
            }}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="#ffd700"
                stroke="#ffd700"
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Imagen principal
            </div>
          </div>

          {/* Miniaturas en slider horizontal */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            paddingBottom: '8px'
          }}>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: '#171717 #f0f0f0',
                paddingBottom: '4px',
                flex: 1
              }}
            >
              {previews.map((src, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    minWidth: '120px',
                    width: '120px',
                    height: '120px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: mainImageIndex === index 
                      ? '0 0 0 3px #171717' 
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    transform: hoveredIndex === index ? 'translateY(-4px)' : 'translateY(0)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setMainImageIndex(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={src}
                    alt={`preview-${index}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  
                  {/* Botón de imagen principal */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMainImageIndex(index);
                      }}
                      style={{
                        position: 'absolute',
                        top: '-112px',
                        left: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        zIndex: 2
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                      }}
                    >
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill={mainImageIndex === index ? "#ffd700" : "none"}
                        stroke={mainImageIndex === index ? "#ffd700" : "white"}
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                    
                    {/* Tooltip */}
                    {showTooltip === index && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-140px',
                          left: '8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          zIndex: 10,
                        }}
                      >
                        Imagen principal
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '-4px',
                            left: '12px',
                            width: 0,
                            height: 0,
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: '4px solid rgba(0, 0, 0, 0.9)',
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Botón de eliminar */}
                  {hoveredIndex === index && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(244, 67, 54, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        zIndex: 2
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(211, 47, 47, 1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.9)';
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
                        <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Botón para agregar más imágenes */}
            {canAddMore && (
              <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    border: '2px dashed #171717',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#171717',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    fontSize: '12px',
                    textAlign: 'center',
                    padding: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round"/>
                    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
                  </svg>
                  <span>Agregar</span>
                  <span>({5 - files.length})</span>
                </div>
                <input
                  hidden
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    handleChange(Array.from(e.target.files ?? []))
                  }
                />
              </label>
            )}
          </div>
        </>
      )}
      
      <style>{`
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