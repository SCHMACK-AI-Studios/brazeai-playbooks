/// <reference types="vite/client" />

declare module "virtual:playbooks" {
  export const playbooks: import("./engine/types").Playbook[];
}
