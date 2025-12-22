export default function Footer() {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Holiday Promo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
