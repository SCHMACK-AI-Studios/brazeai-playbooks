import type { Playbook } from "@/engine/types";
import { agenticStandards } from "@/playbooks/agentic-standards";
import { conversationalAgents } from "@/playbooks/conversational-agents";
import { decisioningStudioGo } from "@/playbooks/decisioning-studio-go";

/** Local editorial development only. Production uses one isolated entry per playbook. */
export const playbooks: Playbook[] = [decisioningStudioGo, agenticStandards, conversationalAgents];
