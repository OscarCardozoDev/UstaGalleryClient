// src/services/calendar.service.ts

import type { IEvent, IUser } from "./calendar/interfaces";
import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from "./calendar/mocks"; // ajusta la ruta según tu proyecto

// Simula latencia real de API (opcional pero recomendado)
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getCalendarEvents = async (): Promise<IEvent[]> => {
  await delay(300); // simula request
  return CALENDAR_ITEMS_MOCK;
};

export const getCalendarUsers = async (): Promise<IUser[]> => {
  await delay(200);
  return USERS_MOCK;
};