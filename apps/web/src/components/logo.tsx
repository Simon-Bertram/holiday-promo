import { TreePalm } from "lucide-react";
import Link from "next/link";

export default function Logo() {
  return (
    <Link className="flex items-center gap-2" href="/">
      <TreePalm className="h-6 w-6" />
      <span className="font-bold text-2xl">Holiday Promotions</span>
    </Link>
  );
}
