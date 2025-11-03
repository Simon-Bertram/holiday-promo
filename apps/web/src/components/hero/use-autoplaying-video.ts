import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Options to control autoplay behavior for the Cloudinary video player.
 */
type AutoplayMode = "on-scroll" | "viewable" | "always" | "never";

type AutoplayOptions = {
  /**
   * Minimum intersection ratio required to keep the video playing.
   * Defaults to 0.5 (50% visible).
   */
  visibilityThreshold?: number;
  /**
   * Maximum number of polling attempts while waiting for the video element
   * to be rendered by the Cloudinary player. Defaults to 20.
   */
  maxRetries?: number;
  /**
   * Milliseconds between polling attempts. Defaults to 100ms.
   */
  retryIntervalMs?: number;
  /**
   * Cloudinary-like autoplay mode semantics:
   * - 'on-scroll' | 'viewable': play when sufficiently visible
   * - 'always': try to play whenever possible
   * - 'never': do not autoplay (user gesture only)
   */
  autoplayMode?: AutoplayMode;
};

/**
 * Hook to autoplay a Cloudinary video element rendered inside a container.
 *
 * The hook:
 * - Polls for the underlying <video> tag (rendered asynchronously)
 * - Ensures attributes required for autoplay (muted, playsInline, autoplay)
 * - Attempts to play when ready and when sufficiently visible
 * - Exposes a user action handler to retry playback when browsers block autoplay
 */
export function useAutoplayingCloudinaryVideo(options: AutoplayOptions = {}) {
  const {
    visibilityThreshold = 0.5,
    maxRetries = 20,
    retryIntervalMs = 100,
    autoplayMode = "always",
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  // HTMLMediaElement.HAVE_CURRENT_DATA === 2
  const HAVE_CURRENT_DATA = 2;

  // Attempt to play a specific video element and reflect whether user gesture is needed
  const playVideo = useCallback((videoEl: HTMLVideoElement) => {
    // Respect reduced motion preferences: do not autoplay
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setNeedsUserGesture(false);
      return Promise.resolve(false);
    }

    // Avoid autoplay when the tab/page is not visible
    if (document.visibilityState !== "visible") {
      return Promise.resolve(false);
    }

    return videoEl
      .play()
      .then(() => {
        setNeedsUserGesture(false);
        return true;
      })
      .catch((error: unknown) => {
        console.warn(
          "Autoplay was blocked. Prompting user interaction.",
          error
        );
        setNeedsUserGesture(true);
        return false;
      });
  }, []);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) {
      return;
    }

    // Cloudinary player renders asynchronously, so we need to wait for the video element
    const findVideoElement = (): HTMLVideoElement | null =>
      containerEl.querySelector("video") as HTMLVideoElement | null;

    // Poll for video element (since CldVideoPlayer renders it asynchronously)
    let videoEl: HTMLVideoElement | null = findVideoElement();
    let retryCount = 0;
    let observer: IntersectionObserver | null = null;
    let canPlayHandler: (() => void) | null = null;
    let timeoutId: number | null = null;

    const configureAutoplayByMode = (
      video: HTMLVideoElement,
      container: HTMLDivElement
    ) => {
      if (autoplayMode === "on-scroll" || autoplayMode === "viewable") {
        observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (!(entry && video)) {
              return;
            }
            if (
              entry.isIntersecting &&
              entry.intersectionRatio >= visibilityThreshold
            ) {
              playVideo(video).catch(() => {
                /* handled in playVideo */
              });
            } else {
              video.pause();
            }
          },
          { threshold: visibilityThreshold }
        );
        observer.observe(container);
        return;
      }
      if (autoplayMode === "always") {
        // No intersection gating; visibilitychange handler below will pause on hidden.
        return;
      }
      // 'never'
      video.pause();
    };

    const setupVideo = () => {
      if (!videoEl) {
        if (retryCount < maxRetries) {
          retryCount += 1;
          timeoutId = window.setTimeout(() => {
            videoEl = findVideoElement();
            if (videoEl) {
              setupVideo();
            }
          }, retryIntervalMs);
        }
        return;
      }

      // Ensure attributes required for reliable autoplay
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.autoplay = true;
      // iOS Safari robustness: also set attributes explicitly
      videoEl.setAttribute("playsinline", "");
      videoEl.setAttribute("webkit-playsinline", "");

      // Wait for video to be ready before attempting autoplay
      if (videoEl.readyState >= HAVE_CURRENT_DATA) {
        // HAVE_CURRENT_DATA - video has enough data to play
        if (autoplayMode !== "never") {
          playVideo(videoEl).catch(() => {
            /* handled in playVideo */
          });
        }
      } else {
        // Wait for video to load enough data
        const handleCanPlay = () => {
          if (videoEl && autoplayMode !== "never") {
            playVideo(videoEl).catch(() => {
              /* handled in playVideo */
            });
          }
          if (canPlayHandler && videoEl) {
            videoEl.removeEventListener("canplay", canPlayHandler);
          }
        };
        canPlayHandler = handleCanPlay;
        videoEl.addEventListener("canplay", canPlayHandler);
      }

      configureAutoplayByMode(videoEl, containerEl);
    };

    setupVideo();

    // Pause on page hide, try to resume on visible if in view
    const handleVisibility = () => {
      const video = containerEl.querySelector(
        "video"
      ) as HTMLVideoElement | null;
      if (!video) {
        return;
      }
      if (document.visibilityState === "hidden") {
        video.pause();
        return;
      }
      // Resume behavior depends on autoplayMode
      if (autoplayMode === "always") {
        playVideo(video).catch(() => {
          /* handled in playVideo */
        });
        return;
      }
      if (autoplayMode === "on-scroll" || autoplayMode === "viewable") {
        // IO callback will handle when intersecting, but try in case already in view
        playVideo(video).catch(() => {
          /* handled in playVideo */
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Cleanup function
    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (observer) {
        observer.disconnect();
      }
      if (videoEl && canPlayHandler) {
        videoEl.removeEventListener("canplay", canPlayHandler);
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [
    visibilityThreshold,
    maxRetries,
    retryIntervalMs,
    autoplayMode,
    playVideo,
  ]);

  const handleUserPlay = useCallback(() => {
    const containerEl = containerRef.current;
    const videoEl = containerEl?.querySelector(
      "video"
    ) as HTMLVideoElement | null;
    if (!videoEl) {
      return;
    }
    playVideo(videoEl).catch(() => {
      /* handled in playVideo */
    });
  }, [playVideo]);

  return { containerRef, needsUserGesture, handleUserPlay };
}
