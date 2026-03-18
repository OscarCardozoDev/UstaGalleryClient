import type {
  Photo,
  CreatePhotoDto,
  UpdatePhotoDto,
} from "../interfaces/photos";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Helper interno ─────────────────────────────────────────────────────────

function getHeaders(json = false): Record<string, string> {
  const token = localStorage.getItem("token");
  return {
    ...(json && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || fallback);
  }
  return response.json();
}

// ─── Crear photo ──────────────────────────────────────────────────────────────

export async function createPhoto(dto: CreatePhotoDto): Promise<Photo> {
  const response = await fetch(`${API_URL}/photos/create`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
  });

  return handleResponse<Photo>(response, "Error al crear la foto");
}

// ─── Obtener photo por UID (con base64) ──────────────────────────────────────

export async function getPhoto(uid: string): Promise<Photo> {
  const response = await fetch(`${API_URL}/photos/get/${uid}`, {
    headers: getHeaders(),
  });

  return handleResponse<Photo>(response, "Foto no encontrada");
}

// ─── Actualizar photo ─────────────────────────────────────────────────────────

export async function updatePhoto(
  uid: string,
  dto: UpdatePhotoDto
): Promise<Photo> {
  const response = await fetch(`${API_URL}/photos/edit/${uid}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
  });

  return handleResponse<Photo>(response, "Error al actualizar la foto");
}