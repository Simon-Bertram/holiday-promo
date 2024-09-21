import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InputWithButton() {
  return (
    <div className="flex items-center space-x-2">
      <Input type="email" placeholder="Email" />
      <Button
        className="bg-white text-gray-800 hover:bg-blue-700 hover:text-white"
        type="submit"
      >
        Subscribe
      </Button>
    </div>
  );
}

export default function Hero() {
  return (
    <div className="relative h-screen w-full">
      <picture>
        {/* Desktop images */}
        <source
          media="(min-width: 1024px)"
          srcSet="sebastian-pena-lambarri-Yaia5KzMI-Y-unsplash-2400w.webp 2400w, sebastian-pena-lambarri-Yaia5KzMI-Y-unsplash-2400w.jpg 2400w"
          sizes="100vw"
        />

        {/* Tablet images */}
        <source
          media="(min-width: 640px)"
          srcSet="xavier-coiffic-auL-Y1_TwZc-unsplash-1024w.webp 1024w, xavier-coiffic-auL-Y1_TwZc-unsplash-1024w.jpg 1024w xavier-coiffic-auL-Y1_TwZc-unsplash-2048w.webp 2048w, xavier-coiffic-auL-Y1_TwZc-unsplash-2048w.jpg 2048w"
          sizes="100vw"
        />

        {/* Mobile image (default) using Next.js Image component */}
        <Image
          src="/xavier-coiffic-auL-Y1_TwZc-unsplash-2048w.jpg"
          alt="Hero image"
          fill
          style={{ objectFit: "cover" }}
          priority
          sizes="100vw"
        />
      </picture>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 lg:p-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white text-center mb-12">
          Great holidays for you
        </h1>
        <div className="w-full max-w-md flex justify-center">
          <InputWithButton />
        </div>
      </div>
    </div>
  );
}
