import type { Style, CreateStyleDto, UpdateStyleDto, Category } from "../interfaces/styles";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getHeaders(json = false): Record<string, string> {
  return {
    ...(json && { "Content-Type": "application/json" }),
  };
}

async function handleResponse<T>(
  response: Response,
  errorMessage: string,
): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: errorMessage }));
    throw new Error(error.message || errorMessage);
  }
  return response.json();
}

// ─── Obtener todos los estilos ───────────────────────────────────────────────

export async function getAllStyles(): Promise<Style[]> {
  const response = await fetch(`${API_URL}/styles/all`, {
    headers: getHeaders(true),
  });

  return handleResponse<Style[]>(response, "Error al obtener estilos");
}

// ─── Obtener todos los estilos por grupo ───────────────────────────────────────────────

export async function getAllStylesByGroup(category: Category): Promise<Style[]> {
  const response = await fetch(`${API_URL}/styles/all/${category}`, {
    headers: getHeaders(true),
  });

  return handleResponse<Style[]>(response, "Error al obtener estilos");
}

// ─── Obtener estilo por ID ───────────────────────────────────────────────────

export async function getStyleById(uid: string): Promise<Style> {
  const response = await fetch(`${API_URL}/styles/get/${uid}`, {
    headers: getHeaders(true),
  });

  return handleResponse<Style>(response, "Estilo no encontrado");
}

// ─── Crear estilo ────────────────────────────────────────────────────────────

export async function createStyle(data: CreateStyleDto): Promise<Style> {
  const response = await fetch(`${API_URL}/styles/create`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(data),
    credentials: 'include',
  });

  return handleResponse<Style>(response, "Error al crear estilo");
}

// ─── Actualizar estilo ───────────────────────────────────────────────────────

export async function updateStyle(
  uid: string,
  data: UpdateStyleDto,
): Promise<Style> {
  const response = await fetch(`${API_URL}/styles/update/${uid}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(data),
    credentials: 'include',
  });

  return handleResponse<Style>(response, "Error al actualizar estilo");
}

// ─── Eliminar estilo ─────────────────────────────────────────────────────────

export async function deleteStyle(uid: string): Promise<void> {
  const response = await fetch(`${API_URL}/styles/delete/${uid}`, {
    method: "DELETE",
    headers: getHeaders(true),
    credentials: 'include',
  });

  return handleResponse<void>(response, "Error al eliminar estilo");
}
