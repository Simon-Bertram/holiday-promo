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
    <Card>
      <CardHeader>
        <CardTitle className="font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          Unlock your best holiday yet
        </CardTitle>
        <CardDescription>
          Get the best deals on flights, hotels, and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/login">Sign up now</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
