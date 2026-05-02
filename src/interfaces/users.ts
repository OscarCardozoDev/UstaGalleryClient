// UstaGallery/src/interfaces/users.ts
import type { components } from '../types/api';
import type { Photo } from './photos';
import type { Role } from './roles';

// ─── Requests (codegen) ──────────────────────────────────────────────────────
export type CreateStudentDto      = Omit<components['schemas']['CreateStudentDto'], 'roleData'> & {
  roleData: Record<string, string>;
};
export type CreateProfessorDto    = components['schemas']['CreateProfessorDto'];
export type UpdateUserDto         = components['schemas']['UpdateUserDto'];
export type UpdateUserPhotoDto    = components['schemas']['UpdateUserPhotoDto'];

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
  telNumber: string;
  isActive: boolean;
  userTypeId: string;
  photoId?: string | null;
  roleId?: string | null;
  roleData?: Record<string, string> | null;
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
  role?: Role | null;
}

export interface UserUidResult {
  uid: string;
  photo?: { uid: string };
}
