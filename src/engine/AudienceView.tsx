import { ChevronLeft, ChevronRight, House, Maximize, Minimize, NotebookText } from "lucide-react";
import { useCallback, useRef } from "react";
import { deck } from "@/engine/deckStore";
import { EdgeNavArrows } from "@/engine/EdgeNavArrows";
import { SlideCanvas } from "@/engine/SlideCanvas";
import { SlideRenderer } from "@/engine/SlideRenderer";
import type { SlideDef } from "@/engine/types";
import { buildUrl, homeUrl } from "@/engine/url";
import { useDeck } from "@/engine/useDeck";
import { useDeckKeys } from "@/engine/useDeckKeys";
import { usePreload } from "@/engine/usePreload";
import { useFullscreen } from "@/lib/useFullscreen";
import { useIdle } from "@/lib/useIdle";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SWIPE_PX = 60;
const INTERACTIVE = "button, a, input, textarea, select, [data-interactive]";

export function openPresenter(slide: number) {
  window.open(buildUrl(slide, true), "schmack-playbooks-presenter", "popup=yes,width=1440,height=900");
}

/**
 * The projected view: one slide, full viewport, no website around it.
 *
 * Forward is a key, a click anywhere on the slide, or a swipe. The controls
 * and the pointer both disappear after 2.5s of stillness, and return on any
 * movement, so nothing but the slide is on the wall while presenting.
 */
export function AudienceView({ slides }: { slides: readonly SlideDef[] }) {
  const position = useDeck();
  const reducedMotion = useReducedMotion();
  const idle = useIdle(2500);
  const { isFullscreen, toggle } = useFullscreen(() => document.documentElement);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  usePreload(slides, position.slide);
  const openOther = useCallback(() => openPresenter(deck.getSnapshot().slide), []);
  useDeckKeys({ onFullscreen: toggle, onOther: openOther });

  const steps = deck.stepsFor(position.slide);
  const def = slides[position.slide];

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: every click action here has a key binding in useDeckKeys.
    <main
      className="fixed inset-0 select-none"
      data-cursor={idle ? "hidden" : "shown"}
      onPointerDown={(e) => {
        pointer.current = { x: e.clientX, y: e.clientY };
        swiped.current = false;
      }}
      onPointerUp={(e) => {
        const start = pointer.current;
        pointer.current = null;
        if (!start) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
          swiped.current = true;
          if (dx < 0) deck.next();
          else deck.prev();
        }
      }}
      onClick={(e) => {
        if (swiped.current || e.button !== 0) return;
        if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
        deck.next();
      }}
      aria-roledescription="presentation"
      aria-label={def ? `Slide ${position.slide + 1} of ${slides.length}: ${def.title}` : undefined}
    >
      <SlideCanvas>
        <SlideRenderer slides={slides} position={position} instant={reducedMotion} />
      </SlideCanvas>

      <EdgeNavArrows
        onPrev={() => deck.prev()}
        onNext={() => deck.next()}
        canGoPrev={position.slide > 0 || position.step > 0}
        canGoNext={position.slide < slides.length - 1 || position.step < steps}
        idle={idle}
      />

      {/* Revealed by any pointer movement; hidden again after 2.5s of stillness. */}
      <nav
        aria-label="Presentation controls"
        className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 px-2 py-1.5 transition-opacity duration-300"
        style={{
          background: "rgba(16,16,16,0.86)",
          border: "1px solid var(--chrome-line)",
          opacity: idle ? 0 : 1,
          pointerEvents: idle ? "none" : "auto",
        }}
      >
        <ControlButton label="All playbooks (H)" onClick={() => window.location.assign(homeUrl())}>
          <House size={14} />
        </ControlButton>
        <span aria-hidden="true" className="mx-1 h-4 w-px" style={{ background: "var(--chrome-line)" }} />
        <ControlButton
          label="Previous"
          onClick={() => deck.prev()}
          disabled={position.slide === 0 && position.step === 0}
        >
          <ChevronLeft size={16} />
        </ControlButton>
        <span className="font-mono px-2 text-[12px] tabular-nums" style={{ color: "var(--chrome-muted)" }}>
          {position.slide + 1} / {slides.length}
          {steps > 0 && (
            <span className="ml-2" role="img" aria-label={`Reveal ${position.step + 1} of ${steps + 1}`}>
              {Array.from({ length: steps + 1 }, (_, i) => (
                <span
                  key={i}
                  className="ml-[3px] inline-block h-[6px] w-[6px] align-middle"
                  style={{ background: i <= position.step ? "var(--red)" : "var(--chrome-line)" }}
                />
              ))}
            </span>
          )}
        </span>
        <ControlButton
          label="Next"
          onClick={() => deck.next()}
          disabled={position.slide === slides.length - 1 && position.step === steps}
        >
          <ChevronRight size={16} />
        </ControlButton>
        <span aria-hidden="true" className="mx-1 h-4 w-px" style={{ background: "var(--chrome-line)" }} />
        <ControlButton label="Open presenter view (P)" onClick={openOther}>
          <NotebookText size={14} />
        </ControlButton>
        <ControlButton label={isFullscreen ? "Exit fullscreen (F)" : "Enter fullscreen (F)"} onClick={toggle}>
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </ControlButton>
      </nav>
    </main>
  );
}

export function ControlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-30"
      style={{ color: "var(--paper-2)" }}
    >
      {children}
    </button>
  );
}
