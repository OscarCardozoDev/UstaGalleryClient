import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser } from '../services/users';
import type { UserSession } from '../interfaces/session';
import { Logout } from '../services/auth';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS DEL CONTEXTO
// ═══════════════════════════════════════════════════════════════════════════

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  error: string | null;
  currentGroup: string | null;
  setCurrentGroup: (groupId: string) => void;
  isAuthenticated: () => boolean;
  login: (rawUserData: any) => void;
  logout: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════
const sessionKey = crypto.randomUUID();

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS - USUARIO (sessionStorage)
// ═══════════════════════════════════════════════════════════════════════════

const saveUser = (user: UserSession) => {
  sessionStorage.setItem(sessionKey, JSON.stringify(user));
};

const getUser = (): UserSession | null => {
  try {
    const stored = sessionStorage.getItem(sessionKey);
    return stored ? (JSON.parse(stored) as UserSession) : null;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS - GRUPO (localStorage)
// ═══════════════════════════════════════════════════════════════════════════

const saveGroup = (userId: string, groupId: string) => {
  localStorage.setItem(userId, groupId);
};

const getGroup = (userId: string): string | null => {
  return localStorage.getItem(userId);
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS - TRANSFORMAR RESPUESTA DEL BACKEND
// ═══════════════════════════════════════════════════════════════════════════

const transformUser = (data: any): UserSession => ({
  uid: data.uid,
  name: data.name,
  lastName: data.lastName,
  username: data.username,
  userType: data.userType,
  photo: data.photo ?? null,
  groups: (data.groups ?? []).map((g: any) => ({
    uid: g.group.uid,
    name: g.group.name,
  })),
  lastUpdated: new Date().toISOString(),
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXTO
// ═══════════════════════════════════════════════════════════════════════════

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentGroup, setCurrentGroupState] = useState<string | null>(null);

  const resolveGroup = (user: UserSession) => {
    const saved = getGroup(user.uid);
    const isValid = user.groups.some(g => g.uid === saved);

    if (isValid) return saved!;

    const defaultGroup = user.groups[0]?.uid ?? null;
    if (defaultGroup) saveGroup(user.uid, defaultGroup);
    return defaultGroup;
  };

  // Carga inicial: sessionStorage → backend
  useEffect(() => {
    const init = async () => {
      const cached = getUser();
      if (cached) {
        setUser(cached);
        setCurrentGroupState(resolveGroup(cached));
        setIsLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        const session = transformUser(data);
        saveUser(session);
        setUser(session);
        setCurrentGroupState(resolveGroup(session));
      } catch {
        // Sin sesión activa, usuario queda null — no es un error real
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // ── login: llamar después de un Login() exitoso ──────────
  // Recibe los datos crudos del backend, los transforma y guarda en sesión.
  const login = (rawUserData: any) => {
    const session = transformUser(rawUserData);
    saveUser(session);
    setUser(session);
    setCurrentGroupState(resolveGroup(session));
  };

  // ── setCurrentGroup ───────────────────────────────────────
  const setCurrentGroup = (groupId: string) => {
    if (!user) return;

    if (user.groups.some(g => g.uid === groupId)) {
      setCurrentGroupState(groupId);
      saveGroup(user.uid, groupId);
    } else {
      console.warn(`Grupo ${groupId} no encontrado en la lista de grupos del usuario`);
    }
  };

  const isAuthenticated = (): boolean => {
    return !!getUser();
  };

  // ── logout ────────────────────────────────────────────────
  // No navega — quien llame a logout() se encarga del navigate
  const logout = async () => {
    await Logout();
    sessionStorage.removeItem(sessionKey);
    setUser(null);
    setCurrentGroupState(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    currentGroup,
    setCurrentGroup,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}