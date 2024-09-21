import { Button } from "@/components/ui/button";

export default function SignInForm() {
  return (
    <form className="rounded-lg text-black py-10 px-12 bg-white/40 max-w-xl mx-auto">
      <div className="flex gap-5 items-center mb-4">
        <label htmlFor="email">Email Address:</label>
        <input
          className="rounded-md w-full p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          id="email"
          name="email"
          required
          aria-required="true"
        />
      </div>
      <Button className="mb-8" type="submit">
        Sign Up
      </Button>
    </form>
  );
}
