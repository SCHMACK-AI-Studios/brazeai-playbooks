import { motion } from "motion/react";
import { useId } from "react";
import { useSlide } from "@/engine/SlideContext";

export type Pt = readonly [number, number];

/** A smooth path through normalised points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(points: readonly Pt[], w: number, h: number): string {
  const p = points.map(([x, y]) => [x * w, y * h] as const);
  if (p.length < 2) return "";
  let d = `M${p[0]?.[0]},${p[0]?.[1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    if (!p0 || !p1 || !p2 || !p3) continue;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/**
 * One of the deck's hand-drawn marks (arrows, the oval, the underline, the
 * knot, the lightning bolt) drawn onto the slide as if by hand.
 *
 * The artwork is the original PNG from the source deck, not a redrawing: a
 * vector trace would lose the wobble that makes these read as marker pen. It
 * is revealed through an SVG mask whose thick stroke follows the pen's route
 * (`route`, in 0–1 coordinates of the image box), animated from 0 to full
 * length. The route only has to be roughly right; `brush` is wide enough
 * to cover the ink on either side of it.
 *
 * Several routes draw one after another, for marks with separate strokes
 * such as an arrowhead or the two bars of the "≠".
 */
export function Scribble({
  src,
  x,
  y,
  w,
  h,
  rotate = 0,
  flip = false,
  routes,
  brush,
  at = 0,
  on,
  delay = 0,
  duration = 0.7,
  crop,
}: {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  flip?: boolean;
  routes: readonly (readonly Pt[])[];
  brush: number;
  at?: number;
  /** Overrides `at`, for visibility that depends on a scene position. */
  on?: boolean;
  delay?: number;
  duration?: number;
  /** Source-deck srcRect: fractions of the artwork cropped off each edge. */
  crop?: { l?: number; t?: number; r?: number; b?: number };
}) {
  const id = useId().replace(/:/g, "");
  const { step, instant } = useSlide();
  const shown = on ?? step >= at;
  const per = duration / routes.length;
  const fullW = w / (1 - (crop?.l ?? 0) - (crop?.r ?? 0));
  const fullH = h / (1 - (crop?.t ?? 0) - (crop?.b ?? 0));

  return (
    <div
      className="decor absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `rotate(${rotate}deg) scaleX(${flip ? -1 : 1})`,
      }}
      aria-hidden="true"
    >
      <svg aria-hidden="true" width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="hidden">
        <mask id={id} maskUnits="userSpaceOnUse" x={-w} y={-h} width={w * 3} height={h * 3}>
          {routes.map((route, i) => (
            <motion.path
              // The routes are fixed data; their order is their identity.
              key={i}
              d={smoothPath(route, w, h)}
              fill="none"
              stroke="white"
              strokeWidth={brush}
              strokeLinecap="round"
              strokeLinejoin="round"
              // Opacity rides along because a zero-length path with round caps still paints a dot.
              initial={instant ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
              transition={
                instant
                  ? { duration: 0 }
                  : shown
                    ? {
                        pathLength: { duration: per, delay: delay + i * per, ease: [0.45, 0, 0.35, 1] },
                        opacity: { duration: 0.01, delay: delay + i * per },
                      }
                    : { duration: 0.15 }
              }
            />
          ))}
        </mask>
        <g mask={`url(#${id})`}>
          <image
            href={src}
            x={-(crop?.l ?? 0) * fullW}
            y={-(crop?.t ?? 0) * fullH}
            width={fullW}
            height={fullH}
            preserveAspectRatio="none"
          />
        </g>
      </svg>
    </div>
  );
}
