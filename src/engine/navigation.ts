import type { DeckPosition } from "@/engine/types";

/**
 * Pure navigation rules, kept apart from the store so they read in one place.
 *
 * Forward walks every reveal state of a slide before leaving it. Back undoes
 * reveals first, then lands on the previous slide fully revealed, the way a
 * presenter expects when they step back to re-make a point.
 */
export function nextPosition(pos: DeckPosition, steps: readonly number[]): DeckPosition {
  const max = steps[pos.slide] ?? 0;
  if (pos.step < max) return { slide: pos.slide, step: pos.step + 1 };
  if (pos.slide < steps.length - 1) return { slide: pos.slide + 1, step: 0 };
  return pos;
}

export function prevPosition(pos: DeckPosition, steps: readonly number[]): DeckPosition {
  if (pos.step > 0) return { slide: pos.slide, step: pos.step - 1 };
  if (pos.slide > 0) return { slide: pos.slide - 1, step: steps[pos.slide - 1] ?? 0 };
  return pos;
}

export function clampPosition(pos: DeckPosition, steps: readonly number[]): DeckPosition {
  const slide = Math.max(0, Math.min(steps.length - 1, Math.trunc(pos.slide) || 0));
  const step = Math.max(0, Math.min(steps[slide] ?? 0, Math.trunc(pos.step) || 0));
  return { slide, step };
}

export function samePosition(a: DeckPosition, b: DeckPosition): boolean {
  return a.slide === b.slide && a.step === b.step;
}
