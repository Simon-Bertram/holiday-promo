import Image from "next/image";

export default function Home() {
  return (
    <div className="absolute inset-0 -z-10">
      <Image
        src="/sean-oulashin-KMn4VEeEPR8-unsplash.jpg"
        width={1920}
        height={1280}
        alt="Seashore during golden hour"
        className="hidden md:block"
      />
    </div>
  );
}
