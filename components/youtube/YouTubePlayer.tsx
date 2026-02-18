"use client";

import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import {
  forwardRef,
  useImperativeHandle,
} from "react";

export interface YouTubePlayerRef {
  playSongSnippet: (videoId: string, durationSeconds: number) => void;
  stop: () => void;
  ready: boolean;
}

interface YouTubePlayerProps {
  onSnippetEnd?: () => void;
  onError?: (errorCode: number) => void;
}

/**
 * Hidden YouTube player.
 * Exposes an imperative ref to control playback from parent components.
 */
const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  function YouTubePlayer({ onSnippetEnd, onError }, ref) {
    const { containerRef, ready, playSongSnippet, stop } = useYouTubePlayer({
      onSnippetEnd,
      onError,
    });

    useImperativeHandle(
      ref,
      () => ({
        playSongSnippet,
        stop,
        ready,
      }),
      [playSongSnippet, stop, ready]
    );

    return (
      <div
        ref={containerRef}
        className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-px w-px overflow-hidden opacity-0"
        aria-hidden="true"
      />
    );
  }
);

export default YouTubePlayer;
