// ─── Enums ───────────────────────────────────────────────────────────────────

export type EventStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
export type EventType = "EXHIBITION" | "WORKSHOP" | "PERFORMANCE" | "CONFERENCE" | "OTHER";
export type EventPhotoType = "HERO" | "PROMO" | "MEMORY";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

// ─── Paginación / Filtros ─────────────────────────────────────────────────────

export interface GetEventsOptions {
  page?: number;
  limit?: number;
  status?: EventStatus;
  eventType?: EventType;
}

// ─── DTOs (Requests) ──────────────────────────────────────────────────────────

export interface EventPhotoDto {
  base64: string;
  name: string;
  folder: string;
  photoType: EventPhotoType;
}

export interface CreateEventDto {
  name: string;
  description: string;
  eventType: EventType;
  startDate: string;
  endDate?: string;
  locationUrl?: string;
  isVirtual: boolean;
  streamingUrl?: string;
  createdById: string;
  groupIds: string[];
  productIds?: string[];
  coverPhoto?: EventPhotoDto;
}

export interface UpdateEventDto {
  name?: string;
  description?: string;
  eventType?: EventType;
  startDate?: string;
  endDate?: string;
  locationUrl?: string;
  isVirtual?: boolean;
  streamingUrl?: string;
}

export interface UpdateEventStatusDto {
  status: EventStatus;
  feedback?: string;
}

export interface UpdateEventProductsDto {
  productIds: string[];
  groupId: string;
}

export interface SendInvitationDto {
  groupId: string;
}

export interface RespondInvitationDto {
  status: "ACCEPTED" | "REJECTED";
}

export interface EventPhotoUploadDto {
  images: EventPhotoDto[];
}

// ─── Responses (Subtipos reutilizables) ───────────────────────────────────────

export interface EventPhoto {
  photoType: EventPhotoType;
  photo: {
    uid: string;
    url: string;
  };
}

export interface EventGroup {
  group: {
    uid: string;
    name: string;
    category: string;
  };
}

export interface EventProductItem {
  product: {
    uid: string;
    name: string;
    description: string;
    photos: {
      photo: {
        uid: string;
        url: string;
      };
    }[];
  };
}

export interface EventInvitationItem {
  uid: string;
  status: InvitationStatus;
  group: {
    uid: string;
    name: string;
  };
}

// ─── Respuestas principales ───────────────────────────────────────────────────

/** Listado general (getAll, upcoming, past, getByGroup) */
export interface EventSummary {
  uid: string;
  name: string;
  description?: string;
  eventType: EventType;
  status?: EventStatus;
  startDate: string;
  endDate: string | null;
  isVirtual?: boolean;
  groups: EventGroup[];
  photos: EventPhoto[];
}

/** Para la página de inicio (getHome) */
export interface EventHome {
  uid: string;
  name: string;
  eventType: EventType;
  startDate: string;
  photos: EventPhoto[];
}

/** Detalle completo (getById) */
export interface Event {
  uid: string;
  name: string;
  description: string;
  status: EventStatus;
  feedback: string | null;
  eventType: EventType;
  startDate: string;
  endDate: string | null;
  locationUrl: string | null;
  isVirtual: boolean;
  streamingUrl: string | null;
  isActive: boolean;
  createdById: string;
  createdBy: {
    uid: string;
    name: string;
    lastName: string;
  };
  groups: EventGroup[];
  products: EventProductItem[];
  photos: EventPhoto[];
  invitations: EventInvitationItem[];
  createdAt: string;
  updatedAt: string;
}

/** Invitación pendiente (getPendingInvitations) */
export interface PendingInvitation {
  uid: string;
  status: InvitationStatus;
  event: {
    uid: string;
    name: string;
    eventType: EventType;
    startDate: string;
    photos: EventPhoto[];
  };
  group: {
    uid: string;
    name: string;
    category: string;
  };
}

/** Obras disponibles para agregar al evento (getAvailableProducts) */
export interface AvailableProduct {
  uid: string;
  name: string;
  description: string;
  photos: {
    photo: {
      uid: string;
      url: string;
    };
  }[];
  authors: {
    isAuthor: boolean;
    user: {
      name: string;
      lastName: string;
    };
  }[];
}