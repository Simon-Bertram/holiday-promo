import Image from "next/image";
import HeroCta from "./hero-cta";

export default function Hero() {
  return (
    <div className="relative flex min-h-dvh w-full items-end justify-start">
      {/* Full-screen hero background image */}
      <Image
        alt="Holiday destination background"
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src="https://res.cloudinary.com/dulwhlyqt/image/upload/v1766139373/jennifer-kalenberg-D1ZtQGk3AB8-unsplash_nfo8gh.jpg"
      />

      <div className="z-10 mb-6 ml-4 flex w-full max-w-md flex-col sm:mb-8 sm:ml-6 md:mb-10 md:ml-8 md:w-1/2 lg:ml-12">
        <HeroCta />
      </div>
    </div>
  );
}
