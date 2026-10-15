import { useEffect, useRef, useState } from "react";
import { useSlide } from "@/engine/SlideContext";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/<>[]{}=+*#%";

function scrambled(target: string, settled: number, seed: number): string {
  let out = "";
  const chars = Array.from(target);
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i] ?? "";
    // Spaces stay spaces, so every word keeps its length and the lines wrap
    // exactly as the settled text will: JetBrains Mono gives every glyph the
    // same advance, so nothing on the card shifts while it decodes.
    if (i < settled || c === " " || c === "\n") out += c;
    else out += GLYPHS[(i * 7 + seed * 13) % GLYPHS.length];
  }
  return out;
}

/**
 * Swaps `from` for `to` when the slide reaches reveal state `at`, decoding
 * left to right through random glyphs. Built for the recap slide, where
 * each theme card turns into the action it asks for; in the source deck the
 * two texts simply swap on click.
 */
export function Scramble({
  from,
  to,
  at,
  duration = 0.9,
  className,
}: {
  from: string;
  to: string;
  at: number;
  duration?: number;
  className?: string;
}) {
  const { step, instant } = useSlide();
  const flipped = step >= at;
  const [text, setText] = useState(flipped ? to : from);
  const first = useRef(true);

  useEffect(() => {
    const target = flipped ? to : from;
    // Arriving on the slide already past this card's reveal (stepping back
    // from the next slide) shows the settled text; only a live press decodes.
    if (instant || first.current) {
      first.current = false;
      setText(target);
      return;
    }
    const len = Array.from(target).length;
    const started = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / (duration * 1000));
      const settled = Math.floor(t * t * len);
      setText(t >= 1 ? target : scrambled(target, settled, Math.floor(now / 50)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [flipped, from, to, instant, duration]);

  return (
    <span className={className}>
      <span className="sr-only">{flipped ? to : from}</span>
      <span aria-hidden="true">{text}</span>
    </span>
  );
}
