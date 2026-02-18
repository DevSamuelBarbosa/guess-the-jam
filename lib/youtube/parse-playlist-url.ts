/**
 * Extract a YouTube playlist ID from various URL formats.
 *
 * Supported formats:
 *   https://www.youtube.com/playlist?list=PLxxxxxx
 *   https://www.youtube.com/watch?v=xxxxx&list=PLxxxxxx
 *   https://youtu.be/xxxxx?list=PLxxxxxx
 *   https://music.youtube.com/playlist?list=PLxxxxxx
 *
 * Returns the playlist ID string, or null if not found.
 */
export function parsePlaylistUrl(input: string): string | null {
  const trimmed = input.trim();

  // Try parsing as URL first
  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace("www.", "");

    if (
      host === "youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtu.be"
    ) {
      const listParam = url.searchParams.get("list");
      if (listParam && listParam.length > 2) {
        return listParam;
      }
    }
  } catch {
    // Not a valid URL — fall through to regex
  }

  // Fallback: extract list= from raw string
  const match = trimmed.match(/[?&]list=([A-Za-z0-9_-]+)/);
  return match?.[1] ?? null;
}
