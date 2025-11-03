import { usePathname } from "next/navigation";
import { useState } from "react";

export function useNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const isCurrentPage = (href: string) => pathname === href;

  return {
    pathname,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    closeMobileMenu,
    openMobileMenu,
    isCurrentPage,
  };
}
