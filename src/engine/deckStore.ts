import { clampPosition, nextPosition, prevPosition, samePosition } from "@/engine/navigation";
import type { DeckPosition } from "@/engine/types";

/**
 * The single slide-state abstraction shared by the audience and presenter
 * windows. Both render from this store; neither owns the position.
 *
 * Sync between windows on the same machine, with no server:
 *
 * - BroadcastChannel carries every local navigation to the other windows.
 * - localStorage holds the latest position too, which does 3 jobs: a
 *   refresh restores the reveal step, a newly opened window can adopt the
 *   position before anyone replies, and where BroadcastChannel is missing
 *   the `storage` event becomes the transport instead.
 *
 * Loop safety: a position that arrives from another window is applied and
 * never re-broadcast. Only a local action (a key, a click, a swipe) sends.
 * Each message carries a timestamp and the sender's id, and anything older
 * than the position already applied is dropped, so two windows pressing at
 * once settle on the later press rather than oscillating.
 */

/** Set per deck in startDeck, so two playbooks open at once never move each other. */
let CHANNEL = "schmack-playbooks";
let STORAGE_KEY = "schmack-playbooks:position";
/** A stored position older than this belongs to a previous rehearsal, not this one. */
const STALE_AFTER_MS = 12 * 60 * 60 * 1000;

interface Stamped extends DeckPosition {
  at: number;
  origin: string;
}

type Message = { type: "position"; position: Stamped } | { type: "hello"; origin: string };

const origin = Math.random().toString(36).slice(2);

let steps: readonly number[] = [0];
let state: DeckPosition = { slide: 0, step: 0 };
let lastAt = 0;
const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;
let started = false;

function emit() {
  for (const l of listeners) l();
}

function readStored(): Stamped | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stamped;
    if (typeof parsed.slide !== "number" || Date.now() - parsed.at > STALE_AFTER_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(p: Stamped) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // Private mode or a full quota: sync still works over BroadcastChannel.
  }
}

function stamp(p: DeckPosition): Stamped {
  // Strictly increasing within this window, even for two presses in one millisecond.
  const at = Math.max(Date.now(), lastAt + 1);
  return { ...p, at, origin };
}

function applyRemote(p: Stamped) {
  if (p.origin === origin) return;
  if (p.at < lastAt) return;
  const next = clampPosition(p, steps);
  lastAt = p.at;
  if (samePosition(next, state)) return;
  state = next;
  emit();
}

function post(message: Message) {
  channel?.postMessage(message);
}

function commit(p: DeckPosition) {
  const next = clampPosition(p, steps);
  if (samePosition(next, state)) return;
  state = next;
  const stamped = stamp(next);
  lastAt = stamped.at;
  writeStored(stamped);
  post({ type: "position", position: stamped });
  emit();
}

/**
 * Starts the store once per window.
 *
 * `urlSlide` is the slide the URL names, if any. A window opened on an
 * explicit slide shows that slide, because a deep link has to mean what it
 * says. A window opened without one (`/` or `/?presenter`) joins wherever the
 * other windows already are.
 */
export function startDeck(stepCounts: readonly number[], urlSlide: number | null, deckId = "deck"): void {
  steps = stepCounts;
  if (started) return;
  started = true;
  CHANNEL = `schmack-playbooks:${deckId}`;
  STORAGE_KEY = `schmack-playbooks:${deckId}:position`;

  const stored = readStored();
  if (urlSlide !== null) {
    // A refresh keeps its reveal step; a fresh deep link starts the slide from the top.
    const step = stored && stored.slide === urlSlide ? stored.step : 0;
    state = clampPosition({ slide: urlSlide, step }, steps);
  } else if (stored) {
    state = clampPosition(stored, steps);
  }
  lastAt = 0;

  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e: MessageEvent<Message>) => {
      const m = e.data;
      if (m.type === "position") applyRemote(m.position);
      if (m.type === "hello" && m.origin !== origin) post({ type: "position", position: stamp(state) });
    };
  } else {
    window.addEventListener("storage", (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        applyRemote(JSON.parse(e.newValue) as Stamped);
      } catch {
        // Ignore a malformed value written by an older build.
      }
    });
  }

  if (urlSlide === null) post({ type: "hello", origin });
}

export const deck = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): DeckPosition {
    return state;
  },
  next() {
    commit(nextPosition(state, steps));
  },
  prev() {
    commit(prevPosition(state, steps));
  },
  goTo(slide: number, step = 0) {
    commit({ slide, step });
  },
  first() {
    commit({ slide: 0, step: 0 });
  },
  last() {
    commit({ slide: steps.length - 1, step: 0 });
  },
  get total() {
    return steps.length;
  },
  stepsFor(slide: number) {
    return steps[slide] ?? 0;
  },
};
