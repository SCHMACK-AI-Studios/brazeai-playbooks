import { motion, type TargetAndTransition } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { useSlide } from "@/engine/SlideContext";

export const EASE_OUT = [0.2, 0, 0, 1] as const;
/** The deck's travel ease: quick off the mark, long settle. */
export const EASE_TRAVEL = [0.16, 1, 0.3, 1] as const;

/**
 * `travel` is the default: in from the side the deck is moving from, out
 * the same way on a step back. The others are for a moment that should feel
 * different from navigation (the starburst's punch, a QR code settling).
 */
type From = "travel" | "down" | "fade" | "scale" | "punch";

const TRAVEL = 90;

const HIDDEN: Record<Exclude<From, "travel">, TargetAndTransition> = {
  down: { opacity: 0, y: -28 },
  fade: { opacity: 0 },
  scale: { opacity: 0, scale: 0.94 },
  punch: { opacity: 0, scale: 0.6, rotate: -8 },
};
const SHOWN: TargetAndTransition = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 };

/**
 * Animates children on arrival, with `delay` for sequencing within a slide.
 *
 * Hidden content keeps its layout box, so nothing else on the slide moves
 * when something appears: the source deck's compositions stay put.
 */
export function Reveal({
  on,
  from = "travel",
  delay = 0,
  duration = 0.5,
  className,
  style,
  children,
}: {
  /** Controls visibility. */
  on?: boolean;
  from?: From;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const { instant, direction } = useSlide();
  const shown = on ?? true;
  const hidden = from === "travel" ? { opacity: 0, x: direction * TRAVEL } : HIDDEN[from];
  const transition = instant
    ? { duration: 0 }
    : from === "punch"
      ? { type: "spring" as const, stiffness: 520, damping: 26, delay: shown ? delay : 0 }
      : from === "travel"
        ? shown
          ? { x: { duration: duration + 0.25, delay, ease: EASE_TRAVEL }, opacity: { duration: 0.35, delay } }
          : { duration: 0.22, ease: [0.4, 0, 1, 1] as const }
        : { duration: shown ? duration : 0.22, ease: EASE_OUT, delay: shown ? delay : 0 };

  return (
    <motion.div
      className={className}
      style={style}
      initial={instant ? false : hidden}
      animate={shown ? SHOWN : hidden}
      transition={transition}
      aria-hidden={shown ? undefined : true}
    >
      {children}
    </motion.div>
  );
}
