import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./modules/Home/Home";
import UploadGalleryPage from "./modules/UploadPicture/UploadPictures";
import UpdatePicture from "./modules/UpdatePicture/UpdatePicture";
import ReviewArtWorksPage from "./modules/ReviewArtWorks/ReviewArtWorks";
import YourGalleryReviewPage from "./modules/YourGalleryReview/YourGalleryReview";
import CreateEventPage from "./modules/CreateEvent/CreateEvent";
import ReviewEvents from "./modules/ReviewEvents/ReviewEvents";
import EditEventPage from "./modules/EditEvent/EditEvent";
import Calendar from "./modules/Calendar/Calendar";
import InvitationsPage from "./modules/Invitations/Invitations";
import MyEventsPage from "./modules/MyEvents/MyEvents";
import ClasesPage from "./modules/Clases/Clases";
import ProfessorsPage from "./modules/Professors/Professors";
import GamesModule from "./modules/Games";
import ControlPanelPage from "./modules/ControlPanel/ControlPanel";

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
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/invitations" element={<InvitationsPage />} />
      <Route path="/my-events" element={<MyEventsPage />} />
      <Route path="/clases" element={<ClasesPage />} />
      <Route path="/professors" element={<ProfessorsPage />} />
      <Route path="/panel-control" element={<ControlPanelPage />} />
      <Route path="/games/*" element={<GamesModule />} />

      {/* futuras rutas */}
      {/* <Route path="users" element={<UsersPage />} /> */}
    </Routes>
  );
}
