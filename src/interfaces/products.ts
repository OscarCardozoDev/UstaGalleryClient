import type { components } from "../types/api";

// ─── Requests (vienen del codegen) ───────────────────────────────────────────
export type CreateProductDto = components["schemas"]["CreateProductDto"];
export type UpdateProductDto = components["schemas"]["UpdateProductDto"];
export type ProductAuthorDto = components["schemas"]["ProductAuthorDto"];
export type ProductImageDto  = components["schemas"]["ProductImageDto"];
export type UpdateProductImageDto = components["schemas"]["UpdateProductImageDto"];

// ─── Paginación ───────────────────────────────────────────────────────────────
export interface GetProductsOptions {
  page?: number;
  limit?: number;
  styleId?: string;
}

// ─── Tipos para revisión de obras ────────────────────────────────────────────
export type ProductStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface UpdateProductStatusDto {
  status: ProductStatus;
  feedback?: string;
}

// ─── Responses (manual hasta agregar @ApiResponse en el backend) ──────────────

export interface ProductPhoto {
  photo: {
    uid: string;
    name: string;
    url: string;
  };
  isMain?: boolean;
}

export interface ProductGallery {
  uid: string;
  name: string;
  photos: ProductPhoto[];
}

export interface Product {
  uid: string;
  name: string;
  description: string;
  price: string | null;
  isSold: boolean;
  isActive: boolean;
  status: ProductStatus;
  feedback: string | null;
  madeAt: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
  photos: ProductPhoto[];
  authors: {
    userId: string;
    isAuthor: boolean;
  }[]
  styles: {
    styleId: string;
  }[]
}