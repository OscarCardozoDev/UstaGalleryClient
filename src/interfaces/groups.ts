import type { components } from "../types/api";

// ─── Requests (codegen) ───────────────────────────────────────────────────────
export type CreateGroupDto    = components["schemas"]["CreateGroupDto"];
export type UpdateGroupDto    = components["schemas"]["UpdateGroupDto"];
export type AddStudentDto     = components["schemas"]["AddStudentDto"];
export type DeleteStudentDto  = components["schemas"]["DeleteStudentDto"];
export type UpdateStudentsDto = components["schemas"]["UpdateStudentsDto"];

// ─── Responses (manual) ──────────────────────────────────────────────────────
export interface Group {
  uid: string;
  name: string;
  description?: string | null;
  profesorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupWithRelations extends Group {
  profesor?: {
    uid: string;
    name: string;
    lastName?: string;
  } | null;
  students?: {
    uid: string;
    name: string;
    lastName?: string;
  }[];
}

export interface GetGroupsOptions {
  profesorId?: string;
  name?: string;
  page?: number;
  limit?: number;
}

export interface GroupResult {
  uid: string;
  name: string;
}

export interface AddStudentToGroupsResult {
  success: boolean;
  userId: string;
  created: number;
  failed: number;
  details: {
    created: { uid: string; groupId: string }[];
    failed: { groupId: string; reason: string }[];
  };
}

export interface GroupStudent {
  user: {
    uid: string;
    name: string;
    lastName: string;
  };
}