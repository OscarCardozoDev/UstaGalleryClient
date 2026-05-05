import type {
  Product,
  GetProductsOptions,
  CreateProductDto,
  UpdateProductDto,
  ProductGallery,
  UpdateProductStatusDto,
} from "../interfaces/products";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Helper interno ──────────────────────────────────────────────────────────

function getHeaders(json = false): Record<string, string> {
  return {
    ...(json && { "Content-Type": "application/json" }),
  };
}

async function handleResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || fallback);
  }
  return response.json();
}

// ─── Obtener todos los productos (paginado) ──────────────────────────────────

export async function getProducts(
  options: GetProductsOptions = {},
): Promise<Product[]> {
  const { page = 1, limit = 10 } = options;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(`${API_URL}/products/getAll?${params}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<Product[]>(response, "Error al obtener productos");
}

// ─── Obtener Productos para la galería ──────────────────────────────────────

export async function getGalleryProducts(
  options: GetProductsOptions = {},
): Promise<ProductGallery[]> {
  const { page = 1, limit = 10, styleId } = options;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (styleId) params.set("styleId", styleId);

  const response = await fetch(`${API_URL}/products/getGalleryHome?${params}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<ProductGallery[]>(
    response,
    "Error al obtener productos",
  );
}

// ─── Obtener producto por ID ─────────────────────────────────────────────────

export async function getProductById(uid: string): Promise<Product> {
  const response = await fetch(`${API_URL}/products/get/${uid}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<Product>(response, "Producto no encontrado");
}

// ─── Obtener todos los productos por grupo ──────────────────────────────────

export async function getProductByGroup(uid: string): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products/getGroup/${uid}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<Product[]>(response, "Productos no encontrado");
}

// ─── Obtener producto por Autor ──────────────────────────────────────────────

export async function getProductByAuthor(uid: string): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products/getAuthor/${uid}`, {
    headers: getHeaders(),
    credentials: "include",
  });

  return handleResponse<Product[]>(response, "Producto no encontrado");
}

// ─── Crear producto ──────────────────────────────────────────────────────────

export async function createProduct(dto: CreateProductDto): Promise<Product> {
  const response = await fetch(`${API_URL}/products/create`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: "include",
  });

  return handleResponse<Product>(response, "Error al crear producto");
}

// ─── Actualizar producto ─────────────────────────────────────────────────────

export async function updateProduct(
  uid: string,
  dto: UpdateProductDto,
): Promise<Product> {
  const response = await fetch(`${API_URL}/products/update/${uid}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: "include",
  });

  return handleResponse<Product>(response, "Error al actualizar producto");
}

// ─── Actualizar status de un producto ───────────────────────────────────────
// PATCH /products/:uid/status
// Endpoint dedicado solo para revisión — no toca imagen, estilos ni otros campos.
// El backend solo hace: prisma.products.update({ data: { status, feedback } })

export async function updateProductStatus(
  uid: string,
  dto: UpdateProductStatusDto,
): Promise<{ uid: string }> {
  const response = await fetch(`${API_URL}/products/status/${uid}`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(dto),
    credentials: "include",
  });

  return handleResponse<{ uid: string }>(
    response,
    "Error al actualizar el estado de la obra",
  );
}

// ─── Aprobar obras seleccionadas ─────────────────────────────────────────────
// PATCH /products/approveMany
// Aprueba en lote los UIDs que el profesor seleccionó con checkboxes.
// El backend hace: prisma.products.updateMany({ where: { uid: { in: productIds }, status: "PENDING" }, data: { status: "APPROVED" } })

export async function approveManyProducts(
  productIds: string[],
): Promise<{ count: number }> {
  const response = await fetch(`${API_URL}/products/approveMany`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify({ productIds }),
    credentials: "include",
  });

  return handleResponse<{ count: number }>(
    response,
    "Error al aprobar las obras seleccionadas",
  );
}

// ─── Eliminar producto ───────────────────────────────────────────────────────

export async function deleteProduct(uid: string): Promise<void> {
  const response = await fetch(`${API_URL}/products/delete/${uid}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Error al eliminar producto");
  }
}