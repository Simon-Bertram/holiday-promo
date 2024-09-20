import Image from "next/image";
import SignInForm from "./ui/signin-form";

export default function Home() {
  return (
    <div className="relative h-screen">
      <div className="absolute inset-0 z-0">
        <Image
          src="/sean-oulashin-KMn4VEeEPR8-unsplash.jpg"
          width={1920}
          height={1280}
          alt="Seashore during golden hour"
          className="hidden md:block"
        />
      </div>

      <div className="relative z-10 flex items-center justify-center h-full p-20">
        <SignInForm />
      </div>
    </div>
  );
}
