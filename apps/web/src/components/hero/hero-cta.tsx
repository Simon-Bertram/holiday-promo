import Link from "next/link";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default function HeroCta() {
  return (
    <Card className="bg-white/50 backdrop-blur-sm dark:bg-black/50">
      <CardHeader>
        <CardTitle className="font-black text-2xl text-black sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
          Unlock your best holiday yet
        </CardTitle>
        <CardDescription className="text-black dark:text-white">
          Get the best deals on flights, hotels, and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/signup">Sign up now</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
