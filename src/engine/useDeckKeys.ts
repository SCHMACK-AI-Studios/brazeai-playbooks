import { useEffect, useRef } from "react";
import { deck } from "@/engine/deckStore";
import { homeUrl } from "@/engine/url";

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  if (el.closest?.("[data-own-keys]")) return true;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT";
}

/**
 * The deck's keyboard map, shared by both views so a presenter's muscle
 * memory works in either window.
 *
 *   → Space PageDown ↓   forward (clickers send PageDown)
 *   ← PageUp ↑           back
 *   Home / End           first / last slide
 *   F                    fullscreen
 *   P                    open the other view in a new window
 *   H                    back to the home page, to pick another playbook
 *   digits then Enter    jump to that slide (e.g. 1 2 Enter)
 *
 * Ignored while typing in a field, inside anything marked data-own-keys, and
 * with a modifier held, so browser shortcuts such as ⌘R keep working.
 */
export function useDeckKeys({
  onFullscreen,
  onOther,
  onNext,
  onPrev,
}: {
  onFullscreen: () => void;
  onOther: () => void;
  /** Replaces a plain `deck.next()` for forward presses; the presenter view pages its notes first. */
  onNext?: () => void;
  /** Replaces a plain `deck.prev()` for back presses; the presenter view pages its notes back first. */
  onPrev?: () => void;
}) {
  const buffer = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      // A focused button activates on Space and Enter itself; handling the key
      // here too would move the deck twice for one press.
      if ((e.key === " " || e.key === "Enter") && (e.target as HTMLElement).closest?.("button, a")) return;

      if (/^[0-9]$/.test(e.key)) {
        buffer.current += e.key;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          buffer.current = "";
        }, 1500);
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault();
          if (onNext) onNext();
          else deck.next();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          if (onPrev) onPrev();
          else deck.prev();
          break;
        case "Home":
          e.preventDefault();
          deck.first();
          break;
        case "End":
          e.preventDefault();
          deck.last();
          break;
        case "Enter":
          if (buffer.current) {
            e.preventDefault();
            deck.goTo(Number.parseInt(buffer.current, 10) - 1);
            buffer.current = "";
          }
          break;
        case "f":
        case "F":
          e.preventDefault();
          onFullscreen();
          break;
        case "p":
        case "P":
          e.preventDefault();
          onOther();
          break;
        case "h":
        case "H":
          e.preventDefault();
          window.location.assign(homeUrl());
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onFullscreen, onOther, onNext, onPrev]);
}
