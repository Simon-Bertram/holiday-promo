"use client";
import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";
import MobileMenu from "./navigation/mobile-menu";
import NavItems from "./navigation/nav-items";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-20">
      <div className="flex flex-row items-center justify-between bg-transparent px-2 py-1">
        <nav className="my-2 flex w-full justify-between gap-4 bg-transparent align-middle font-black text-white text-xl drop-shadow">
          <Logo />
          <NavItems className="hidden items-center gap-4 md:flex" />
          <MobileMenu />
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
