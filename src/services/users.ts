import type {
  UserWithRelations,
  CreateStudentDto,
  UpdateUserDto,
  UpdateUserPhotoDto,
  UserUidResult,
  AuthorDetail,
} from "../interfaces/users";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Helper interno ─────────────────────────────────────────────────────────

function getHeaders(json = false): Record<string, string> {
  return {
    ...(json && { "Content-Type": "application/json" }),
  };
}

async function handleResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || fallback);
  }
  return response.json();
}

// ─── Crear usuario ──────────────────────────────────────────────────────────

export async function createUser(
  dto: CreateStudentDto,
): Promise<UserUidResult> {
  const response = await fetch(`${API_URL}/user/create`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: 'include',
  });

  return handleResponse<UserUidResult>(response, "Error al crear usuario");
}

// ─── Obtener todos los usuarios activos ─────────────────────────────────────

export async function getActiveUsers(): Promise<UserWithRelations[]> {
  const response = await fetch(`${API_URL}/user/allActive`, {
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<UserWithRelations[]>(
    response,
    "Error al obtener usuarios activos",
  );
}

// ─── Obtener usuario actual (desde token JWT) ───────────────────────────────

export async function getCurrentUser(): Promise<UserWithRelations> {
  const response = await fetch(`${API_URL}/user/me`, {
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<UserWithRelations>(
    response,
    "Error al obtener usuario actual",
  );
}

// ─── Obtener usuario por UID ────────────────────────────────────────────────

export async function getUserById(uid: string): Promise<UserWithRelations> {
  const response = await fetch(`${API_URL}/user/${uid}`, {
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<UserWithRelations>(response, "Usuario no encontrado");
}

// ─── Obtener detalles del Autor ──────────────────────────────────────────────

export async function getAuthorDetail(uid: string): Promise<AuthorDetail> {
  const response = await fetch(`${API_URL}/user/author/${uid}`, {
    headers: getHeaders(),
    credentials: "include",
  });
  return handleResponse<AuthorDetail>(response, "Autor no encontrado");
}

// ─── Actualizar usuario actual ──────────────────────────────────────────────

export async function updateCurrentUser(
  dto: UpdateUserDto,
): Promise<UserUidResult> {
  const response = await fetch(`${API_URL}/user/update`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: 'include',
  });

  return handleResponse<UserUidResult>(
    response,
    "Error al actualizar usuario",
  );
}

// ─── Actualizar usuario específico (admin) ──────────────────────────────────

export async function updateUser(
  uid: string,
  dto: UpdateUserDto,
): Promise<UserUidResult> {
  const response = await fetch(`${API_URL}/user/${uid}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: 'include',
  });

  return handleResponse<UserUidResult>(
    response,
    "Error al actualizar usuario",
  );
}

// ─── Actualizar foto del usuario actual ─────────────────────────────────────

export async function updateCurrentUserPhoto(
  dto: UpdateUserPhotoDto,
): Promise<UserUidResult> {
  const response = await fetch(`${API_URL}/user/photo`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: 'include',
  });

  return handleResponse<UserUidResult>(
    response,
    "Error al actualizar foto de usuario",
  );
}

// ─── Actualizar foto de usuario específico (admin) ──────────────────────────

export async function updateUserPhoto(
  uid: string,
  dto: UpdateUserPhotoDto,
): Promise<UserUidResult> {
  const response = await fetch(`${API_URL}/user/${uid}/photo`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: 'include',
  });

  return handleResponse<UserUidResult>(
    response,
    "Error al actualizar foto de usuario",
  );
}

// ─── Desactivar usuario actual (soft delete) ────────────────────────────────

export async function deactivateCurrentUser(): Promise<UserUidResult> {
  const response = await fetch(`${API_URL}/user/deactivate`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<UserUidResult>(
    response,
    "Error al desactivar usuario",
  );
}

// ─── Desactivar usuario específico (admin) ──────────────────────────────────

export async function deactivateUser(uid: string): Promise<UserUidResult> {
  const response = await fetch(`${API_URL}/user/${uid}/deactivate`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<UserUidResult>(
    response,
    "Error al desactivar usuario",
  );
}

// ─── Reactivar usuario (admin) ──────────────────────────────────────────────

export async function reactivateUser(uid: string): Promise<UserUidResult> {
  const response = await fetch(`${API_URL}/user/${uid}/reactivate`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<UserUidResult>(
    response,
    "Error al reactivar usuario",
  );
}