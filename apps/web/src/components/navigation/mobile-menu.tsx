"use client";

import { Menu } from "lucide-react";
import { useNavigation } from "@/app/hooks/use-navigation";
import NavItems from "@/components/navigation/nav-items";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "../mode-toggle";
import UserMenu from "../user-menu";

export default function MobileMenu() {
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu } = useNavigation();

  const handleMenuToggle = () => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  return (
    <Sheet onOpenChange={handleMenuToggle} open={isMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          aria-label="Open navigation menu"
          className="p-6 md:hidden"
          size="icon"
        >
          <Menu aria-hidden="true" className="size-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        aria-label="Navigation menu"
        className="w-[300px] sm:w-[400px]"
        id="mobile-navigation"
        side="right"
      >
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Main navigation" className="flex flex-col gap-4 p-6">
          <NavItems
            className="flex flex-col gap-4"
            onItemClick={closeMobileMenu}
          />
        </nav>
        <div className="flex items-center gap-4 p-6">
          <ModeToggle />
          <UserMenu />
        </div>
      </SheetContent>
    </Sheet>
  );
}
