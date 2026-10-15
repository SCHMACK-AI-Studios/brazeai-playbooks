import type { Playbook } from "@/engine/types";
import { agenticStandards } from "@/playbooks/agentic-standards";
import { conversationalAgents } from "@/playbooks/conversational-agents";
import { decisioningStudioGo } from "@/playbooks/decisioning-studio-go";

/** Every playbook, in the order the home page lists them. Add a new one here. */
export const playbooks: Playbook[] = [decisioningStudioGo, agenticStandards, conversationalAgents];
