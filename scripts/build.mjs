import { cp, mkdir, rm } from "node:fs/promises";
import { build } from "vite";
import playbooks from "../config/playbooks.json" with { type: "json" };

// Never publish dist directly: every file is served through server/index.mjs.
await rm("dist", { recursive: true, force: true });
for (const playbook of playbooks) {
  process.env.PLAYBOOK_ID = playbook.id;
  await build();
  const out = `dist/${playbook.id}`;
  await mkdir(`${out}/images`, { recursive: true });
  await mkdir(`${out}/illustrations`, { recursive: true });
  await cp("public/logos", `${out}/logos`, { recursive: true });
  await cp("public/favicon.png", `${out}/favicon.png`);
  await cp("public/illustrations/arrow.webp", `${out}/illustrations/arrow.webp`);
  for (const image of playbook.images) await cp(`public/images/${image}`, `${out}/images/${image}`);
}
