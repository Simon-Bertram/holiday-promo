"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import VideoBg from "./video-bg";

export default function Hero() {
  return (
    <div className="relative h-screen w-full">
      <VideoBg />
      <div className="absolute right-10 bottom-30 z-10 flex flex-col rounded-lg bg-black/70 p-6 text-white">
        <h1 className="mb-4 font-black text-4xl">
          Unlock your best holiday yet
        </h1>
        <p className="mb-4 text-lg">
          Get the best deals on flights, hotels, and more.
        </p>
        <Button asChild className="bg-white text-blue-950 hover:bg-white/80">
          <Link href="/login">Sign up now</Link>
        </Button>
      </div>
    </div>
  );
}
