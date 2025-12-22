"use client";
import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";
import MobileMenu from "./navigation/mobile-menu";
import NavItems from "./navigation/nav-items";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 bg-linear-to-t from-transparent to-white dark:to-black">
      <div className="container mx-auto flex min-h-16 flex-row items-center justify-between bg-transparent px-2 py-4">
        <nav className="my-2 flex w-full items-center justify-between gap-4 bg-transparent align-middle font-black text-black text-xl drop-shadow dark:text-white">
          <Logo />
          <NavItems className="mr-4 hidden items-center gap-4 md:flex" />
          <MobileMenu />
        </nav>
        <div className="hidden min-w-32 items-center justify-end gap-2 md:flex">
          <UserMenu />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
