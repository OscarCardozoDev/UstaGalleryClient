export interface UserSession {
  uid: string;
  name: string;
  lastName: string;
  username: string;
  isProfesor: boolean;
  userType: {
    uid: string;
    name: string;
  };
  photo?: {
    uid: string;
    url: string;
  } | null;
  groups: {
    uid: string;
    name: string;
  }[];
  lastUpdated: string;
}