"use client";

import { useState } from "react";
import { useGame } from "@/hooks/useGameReducer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MAX_TEAMS, MIN_SONGS } from "@/lib/game/constants";
import type { PlaybackDuration, Song } from "@/lib/game/types";

export default function SetupPhase() {
  const { state, dispatch } = useGame();

  // ─── Playlist loading ───
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);

  // ─── Team creation ───
  const [teamName, setTeamName] = useState("");

  const hasSongs = state.songs.length >= MIN_SONGS;
  const hasTeams = state.teams.length >= 1;
  const canStart = hasSongs && hasTeams;

  async function handleLoadPlaylist() {
    setLoading(true);
    setPlaylistError(null);

    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: playlistUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPlaylistError(data.error ?? "Failed to load playlist.");
        return;
      }

      dispatch({ type: "SET_PLAYLIST", songs: data.songs as Song[] });
    } catch {
      setPlaylistError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAddTeam() {
    const name = teamName.trim();
    if (!name) return;
    if (state.teams.length >= MAX_TEAMS) return;

    dispatch({
      type: "ADD_TEAM",
      team: { id: crypto.randomUUID(), name, score: 0 },
    });
    setTeamName("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTeam();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <h1 className="text-center text-3xl font-bold tracking-tight">
        🎵 Guess the Jam
      </h1>

      {/* ─── Playlist ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Playlist</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="Paste a YouTube playlist link…"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleLoadPlaylist} disabled={loading || !playlistUrl.trim()}>
              {loading ? "Loading…" : "Load"}
            </Button>
          </div>

          {playlistError && (
            <p className="text-sm text-destructive">{playlistError}</p>
          )}

          {hasSongs && (
            <Badge variant="secondary" className="w-fit">
              ✓ {state.songs.length} songs loaded
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* ─── Teams ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Teams</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {state.teams.length < MAX_TEAMS && (
            <div className="flex gap-2">
              <Input
                placeholder="Team name…"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={24}
              />
              <Button
                onClick={handleAddTeam}
                disabled={!teamName.trim()}
              >
                Add
              </Button>
            </div>
          )}

          {state.teams.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add at least 1 team to start.
            </p>
          )}

          <ul className="flex flex-col gap-2">
            {state.teams.map((team) => (
              <li
                key={team.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="font-medium">{team.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    dispatch({ type: "REMOVE_TEAM", teamId: team.id })
                  }
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* ─── Duration ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Playback Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Label htmlFor="duration">Seconds per song:</Label>
            <Select
              value={String(state.playbackDuration)}
              onValueChange={(v) =>
                dispatch({
                  type: "SET_PLAYBACK_DURATION",
                  duration: Number(v) as PlaybackDuration,
                })
              }
            >
              <SelectTrigger id="duration" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1s</SelectItem>
                <SelectItem value="3">3s</SelectItem>
                <SelectItem value="5">5s</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ─── Start ─── */}
      <Button
        size="lg"
        className="w-full text-lg"
        disabled={!canStart}
        onClick={() => dispatch({ type: "START_GAME" })}
      >
        Start Game
      </Button>
    </div>
  );
}
