const MARKERS = {
  CLICK: { label: "Click", color: "#ff333b", ink: "#ffffff" },
  PAUSE: { label: "Pause", color: "#f5f5f5", ink: "#101010" },
  ASK: { label: "Ask", color: "#d6ff3d", ink: "#101010" },
  DEMO: { label: "Demo", color: "#7cc4ff", ink: "#101010" },
  NOTE: { label: "Note", color: "#595959", ink: "#ffffff" },
} as const;

type Marker = keyof typeof MARKERS;

function parse(line: string): { marker: Marker | null; text: string } {
  const m = /^\s*\[(CLICK|PAUSE|ASK|DEMO|NOTE)\]\s*/.exec(line);
  if (!m) return { marker: null, text: line };
  return { marker: m[1] as Marker, text: line.slice(m[0].length) };
}

/**
 * Speaker notes, large enough to read at a glance from a lectern. A line
 * that starts with a marker such as `[CLICK]` gets a coloured tag, so cues
 * stand apart from talking points. `[CLICK]` lines line up with the slide's
 * reveal states: the one for the next press is highlighted.
 */
export function NotesPanel({ notes, step, fontSize }: { notes: readonly string[]; step: number; fontSize: number }) {
  // A slide with nothing to say shows nothing: the panel holds only what is spoken.
  if (notes.length === 0) return null;

  let clickIndex = 0;
  return (
    <ul className="m-0 flex list-none flex-col gap-[0.7em] p-0" style={{ fontSize, lineHeight: 1.35 }}>
      {notes.map((line, i) => {
        const { marker, text } = parse(line);
        const isClick = marker === "CLICK";
        const thisClick = isClick ? ++clickIndex : 0;
        // The press that comes next is reveal number `step + 1`.
        const upNext = isClick && thisClick === step + 1;
        const done = isClick && thisClick <= step;
        const style = marker ? MARKERS[marker] : null;
        return (
          <li
            key={i}
            // The presenter view pages its notes until this cue is on screen before revealing.
            data-next-click={upNext ? "" : undefined}
            className="flex items-baseline gap-3"
            style={{ color: done ? "var(--chrome-muted)" : "var(--paper)", fontWeight: upNext ? 600 : 400 }}
          >
            {style && (
              <span
                className="font-mono shrink-0 px-[0.45em] py-[0.1em] text-[0.55em] font-bold tracking-[0.08em] uppercase"
                style={{
                  background: done ? "transparent" : style.color,
                  color: done ? "var(--chrome-muted)" : style.ink,
                  border: `1px solid ${style.color}`,
                  outline: upNext ? "2px solid var(--paper)" : undefined,
                  outlineOffset: 2,
                }}
              >
                {style.label}
              </span>
            )}
            <span>{text}</span>
          </li>
        );
      })}
    </ul>
  );
}
