// UstaGallery/src/services/roles.ts
import type { Role } from '../interfaces/roles';

const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || fallback);
  }
  return response.json();
}

export async function getRoles(): Promise<Role[]> {
  const response = await fetch(`${API_URL}/roles`, { credentials: 'include' });
  return handleResponse<Role[]>(response, 'Error al obtener roles');
}
