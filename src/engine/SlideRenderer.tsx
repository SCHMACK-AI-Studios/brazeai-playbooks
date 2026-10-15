import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { DirectionContext, SlideContext } from "@/engine/SlideContext";
import type { DeckPosition, SlideDef } from "@/engine/types";

/** First index of the run of adjacent slides sharing `slides[index]`'s scene. */
export function sceneStart(slides: readonly SlideDef[], index: number): number {
  const scene = slides[index]?.scene;
  if (!scene) return index;
  let i = index;
  while (i > 0 && slides[i - 1]?.scene === scene) i--;
  return i;
}

/**
 * Renders one deck position.
 *
 * The deck behaves like one horizontal strip, the way abridge-sessions'
 * scroll-snapped frames do: forward pulls the next slide's content in from
 * the right, back brings it from the left, and the edge arrows point the
 * same way. Only the content travels. Each slide's ground dissolves in place,
 * and since nearly every slide shares the #181818 master and its chrome, the
 * footer, fox, and rule never appear to move at all.
 *
 * Slides in the same scene share a key, so React keeps the one component
 * mounted and the scene animates its own composition from slide to slide.
 */
export function SlideRenderer({
  slides,
  position,
  instant = false,
}: {
  slides: readonly SlideDef[];
  position: DeckPosition;
  instant?: boolean;
}) {
  const previous = useRef(position);
  const direction = useRef<1 | -1>(1);
  const prev = previous.current;
  if (prev.slide !== position.slide) {
    direction.current = position.slide > prev.slide ? 1 : -1;
    previous.current = position;
  }

  const def = slides[position.slide];
  if (!def) return null;
  const key = def.scene ?? def.id;
  const Component = def.component;
  const value = {
    slide: position.slide,
    sceneIndex: position.slide - sceneStart(slides, position.slide),
    instant,
  };

  return (
    <DirectionContext.Provider value={direction.current}>
      <AnimatePresence initial={false}>
        <motion.div
          key={key}
          data-slide={def.id}
          className="absolute inset-0"
          initial={instant ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={instant ? { duration: 0 } : { duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
        >
          <SlideContext.Provider value={value}>
            <Component />
          </SlideContext.Provider>
        </motion.div>
      </AnimatePresence>
    </DirectionContext.Provider>
  );
}
