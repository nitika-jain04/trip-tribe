"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  // { name: "Blog", href: "/blog" },
  { name: "Become a Partner", href: "/partners" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const isHeaderSolid = isScrolled || isMobileMenuOpen;
  const isTransparentAndHome = pathname === "/" && !isHeaderSolid;

  const handleNavClick = (e, href) => {
    if (pathname === href) {
      e.preventDefault(); // stop navigation
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHeaderSolid
            ? "backdrop-blur-lg border-b border-border bg-white"
            : "bg-transparent"
        }`}
        style={{ transform: "translateZ(0)" }}
      >
        <nav className="container-premium">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              onClick={(e) => handleNavClick(e, "/")}
            >
              <img
                src="/triptribe-logo-final.png"
                alt="TripTribe"
                className="h-12 w-12 rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
              <span
                className={`font-display text-xl font-semibold transition-colors ${isTransparentAndHome ? "text-white" : "text-foreground"}`}
              >
                TripTribe
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 text-body-sm font-medium rounded-full transition-colors duration-200 ${
                    pathname === item.href
                      ? "text-primary bg-primary-light"
                      : isTransparentAndHome
                        ? "text-white hover:text-white/80"
                        : "text-foreground hover:text-primary hover:bg-muted"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/trips">
                <Button className="btn-primary">Explore Trips</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors text-foreground ${
                isHeaderSolid
                  ? "text-foreground hover:bg-muted"
                  : "text-background hover:bg-background/10"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X
                  className={`w-6 h-6 transition-colors duration-75 ease-in-out ${isTransparentAndHome ? "text-white" : "text-foreground hover:text-white"}`}
                />
              ) : (
                <Menu
                  className={`w-6 h-6 transition-colors duration-75 ease-in-out ${isTransparentAndHome ? "text-white" : "text-foreground hover:text-white"}`}
                />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`md:hidden backdrop-blur-lg overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen ? "max-h-96 pb-6" : "max-h-0"
            }`}
          >
            <div className="flex flex-col gap-1 pt-4 border-t border-border bg-background rounded-xl mt-2 p-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 text-body font-medium rounded-lg transition-colors duration-200 ${
                    pathname === item.href
                      ? "text-primary bg-primary-light"
                      : "text-foreground hover:text-primary hover:bg-muted"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <Link
                href="/trips"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4"
              >
                <Button className="btn-primary w-full">Explore Trips</Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-md transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}
