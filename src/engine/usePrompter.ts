import { type RefObject, useEffect, useRef } from "react";

/** Speed multipliers the presenter steps through. 1× is roughly a relaxed speaking pace. */
export const PROMPTER_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3] as const;

/** Lines per second at 1×: about 150 words a minute at 5 words a line. */
const LINES_PER_SECOND = 0.5;

/**
 * Scrolls `ref` upward at a steady rate while `on`, like an autocue.
 *
 * The rate is expressed in lines, so bigger notes scroll proportionally faster
 * and the reading pace stays the same whatever the font size. Position is kept
 * as a float between frames because `scrollTop` rounds to whole pixels, and at
 * slow speeds a frame's movement is less than one. The presenter can still
 * scroll by hand: the next frame carries on from wherever they left it.
 *
 * Changing `resetKey` (the slide) returns to the top.
 */
export function usePrompter(
  ref: RefObject<HTMLElement | null>,
  { on, speed, lineHeight, resetKey }: { on: boolean; speed: number; lineHeight: number; resetKey: unknown },
) {
  const pos = useRef(0);

  useEffect(() => {
    pos.current = 0;
    if (ref.current) ref.current.scrollTop = 0;
  }, [resetKey, ref]);

  useEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
    const pxPerSecond = LINES_PER_SECOND * lineHeight * speed;
    let frame = 0;
    let last = performance.now();
    pos.current = el.scrollTop;

    function tick(now: number) {
      if (!el) return;
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      // A manual scroll moved it more than a frame's drift: follow the hand.
      if (Math.abs(el.scrollTop - pos.current) > 2) pos.current = el.scrollTop;
      pos.current = Math.min(pos.current + pxPerSecond * dt, el.scrollHeight - el.clientHeight);
      el.scrollTop = pos.current;
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [on, speed, lineHeight, ref]);
}
