import { useState, useEffect } from "react";

export default function useScreen() {
  const getSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [screen, setScreen] = useState(getSize);

  useEffect(() => {
    function handleResize() {
      setScreen(getSize());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screen;
}
