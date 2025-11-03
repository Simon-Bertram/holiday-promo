"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Hero() {
  return (
    <div className="relative grid min-h-dvh w-full grid-cols-12 grid-rows-8">
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
      <div className="z-10 col-start-2 col-end-12 row-start-5 row-end-8 flex flex-col rounded-lg bg-black/70 p-6 text-white md:col-start-8 md:col-end-13 md:row-start-7 md:row-end-9">
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
