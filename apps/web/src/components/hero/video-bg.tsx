"use client";

import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";
import { useAutoplayingCloudinaryVideo } from "./use-autoplaying-video";

export default function VideoBg() {
  const { containerRef, needsUserGesture, handleUserPlay } =
    useAutoplayingCloudinaryVideo();

  return (
    <div
      className="absolute inset-0 h-full w-full overflow-hidden"
      ref={containerRef}
    >
      <CldVideoPlayer
        aria-label="Hero Background video"
        autoPlay
        className="h-full w-full object-cover"
        controls={false}
        height="1080"
        id="hero-video"
        loop
        muted
        onError={(error: unknown) => {
          console.error("Video error:", error);
        }}
        playsinline
        preload="auto"
        src="https://res.cloudinary.com/dulwhlyqt/video/upload/q_auto,f_auto/7677655-hd_1920_1080_25fps_altt0g.mp4"
        width="1920"
      />
      {needsUserGesture ? (
        <button
          aria-label="Play background video"
          className="absolute inset-0 grid place-items-center"
          onClick={handleUserPlay}
          type="button"
        >
          <span className="rounded-full bg-black/60 px-5 py-3 text-white">
            Play video
          </span>
        </button>
      ) : null}
    </div>
  );
}
