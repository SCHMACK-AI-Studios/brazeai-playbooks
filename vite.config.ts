import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import playbooks from "./config/playbooks.json";

const root = path.dirname(fileURLToPath(import.meta.url));

/** Production builds contain exactly one playbook; the Node server gates its whole directory. */
export default defineConfig(({ command }) => {
  const selected = playbooks.find((p) => p.id === process.env.PLAYBOOK_ID);
  if (command === "build" && !selected) throw new Error("Use pnpm build to create the protected per-playbook builds.");
  return {
    base: selected ? `/${selected.id}/` : "/",
    publicDir: command === "build" ? false : "public",
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "isolated-playbook",
        resolveId(id) {
          if (id === "virtual:playbooks") return "\0virtual:playbooks";
        },
        load(id) {
          if (id !== "\0virtual:playbooks") return;
          return selected
            ? `import { ${selected.exportName} as playbook } from "/src/playbooks/${selected.id}.tsx"; export const playbooks = [playbook];`
            : 'export { playbooks } from "/src/playbooks/index.ts";';
        },
      },
    ],
    build: { outDir: selected ? `dist/${selected.id}` : "dist", sourcemap: false },
    resolve: {
      alias: { "@": path.resolve(root, "./src") },
    },
    server: { port: 5195 },
    preview: { port: 5195 },
  };
});
