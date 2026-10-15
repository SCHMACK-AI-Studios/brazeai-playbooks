import { access } from "node:fs/promises";
import playbooks from "../config/playbooks.json" with { type: "json" };
import { createApp } from "./app.mjs";
import { buildPath, loadConfig } from "./config.mjs";

const config = loadConfig();
for (const playbook of playbooks) await access(buildPath(config, playbook.id, "index.html"));
const server = createApp(config);
server.listen(config.port, config.host, () =>
  console.log(`Protected playbook server listening on port ${config.port}`),
);
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => server.close(() => process.exit(0)));
