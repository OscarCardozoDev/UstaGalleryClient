export interface ClassProfesor {
  uid: string;
  name: string;
  lastName: string;
}

export interface ClassGroup {
  name: string;
  category: string;
  profesor: ClassProfesor;
}

export interface ClassSession {
  uid: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string | null;
  review: string | null;
  groupId: string;
  scheduleId: string | null;
  group: ClassGroup;
}

export interface CurrentClassResult {
  active: boolean;
  classId?: string;
}

export interface AttendanceRecord {
  uid: string;
  takenAt: string;
  user: {
    uid: string;
    name: string;
    lastName: string;
    username: string;
  };
}
