import { useSyncExternalStore } from "react";
import { deck } from "@/engine/deckStore";
import type { DeckPosition } from "@/engine/types";

export function useDeck(): DeckPosition {
  return useSyncExternalStore(deck.subscribe, deck.getSnapshot, deck.getSnapshot);
}
