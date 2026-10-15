import type { CSSProperties, ReactNode } from "react";

/** Google Slides' default text inset, 0.1in, in canvas pixels. */
export const INSET = 19;

/**
 * A text box placed exactly where the source deck put it: the same box, the
 * same default inset, and the same vertical anchoring, so a line of copy
 * lands on the same baseline as it does in the Slides export.
 */
export function TextBox({
  x,
  y,
  w,
  h,
  anchor = "t",
  align = "left",
  inset = INSET,
  className,
  style,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  anchor?: "t" | "ctr" | "b";
  align?: "left" | "center" | "right";
  inset?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      // Children never shrink: Slides lets text overflow a box, it never squashes blank lines.
      className={`absolute flex flex-col *:shrink-0 ${className ?? ""}`}
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        padding: inset,
        justifyContent: anchor === "t" ? "flex-start" : anchor === "b" ? "flex-end" : "center",
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Google Slides sets every line at 1.2 × the font size × the paragraph's
 * line-spacing percentage, whatever the font's own metrics say. `lh(105)`
 * converts a source deck spacing into the CSS line-height that matches it.
 */
export const lh = (percent = 100) => 1.2 * (percent / 100);

/** Slides' paragraph "space before", given in points in the source, as canvas pixels. */
export const pt = (points: number) => Math.round(points * (1920 / 720));

export const mono = (size: number, extra?: CSSProperties): CSSProperties => ({
  fontFamily: "var(--font-mono)",
  fontSize: size,
  lineHeight: 1.2,
  ...extra,
});

export const display = (size: number, extra?: CSSProperties): CSSProperties => ({
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: size,
  lineHeight: 1.2,
  ...extra,
});
