"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Extend Window to include YT API globals
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export interface YouTubePlayerHandle {
  playSongSnippet: (videoId: string, durationSeconds: number) => void;
  stop: () => void;
  resume: () => void;
}

interface UseYouTubePlayerOptions {
  /** Called when the snippet playback timer expires. */
  onSnippetEnd?: () => void;
  /** Called when the IFrame API encounters a fatal error (e.g. embed blocked). */
  onError?: (errorCode: number) => void;
}

/**
 * Manages the YouTube IFrame player lifecycle and provides an imperative handle
 * for playing song snippets.
 */
export function useYouTubePlayer({
  onSnippetEnd,
  onError,
}: UseYouTubePlayerOptions = {}) {
  const playerRef = useRef<YT.Player | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  const onSnippetEndRef = useRef(onSnippetEnd);
  const onErrorRef = useRef(onError);
  onSnippetEndRef.current = onSnippetEnd;
  onErrorRef.current = onError;

  // Load the IFrame API script (idempotent)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // If already loaded
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    // If script tag already exists (being loaded)
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        createPlayer();
      };
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function createPlayer() {
    if (playerRef.current || !containerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: "225",
      width: "400",
      playerVars: {
        autoplay: 0,
        controls: 1,
        disablekb: 0,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: () => {
          // Make the iframe responsive — fill its wrapper
          const iframe = playerRef.current?.getIframe?.();
          if (iframe) {
            iframe.style.width = "100%";
            iframe.style.height = "100%";
          }
          setReady(true);
        },
        onError: (e: YT.OnErrorEvent) => {
          onErrorRef.current?.(e.data);
        },
      },
    });
  }

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      playerRef.current?.pauseVideo();
    } catch {
      // Player might not be ready
    }
  }, []);

  const resume = useCallback(() => {
    try {
      playerRef.current?.playVideo();
    } catch {
      // Player might not be ready
    }
  }, []);

  const playSongSnippet = useCallback(
    (videoId: string, durationSeconds: number) => {
      stop();

      if (!playerRef.current) return;

      // Pick a random start offset (skip first 15s and last 15s)
      const player = playerRef.current;

      // Load and play the video
      player.loadVideoById({
        videoId,
        startSeconds: 30, // Phase 1: fixed offset. Phase 3: randomize.
      });

      // Set a timeout to pause after durationSeconds
      timerRef.current = setTimeout(() => {
        try {
          player.pauseVideo();
        } catch {
          // ignore
        }
        onSnippetEndRef.current?.();
      }, durationSeconds * 1000);
    },
    [stop]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      try {
        playerRef.current?.destroy();
      } catch {
        // ignore
      }
    };
  }, []);

  return {
    containerRef,
    ready,
    playSongSnippet,
    stop,
    resume,
  } satisfies YouTubePlayerHandle & {
    containerRef: React.RefObject<HTMLDivElement | null>;
    ready: boolean;
  };
}
