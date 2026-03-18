import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/public/layouts/Home";
//import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
//import Hero from "./pages/public/modules/hero/Hero";
import AuthPage from "./pages/auth/layout/AuthLayout";
import DashboardModule from "./pages/dashboard/index";
import ShowImage from "./pages/public/modules/ShowImages/ShowImage";
import GalleryPage from "./pages/public/modules/gallery/Gallery";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        {/*<Route path="/hero" element={<Hero />} /> */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard/*" element={<DashboardModule />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/show-picture/:uid" element={<ShowImage />} />

        {/* Aquí puedes agregar rutas protegidas más adelante */}
        {/* 
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
