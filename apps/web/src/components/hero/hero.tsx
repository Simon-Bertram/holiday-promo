import Image from "next/image";
import HeroCta from "./hero-cta";

// Blur placeholder data URL for layout stability
const blurDataURL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

export default function Hero() {
  return (
    <section className="relative flex min-h-dvh w-full items-end justify-start">
      {/* Full-screen hero background image */}
      <Image
        alt="Holiday destination background"
        blurDataURL={blurDataURL}
        className="object-cover"
        fill
        placeholder="blur"
        priority
        sizes="100vw"
        src="https://res.cloudinary.com/dulwhlyqt/image/upload/v1766139373/jennifer-kalenberg-D1ZtQGk3AB8-unsplash_nfo8gh.jpg"
      />

      <div className="z-10 mb-6 ml-4 flex w-full max-w-md flex-col sm:mb-8 sm:ml-6 md:mb-10 md:ml-8 md:w-1/2 lg:ml-12">
        <HeroCta />
      </div>
    </section>
  );
}
