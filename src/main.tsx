import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import "@/styles/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element in index.html");

/*
 * Hold the first render until the brand fonts are ready (or 1.5s has passed),
 * so the opening slide never lays out in a fallback face and then re-breaks
 * its lines when Albert Sans arrives.
 */
const fontsReady = Promise.all([
  document.fonts.load('600 100px "Albert Sans"'),
  document.fonts.load('400 32px "JetBrains Mono"'),
]).catch(() => undefined);
const timeout = new Promise((r) => setTimeout(r, 1500));

Promise.race([fontsReady, timeout]).then(() => {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
