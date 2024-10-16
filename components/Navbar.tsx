import NavLinks from "@/app/ui/nav-links";

const NavBar = () => {
  return (
    <header className="bg-transparent absolute left-0 top-0 right-0 z-10 text-gray-800">
      <nav className="flex items-center justify-center space-between py-4 px-8">
        <NavLinks />
      </nav>
    </header>
  );
};

export default NavBar;
