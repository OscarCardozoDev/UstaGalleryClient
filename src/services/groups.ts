import type {
  GroupWithRelations,
  CreateGroupDto,
  UpdateGroupDto,
  GroupResult,
  GroupStudent,
  GetGroupsOptions,
  UpdateStudentsDto,
  DeleteStudentDto,
  AddStudentToGroupsResult,
  AddStudentDto,
  GroupStats,
  GroupMembersResult,
} from "../interfaces/groups";

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

// ─── Crear grupo ────────────────────────────────────────────────────────────

export async function createGroup(
  dto: CreateGroupDto,
): Promise<GroupResult> {
  const response = await fetch(`${API_URL}/groups/create`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: 'include',
  });

  return handleResponse<GroupResult>(response, "Error al crear grupo");
}

// ─── Obtener todos los grupos ───────────────────────────────────────────────

export async function getAllGroups(
  options?: GetGroupsOptions,
): Promise<GroupWithRelations[]> {
  const queryParams = new URLSearchParams();
  
  if (options?.profesorId) {
    queryParams.append('profesorId', options.profesorId);
  }
  if (options?.name) {
    queryParams.append('name', options.name);
  }

  const url = `${API_URL}/groups/get${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<GroupWithRelations[]>(
    response,
    "Error al obtener grupos",
  );
}

// ─── Obtener grupo por UID ──────────────────────────────────────────────────

export async function getGroupById(uid: string): Promise<GroupWithRelations> {
  const response = await fetch(`${API_URL}/groups/get/${uid}`, {
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<GroupWithRelations>(response, "Grupo no encontrado");
}

// ─── Actualizar grupo ───────────────────────────────────────────────────────

export async function updateGroup(
  uid: string,
  dto: UpdateGroupDto,
): Promise<GroupResult> {
  const response = await fetch(`${API_URL}/groups/update/${uid}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: 'include',
  });

  return handleResponse<GroupResult>(
    response,
    "Error al actualizar grupo",
  );
}

// ─── Eliminar grupo ─────────────────────────────────────────────────────────

export async function deleteGroup(uid: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/groups/delete/${uid}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<{ success: boolean }>(
    response,
    "Error al eliminar grupo",
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT USE CASES
// ═══════════════════════════════════════════════════════════════════════════

// ─── Agregar estudiante a varios grupos ────────────────────────────────────────────

export async function addStudentToGroups(
  dto: AddStudentDto,
): Promise<AddStudentToGroupsResult> {
  const response = await fetch(`${API_URL}/groups/student/add`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: 'include',
  });

  return handleResponse<AddStudentToGroupsResult>(
    response,
    "Error al agregar estudiante a los grupos",
  );
}

// ─── Obtener todos los estudiantes de un grupo ──────────────────────────────

export async function getStudentsByGroup(
  groupId: string,
): Promise<GroupStudent[]> {
  const response = await fetch(`${API_URL}/groups/student/get/${groupId}`, {
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<GroupStudent[]>(
    response,
    "Error al obtener estudiantes del grupo",
  );
}

// ─── Eliminar un estudiante del grupo ───────────────────────────────────────

export async function deleteStudentFromGroup(
  groupId: string,
  dto: DeleteStudentDto,
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/groups/student/delete/${groupId}`, {
    method: "DELETE",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: 'include',
  });

  return handleResponse<{ success: boolean }>(
    response,
    "Error al eliminar estudiante del grupo",
  );
}

// ─── Eliminar todos los estudiantes del grupo ───────────────────────────────

export async function deleteAllStudentsFromGroup(
  groupId: string,
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/groups/student/deleteAll/${groupId}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<{ success: boolean }>(
    response,
    "Error al eliminar todos los estudiantes del grupo",
  );
}

// ─── Actualizar lista de estudiantes del grupo ──────────────────────────────

export async function updateStudentsInGroup(
  groupId: string,
  dto: UpdateStudentsDto,
): Promise<GroupResult> {
  const response = await fetch(`${API_URL}/groups/student/update/${groupId}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: 'include',
  });

  return handleResponse<GroupResult>(
    response,
    "Error al actualizar estudiantes del grupo",
  );
}

// ─── Panel de Control — Stats ────────────────────────────────────────────────

export async function getGroupStats(groupId: string): Promise<GroupStats> {
  const response = await fetch(`${API_URL}/groups/${groupId}/stats`, {
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<GroupStats>(response, 'Error al obtener estadísticas del grupo');
}

// ─── Panel de Control — Members (paginated) ──────────────────────────────────

export async function getGroupMembers(
  groupId: string,
  page: number,
  limit: number,
): Promise<GroupMembersResult> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await fetch(`${API_URL}/groups/${groupId}/members?${params}`, {
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<GroupMembersResult>(response, 'Error al obtener estudiantes del grupo');
}