import { getPhoto } from '../services/photos';

/**
 * Carga múltiples imágenes en paralelo dado un array de photoIds
 * @param photoIds - Array de IDs de fotos a cargar
 * @returns Objeto con photoId como key y base64 como value
 */
export async function loadImagesBatch(
  photoIds: string[]
): Promise<Record<string, string>> {
  if (photoIds.length === 0) return {};

  // Eliminar duplicados
  const uniquePhotoIds = Array.from(new Set(photoIds));

  // Cargar todas las imágenes en paralelo
  const imagePromises = uniquePhotoIds.map(async (photoId) => {
    try {
      const photoDetail = await getPhoto(photoId);
      return { photoId, base64: photoDetail.base64 };
    } catch (err) {
      console.error(`Error cargando imagen ${photoId}:`, err);
      return null;
    }
  });

  const results = await Promise.all(imagePromises);

  // Convertir el array de resultados en un objeto Record<photoId, base64>
  const imageCache: Record<string, string> = {};
  results.forEach((result) => {
    if (result) {
      imageCache[result.photoId] = result.base64;
    }
  });

  return imageCache;
}

/**
 * Carga una sola imagen por photoId
 * @param photoId - ID de la foto a cargar
 * @returns base64 de la imagen o null si falla
 */
export async function loadSingleImage(photoId: string): Promise<string | null> {
  try {
    const photoDetail = await getPhoto(photoId);
    return photoDetail.base64;
  } catch (err) {
    console.error(`Error cargando imagen ${photoId}:`, err);
    return null;
  }
}