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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="container-premium">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/triptribe-logo-final.png"
              alt="TripTribe"
              className="h-12 w-12 rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
            <span
              className={`font-display text-xl font-semibold transition-colors ${pathname === "/" && !isScrolled ? "text-white" : "text-foreground"}`}
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
                    : pathname === "/" && !isScrolled
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
            className={`md:hidden p-2 rounded-lg transition-colors text-foreground hover:bg-primary ${
              isScrolled
                ? "text-foreground hover:bg-muted"
                : "text-background hover:bg-background/10"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X
                className={`w-6 h-6 transition-colors duration-75 ease-in-out ${pathname === "/" && !isScrolled ? "text-white" : "text-foreground hover:text-white"}`}
              />
            ) : (
              <Menu
                className={`w-6 h-6 transition-colors duration-75 ease-in-out ${pathname === "/" && !isScrolled ? "text-white" : "text-foreground hover:text-white"}`}
              />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
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
  );
}
