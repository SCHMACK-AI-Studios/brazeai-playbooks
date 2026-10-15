import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * The SCHMACK playbooks: a home page and one deck per playbook, each at its
 * own address (/agentic-standards/3). Vite's dev and preview servers send
 * every unknown path to index.html; any other host must do the same.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(root, "./src") },
  },
  server: { port: 5195 },
  preview: { port: 5195 },
});
