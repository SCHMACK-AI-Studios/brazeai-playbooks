/**
 * A public asset's URL under the deck's base path. The deck is served at
 * /deck/ on the same origin as the phones, so "/images/x.webp" would miss;
 * every image, illustration, and logo goes through here.
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
