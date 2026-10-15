import type { ReactNode } from "react";
import { Frame } from "@/components/Frame";
import { Kinetic, type Line } from "@/components/Kinetic";
import { TextBox } from "@/components/TextBox";
import type { SectionLabel } from "@/engine/types";

/**
 * The deck's big-statement slide: one idea, display type, a word or two in
 * red. Two compositions recur in the source: centred at 109px for a theme's
 * title card, and left-aligned at 85px for the point made inside a theme.
 */
export function Statement({
  label,
  lines,
  variant,
  children,
}: {
  label: SectionLabel;
  lines: readonly Line[];
  variant: "theme" | "point";
  children?: ReactNode;
}) {
  const theme = variant === "theme";
  return (
    <Frame label={label}>
      <TextBox
        // Left-aligned statements sit 6px in from their box in the source render.
        x={theme ? 178 : 81}
        y={380}
        w={theme ? 1565 : 1801}
        h={319}
        anchor="ctr"
        align={theme ? "center" : "left"}
        inset={0}
      >
        <Kinetic
          lines={lines}
          className="headline"
          style={{ fontSize: theme ? 109 : 85, lineHeight: theme ? 1.26 : 1.26 }}
        />
      </TextBox>
      {children}
    </Frame>
  );
}
