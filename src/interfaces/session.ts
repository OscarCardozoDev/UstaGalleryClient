// UstaGallery/src/interfaces/session.ts
export interface UserSession {
  uid: string;
  name: string;
  lastName: string;
  username: string;
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
