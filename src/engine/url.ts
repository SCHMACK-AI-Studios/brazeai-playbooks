/**
 * URL convention, short enough to type:
 *
 *   /                                 the home page, listing every playbook
 *   /agentic-standards                that playbook, slide 1 (or wherever its other window already is)
 *   /agentic-standards/12             slide 12
 *   /agentic-standards/12?presenter   presenter view on slide 12
 *   /agentic-standards/presenter      presenter view, joining whatever the audience window shows
 *
 * Slide numbers are 1-based.
 */

/** Vite's `base`: "/" unless the app is hosted under a sub-path. */
const BASE = import.meta.env.BASE_URL;

export interface ParsedUrl {
  /** The playbook the URL names, or null for the home page. */
  deck: string | null;
  /** 0-based slide index, or null when the URL names none. */
  slide: number | null;
  presenter: boolean;
}

/** The playbook this window is showing. Set once at start-up, before anything builds a URL. */
let currentDeck = "";
export function setDeck(id: string): void {
  currentDeck = id;
}

export function parseUrl(location: Pick<Location, "pathname" | "search">): ParsedUrl {
  const params = new URLSearchParams(location.search);
  const path = location.pathname.startsWith(BASE) ? location.pathname.slice(BASE.length) : location.pathname;
  const segments = path.split("/").filter(Boolean);
  const deck = segments.shift() ?? null;
  let presenter = params.has("presenter") && params.get("presenter") !== "0";
  if (segments[0] === "presenter") {
    presenter = true;
    segments.shift();
  }
  const fromPath = segments[0] ? Number.parseInt(segments[0], 10) : Number.NaN;
  const fromQuery = params.has("slide") ? Number.parseInt(params.get("slide") ?? "", 10) : Number.NaN;
  const n = Number.isFinite(fromPath) ? fromPath : fromQuery;
  return { deck, slide: Number.isFinite(n) ? Math.max(0, n - 1) : null, presenter };
}

export function homeUrl(): string {
  return BASE;
}

export function deckUrl(id: string): string {
  return `${BASE}${id}/1`;
}

export function buildUrl(slide: number, presenter: boolean): string {
  return `${BASE}${currentDeck}/${slide + 1}${presenter ? "?presenter" : ""}`;
}

/**
 * Written with replaceState on every change: a refresh returns to the same
 * slide, but moving through a deck does not stack a history entry per slide.
 */
export function writeUrl(slide: number, presenter: boolean): void {
  const url = buildUrl(slide, presenter);
  if (`${window.location.pathname}${window.location.search}` !== url) {
    window.history.replaceState(null, "", url);
  }
}
