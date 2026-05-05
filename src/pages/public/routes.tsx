import { Routes, Route, useParams } from "react-router-dom";
import WelcomePage from "./pages/Welcome/Welcome";
import GalleryPage from "./pages/Gallery/Gallery";
import ShowImagePage from "./pages/ShowImage/ShowImage";
import Events from "./pages/Events/Events";
import EventDetail from "./pages/EventDetail/EventDetail";
import ArtistPage from "./pages/ArtistPage/ArtistPage";

export default function MainPageRoutes() {
  return (
    <Routes>
      <Route index element={<WelcomePage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/show-picture/:uid" element={<ShowImagePageWrapper />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:uid" element={<EventDetail />} />
      <Route path="/artist/:uid" element={<ArtistPageWrapper />} />
    </Routes>
  );
}

function ShowImagePageWrapper() {
  const { uid } = useParams<{ uid: string }>();
  return <ShowImagePage key={uid} />;
}

function ArtistPageWrapper() {
  const { uid } = useParams<{ uid: string }>();
  return <ArtistPage key={uid} />;
}