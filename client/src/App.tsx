import { useCallback, useEffect, useState } from "react";
import { ScribbleField } from "./components/ScribbleField";
import { Toasts } from "./components/Toasts";
import { Landing } from "./pages/Landing";
import { RoomPage } from "./pages/RoomPage";

function parse(path: string): { page: "landing" } | { page: "room"; code: string } {
  const m = path.match(/^\/r\/([A-Za-z]{5})\/?$/);
  return m ? { page: "room", code: m[1].toUpperCase() } : { page: "landing" };
}

export function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to !== window.location.pathname) window.history.pushState(null, "", to);
    setPath(to);
    window.scrollTo(0, 0);
  }, []);

  const route = parse(path);
  return (
    <>
      <SketchFilters />
      <ScribbleField />
      {route.page === "room" ? <RoomPage key={route.code} code={route.code} navigate={navigate} /> : <Landing navigate={navigate} />}
      <Toasts />
    </>
  );
}

/** The wobble behind every hand-drawn outline (.sketch). Two seeds, so neighbours don't wobble alike. */
function SketchFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <filter id="sketch-wobble" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="sketch-wobble-alt" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="11" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
