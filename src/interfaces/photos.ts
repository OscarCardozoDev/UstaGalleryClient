import type { components } from "../types/api";

// ─── Requests (codegen) ───────────────────────────────────────────────────────
export type CreatePhotoDto = components["schemas"]["CreatePhotoDto"];
export type UpdatePhotoDto = components["schemas"]["UpdatePhotoDto"];

// ─── Response (manual) ───────────────────────────────────────────────────────
export interface ImageData {
  photo: Photo
  isMain?: boolean;
}

export interface Photo {
  uid: string;
  name: string;
  url?: string;
}