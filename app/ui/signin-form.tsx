import { Button } from "@/components/ui/button";

export default function SignInForm() {
  return (
    <form className="rounded-lg text-black py-10 px-12 bg-white/40">
      <h1 className="text-xl mb-8">Sign up for the best holiday deals</h1>
      <div className="flex gap-5 items-center">
        <label htmlFor="email">Email Address:</label>
        <input className="rounded-md" type="email" id="email" />
      </div>
      <Button>Submit</Button>
    </form>
  );
}
