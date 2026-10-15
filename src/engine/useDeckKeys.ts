import { useEffect } from "react";
import { deck } from "@/engine/deckStore";

/** Arrow keys supplement the visible controls without replacing browser shortcuts. */
export function useDeckKeys() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        target?.isContentEditable ||
        target?.closest("input, textarea, select, [data-own-keys], [role='slider'], [role='tablist']")
      )
        return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        deck.next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        deck.prev();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
