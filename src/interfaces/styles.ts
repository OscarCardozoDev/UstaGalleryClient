import type { components } from "../types/api";

// ─── Requests (codegen) ───────────────────────────────────────────────────────
export type CreateStyleDto = components["schemas"]["CreateStyleDto"];
export type UpdateStyleDto = components["schemas"]["UpdateStyleDto"];
export type Category = components["schemas"]["Category"];

// ─── Response (manual) ───────────────────────────────────────────────────────
export interface Style {
  uid: string;
  name: string;
  description: string;
  category: Category;
}