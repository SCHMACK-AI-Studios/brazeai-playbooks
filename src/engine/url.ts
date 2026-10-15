/**
 * URL convention, short enough to type:
 *
 *   /                                 redirects to SCHMACK Resources
 *   /agentic-standards                that playbook, slide 1
 *   /agentic-standards/12             slide 12
 *
 * Slide numbers are 1-based.
 */

export interface ParsedUrl {
  /** The playbook the URL names, or null at the root. */
  deck: string | null;
  /** 0-based slide index, or null when the URL names none. */
  slide: number | null;
}

/** The playbook this window is showing. Set once at start-up, before anything builds a URL. */
let currentDeck = "";
export function setDeck(id: string): void {
  currentDeck = id;
}

export function parseUrl(location: Pick<Location, "pathname" | "search">): ParsedUrl {
  const params = new URLSearchParams(location.search);
  const segments = location.pathname.split("/").filter(Boolean);
  const deck = segments.shift() ?? null;
  const fromPath = segments[0] ? Number.parseInt(segments[0], 10) : Number.NaN;
  const fromQuery = params.has("slide") ? Number.parseInt(params.get("slide") ?? "", 10) : Number.NaN;
  const n = Number.isFinite(fromPath) ? fromPath : fromQuery;
  return { deck, slide: Number.isFinite(n) ? Math.max(0, n - 1) : null };
}

export function homeUrl(): string {
  if (import.meta.env.DEV) return "/";
  return import.meta.env.VITE_RESOURCES_URL || "https://schmack.com/?folder=resources";
}

export function buildUrl(slide: number): string {
  return `/${currentDeck}/${slide + 1}`;
}

/**
 * Written with replaceState on every change: a refresh returns to the same
 * slide, but moving through a deck does not stack a history entry per slide.
 */
export function writeUrl(slide: number): void {
  const url = buildUrl(slide);
  if (`${window.location.pathname}${window.location.search}` !== url) {
    window.history.replaceState(null, "", url);
  }
}
