"use client";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";
import MobileMenu from "./navigation/mobile-menu";
import NavItems from "./navigation/nav-items";
import { Button } from "./ui/button";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-20 bg-linear-to-t from-transparent to-white dark:to-black">
      <div className="container mx-auto flex min-h-16 flex-row items-center justify-between bg-transparent px-2 py-4">
        <nav className="my-2 flex w-full items-center justify-between bg-transparent font-black text-black text-xl drop-shadow dark:text-white">
          {/* Left Group */}
          <Logo />

          {/* Right Group (Desktop + Mobile) */}
          <div className="flex items-center gap-4">
            <NavItems className="hidden items-center gap-4 md:flex" />

            {/* Desktop Actions */}
            <div className="hidden min-w-14 items-center justify-end gap-4 md:flex">
              {session?.user ? null : (
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              )}
              <UserMenu />
              <ModeToggle />
            </div>

            {/* Mobile Menu Trigger */}
            <MobileMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
