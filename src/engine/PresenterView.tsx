import {
  ChevronLeft,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  Maximize2,
  Minimize2,
  Minus,
  House,
  MonitorUp,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ScrollText,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { deck } from "@/engine/deckStore";
import { NotesPanel } from "@/engine/NotesPanel";
import { nextPosition } from "@/engine/navigation";
import { SlideCanvas } from "@/engine/SlideCanvas";
import { SlideRenderer } from "@/engine/SlideRenderer";
import type { SlideDef } from "@/engine/types";
import { buildUrl, homeUrl } from "@/engine/url";
import { useDeck } from "@/engine/useDeck";
import { useDeckKeys } from "@/engine/useDeckKeys";
import { usePreload } from "@/engine/usePreload";
import { formatElapsed, usePresenterTimer } from "@/engine/usePresenterTimer";
import { PROMPTER_SPEEDS, usePrompter } from "@/engine/usePrompter";
import { useFullscreen } from "@/lib/useFullscreen";

const FONT_KEY = "schmack-playbooks:notes-size";
const SPEED_KEY = "schmack-playbooks:prompter-speed";
const EXPAND_KEY = "schmack-playbooks:notes-expanded";

const FONT_MIN = 16;
const FONT_MAX = 96;
const LINE_HEIGHT = 1.35;
const DEFAULT_SPEED = PROMPTER_SPEEDS.indexOf(1);

function readNumber(key: string, fallback: number, ok: (v: number) => boolean): number {
  try {
    const raw = window.localStorage.getItem(key);
    const v = Number(raw);
    if (raw !== null && ok(v)) return v;
  } catch {}
  return fallback;
}

function store(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

/** Small steps where they matter, bigger ones once the notes are already large. */
function fontStep(size: number): number {
  return size >= 40 ? 6 : 2;
}

function openAudience(slide: number) {
  window.open(buildUrl(slide, false), "schmack-playbooks-audience");
}

/**
 * The presenter's laptop view: `/<slide>?presenter`.
 *
 * It drives the same store as the projected window, so a press here moves
 * both, and a press there moves this. The current preview renders live, so
 * builds play here as they play on the wall; the next preview renders the
 * next *state*, which is the next reveal on this slide when there is one.
 */
export function PresenterView({ slides }: { slides: readonly SlideDef[] }) {
  const position = useDeck();
  const timer = usePresenterTimer();
  const [fontSize, setFontSize] = useState(() => readNumber(FONT_KEY, 26, (v) => v >= FONT_MIN && v <= FONT_MAX));
  const [expanded, setExpanded] = useState(() => readNumber(EXPAND_KEY, 0, (v) => v === 0 || v === 1) === 1);
  // Autoscroll starts off every time the view opens, so the notes never run away before the talk.
  const [prompting, setPrompting] = useState(false);
  // Paused keeps the autocue layout and the reading position; stopping drops both.
  const [paused, setPaused] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(() =>
    readNumber(SPEED_KEY, DEFAULT_SPEED, (v) => Number.isInteger(v) && v >= 0 && v < PROMPTER_SPEEDS.length),
  );
  const notesRef = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState(() => new Date());
  const { toggle } = useFullscreen(() => document.documentElement);

  usePreload(slides, position.slide);
  const openOther = useCallback(() => openAudience(deck.getSnapshot().slide), []);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  // The talk has started once someone moves off the opening position.
  const { start: startTimer } = timer;
  useEffect(() => {
    if (position.slide > 0 || position.step > 0) startTimer();
  }, [position.slide, position.step, startTimer]);

  useEffect(() => store(FONT_KEY, String(fontSize)), [fontSize]);
  useEffect(() => store(EXPAND_KEY, expanded ? "1" : "0"), [expanded]);
  useEffect(() => store(SPEED_KEY, String(speedIndex)), [speedIndex]);

  const speed = PROMPTER_SPEEDS[speedIndex] ?? 1;
  const slower = useCallback(() => setSpeedIndex((i) => Math.max(0, i - 1)), []);
  const faster = useCallback(() => setSpeedIndex((i) => Math.min(PROMPTER_SPEEDS.length - 1, i + 1)), []);
  const smaller = useCallback(() => setFontSize((s) => Math.max(FONT_MIN, s - fontStep(s - 1))), []);
  const larger = useCallback(() => setFontSize((s) => Math.min(FONT_MAX, s + fontStep(s))), []);

  const toggleAutoscroll = useCallback(() => {
    setPaused(false);
    setPrompting((p) => !p);
  }, []);
  // Play starts autoscroll if it is off; otherwise it pauses and resumes in place.
  const playPause = useCallback(() => {
    if (!prompting) {
      setPaused(false);
      setPrompting(true);
    } else setPaused((x) => !x);
  }, [prompting]);

  usePrompter(notesRef, {
    on: prompting && !paused,
    speed,
    lineHeight: fontSize * LINE_HEIGHT,
    resetKey: position.slide,
  });

  /**
   * Where a forward press should scroll the notes to, or null when the press
   * should move the deck on. Notes are read to the end before the slide
   * changes, a paragraph at a time: each press brings the next paragraph up
   * to the reading position (the top, or the autocue's reading line), and a
   * paragraph taller than the panel is read a screen at a time. A press
   * reveals once the next [CLICK] cue is on screen, and moves to the next slide
   * once the last paragraph is showing. Notes that fit on screen need no paging.
   */
  const notesTarget = useCallback((): number | null => {
    const el = notesRef.current;
    if (!el) return null;
    const items = [...el.querySelectorAll<HTMLElement>("li")];
    const last = items.at(-1);
    if (!last) return null;
    const view = el.getBoundingClientRect().top;
    const top = (n: HTMLElement) => n.getBoundingClientRect().top - view;
    const line = fontSize * LINE_HEIGHT;
    const cue = el.querySelector<HTMLElement>("[data-next-click]");
    if (cue && top(cue) + line <= el.clientHeight) return null; // The cue is showing: this press reveals.
    if (!cue && last.getBoundingClientRect().bottom - view <= el.clientHeight + 1) return null; // All read.
    const reading = prompting ? el.clientHeight * 0.3 : 0;
    const next = items.find((li) => top(li) > reading + 2);
    if (!next) return null;
    // A paragraph taller than the panel is read a screen at a time, so no line is skipped.
    const page = Math.max(el.clientHeight - reading - line, line);
    return el.scrollTop + Math.min(top(next) - reading, page);
  }, [fontSize, prompting]);

  const advance = useCallback(() => {
    const el = notesRef.current;
    const target = notesTarget();
    if (!el || target === null) {
      deck.next();
      return;
    }
    // A running autocue sets scrollTop every frame, which would cut a smooth scroll short.
    if (prompting && !paused) el.scrollTop = target;
    else el.scrollTo({ top: target, behavior: "smooth" });
  }, [notesTarget, prompting, paused]);

  /**
   * Where a back press should scroll the notes to, or null when the notes are
   * back at the start and the press should move the deck back. It mirrors a
   * forward press: the previous paragraph returns to the reading position, a
   * screen at a time through a tall one.
   */
  const notesBackTarget = useCallback((): number | null => {
    const el = notesRef.current;
    if (!el || el.scrollTop <= 2) return null;
    const items = [...el.querySelectorAll<HTMLElement>("li")];
    const view = el.getBoundingClientRect().top;
    const top = (n: HTMLElement) => n.getBoundingClientRect().top - view;
    const line = fontSize * LINE_HEIGHT;
    const reading = prompting ? el.clientHeight * 0.3 : 0;
    const prev = items.filter((li) => top(li) < reading - 2).at(-1);
    if (!prev) return 0;
    const page = Math.max(el.clientHeight - reading - line, line);
    return Math.max(0, el.scrollTop - Math.min(reading - top(prev), page));
  }, [fontSize, prompting]);

  // Set by a back press that leaves the slide, so the previous slide's notes open at their last paragraph.
  const openAtEnd = useRef(false);

  const retreat = useCallback(() => {
    const el = notesRef.current;
    const target = notesBackTarget();
    if (!el || target === null) {
      // Only a press that leaves the slide opens the previous one at its end; undoing a reveal stays put.
      openAtEnd.current = deck.getSnapshot().step === 0;
      deck.prev();
      return;
    }
    if (prompting && !paused) el.scrollTop = target;
    else el.scrollTo({ top: target, behavior: "smooth" });
  }, [notesBackTarget, prompting, paused]);

  // A back press that only undid a reveal stays on this slide's notes; one that changed slide lands at the end.
  useEffect(() => {
    if (!openAtEnd.current) return;
    openAtEnd.current = false;
    const frame = requestAnimationFrame(() => {
      const el = notesRef.current;
      const last = el?.querySelector<HTMLElement>("li:last-child");
      if (!el || !last) return;
      const reading = prompting ? el.clientHeight * 0.3 : 0;
      el.scrollTop += last.getBoundingClientRect().top - el.getBoundingClientRect().top - reading;
    });
    return () => cancelAnimationFrame(frame);
  }, [position.slide]);

  useDeckKeys({ onFullscreen: toggle, onOther: openOther, onNext: advance, onPrev: retreat });

  // Whether the next press pages the notes, for the Next button's label.
  const [notesAhead, setNotesAhead] = useState(false);
  useEffect(() => {
    const el = notesRef.current;
    if (!el) return;
    const update = () => setNotesAhead(notesTarget() !== null);
    const frame = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [notesTarget, position.slide, position.step, expanded]);

  // Presenter-only keys; the shared deck keys live in useDeckKeys.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      switch (e.key) {
        case "s":
        case "S":
          e.preventDefault();
          toggleAutoscroll();
          break;
        case "k":
        case "K":
          e.preventDefault();
          playPause();
          break;
        case "[":
          e.preventDefault();
          slower();
          break;
        case "]":
          e.preventDefault();
          faster();
          break;
        case "-":
          e.preventDefault();
          smaller();
          break;
        case "=":
        case "+":
          e.preventDefault();
          larger();
          break;
        case "n":
        case "N":
          e.preventDefault();
          setExpanded((x) => !x);
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slower, faster, smaller, larger, toggleAutoscroll, playPause]);

  useEffect(() => {
    document.title = `Presenter · ${position.slide + 1}/${slides.length}`;
  }, [position.slide, slides.length]);

  const def = slides[position.slide];
  const steps = deck.stepsFor(position.slide);
  const stepCounts = slides.map((s) => s.steps);
  const upcoming = nextPosition(position, stepCounts);
  const atEnd = upcoming.slide === position.slide && upcoming.step === position.step;
  const nextIsReveal = !atEnd && upcoming.slide === position.slide;
  const nextDef = slides[upcoming.slide];

  if (!def) return null;

  return (
    <main
      className="font-display fixed inset-0 grid gap-4 p-4"
      style={{ gridTemplateRows: "auto 1fr auto", background: "#0e0e0e", color: "var(--paper)" }}
    >
      <header className="flex items-center gap-6 border-b pb-3" style={{ borderColor: "var(--chrome-line)" }}>
        <div className="font-mono text-[13px] tracking-[0.08em] uppercase" style={{ color: "var(--red)" }}>
          Presenter
        </div>
        <div className="min-w-0 flex-1 truncate text-[18px]">
          <span className="font-mono mr-3 tabular-nums" style={{ color: "var(--chrome-muted)" }}>
            {def.id}
          </span>
          {def.title}
        </div>
        <div className="font-mono text-[22px] tabular-nums" role="status" aria-label="Progress">
          {position.slide + 1}
          <span style={{ color: "var(--chrome-muted)" }}> / {slides.length}</span>
        </div>
        <div className="flex items-center gap-1" role="timer" aria-label="Elapsed time">
          <span
            className="font-mono w-[5.2ch] text-right text-[22px] tabular-nums"
            style={{ color: timer.running ? "var(--paper)" : "var(--chrome-muted)" }}
          >
            {formatElapsed(timer.elapsed)}
          </span>
          <ChromeButton
            label={timer.running ? "Pause timer" : "Start timer"}
            onClick={timer.running ? timer.pause : timer.start}
          >
            {timer.running ? <Pause size={14} /> : <Play size={14} />}
          </ChromeButton>
          <ChromeButton label="Reset timer" onClick={timer.reset}>
            <RotateCcw size={14} />
          </ChromeButton>
        </div>
        <div className="font-mono text-[14px] tabular-nums" style={{ color: "var(--chrome-muted)" }}>
          {clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </div>
        <ChromeButton label="All playbooks (H)" onClick={() => window.location.assign(homeUrl())}>
          <House size={16} />
        </ChromeButton>
        <ChromeButton label="Open audience window (P)" onClick={openOther}>
          <MonitorUp size={16} />
        </ChromeButton>
      </header>

      <div
        className="grid min-h-0 gap-4"
        style={{
          gridTemplateColumns: expanded ? "minmax(0, 0.75fr) minmax(0, 2fr)" : "minmax(0, 1.55fr) minmax(0, 1fr)",
        }}
      >
        {/* Current slide, live */}
        <section className="flex min-h-0 flex-col gap-2" aria-label="Current slide">
          <div className={expanded ? "aspect-video w-full" : "min-h-0 flex-1"}>
            <div className="relative h-full" style={{ outline: "1px solid var(--chrome-line)" }}>
              <SlideCanvas>
                <SlideRenderer slides={slides} position={position} />
              </SlideCanvas>
            </div>
          </div>
          <RevealTrack steps={steps} step={position.step} />
        </section>

        {/* Next state and notes */}
        <section className="flex min-h-0 flex-col gap-3">
          <fieldset className="m-0 border-0 p-0" aria-label="Next" hidden={expanded}>
            <div className="font-mono mb-1.5 flex items-center gap-2 text-[12px] tracking-[0.08em] uppercase">
              {atEnd ? (
                <span style={{ color: "var(--chrome-muted)" }}>End of deck</span>
              ) : nextIsReveal ? (
                <span style={{ color: "var(--red)" }}>
                  Next: reveal {upcoming.step + 1} of {steps + 1} on this slide
                </span>
              ) : (
                <span style={{ color: "var(--chrome-muted)" }}>
                  Next slide {upcoming.slide + 1}: <span style={{ color: "var(--paper)" }}>{nextDef?.title}</span>
                </span>
              )}
            </div>
            <div
              className="aspect-video w-full"
              style={{ outline: "1px solid var(--chrome-line)", opacity: atEnd ? 0.3 : 1 }}
            >
              <SlideCanvas>
                <SlideRenderer slides={slides} position={upcoming} instant />
              </SlideCanvas>
            </div>
          </fieldset>

          <div
            className="flex min-h-0 flex-1 flex-col pt-3"
            style={{ borderColor: "var(--chrome-line)", borderTopWidth: expanded ? 0 : 1 }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className="font-mono border-b-2 pb-1 text-[12px] tracking-[0.08em] uppercase"
                style={{ color: "var(--paper)", borderColor: "var(--red)" }}
              >
                Notes
              </span>
              <span className="flex items-center gap-1">
                <ChromeButton
                  label={prompting ? "Stop autoscroll (S)" : "Start autoscroll (S)"}
                  onClick={toggleAutoscroll}
                  pressed={prompting}
                >
                  <ScrollText size={14} />
                </ChromeButton>
                <ChromeButton
                  label={prompting && !paused ? "Pause script (K)" : "Play script (K)"}
                  onClick={playPause}
                  pressed={prompting && paused}
                >
                  {prompting && !paused ? <Pause size={14} /> : <Play size={14} />}
                </ChromeButton>
                <ChromeButton label="Slower ([)" onClick={slower}>
                  <ChevronsDown size={14} />
                </ChromeButton>
                <span
                  className="font-mono w-[4.5ch] text-center text-[12px] tabular-nums"
                  style={{ color: prompting ? "var(--paper)" : "var(--chrome-muted)" }}
                  title="Autoscroll speed"
                >
                  {speed}×
                </span>
                <ChromeButton label="Faster (])" onClick={faster}>
                  <ChevronsUp size={14} />
                </ChromeButton>
                <span className="mx-1 h-5 w-px" style={{ background: "var(--chrome-line)" }} aria-hidden="true" />
                <ChromeButton label="Smaller notes (−)" onClick={smaller}>
                  <Minus size={14} />
                </ChromeButton>
                <span
                  className="font-mono w-[3.5ch] text-center text-[12px] tabular-nums"
                  style={{ color: "var(--chrome-muted)" }}
                  title="Notes size (px)"
                >
                  {fontSize}
                </span>
                <ChromeButton label="Larger notes (+)" onClick={larger}>
                  <Plus size={14} />
                </ChromeButton>
                <ChromeButton
                  label={expanded ? "Shrink notes (N)" : "Expand notes (N)"}
                  onClick={() => setExpanded((x) => !x)}
                >
                  {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </ChromeButton>
              </span>
            </div>
            {/* A size container, so the autocue padding can be a share of the visible height. */}
            <div className="relative min-h-0 flex-1" style={{ containerType: "size" }}>
              <div ref={notesRef} className="h-full overflow-y-auto pr-2">
                {prompting ? (
                  // Autocue layout: the first line starts on the reading line, and the
                  // last can scroll all the way up to it.
                  <div style={{ paddingTop: "30cqh", paddingBottom: "70cqh" }}>
                    <NotesPanel notes={def.notes} step={position.step} fontSize={fontSize} />
                  </div>
                ) : (
                  // Space after the notes, so presses can bring the last paragraph up to the top.
                  <div style={{ paddingBottom: "85cqh" }}>
                    <NotesPanel notes={def.notes} step={position.step} fontSize={fontSize} />
                  </div>
                )}
              </div>
              {prompting && (
                <div
                  className="pointer-events-none absolute right-0 left-0"
                  style={{
                    top: "30%",
                    borderTop: `2px ${paused ? "dashed" : "solid"} var(--red)`,
                    opacity: paused ? 1 : 0.6,
                  }}
                  aria-hidden="true"
                >
                  {paused && (
                    <span
                      className="font-mono absolute right-0 px-2 py-0.5 text-[12px] uppercase tracking-[0.08em]"
                      style={{ top: 4, background: "var(--red)", color: "#fff" }}
                    >
                      Paused
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="flex items-center gap-3">
        <button
          type="button"
          onClick={retreat}
          className="font-mono flex h-12 items-center gap-2 px-5 text-[14px] uppercase tracking-[0.06em] hover:bg-white/10"
          style={{ border: "1px solid var(--chrome-line)" }}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <button
          type="button"
          onClick={advance}
          disabled={atEnd && !notesAhead}
          className="font-mono flex h-12 flex-1 items-center justify-center gap-2 text-[14px] uppercase tracking-[0.06em] disabled:opacity-40"
          style={{ background: "var(--red)", color: "#fff" }}
        >
          {notesAhead ? "More notes" : nextIsReveal ? "Reveal" : "Next slide"} <ChevronRight size={18} />
        </button>
        <p className="font-mono m-0 hidden text-[12px] lg:block" style={{ color: "var(--chrome-muted)" }}>
          → Space PgDn forward · ← PgUp back · 12 Enter jump · F fullscreen · P audience window · H all playbooks · S autoscroll · K pause
          · [ ] speed · − + size · N expand notes
        </p>
      </footer>
    </main>
  );
}

function RevealTrack({ steps, step }: { steps: number; step: number }) {
  if (steps === 0) {
    return (
      <p className="font-mono m-0 text-[12px] uppercase tracking-[0.08em]" style={{ color: "var(--chrome-muted)" }}>
        No reveals on this slide
      </p>
    );
  }
  const remaining = steps - step;
  return (
    <div className="font-mono flex items-center gap-3 text-[12px] uppercase tracking-[0.08em]">
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: steps + 1 }, (_, i) => (
          <span key={i} className="h-2 w-6" style={{ background: i <= step ? "var(--red)" : "var(--chrome-line)" }} />
        ))}
      </span>
      <span style={{ color: remaining > 0 ? "var(--red)" : "var(--chrome-muted)" }}>
        {remaining > 0
          ? `${remaining} more reveal${remaining === 1 ? "" : "s"} before the next slide`
          : "Fully revealed"}
      </span>
    </div>
  );
}

function ChromeButton({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  /** Set for toggles, so the on state is visible and announced. */
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center hover:bg-white/10"
      style={pressed ? { background: "var(--red)", color: "#fff" } : { color: "var(--paper-2)" }}
    >
      {children}
    </button>
  );
}
