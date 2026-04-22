import type { ClassSession, CurrentClassResult, AttendanceRecord } from '../interfaces/classes';

const API_URL = import.meta.env.VITE_API_URL;

function getHeaders(json = false): Record<string, string> {
  return {
    ...(json && { 'Content-Type': 'application/json' }),
  };
}

async function handleResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || fallback);
  }
  return response.json();
}

export async function getClassesByGroup(
  groupId: string,
  from?: string,
  to?: string,
): Promise<ClassSession[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await fetch(`${API_URL}/classes/group/${groupId}${query}`, {
    credentials: 'include',
    headers: getHeaders(),
  });
  return handleResponse<ClassSession[]>(res, 'Failed to fetch classes');
}

export async function getCurrentClass(groupId: string): Promise<CurrentClassResult> {
  const res = await fetch(`${API_URL}/classes/current/${groupId}`, {
    credentials: 'include',
    headers: getHeaders(),
  });
  return handleResponse<CurrentClassResult>(res, 'Failed to check current class');
}

export async function attendClass(classId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/classes/attend`, {
    method: 'POST',
    credentials: 'include',
    headers: getHeaders(true),
    body: JSON.stringify({ classId }),
  });
  if (res.status === 409) return { success: true };
  return handleResponse<{ success: boolean }>(res, 'Failed to register attendance');
}

export async function getClassAttendance(classId: string): Promise<AttendanceRecord[]> {
  const res = await fetch(`${API_URL}/classes/${classId}/attendance`, {
    credentials: 'include',
    headers: getHeaders(),
  });
  return handleResponse<AttendanceRecord[]>(res, 'Failed to fetch attendance');
}

export async function updateClassTopic(
  classId: string,
  data: { topic?: string; review?: string },
): Promise<{ uid: string; topic: string | null; review: string | null }> {
  const res = await fetch(`${API_URL}/classes/${classId}/topic`, {
    method: 'PATCH',
    credentials: 'include',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(res, 'Failed to update topic');
}

export async function createManualClass(data: {
  groupId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic?: string;
}): Promise<{ uid: string }> {
  const res = await fetch(`${API_URL}/classes/create`, {
    method: 'POST',
    credentials: 'include',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(res, 'Failed to create class');
}
