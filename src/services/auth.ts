import type { CreateCredentialDto } from "../interfaces/auth";
const API_URL = import.meta.env.VITE_API_URL;

export async function Register({ mail, password }: CreateCredentialDto) {
  try {
    const response = await fetch(API_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mail, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al registrar usuario');
    }

    return await response.json();
  } catch (error) {
    throw new Error((error as Error).message || 'Error al registrar usuario');
  }
}

export async function Login({ mail, password }: CreateCredentialDto) {
  try {
    const response = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mail, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al iniciar sesión');
    }

    return await response.json();
  } catch (error) {
    throw new Error((error as Error).message || 'Error al iniciar sesión');
  }
}

export async function Logout() {
  try {
    const response = await fetch(API_URL + '/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al cerrar sesión');
    }

    return await response.json();
  } catch (error) {
    throw new Error((error as Error).message || 'Error al cerrar sesión');
  }
}

export async function sendVerificationCode(): Promise<void> {
  const response = await fetch(API_URL + '/auth/send-code', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al enviar el código');
  }
}

export async function verifyCode(code: string): Promise<{ verified: boolean }> {
  const response = await fetch(API_URL + '/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Código inválido o expirado');
  }

  return response.json();
}
