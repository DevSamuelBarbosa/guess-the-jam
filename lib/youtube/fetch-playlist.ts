import type { Song } from "@/lib/game/types";
import type { YouTubePlaylistResponse } from "./types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const MAX_PAGES = 5; // Safety cap: 5 pages × 50 = 250 items max

/**
 * Fetch all playable songs from a YouTube playlist.
 * Requires the YOUTUBE_API_KEY env variable (server-side only).
 */
export async function fetchPlaylist(playlistId: string): Promise<Song[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not configured on the server.");
  }

  const songs: Song[] = [];
  let pageToken: string | undefined;
  let page = 0;

  do {
    const params = new URLSearchParams({
      part: "snippet,status",
      playlistId,
      maxResults: "50",
      key: apiKey,
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const res = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?${params.toString()}`,
      { next: { revalidate: 0 } } // never cache
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const reason =
        body?.error?.errors?.[0]?.reason ?? `HTTP ${res.status}`;

      if (reason === "quotaExceeded") {
        throw new Error("YouTube API quota exceeded. Try again later.");
      }
      if (res.status === 404) {
        throw new Error("Playlist not found. Check the URL.");
      }
      if (res.status === 403) {
        throw new Error("Playlist is private or access is denied.");
      }

      throw new Error(`YouTube API error: ${reason}`);
    }

    const data: YouTubePlaylistResponse = await res.json();

    for (const item of data.items) {
      const title = item.snippet.title;

      // Skip deleted / private videos
      if (
        !title ||
        title === "Private video" ||
        title === "Deleted video" ||
        item.status?.privacyStatus === "private"
      ) {
        continue;
      }

      songs.push({
        videoId: item.snippet.resourceId.videoId,
        title,
        thumbnailUrl:
          item.snippet.thumbnails?.medium?.url ??
          item.snippet.thumbnails?.default?.url ??
          "",
      });
    }

    pageToken = data.nextPageToken;
    page++;
  } while (pageToken && page < MAX_PAGES);

  return songs;
}
