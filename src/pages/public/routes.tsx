import { Routes, Route, useParams } from "react-router-dom";
import WelcomePage from "./modules/Welcome/Welcome";
import GalleryPage from "./modules/Gallery/Gallery";
import ShowImagePage from "./modules/ShowImage/ShowImage";
import Events from "./modules/Events/Events";
import EventDetail from "./modules/EventDetail/EventDetail";

export default function MainPageRoutes() {
  return (
    <Routes>
      <Route index element={<WelcomePage />} />
      <Route path="/gallery" element={<GalleryPage/>} />
      <Route path="/show-picture/:uid" element={<ShowImagePageWrapper/>} />
      <Route path="/events" element={<Events/>} />
      <Route path="/events/:uid" element={<EventDetail/>} />

      {/*
        <Hero 
          widthHeader={widthButton} 
          heightHeader={heightHeader}
          heightCarrusel={300} 
          widthCarrusel={400} 
          positionYCarrusel={525} 
        />
      */}
    </Routes>
  );
}

// -------------------------- Wrappers -------------------------- //

/**
 * ShowImagePageWrapper
 * 
 * Este wrapper es necesario para pasar el parámetro `uid` a ShowImagePage.
 * Al envolver ShowImagePage en este componente, se asegura de que se renderice
 * con el parámetro `uid` correcto, evitando problemas de rendimiento y
 * asegurando que cada imagen se muestre correctamente.
 */
function ShowImagePageWrapper() {
  const { uid } = useParams<{ uid: string }>();
  return <ShowImagePage key={uid} />;
}