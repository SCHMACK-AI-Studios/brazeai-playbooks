import { ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
import { useRef } from "react";
import { deck } from "@/engine/deckStore";
import { EdgeNavArrows } from "@/engine/EdgeNavArrows";
import { SlideCanvas } from "@/engine/SlideCanvas";
import { SlideRenderer } from "@/engine/SlideRenderer";
import type { SlideDef } from "@/engine/types";
import { homeUrl } from "@/engine/url";
import { useDeck } from "@/engine/useDeck";
import { useDeckKeys } from "@/engine/useDeckKeys";
import { usePreload } from "@/engine/usePreload";
import { useFullscreen } from "@/lib/useFullscreen";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SWIPE_PX = 60;
const INTERACTIVE = "button, a, input, textarea, select, [data-interactive]";

/** A self-guided reader with persistent controls and optional touch navigation. */
export function ReaderView({ slides }: { slides: readonly SlideDef[] }) {
  const position = useDeck();
  const reducedMotion = useReducedMotion();
  const { isFullscreen, toggle } = useFullscreen(() => document.documentElement);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  usePreload(slides, position.slide);
  useDeckKeys();

  const def = slides[position.slide];
  const canGoPrev = position.slide > 0;
  const canGoNext = position.slide < slides.length - 1;

  return (
    <main
      className="fixed inset-0"
      onPointerDown={(event) => {
        if (event.pointerType !== "touch" || !event.isPrimary || (event.target as HTMLElement).closest(INTERACTIVE))
          return;
        pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
      }}
      onPointerCancel={() => {
        pointer.current = null;
      }}
      onPointerUp={(event) => {
        const start = pointer.current;
        pointer.current = null;
        if (!start || start.id !== event.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) deck.next();
          else deck.prev();
        }
      }}
      aria-label={def ? `Slide ${position.slide + 1} of ${slides.length}: ${def.title}` : undefined}
    >
      <div className="absolute inset-x-0 top-0 bottom-20" style={{ touchAction: "pan-y" }}>
        <SlideCanvas>
          <SlideRenderer slides={slides} position={position} instant={reducedMotion} />
        </SlideCanvas>
      </div>

      <EdgeNavArrows
        onPrev={() => deck.prev()}
        onNext={() => deck.next()}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
      />

      <nav
        aria-label="Playbook navigation"
        className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center whitespace-nowrap px-1 py-1.5 font-mono text-xs sm:gap-1 sm:px-2"
        style={{ background: "rgba(16,16,16,0.96)", border: "1px solid var(--chrome-line)", color: "var(--paper-2)" }}
      >
        <a href={homeUrl()} className="flex h-11 items-center px-2 hover:bg-white/10">
          All playbooks
        </a>
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => deck.prev()}
          disabled={!canGoPrev}
          className="flex h-11 w-11 items-center justify-center hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="px-1 tabular-nums" aria-live="polite" aria-atomic="true">
          {position.slide + 1} of {slides.length}
        </span>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => deck.next()}
          disabled={!canGoNext}
          className="flex h-11 w-11 items-center justify-center hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
        <button
          type="button"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={toggle}
          className="flex h-11 w-11 items-center justify-center hover:bg-white/10"
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </nav>
    </main>
  );
}
