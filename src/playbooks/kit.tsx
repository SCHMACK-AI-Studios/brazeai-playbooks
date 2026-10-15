import type { CSSProperties, ReactNode } from "react";
import { Frame } from "@/components/Frame";
import { Kinetic, type Line } from "@/components/Kinetic";
import { Reveal } from "@/components/Reveal";
import { Statement } from "@/components/Statement";
import { display, mono } from "@/components/TextBox";
import { Typewriter } from "@/components/Typewriter";
import type { SectionLabel, SlideDef } from "@/engine/types";
import { homeUrl } from "@/engine/url";
import { asset } from "@/lib/asset";

/**
 * The playbook layouts. Every playbook is built from these, so the three
 * decks read as one family and a new playbook is mostly copy.
 *
 * They follow the SCHMACK master used for the Forge talk: the #181818 ground,
 * red for the one thing that matters on a slide, Albert Sans for headlines,
 * JetBrains Mono for everything read as detail, bracketed section tags, and
 * hairline boxes rather than filled panels.
 *
 * The canvas is 1920×1080. Content sits between x 84 and 1836, and between
 * the section tag (y 44) and the footer rule (y 990).
 */

export const LEFT = 84;
export const WIDTH = 1752;

/** Builds a slide definition. Playbook slides are complete on arrival, so `steps` is 0 unless given. */
export function slide(
  id: string,
  title: string,
  notes: string[],
  component: SlideDef["component"],
  steps = 0,
): SlideDef {
  return { id, title, notes, component, steps };
}

/** The slide's heading: one or two lines, set like the talk's "AI Maturity = reusable capability". */
export function Head({ lines, top = 128 }: { lines: readonly Line[]; top?: number }) {
  return (
    <div className="absolute" style={{ left: LEFT, top }}>
      <Kinetic lines={lines} className="headline" style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.18 }} />
    </div>
  );
}

/** A content region under the heading, in canvas pixels. */
export function Area({
  top = 262,
  height = 690,
  left = LEFT,
  width = WIDTH,
  className,
  style,
  children,
}: {
  top?: number;
  height?: number;
  left?: number;
  width?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className={`absolute ${className ?? ""}`} style={{ left, top, width, height, ...style }}>
      {children}
    </div>
  );
}

/* ───────────────────────── Cover ───────────────────────── */

type CoverGround = "cat" | "catProfile" | "catLookingUp";

/** The playbook's opening slide: the product in red, the promise in mono underneath. */
export function Cover({
  number,
  title,
  subtitle,
  status,
  ground,
}: {
  number: string;
  title: readonly Line[];
  subtitle: readonly Line[];
  status: string;
  ground: CoverGround;
}) {
  return (
    <Frame ground={ground} label={`[ SCHMACK PLAYBOOK ${number} ]`}>
      <div className="absolute" style={{ left: 78, top: 150 }}>
        <Kinetic
          lines={title.map((l) => `[{${l}}]`)}
          accentDelay={0}
          className="headline"
          style={{ fontSize: 150, lineHeight: 1.02, letterSpacing: "-0.01em" }}
        />
        <Kinetic
          lines={subtitle}
          delay={0.25}
          className="font-mono"
          style={{ fontSize: 72, lineHeight: 1.08, marginTop: 64 }}
        />
      </div>
      <Reveal from="fade" delay={0.9} className="absolute" style={{ left: LEFT, top: 880 }}>
        <span style={mono(30, { color: "var(--red)", whiteSpace: "pre" })}>{status}</span>
      </Reveal>
    </Frame>
  );
}

/* ───────────────────────── Statements ───────────────────────── */

/** A section opener: one idea, centred, a word or two in red. */
export function Opener({ label, lines }: { label: SectionLabel; lines: readonly Line[] }) {
  return <Statement label={label} variant="theme" lines={lines} />;
}

/** A point made inside a section: left-aligned display type, with an optional mono line under it. */
export function Point({ label, lines, sub }: { label: SectionLabel; lines: readonly Line[]; sub?: string }) {
  return (
    <Statement label={label} variant="point" lines={lines}>
      {sub && (
        <div className="absolute" style={{ left: LEFT, top: 760, width: 1500 }}>
          <p className="m-0" style={mono(34, { color: "var(--grey-1)", lineHeight: 1.3 })}>
            <Typewriter segments={[{ text: sub }]} delay={0.9} />
          </p>
        </div>
      )}
    </Statement>
  );
}

/* ───────────────────────── Definition ───────────────────────── */

