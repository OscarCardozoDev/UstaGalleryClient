import type { components } from "../types/api";
import type { Photo } from "./photos";

// ─── Requests (codegen) ───────────────────────────────────────────────────────
export type CreateUserDto      = components["schemas"]["CreateUserDto"];
export type UpdateUserDto      = components["schemas"]["UpdateUserDto"];
export type UpdateUserPhotoDto = components["schemas"]["UpdateUserPhotoDto"];

// ─── Responses (manual) ──────────────────────────────────────────────────────
export interface UserType {
  uid: string;
  name?: string;
}

export interface User {
  uid: string;
  name: string;
  lastName: string;
  username: string;
  description?: string | null;
  gender: string;
  idCard: string;
  degree: string;
  semester: string;
  telNumber: string;
  isActive: boolean;
  isProfesor: boolean;
  userTypeId: string;
  photoId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  finishAt?: string | null;
}

export interface AuthorDetail {
  uid: string;
  name: string;
  lastName: string;
  username: string;
  description?: string | null;
  photoId?: string | null;
  photo?: { uid: string; url?: string } | null;
}

export interface UserWithRelations extends User {
  userType?: UserType | null;
  photo?: Photo | null;
}

export interface UserUidResult {
  uid: string;
  photo?: { uid: string };
}