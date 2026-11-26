import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/caveat/600.css";
import "@fontsource-variable/dynapuff";
import "./styles/tokens.css";
import "./styles/base.css";
import { App } from "./App";
import { applyAccent } from "./lib/accent";
import { loadProfile } from "./lib/profile";

applyAccent(loadProfile().color);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
