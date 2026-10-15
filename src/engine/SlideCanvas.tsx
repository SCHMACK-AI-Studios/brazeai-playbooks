import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

/**
 * The deck is composed on one fixed 1920×1080 canvas and scaled to fit, like
 * a slide, rather than reflowing like a web page. Every slide can then place
 * type and imagery in absolute canvas pixels taken straight from the source
 * deck, with consistent line breaks at every window size.
 *
 * Letterboxing fills the spare axis. The canvas is measured against its own
 * container, leaving room for the reader's navigation controls.
 */
export function SlideCanvas({ children, className = "" }: { children: ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / CANVAS_W, height / CANVAS_H));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className={`relative h-full w-full overflow-hidden ${className}`}>
      <div
        className="absolute top-1/2 left-1/2 overflow-hidden"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
          visibility: scale ? "visible" : "hidden",
          background: "var(--ground)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
