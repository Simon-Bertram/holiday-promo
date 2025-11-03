"use client";
import Logo from "./logo";
import { ModeToggle } from "./mode-toggle";
import NavItems from "./navigation/nav-items";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <div className="fixed inset-x-0 top-0 z-20">
      <div className="flex flex-row items-center justify-between bg-transparent px-2 py-1">
        <nav className="my-2 flex gap-4 bg-transparent align-middle font-black text-white text-xl drop-shadow">
          <Logo />
          <NavItems />
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
