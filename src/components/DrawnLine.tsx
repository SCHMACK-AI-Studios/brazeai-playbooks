import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useSlide } from "@/engine/SlideContext";

/** A full-canvas SVG layer for the deck's vector connectors. */
export function LineLayer({ children }: { children: ReactNode }) {
  return (
    <svg className="decor absolute inset-0" width={1920} height={1080} viewBox="0 0 1920 1080" aria-hidden="true">
      {children}
    </svg>
  );
}

/**
 * A straight connector from the source deck, drawn from its start point to
 * its end point when shown. Coordinates are canvas pixels.
 */
export function DrawnLine({
  x1,
  y1,
  x2,
  y2,
  width = 2,
  color = "var(--red)",
  on = true,
  delay = 0,
  duration = 0.4,
  cap = "butt",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width?: number;
  color?: string;
  on?: boolean;
  delay?: number;
  duration?: number;
  cap?: "butt" | "round" | "square";
}) {
  const { instant } = useSlide();
  return (
    <motion.path
      d={`M${x1},${y1} L${x2},${y2}`}
      stroke={color}
      strokeWidth={width}
      strokeLinecap={cap}
      fill="none"
      initial={instant ? false : { pathLength: 0, opacity: 0 }}
      animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
      transition={
        instant
          ? { duration: 0 }
          : on
            ? {
                pathLength: { duration, delay, ease: [0.45, 0, 0.35, 1] },
                opacity: { duration: 0.01, delay },
              }
            : { duration: 0.15 }
      }
    />
  );
}
