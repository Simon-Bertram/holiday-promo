"use client";

import Image from "next/image";
import HeroCta from "./hero-cta";

export default function Hero() {
  return (
    <div className="relative flex min-h-dvh w-full items-end justify-center">
      {/* Full-screen hero background image */}
      <Image
        alt="Holiday destination background"
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src="https://res.cloudinary.com/dulwhlyqt/image/upload/v1766139373/jennifer-kalenberg-D1ZtQGk3AB8-unsplash_nfo8gh.jpg"
      />

      <div className="z-10 mx-4 mb-6 flex w-full flex-col p-4 sm:p-5 md:mr-6 md:mb-6 md:w-1/2 md:p-6">
        <HeroCta />
      </div>
    </div>
  );
}
