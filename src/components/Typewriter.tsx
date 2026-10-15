import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { useSlide } from "@/engine/SlideContext";

export interface Segment {
  text: string;
  className?: string;
  style?: CSSProperties;
}

const MS_PER_CHAR = 38;
const MAX_DURATION_MS = 1500;

/**
 * Types a line in, adapted from abridge-sessions' TypewriterHeadline.
 *
 * The same rule holds that made that component reliable: every character is
 * its own span from the first frame, and typing only flips `visibility`. The
 * boxes the browser wraps never change, so the line breaks are fixed before
 * the first character shows and nothing reflows mid-type. The caret is
 * absolutely positioned inside the current character, outside line layout.
 *
 * Differences from the original: it takes coloured segments, because the
 * source deck colours words mid-line ("CRM has evolved. Again."), and it
 * starts on arrival rather than on scroll.
 */
export function Typewriter({
  segments,
  on,
  delay = 0,
  className,
  style,
  caretColor = "currentColor",
  keepCaret = false,
}: {
  segments: readonly Segment[];
  /** Controls visibility. */
  on?: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  caretColor?: string;
  keepCaret?: boolean;
}) {
  const { instant } = useSlide();
  const full = segments.map((s) => s.text).join("");
  const total = Array.from(full).length;
  const active = on ?? true;
  const [count, setCount] = useState(instant && active ? total : 0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    if (instant) {
      setCount(total);
      return;
    }
    const perChar = Math.min(MS_PER_CHAR, MAX_DURATION_MS / Math.max(total, 1));
    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setCount(i);
        if (i >= total && interval) clearInterval(interval);
      }, perChar);
    }, delay * 1000);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [active, instant, total, delay]);

  const done = count >= total;
  const caretIndex = count === 0 ? 0 : count - 1;
  let index = 0;
  const nodes: ReactNode[] = [];

  segments.forEach((seg, s) => {
    const chars = Array.from(seg.text).map((char) => {
      const i = index++;
      return (
        <span key={i} aria-hidden="true" style={{ visibility: i < count ? "visible" : "hidden", position: "relative" }}>
          {char}
          {active && (!done || keepCaret) && i === caretIndex && (
            <span
              className={done ? "caret" : undefined}
              style={{
                position: "absolute",
                left: count === 0 ? 0 : "100%",
                top: "0.08em",
                bottom: "0.08em",
                width: "0.08em",
                background: caretColor,
                visibility: "visible",
              }}
            />
          )}
        </span>
      );
    });
    nodes.push(
      <span key={s} className={seg.className} style={seg.style}>
        {chars}
      </span>,
    );
  });

  return (
    <span className={className} style={style}>
      <span className="sr-only">{full}</span>
      {nodes}
    </span>
  );
}
