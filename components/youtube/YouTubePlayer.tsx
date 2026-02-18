"use client";

import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import {
  forwardRef,
  useImperativeHandle,
} from "react";

export interface YouTubePlayerRef {
  playSongSnippet: (videoId: string, durationSeconds: number) => void;
  stop: () => void;
  resume: () => void;
  ready: boolean;
}

interface YouTubePlayerProps {
  onSnippetEnd?: () => void;
  onError?: (errorCode: number) => void;
  visible?: boolean;
}

/**
 * Hidden YouTube player.
 * Exposes an imperative ref to control playback from parent components.
 */
const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  function YouTubePlayer({ onSnippetEnd, onError, visible = false }, ref) {
    const { containerRef, ready, playSongSnippet, stop, resume } =
      useYouTubePlayer({
        onSnippetEnd,
        onError,
      });

    useImperativeHandle(
      ref,
      () => ({
        playSongSnippet,
        stop,
        resume,
        ready,
      }),
      [playSongSnippet, stop, resume, ready]
    );

    // The YT IFrame API *replaces* the target div with an <iframe>,
    // so we need a stable wrapper div to control visibility.
    return (
      <div
        className={visible
          ? "w-full max-w-md aspect-video rounded-lg overflow-hidden"
          : "pointer-events-none fixed -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden opacity-0"
        }
        aria-hidden={!visible}
      >
        <div ref={containerRef} />
      </div>
    );
  }
);

export default YouTubePlayer;
