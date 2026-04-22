import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Home/Home";
import UploadGalleryPage from "./pages/UploadPicture/UploadPictures";
import UpdatePicture from "./pages/UpdatePicture/UpdatePicture";
import ReviewArtWorksPage from "./pages/ReviewArtWorks/ReviewArtWorks";
import YourGalleryReviewPage from "./pages/YourGalleryReview/YourGalleryReview";
import CreateEventPage from "./pages/CreateEvent/CreateEvent";
import ReviewEvents from "./pages/ReviewEvents/ReviewEvents";
import EditEventPage from "./pages/EditEvent/EditEvent";
import InvitationsPage from "./pages/Invitations/Invitations";
import MyEventsPage from "./pages/MyEvents/MyEvents";

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/home" replace />} />

      <Route path="/home" element={<HomePage />} />
      <Route path="/upload" element={<UploadGalleryPage />} />
      <Route path="/update/:uid" element={<UpdatePicture />} />
      <Route path="/review-art" element={<ReviewArtWorksPage />} />
      <Route path="/your-gallery" element={<YourGalleryReviewPage />} />
      <Route path="/create-event" element={<CreateEventPage />} />
      <Route path="/events/" element={<ReviewEvents />} />
      <Route path="/events/edit/:uid" element={<EditEventPage />} />
      <Route path="/invitations" element={<InvitationsPage />} />
      <Route path="/my-events" element={<MyEventsPage />} />

      {/* futuras rutas */}
      {/* <Route path="users" element={<UsersPage />} /> */}
    </Routes>
  );
}
