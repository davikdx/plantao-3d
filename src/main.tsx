import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./ui/styles.css";

const el = document.getElementById("root");
if (!el) throw new Error("Elemento raiz ausente");
createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>
);
