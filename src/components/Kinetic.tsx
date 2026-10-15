import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { useSlide } from "@/engine/SlideContext";

/**
 * A line of the deck's display type. A plain string is white at the
 * headline weight; `[text]` marks a phrase in SCHMACK red, and `{text}` sets
 * it bold, which is how the source deck lands each statement's point ("but
 * also [{messier}]"). The two nest either way round.
 */
export type Line = string;

type Seg = { text: string; red: boolean; bold: boolean };

function segments(line: Line): Seg[] {
  const out: Seg[] = [];
  let red = false;
  let bold = false;
  let text = "";
  const flush = () => {
    if (text) out.push({ text, red, bold });
    text = "";
  };
  for (const ch of line) {
    if (ch === "[" || ch === "]" || ch === "{" || ch === "}") {
      flush();
      if (ch === "[" || ch === "]") red = ch === "[";
      else bold = ch === "{";
    } else text += ch;
  }
  flush();
  return out;
}

/** How far a line travels in, in canvas pixels. Further than the slide itself, for depth. */
const LINE_TRAVEL = 120;
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Display type that moves the way the deck moves.
 *
 * Each line travels in along the direction of navigation, from the right
 * going forward and from the left going back, so the type follows the edge
 * arrows. It travels further than the slide's own content layer, which
 * gives the headline a little parallax depth over everything else. Lines
 * land a beat apart, like a sentence being read.
 *
 * Red phrases then get a pass of the marker: the red is laid down across
 * them in the direction of travel, just after the line lands. It is the same gesture as the deck's
 * hand-drawn red underlines and circles.
 *
 * Lines are given explicitly and never wrap, so every break is the one in
 * the source deck, at any window size.
 */
export function Kinetic({
  lines,
  on,
  delay = 0,
  stagger = 0.08,
  accentDelay = 0.3,
  className,
  style,
  lineStyle,
}: {
  lines: readonly Line[];
  /** Controls visibility. */
  on?: boolean;
  delay?: number;
  stagger?: number;
  accentDelay?: number;
  className?: string;
  style?: CSSProperties;
  lineStyle?: CSSProperties;
}) {
  const { instant, direction } = useSlide();
  const shown = on ?? true;
  const hidden = { x: direction * LINE_TRAVEL, opacity: 0 };
  // The marker's un-inked half has to match the surrounding type exactly.
  const base = (style?.color as string | undefined) ?? "#ffffff";

  return (
    <div className={className} style={style}>
      <span className="sr-only">{lines.join(" ").replace(/[[\]{}]/g, "")}</span>
      {lines.map((line, li) => {
        const d = delay + li * stagger;
        return (
          <motion.div
            key={li}
            aria-hidden="true"
            style={{ whiteSpace: "pre", ...lineStyle }}
            initial={instant ? false : hidden}
            animate={shown ? { x: 0, opacity: 1 } : hidden}
            transition={
              instant
                ? { duration: 0 }
                : shown
                  ? { x: { duration: 0.8, delay: d, ease: EASE }, opacity: { duration: 0.35, delay: d } }
                  : { duration: 0.22, ease: [0.4, 0, 1, 1] }
            }
          >
            {segments(line).map((seg, si) =>
              seg.red ? (
                <Marker key={si} text={seg.text} bold={seg.bold} base={base} shown={shown} delay={d + accentDelay} />
              ) : (
                <span key={si} style={seg.bold ? { fontWeight: 700 } : undefined}>
                  {seg.text}
                </span>
              ),
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * A red phrase whose colour is laid down by a sweep. It is a two-stop
 * gradient twice the phrase's width, clipped to the glyphs and slid across,
 * so the type itself never changes and nothing reflows while it colours.
 */
function Marker({
  text,
  bold,
  base,
  shown,
  delay,
}: {
  text: string;
  bold: boolean;
  base: string;
  shown: boolean;
  delay: number;
}) {
  const { instant, direction } = useSlide();
  const forward = direction === 1;
  const inked = forward ? "0% 0" : "100% 0";
  const bare = forward ? "100% 0" : "0% 0";
  return (
    <motion.span
      style={{
        backgroundImage: `linear-gradient(${forward ? 90 : 270}deg, var(--red) 50%, ${base} 50%)`,
        backgroundSize: "200% 100%",
        backgroundRepeat: "no-repeat",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "var(--red)",
        fontWeight: bold ? 700 : undefined,
      }}
      initial={instant ? false : { backgroundPosition: bare }}
      animate={{ backgroundPosition: shown ? inked : bare }}
      transition={
        instant ? { duration: 0 } : { duration: shown ? 0.6 : 0.1, delay: shown ? delay : 0, ease: [0.65, 0, 0.35, 1] }
      }
    >
      {text}
    </motion.span>
  );
}
