import { Routes, Route, useParams } from "react-router-dom";
import WelcomePage from "./modules/Welcome/Welcome";
import GalleryPage from "./modules/Gallery/Gallery";
import ShowImagePage from "./modules/ShowImage/ShowImage";
import Events from "./modules/Events/Events";
import EventDetail from "./modules/EventDetail/EventDetail";
import ArtistPage from "./modules/ArtistPage/ArtistPage";

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