/** The talk's "AI Governance" composition: collage on the left, the term and its meaning on the right. */
export function Definition({
  label,
  image,
  alt,
  term,
  text,
}: {
  label: SectionLabel;
  image: string;
  alt: string;
  term: string;
  text: string;
}) {
  return (
    <Frame label={label}>
      <Reveal from="scale" duration={0.9} className="absolute" style={{ left: 65, top: 192, width: 773, height: 696 }}>
        <img src={asset(image)} alt={alt} className="h-full w-full object-contain" />
      </Reveal>
      <div className="absolute text-right" style={{ left: 900, top: 300, width: 936 }}>
        <Kinetic lines={[term]} className="headline" style={{ fontSize: 83, fontWeight: 700, lineHeight: 1.3 }} />
        <p className="m-0" style={mono(40, { lineHeight: 1.36, marginTop: 28 })}>
          <Typewriter segments={[{ text }]} delay={0.6} />
        </p>
      </div>
    </Frame>
  );
}

/* ───────────────────────── Cards ───────────────────────── */

export interface Card {
  title: string;
  lede?: string;
  points?: readonly string[];
}

/** Red-bordered cards, as on the talk's "Start-up, scale-up, enterprise" slide. Two to four across. */
export function Cards({
  items,
  top = 262,
  height = 660,
  gap = 48,
}: {
  items: readonly Card[];
  top?: number;
  height?: number;
  gap?: number;
}) {
  const dense = items.length > 3;
  return (
    <Area top={top} height={height} className="flex" style={{ gap }}>
      {items.map((c, i) => (
        <Reveal key={c.title} delay={i * 0.18} className="relative min-w-0 flex-1">
          <div
            className="flex h-full flex-col"
            style={{ background: "var(--ground-2)", border: "3px solid var(--red)", padding: dense ? 30 : 38 }}
          >
            <p className="m-0" style={display(dense ? 42 : 52, { fontWeight: 700, lineHeight: 1.12 })}>
              {c.title}
            </p>
            <div className="mt-auto flex flex-col" style={{ gap: dense ? 20 : 26 }}>
              {c.lede && (
                <p className="m-0" style={mono(dense ? 28 : 34, { lineHeight: 1.26 })}>
                  {c.lede}
                </p>
              )}
              {c.points?.map((p) => (
                <p key={p} className="m-0" style={mono(dense ? 23 : 27, { lineHeight: 1.3, color: "var(--grey-1)" })}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      ))}
    </Area>
  );
}

/** Numbered cards, as on the talk's five-themes slide: a red mono numeral, the point in mono below. */
export function NumberCards({
  items,
  top = 262,
  height = 660,
}: {
  items: readonly { title?: string; text: string }[];
  top?: number;
  height?: number;
}) {
  const gap = items.length > 4 ? 28 : 36;
  const size = items.length > 4 ? 27 : 30;
  return (
    <Area top={top} height={height} className="flex" style={{ gap }}>
      {items.map((item, i) => (
        <Reveal key={i} delay={i * 0.12} className="relative min-w-0 flex-1">
          <div
            className="flex h-full flex-col"
            style={{ background: "var(--ground-3)", border: "3px solid var(--grey-5)", padding: "40px 28px 36px" }}
          >
            <span style={mono(83, { color: "var(--red)", fontWeight: 700, lineHeight: 1 })}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="mt-auto">
              {item.title && (
                <p className="m-0" style={display(size + 8, { fontWeight: 700, lineHeight: 1.15, marginBottom: 18 })}>
                  {item.title}
                </p>
              )}
              <p
                className="m-0"
                style={mono(size, { lineHeight: 1.28, color: item.title ? "var(--grey-1)" : undefined })}
              >
                {item.text}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </Area>
  );
}

/* ───────────────────────── Table ───────────────────────── */

/**
 * A mono table on hairlines. `widths` are relative column weights. The first
 * column is the row's name and is set white and bold; the rest read as detail.
 */
export function Table({
  head,
  rows,
  widths,
  top = 262,
  size = rows.length <= 5 ? 30 : rows.length === 6 ? 28 : 26,
}: {
  head: readonly string[];
  rows: readonly (readonly string[])[];
  widths: readonly number[];
  top?: number;
  /** Cell type size. Defaults to the largest that suits the number of rows. */
  size?: number;
}) {
  const columns = widths.map((w) => `${w}fr`).join(" ");
  return (
    // Rows share the height between them, up to a cap, so a short table is not stranded at the top.
    <Area top={top} height={940 - top} className="flex flex-col">
      <div className="grid" style={{ gridTemplateColumns: columns, columnGap: 40, paddingBottom: 12 }}>
        {head.map((h) => (
          <span key={h} style={mono(20, { color: "var(--red)", letterSpacing: "0.06em", textTransform: "uppercase" })}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((row, r) => (
        <Reveal
          key={r}
          delay={0.1 + r * 0.07}
          duration={0.4}
          className="flex"
          style={{ flex: "1 1 0", maxHeight: 116 }}
        >
          <div
            className="grid w-full items-center"
            style={{
              gridTemplateColumns: columns,
              columnGap: 40,
              borderTop: "2px solid var(--grey-5)",
              padding: "10px 0",
            }}
          >
            {row.map((cell, c) => (
              <span
                key={c}
                style={mono(size, {
                  lineHeight: 1.28,
                  color: c === 0 ? "var(--paper)" : "var(--grey-1)",
                  fontWeight: c === 0 ? 700 : 400,
                })}
              >
                {cell}
              </span>
            ))}
          </div>
        </Reveal>
      ))}
    </Area>
  );
}

/* ───────────────────────── Lists ───────────────────────── */

/** A list on red arrows, as on the talk's "Practical productivity improvements" slide. */
export function ArrowList({
  items,
  size = items.length > 5 ? 34 : 36,
  gap = items.length > 5 ? 32 : 40,
  delay = 0.2,
}: {
  items: readonly string[];
  size?: number;
  gap?: number;
  delay?: number;
}) {
  return (
    <div className="flex flex-col" style={{ gap }}>
      {items.map((item, i) => (
        <Reveal key={item} delay={delay + i * 0.1} duration={0.4} className="flex" style={{ gap: size * 0.8 }}>
          <span aria-hidden="true" style={mono(size, { color: "var(--red)", lineHeight: 1.28 })}>
            →
          </span>
          <span style={mono(size, { lineHeight: 1.28 })}>{item}</span>
        </Reveal>
      ))}
    </div>
  );
}

export interface Column {
  title: string;
  lines: readonly string[];
  /** The column's last line, in red: what it adds up to. */
  close?: string;
}

/** Two columns of mono under bold titles, as on the talk's "Governance as constraint / infrastructure" slide. */
export function Columns({
  columns,
  top = 262,
  size = 34,
}: {
  columns: readonly Column[];
  top?: number;
  size?: number;
}) {
  return (
    <Area top={top} height={960 - top} className="flex" style={{ gap: 96 }}>
      {columns.map((col, i) => (
        <Reveal key={col.title} delay={i * 0.3} className="min-w-0 flex-1">
          <p className="m-0" style={display(44, { fontWeight: 700, lineHeight: 1.15, marginBottom: 36 })}>
            {col.title}
          </p>
          <div className="flex flex-col" style={{ gap: size * 0.85 }}>
            {col.lines.map((line) => (
              <p key={line} className="m-0" style={mono(size, { lineHeight: 1.28, color: "var(--grey-1)" })}>
                {line}
              </p>
            ))}
            {col.close && (
              <p className="m-0" style={mono(size, { lineHeight: 1.28, color: "var(--red)" })}>
                {col.close}
              </p>
            )}
          </div>
        </Reveal>
      ))}
    </Area>
  );
}

/* ───────────────────────── Steps ───────────────────────── */

export interface Step {
  /** The boxed name of the step. */
  tab: string;
  text: string;
  /** A short line under the text, in red: a duration, or who does it. */
  meta?: string;
}

/**
 * A run of steps: boxed names joined by red arrows, each with a numbered note
 * under it, as on the talk's "Automation → Mobile → AI" slide. Up to six
 * across; more than that wraps onto a second row.
 */
export function Steps({
  steps,
  perRow = steps.length,
  top = steps.length > perRow ? 280 : 330,
  rowGap = 52,
}: {
  steps: readonly Step[];
  perRow?: number;
  top?: number;
  rowGap?: number;
}) {
  // Type is as large as the column allows: fewer steps across, bigger type.
  const twoRows = steps.length > perRow;
  const size = perRow <= 3 ? (twoRows ? 28 : 34) : perRow === 4 ? (twoRows ? 26 : 30) : perRow === 5 ? 27 : 24;
  const tab = perRow <= 4 && !twoRows ? 30 : 26;
  return (
    <Area
      top={top}
      height={960 - top}
      className="grid content-start"
      style={{ gridTemplateColumns: `repeat(${perRow}, minmax(0, 1fr))`, columnGap: 28, rowGap }}
    >
      {steps.map((step, i) => (
        <Reveal key={step.tab} delay={i * 0.14} duration={0.45} className="min-w-0">
          <div className="flex items-center" style={{ gap: 14 }}>
            <span
              className="font-mono flex items-center justify-center"
              style={{
                height: tab * 2.4,
                padding: `0 ${tab * 0.75}px`,
                border: "2px solid var(--paper)",
                fontSize: tab,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {step.tab}
            </span>
            {(i + 1) % perRow !== 0 && i < steps.length - 1 && (
              <span aria-hidden="true" className="flex-1" style={mono(34, { color: "var(--red)", textAlign: "right" })}>
                →
              </span>
            )}
          </div>
          <p className="m-0" style={mono(size, { color: "var(--red)", fontWeight: 700, marginTop: 34 })}>
            {String(i + 1).padStart(2, "0")}.
          </p>
          <p
            className="m-0"
            style={mono(size, { lineHeight: 1.3, marginTop: 8, color: "var(--grey-1)", paddingRight: 12 })}
          >
            {step.text}
          </p>
          {step.meta && (
            <p className="m-0" style={mono(size - 3, { lineHeight: 1.3, marginTop: 14, color: "var(--red)" })}>
              {step.meta}
            </p>
          )}
        </Reveal>
      ))}
    </Area>
  );
}

/* ───────────────────────── Closing ───────────────────────── */

/** What the SCHMACK team brings, on every playbook's last slide. */
const CREDENTIALS = [
  "Over a dozen double-certified BrazeAI™ specialists",
  "Experts across the full BrazeAI™ suite",
  "A Gold-tier Braze delivery partner and early-access test partner, so you are first to what Braze can do next",
];

/** The playbook's last slide: what to bring to a first call, and what the SCHMACK team brings. */
export function Contact({ lines, bring }: { lines: readonly Line[]; bring: readonly string[] }) {
  return (
    <Frame ground="cat" label="[ GET IN TOUCH ]">
      <div className="absolute" style={{ left: LEFT, top: 128 }}>
        <Kinetic lines={lines} className="headline" style={{ fontSize: 96, fontWeight: 600, lineHeight: 1.1 }} />
      </div>
      <Area top={420} height={300} width={860}>
        <p className="m-0" style={display(34, { fontWeight: 700, marginBottom: 26 })}>
          What to bring to the first call:
        </p>
        <ArrowList items={bring} size={30} gap={20} delay={0.5} />
      </Area>
      <Area top={420} height={300} left={1010} width={826}>
        <p className="m-0" style={display(34, { fontWeight: 700, marginBottom: 26 })}>
          SCHMACK BrazeAI™ Certified team:
        </p>
        <div className="flex flex-col" style={{ gap: 14 }}>
          {CREDENTIALS.map((line, i) => (
            <Reveal key={line} delay={0.6 + i * 0.1} duration={0.4}>
              <div
                style={{
                  border: "2px solid var(--grey-4)",
                  padding: "14px 22px",
                  background: "rgba(20,20,20,0.6)",
                }}
              >
                <span style={mono(25, { lineHeight: 1.3 })}>{line}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Area>
      <Reveal from="fade" delay={1.1} className="absolute" style={{ left: LEFT, top: 860 }}>
        <a
          href="https://schmack.com/"
          target="_blank"
          rel="noreferrer"
          className="no-underline"
          style={mono(32, { color: "var(--red)" })}
        >
          Get in touch: schmack.com
        </a>
      </Reveal>
      <Reveal from="fade" delay={1.2} className="absolute" style={{ left: 1010, top: 860 }}>
        <a href={homeUrl()} className="no-underline" style={mono(32, { color: "var(--paper)" })}>
          ← All playbooks
        </a>
      </Reveal>
    </Frame>
  );
}

/** A plain slide on the master, with a section tag and a heading. Most playbook slides start here. */
export function Page({ label, head, children }: { label: SectionLabel; head: readonly Line[]; children: ReactNode }) {
  return (
    <Frame label={label}>
      <Head lines={head} />
      {children}
    </Frame>
  );
}

/** A small mono caption at the foot of the content area: a caveat or a source. */
export function Footnote({ children, top = 928 }: { children: ReactNode; top?: number }) {
  return (
    <Reveal from="fade" delay={1} className="absolute" style={{ left: LEFT, top, width: WIDTH }}>
      <p className="m-0" style={mono(22, { color: "var(--red)", lineHeight: 1.3 })}>
        {children}
      </p>
    </Reveal>
  );
}
