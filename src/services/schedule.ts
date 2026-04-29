import type { CreateScheduleDto, ScheduleItem } from "../interfaces/schedule";

const API_URL = import.meta.env.VITE_API_URL;

function getHeaders(json = false): Record<string, string> {
  return {
    ...(json && { "Content-Type": "application/json" }),
  };
}

async function handleResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || fallback);
  }
  return response.json();
}

export async function getSchedulesByGroup(groupId: string): Promise<ScheduleItem[]> {
  const res = await fetch(`${API_URL}/schedule/group/${groupId}`, {
    credentials: "include",
    headers: getHeaders(),
  });
  return handleResponse<ScheduleItem[]>(res, "Error al obtener horarios");
}

export async function createSchedule(data: CreateScheduleDto): Promise<ScheduleItem> {
  const res = await fetch(`${API_URL}/schedule/create`, {
    method: "POST",
    credentials: "include",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse<ScheduleItem>(res, "Error al crear horario");
}

export async function deleteSchedule(uid: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/schedule/${uid}`, {
    method: "DELETE",
    credentials: "include",
    headers: getHeaders(),
  });
  return handleResponse<{ success: boolean }>(res, "Error al eliminar horario");
}
