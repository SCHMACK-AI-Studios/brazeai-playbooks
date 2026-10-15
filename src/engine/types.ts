import type { ComponentType } from "react";

/** The section tag printed top left on the slide, written with its brackets: "[ WHY IT MATTERS ]". */
export type SectionLabel = string;

export interface SlideDef {
  /** Stable, human-readable id. Used as the React key. */
  id: string;
  /** Describes the slide for assistive technology. */
  title: string;
  component: ComponentType;
}

export interface DeckPosition {
  slide: number;
}

/** One playbook: a deck with its own protected address. */
export interface Playbook {
  /** The address segment: /agentic-standards. */
  id: string;
  /** Two digits, as printed on the cover. */
  number: string;
  /** Editorial status only. Website resource entries control publication. */
  comingSoon?: boolean;
  title: string;
  /** The Braze product the playbook covers, with its release status. */
  product: string;
  /** A one-line editorial summary. */
  summary: string;
  slides: SlideDef[];
}
