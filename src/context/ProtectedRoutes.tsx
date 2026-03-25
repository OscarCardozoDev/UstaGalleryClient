import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// ProtectedRoute.tsx — bloquea si NO está autenticado (para /dashboard)
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // o un spinner

  if (!user) return <Navigate to="/auth" replace />;

  return children;
};

// GuestRoute.tsx — bloquea si YA está autenticado (para /auth)
export const GuestRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};