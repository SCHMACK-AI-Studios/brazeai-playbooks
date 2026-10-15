import type { DeckPosition } from "@/engine/types";

/** Reading position belongs to this tab. The URL preserves it on refresh. */
let total = 1;
let state: DeckPosition = { slide: 0 };
const listeners = new Set<() => void>();

function clampSlide(slide: number): number {
  return Math.max(0, Math.min(total - 1, Math.trunc(slide) || 0));
}

function goTo(slide: number) {
  const next = clampSlide(slide);
  if (next === state.slide) return;
  state = { slide: next };
  for (const listener of listeners) listener();
}

export function startDeck(slideCount: number, urlSlide: number | null): void {
  total = Math.max(1, slideCount);
  state = { slide: clampSlide(urlSlide ?? 0) };
}

export const deck = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): DeckPosition {
    return state;
  },
  next() {
    goTo(state.slide + 1);
  },
  prev() {
    goTo(state.slide - 1);
  },
  goTo,
  get total() {
    return total;
  },
};
