import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import SubscriptionForm from "./subscription-form";

export default function HeroCta() {
  return (
    <Card className="bg-white/50 backdrop-blur-sm dark:bg-black/50">
      <CardHeader>
        <CardTitle
          as="h1"
          className="font-black text-2xl text-black sm:text-3xl md:text-4xl lg:text-5xl dark:text-white"
        >
          Unlock your best holiday yet
        </CardTitle>
        <CardDescription className="text-black dark:text-white">
          Get the best deals on flights, hotels, and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <SubscriptionForm />
        </div>
      </CardContent>
    </Card>
  );
}
