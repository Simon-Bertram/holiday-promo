import { useCallback, useEffect, useRef, useState } from "react";

type AutoplayOptions = {
  visibilityThreshold?: number;
  maxRetries?: number;
  retryIntervalMs?: number;
};

export function useAutoplayingCloudinaryVideo(options: AutoplayOptions = {}) {
  const {
    visibilityThreshold = 0.5,
    maxRetries = 20,
    retryIntervalMs = 100,
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Cloudinary player renders asynchronously, so we need to wait for the video element
    const findVideoElement = (): HTMLVideoElement | null =>
      container.querySelector("video") as HTMLVideoElement | null;

    // Poll for video element (since CldVideoPlayer renders it asynchronously)
    let videoEl: HTMLVideoElement | null = findVideoElement();
    let retryCount = 0;
    let observer: IntersectionObserver | null = null;
    let canPlayHandler: (() => void) | null = null;
    let timeoutId: number | null = null;

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

      // Function to attempt autoplay
      const attemptAutoplay = () => {
        if (!videoEl) {
          return;
        }
        videoEl
          .play()
          .then(() => {
            setNeedsUserGesture(false);
          })
          .catch((error: unknown) => {
            console.warn(
              "Autoplay was blocked. Prompting user interaction.",
              error
            );
            setNeedsUserGesture(true);
          });
      };

      // Wait for video to be ready before attempting autoplay
      if (videoEl.readyState >= 2) {
        // HAVE_CURRENT_DATA - video has enough data to play
        attemptAutoplay();
      } else {
        // Wait for video to load enough data
        const handleCanPlay = () => {
          attemptAutoplay();
          if (canPlayHandler && videoEl) {
            videoEl.removeEventListener("canplay", canPlayHandler);
          }
        };
        canPlayHandler = handleCanPlay;
        videoEl.addEventListener("canplay", canPlayHandler);
      }

      // Set up Intersection Observer for visibility-based play/pause
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!(entry && videoEl)) {
            return;
          }
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= visibilityThreshold
          ) {
            videoEl
              .play()
              .then(() => {
                setNeedsUserGesture(false);
              })
              .catch((error: unknown) => {
                console.warn(
                  "Autoplay was blocked. Prompting user interaction.",
                  error
                );
                setNeedsUserGesture(true);
              });
          } else {
            videoEl.pause();
          }
        },
        { threshold: visibilityThreshold }
      );

      observer.observe(container);
    };

    setupVideo();

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
    };
  }, [visibilityThreshold, maxRetries, retryIntervalMs]);

  const handleUserPlay = useCallback(() => {
    const container = containerRef.current;
    const videoEl = container?.querySelector(
      "video"
    ) as HTMLVideoElement | null;
    if (!videoEl) {
      return;
    }
    videoEl
      .play()
      .then(() => {
        setNeedsUserGesture(false);
      })
      .catch(() => {
        // stay visible; user may try again
      });
  }, []);

  return { containerRef, needsUserGesture, handleUserPlay };
}
