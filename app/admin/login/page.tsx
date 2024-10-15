export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <a
          className="text-white font-bold bg-teal-600 cursor-pointer p-2 rounded-md"
          href="/api/auth/login"
        >
          Login
        </a>
      </div>
    </main>
  );
}
