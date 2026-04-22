import type { components } from "../types/api";

// ─── Requests (codegen) ──────────────────────────────────────────────────────
export type CreateScheduleDto = components["schemas"]["CreateScheduleDto"];
export type UpdateScheduleDto = components["schemas"]["UpdateScheduleDto"];

// ─── Responses (manual) ──────────────────────────────────────────────────────
export interface ScheduleItem {
  uid: string;
  groupId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
}
