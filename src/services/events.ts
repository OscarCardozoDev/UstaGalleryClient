import type {
  Event,
  EventSummary,
  EventHome,
  AvailableProduct,
  PendingInvitation,
  GetEventsOptions,
  CreateEventDto,
  UpdateEventDto,
  UpdateEventStatusDto,
  UpdateEventProductsDto,
  EventPhotoUploadDto,
  SendInvitationDto,
  RespondInvitationDto,
} from "../interfaces/events";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Helper interno ───────────────────────────────────────────────────────────

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

// ─── Para la página de inicio ─────────────────────────────────────────────────

export async function getHomeEvents(
  options: GetEventsOptions = {},
): Promise<EventHome[]> {
  const { page = 1, limit = 6 } = options;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(`${API_URL}/events/home?${params}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<EventHome[]>(response, "Error al obtener eventos");
}

// ─── Eventos próximos (público) ───────────────────────────────────────────────

export async function getUpcomingEvents(
  options: GetEventsOptions = {},
): Promise<EventSummary[]> {
  const { page = 1, limit = 10, eventType } = options;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (eventType) params.append("eventType", eventType);

  const response = await fetch(`${API_URL}/events/upcoming?${params}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<EventSummary[]>(response, "Error al obtener eventos próximos");
}

// ─── Eventos pasados (público) ────────────────────────────────────────────────

export async function getPastEvents(
  options: GetEventsOptions = {},
): Promise<EventSummary[]> {
  const { page = 1, limit = 10, eventType } = options;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (eventType) params.append("eventType", eventType);

  const response = await fetch(`${API_URL}/events/past?${params}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<EventSummary[]>(response, "Error al obtener eventos pasados");
}

// ─── Todos los eventos (admin) ────────────────────────────────────────────────

export async function getAllEvents(
  options: GetEventsOptions = {},
): Promise<EventSummary[]> {
  const { page = 1, limit = 10, status, eventType } = options;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.append("status", status);
  if (eventType) params.append("eventType", eventType);

  const response = await fetch(`${API_URL}/events/getAll?${params}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<EventSummary[]>(response, "Error al obtener eventos");
}

// ─── Eventos por grupo (público) ──────────────────────────────────────────────

export async function getEventsByGroup(
  groupId: string,
  options: GetEventsOptions = {},
): Promise<EventSummary[]> {
  const { page = 1, limit = 10 } = options;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  const response = await fetch(`${API_URL}/events/getByGroup/${groupId}?${params}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<EventSummary[]>(response, "Error al obtener eventos del grupo");
}

// ─── Detalle de un evento (público) ──────────────────────────────────────────

export async function getEventById(uid: string): Promise<Event> {
  const response = await fetch(`${API_URL}/events/get/${uid}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<Event>(response, "Evento no encontrado");
}

// ─── Obras disponibles para agregar al evento ─────────────────────────────────

export async function getAvailableProducts(
  groupId: string,
): Promise<AvailableProduct[]> {
  const response = await fetch(`${API_URL}/events/available-products/${groupId}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<AvailableProduct[]>(
    response,
    "Error al obtener obras disponibles",
  );
}

// ─── Invitaciones pendientes del profesor ─────────────────────────────────────

export async function getPendingInvitations(
  profesorId: string,
): Promise<PendingInvitation[]> {
  const params = new URLSearchParams({ profesorId });

  const response = await fetch(`${API_URL}/events/invitations/pending?${params}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<PendingInvitation[]>(
    response,
    "Error al obtener invitaciones",
  );
}

// ─── Crear evento ─────────────────────────────────────────────────────────────

export async function createEvent(dto: CreateEventDto): Promise<{ uid: string }> {
  const response = await fetch(`${API_URL}/events/create`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: "include",
  });

  return handleResponse<{ uid: string }>(response, "Error al crear el evento");
}

// ─── Actualizar evento ────────────────────────────────────────────────────────

export async function updateEvent(
  uid: string,
  dto: UpdateEventDto,
): Promise<Event> {
  const response = await fetch(`${API_URL}/events/update/${uid}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: "include",
  });

  return handleResponse<Event>(response, "Error al actualizar el evento");
}

// ─── Cambiar status del evento (admin) ────────────────────────────────────────

export async function updateEventStatus(
  uid: string,
  dto: UpdateEventStatusDto,
): Promise<{ uid: string }> {
  const response = await fetch(`${API_URL}/events/status/${uid}`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: "include",
  });

  return handleResponse<{ uid: string }>(
    response,
    "Error al actualizar el estado del evento",
  );
}

// ─── Desactivar evento (admin) ────────────────────────────────────────────────

export async function deactivateEvent(uid: string): Promise<{ uid: string }> {
  const response = await fetch(`${API_URL}/events/deactivate/${uid}`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<{ uid: string }>(response, "Error al desactivar el evento");
}

// ─── Actualizar obras del evento ──────────────────────────────────────────────

export async function updateEventProducts(
  uid: string,
  dto: UpdateEventProductsDto,
): Promise<{ uid: string }> {
  const response = await fetch(`${API_URL}/events/${uid}/products`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: "include",
  });

  return handleResponse<{ uid: string }>(
    response,
    "Error al actualizar las obras del evento",
  );
}

// ─── Agregar foto al evento ───────────────────────────────────────────────────

export async function addEventPhoto(
  uid: string,
  dto: EventPhotoUploadDto,
): Promise<{ uid: string }> {
  const response = await fetch(`${API_URL}/events/${uid}/photos`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: "include",
  });

  return handleResponse<{ uid: string }>(response, "Error al agregar la foto");
}

// ─── Eliminar foto del evento ─────────────────────────────────────────────────

export async function removeEventPhoto(
  uid: string,
  photoId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/events/${uid}/photos/${photoId}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Error al eliminar la foto");
  }
}

// ─── Enviar invitación a un grupo ─────────────────────────────────────────────

export async function sendInvitation(
  eventId: string,
  dto: SendInvitationDto,
): Promise<{ uid: string }> {
  const response = await fetch(`${API_URL}/events/${eventId}/invite`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: "include",
  });

  return handleResponse<{ uid: string }>(response, "Error al enviar la invitación");
}

// ─── Responder invitación ─────────────────────────────────────────────────────

export async function respondInvitation(
  invitationId: string,
  dto: RespondInvitationDto,
): Promise<{ uid: string }> {
  const response = await fetch(
    `${API_URL}/events/invitations/${invitationId}/respond`,
    {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify(dto),
      credentials: "include",
    },
  );

  return handleResponse<{ uid: string }>(
    response,
    "Error al responder la invitación",
  );
}

// ─── Revocar invitación de un grupo ──────────────────────────────────────────

export async function revokeInvitation(
  eventId: string,
  groupId: string,
): Promise<{ revoked: boolean }> {
  const response = await fetch(`${API_URL}/events/${eventId}/invite/${groupId}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<{ revoked: boolean }>(
    response,
    "Error al revocar la invitación",
  );
}
