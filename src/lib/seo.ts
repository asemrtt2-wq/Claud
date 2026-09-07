/**
 * Shared SEO helpers.
 *
 * Everything canonical hangs off NEXT_PUBLIC_BASE_URL, the same variable the Stripe redirects
 * already use — one place to set the production domain rather than a second hardcoded host
 * that can silently drift from it.
 */
export const SITE_NAME = "Lumia";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Trims a description to a length search results won't cut mid-word. */
export function metaDescription(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}
