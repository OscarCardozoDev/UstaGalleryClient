import type { components } from "../types/api";

export type CreateCredentialDto = components["schemas"]["CreateCredentialDto"];

export interface CredentialWithoutProfile {
  uid: string;
  mail: string;
  createdAt: string;
}