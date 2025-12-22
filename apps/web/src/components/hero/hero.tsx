import Image from "next/image";
import HeroCta from "./hero-cta";

// Base Cloudinary image path
const CLOUDINARY_BASE = "dulwhlyqt/image/upload";
const IMAGE_ID =
  "v1766139373/jennifer-kalenberg-D1ZtQGk3AB8-unsplash_nfo8gh.jpg";

/**
 * Generates an optimized Cloudinary image URL with server-side transformations.
 *
 * Transformations applied:
 * - q_auto: Automatic quality optimization based on image content
 * - f_auto: Automatic format selection (WebP/AVIF when browser supports)
 * - w_1920: Max width constraint for desktop (reduces file size)
 * - c_fill: Fill mode maintains aspect ratio while filling container
 * - g_auto: Automatic gravity for smart cropping/focus
 *
 * @param width - Optional width override (default: 1920)
 * @returns Optimized Cloudinary URL
 */
function getOptimizedImageUrl(width = 1920): string {
  return `https://res.cloudinary.com/${CLOUDINARY_BASE}/w_${width},q_auto,f_auto,c_fill,g_auto/${IMAGE_ID}`;
}

// Blur placeholder data URL for layout stability
// This is a base64-encoded low-quality version of the image
// Note: For production, consider generating this from the actual image at build time
const blurDataURL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

/**
 * Hero component with server-side optimized image loading.
 *
 * Optimizations:
 * - Cloudinary transformations for automatic format/quality optimization
 * - Priority loading for faster LCP (Largest Contentful Paint)
 * - Blur placeholder to prevent layout shift
 * - Responsive sizing with proper srcset generation
 */
export default function Hero() {
  // Main optimized image URL with server-side transformations
  const heroImageSrc = getOptimizedImageUrl();

  return (
    <section className="relative flex min-h-dvh w-full items-end justify-start">
      {/* Full-screen hero background image with server-side optimizations */}
      <Image
        alt="Holiday destination background"
        blurDataURL={blurDataURL}
        className="object-cover"
        fill
        placeholder="blur"
        priority
        sizes="100vw"
        src={heroImageSrc}
      />

      <div className="z-10 mb-6 ml-4 flex w-full max-w-md flex-col sm:mb-8 sm:ml-6 md:mb-10 md:ml-8 md:w-1/2 lg:ml-12">
        <HeroCta />
      </div>
    </section>
  );
}
