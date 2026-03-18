import type { components } from "../types/api";

// ─── Requests (codegen) ───────────────────────────────────────────────────────
export type CreateStyleDto = components["schemas"]["CreateStyleDto"];
export type UpdateStyleDto = components["schemas"]["UpdateStyleDto"];

// ─── Response (manual) ───────────────────────────────────────────────────────
export interface Style {
  uid: string;
  name: string;
  description: string;
  groupId: string;
}