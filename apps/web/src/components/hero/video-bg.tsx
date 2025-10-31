"use client";

import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";
import { useEffect, useState } from "react";

export default function VideoBg() {
  const [needsUserGesture, setNeedsUserGesture] = useState(false);
  useEffect(() => {
    const container = document.getElementById("hero-video");
    if (!container) {
      return;
    }

    // Cloudinary player renders a <video> inside; target it directly
    const videoEl = container.querySelector("video") as HTMLVideoElement | null;
    if (!videoEl) {
      return;
    }

    // Ensure attributes required for reliable autoplay
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.autoplay = true;

    const VISIBILITY_THRESHOLD = 0.5;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= VISIBILITY_THRESHOLD
        ) {
          videoEl
            .play()
            .then(() => {
              setNeedsUserGesture(false);
            })
            .catch((error) => {
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
      { threshold: VISIBILITY_THRESHOLD }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <CldVideoPlayer
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
        controls={true}
        height="1080"
        id="hero-video"
        loop
        muted
        // poster="https://res.cloudinary.com/dxxwom9zj/video/upload/v1735600000000/7677655-hd_1920_1080_25fps_altt0g.jpg"
        playsinline
        preload="auto"
        src="https://res.cloudinary.com/dulwhlyqt/video/upload/q_auto,f_auto/7677655-hd_1920_1080_25fps_altt0g.mp4"
        width="1920"
      />
      {needsUserGesture ? (
        <button
          className="absolute inset-0 grid place-items-center"
          onClick={() => {
            const container = document.getElementById("hero-video");
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
          }}
          type="button"
        >
          <span className="rounded-full bg-black/60 px-5 py-3 text-white">
            Play video
          </span>
        </button>
      ) : null}
    </>
  );
}
