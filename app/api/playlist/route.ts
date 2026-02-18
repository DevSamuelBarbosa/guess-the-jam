import { NextRequest, NextResponse } from "next/server";
import { parsePlaylistUrl } from "@/lib/youtube/parse-playlist-url";
import { fetchPlaylist } from "@/lib/youtube/fetch-playlist";
import { MIN_SONGS } from "@/lib/game/constants";
import type { Song } from "@/lib/game/types";

// ---------------------------------------------------------------------------
// In-memory cache: playlistId → { songs, timestamp }
// Entries expire after CACHE_TTL_MS so updated playlists are eventually picked up.
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  songs: Song[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCached(playlistId: string): Song[] | null {
  const entry = cache.get(playlistId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(playlistId);
    return null;
  }
  return entry.songs;
}

function setCache(playlistId: string, songs: Song[]) {
  cache.set(playlistId, { songs, timestamp: Date.now() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url: string | undefined = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A playlist URL is required." },
        { status: 400 }
      );
    }

    const playlistId = parsePlaylistUrl(url);

    if (!playlistId) {
      return NextResponse.json(
        { error: "Invalid YouTube playlist link." },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = getCached(playlistId);
    if (cached) {
      return NextResponse.json({ songs: cached, cached: true });
    }

    const songs = await fetchPlaylist(playlistId);

    if (songs.length < MIN_SONGS) {
      return NextResponse.json(
        {
          error: `Playlist needs at least ${MIN_SONGS} playable videos (found ${songs.length}).`,
        },
        { status: 422 }
      );
    }

    setCache(playlistId, songs);

    return NextResponse.json({ songs });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
