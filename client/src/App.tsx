import { useCallback, useEffect, useState } from "react";
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
      {route.page === "room" ? <RoomPage key={route.code} code={route.code} navigate={navigate} /> : <Landing navigate={navigate} />}
      <Toasts />
    </>
  );
}
