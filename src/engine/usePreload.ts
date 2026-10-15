import { useEffect } from "react";
import type { SlideDef } from "@/engine/types";
import { asset } from "@/lib/asset";

const requested = new Set<string>();

/**
 * Warms the browser cache for the slides either side of the current one, so
 * the next image is decoded before the reader moves forward. Everything
 * else loads when its slide is reached: the deck's largest images (the world
 * map, the collages) never sit on the first frame.
 */
export function usePreload(slides: readonly SlideDef[], current: number) {
  useEffect(() => {
    for (const i of [current, current + 1, current - 1, current + 2]) {
      for (const src of slides[i]?.assets ?? []) {
        if (requested.has(src)) continue;
        requested.add(src);
        const img = new Image();
        img.decoding = "async";
        img.src = asset(src);
      }
    }
  }, [slides, current]);
}
