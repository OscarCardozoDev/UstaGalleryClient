import type { CreateCredentialDto, CredentialWithoutProfile } from "../interfaces/auth";
const API_URL = import.meta.env.VITE_API_URL;

export async function Register({ mail, password }: CreateCredentialDto) {
  try {
    const response = await fetch(API_URL + '/auth/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
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

export async function getUsersWithoutProfile(): Promise<CredentialWithoutProfile[]> {
  try {
    const response = await fetch(API_URL + '/auth/without-profile', {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al obtener usuarios sin perfil');
    }

    return await response.json();
  } catch (error) {
    throw new Error((error as Error).message || 'Error al obtener usuarios sin perfil');
  }
}

export async function forgotPassword(mail: string): Promise<void> {
  const response = await fetch(API_URL + '/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al enviar el código');
  }
}

export async function resetPassword(
  mail: string,
  code: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch(API_URL + '/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail, code, newPassword }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al cambiar la contraseña');
  }
}
