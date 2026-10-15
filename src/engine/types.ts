import type { ComponentType } from "react";

/** The section tag printed top left on the slide, written with its brackets: "[ WHY IT MATTERS ]". */
export type SectionLabel = string;

export interface SlideDef {
  /** Stable, human-readable id. Used as the React key, and in the presenter view. */
  id: string;
  /** Shown in the presenter view. Never shown to the audience. */
  title: string;
  /**
   * Reveal states after the first. 0 means the slide is complete on arrival;
   * 2 means forward advances twice within the slide before moving on.
   */
  steps: number;
  /**
   * Adjacent slides that share a scene keep one component mounted, so the
   * scene can animate from one slide's composition into the next rather than
   * cutting. The component reads its position in the scene from useSlide().
   */
  scene?: string;
  /** Speaker notes. Never rendered in audience mode. A line starting [CLICK] marks a reveal. */
  notes: string[];
  /** Images this slide shows, preloaded when it is the next or previous slide. Paths are relative to public/. */
  assets?: string[];
  component: ComponentType;
}

export interface DeckPosition {
  slide: number;
  step: number;
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
