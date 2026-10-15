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

/** One playbook: a deck with its own address, listed on the home page. */
export interface Playbook {
  /** The address segment: /agentic-standards. */
  id: string;
  /** Two digits, as the home page numbers them. */
  number: string;
  /** Listed on the home page, greyed out and not clickable. */
  comingSoon?: boolean;
  title: string;
  /** The Braze product the playbook covers, with its release status. */
  product: string;
  /** One line for the home page. */
  summary: string;
  slides: SlideDef[];
}
