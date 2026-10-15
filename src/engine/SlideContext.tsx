import { createContext, useContext } from "react";

export interface SlideState {
  /** 0-based index of the slide in the deck. */
  slide: number;
  /** Position of this slide within its scene; 0 for a slide with no scene. */
  sceneIndex: number;
  /**
   * True under reduced motion: render the state
   * directly, with no entry animation and no transition into it.
   */
  instant: boolean;
}

export const SlideContext = createContext<SlideState>({ slide: 0, sceneIndex: 0, instant: false });

/**
 * Which way the deck last moved: 1 forward, -1 back. Provided above the
 * slide transition rather than inside it, so a slide that is on its way out
 * still reads the live value and leaves in the direction of travel.
 */
export const DirectionContext = createContext<1 | -1>(1);

export function useSlide(): SlideState & { direction: 1 | -1 } {
  return { ...useContext(SlideContext), direction: useContext(DirectionContext) };
}
