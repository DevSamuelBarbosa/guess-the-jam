import { NextRequest, NextResponse } from "next/server";
import { parsePlaylistUrl } from "@/lib/youtube/parse-playlist-url";
import { fetchPlaylist } from "@/lib/youtube/fetch-playlist";
import { MIN_SONGS } from "@/lib/game/constants";

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

    const songs = await fetchPlaylist(playlistId);

    if (songs.length < MIN_SONGS) {
      return NextResponse.json(
        {
          error: `Playlist needs at least ${MIN_SONGS} playable videos (found ${songs.length}).`,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ songs });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
