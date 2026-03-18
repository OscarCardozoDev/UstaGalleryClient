import { Routes, Route, Navigate } from "react-router-dom";
import UploadGalleryPage from "./pages/UploadPicture/UploadPictures";
import HomePage from "./pages/home/Home";
import UpdatePicture from "./pages/UpdatePicture/UpdatePicture";
import ReviewArtWorksPage from "./pages/ReviewArtWorks/ReviewArtWorks";
import YourGalleryReviewPage from "./pages/YourGalleryReview/YourGalleryReview";

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/home" replace />} />

      <Route path="/home" element={<HomePage />} />
      <Route path="/upload" element={<UploadGalleryPage />} />
      <Route path="/update/:uid" element={<UpdatePicture />} />
      <Route path="/review-art" element={<ReviewArtWorksPage />} />
      <Route path="/your-gallery" element={<YourGalleryReviewPage />} />

      {/* futuras rutas */}
      {/* <Route path="users" element={<UsersPage />} /> */}
    </Routes>
  );
}
