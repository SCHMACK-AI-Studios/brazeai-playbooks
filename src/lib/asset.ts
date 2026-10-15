/**
 * An asset under this playbook's protected base path. Every image,
 * illustration and logo goes through the same access check as its slides.
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
