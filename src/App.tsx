import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, GuestRoute } from "./context/ProtectedRoutes";
import MainPageModule from "./pages/public/index";
import AuthPage from "./pages/auth/layout/AuthLayout";
import DashboardModule from "./pages/dashboard/index";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
        {/* Rutas públicas */}
        <Route path="/*" element={<MainPageModule />} />
        <Route path="/auth" element={
          <GuestRoute>
            <AuthPage />
          </GuestRoute>
        } />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <DashboardModule />
          </ProtectedRoute>
        } />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
