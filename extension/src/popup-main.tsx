import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Launcher from "./popup/Launcher";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Launcher />
  </StrictMode>
);
