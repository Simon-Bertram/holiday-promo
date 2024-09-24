import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribe } from "@/lib/actions";

export default function Subscribe() {
  return (
    <form action={subscribe} className="flex items-center space-x-2">
      <Input type="email" placeholder="Email address" name="email" id="email" />
      <Button
        className="bg-white text-gray-800 hover:bg-blue-700 hover:text-white"
        type="submit"
      >
        Subscribe
      </Button>
    </form>
  );
}
