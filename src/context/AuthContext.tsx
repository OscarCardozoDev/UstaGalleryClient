import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
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
  logout: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const SESSION_KEY = 'user_session';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS - USUARIO (sessionStorage)
// ═══════════════════════════════════════════════════════════════════════════

const saveUser = (user: UserSession) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

const getUser = (): UserSession | null => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
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
  isProfesor: data.isProfesor,
  userType: data.userType,
  photo: data.photo ?? null,
  groups: data.groups.map((g: any) => ({
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
  const navigate = useNavigate();
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

  useEffect(() => {
    const init = async () => {
      // Intentar cargar desde sessionStorage primero
      const cached = getUser();
      if (cached) {
        setUser(cached);
        setCurrentGroupState(resolveGroup(cached));
        setIsLoading(false);
        return;
      }

      // Si no hay cache, cargar desde el backend
      try {
        const data = await getCurrentUser();
        const session = transformUser(data);
        saveUser(session);
        setUser(session);
        setCurrentGroupState(resolveGroup(session));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuario');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const setCurrentGroup = (groupId: string) => {
    if (!user) return;

    if (user.groups.some(g => g.uid === groupId)) {
      setCurrentGroupState(groupId);
      saveGroup(user.uid, groupId);
    } else {
      console.warn(`Grupo ${groupId} no encontrado en la lista de grupos del usuario`);
    }
  };

  const logout = async () => {
    await Logout();
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    setCurrentGroupState(null);
    navigate("/");
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    currentGroup,
    setCurrentGroup,
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