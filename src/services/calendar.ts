// src/services/calendar.service.ts

import type { IEvent, IUser } from "../interfaces/calendar";

export const getCalendarEvents = async (): Promise<IEvent[]> => {
  return [
    {
      id: 1,
      title: "Clase de Pintura",
      description: "Clase de pintura con el profesor de Pintura",
      startDate: "2026-04-15",
      endDate: "2026-04-15",
      color: "red",
      user: {
        id: "1",
        name: "Oscar Cardozo",
        picturePath: null,
      },
    },
    {
      id: 2,
      title: "Reunión docente",
      description: "Reunión con el docente de Pintura",
      startDate: "2026-04-16",
      endDate: "2026-04-16",
      color: "green",
      user: {
        id: "2",
        name: "Oscar Cardozo",
        picturePath: null,
      },
    },
    {
      id: 3,
      title: "Exposición final",
      description: "Exposición final de la UstaGallery",
      startDate: "2026-04-20",
      endDate: "2026-04-20",
      color: "orange",
      user: {
        id: "3",
        name: "Oscar Cardozo",
        picturePath: null,
      },
    },
  ];
};

export const getCalendarUsers = async (): Promise<IUser[]> => {
  return [
    {
      id: "1",
      name: "Oscar Cardozo",
      picturePath: null,
    },
    {
      id: "2",
      name: "Edgard Patiño",
      picturePath: null,
    },
    {
      id: "3",
      name: "Pablo Aguilar",
      picturePath: null,
    },
  ];
};