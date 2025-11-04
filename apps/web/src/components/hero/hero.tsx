"use client";

import Image from "next/image";
import HeroCta from "./hero-cta";

export default function Hero() {
  return (
    <div className="relative flex min-h-dvh w-full items-end justify-center border border-red-500">
      {/* Mobile background image */}
      <Image
        alt="Holiday destination background"
        className="object-cover md:hidden"
        fill
        priority
        sizes="(max-width: 767px) 100vw, 100vw"
        src="https://res.cloudinary.com/dulwhlyqt/video/upload/f_jpg,q_auto,dpr_auto,c_fill,g_auto,w_1080,h_1920,so_1/12529111_1080_1920_60fps_iamdrc.jpg"
      />

      {/* Desktop background image */}
      <Image
        alt="Holiday destination background"
        className="hidden object-cover md:block"
        fill
        priority
        sizes="(min-width: 768px) 100vw, 100vw"
        src="https://res.cloudinary.com/dulwhlyqt/video/upload/f_jpg,q_auto,dpr_auto,c_fill,g_auto,w_1920,h_1080,so_1/7677655-hd_1920_1080_25fps_altt0g.jpg"
      />

      <div className="z-10 mx-4 mb-6 flex w-full flex-col p-4 sm:p-5 md:mr-6 md:mb-6 md:w-1/2 md:p-6">
        <HeroCta />
      </div>
    </div>
  );
}
