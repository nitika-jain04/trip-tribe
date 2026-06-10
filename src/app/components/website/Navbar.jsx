"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Cookies from "js-cookie";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  // { name: "Blog", href: "/blog" },
  { name: "Become a Partner", href: "/partners" },
  { name: "Contact", href: "/contact" },
  { name: "Explore Trips", href: "/trips" },
];

function getUserDisplayName(user) {
  if (!user) return "User";
  if (user.name) return user.name;
  if (user.first_name) {
    return user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.first_name;
  }
  if (user.email) return user.email.split("@")[0];
  if (user.phone_number) return user.phone_number;
  return "User";
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const displayName = getUserDisplayName(user);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch (e) {
        console.error("Failed to parse user cookie:", e);
      }
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".profile-dropdown-container")) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("user", { path: "/" });
    setUser(null);
    window.location.href = "/";
  };

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
  // const isTransparentAndHome = pathname === "/" && !isHeaderSolid;
  const isTransparentAndHome = pathname === "/" && !isHeaderSolid;
  const isDarkHome =
    pathname === "/" &&
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

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
      >
        <nav className="container-premium">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              prefetch={false}
              onClick={(e) => handleNavClick(e, "/")}
            >
              <img
                src="/triptribe-logo-final.webp"
                alt="TripTribe"
                className="h-12 w-12 rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
              {/* <span
                className={`font-display text-xl font-semibold transition-colors ${isTransparentAndHome ? "text-white" : "text-foreground"}`}
              >
                TripTribe
              </span> */}
              <span
                className={`font-display text-xl font-semibold transition-colors ${
                  isTransparentAndHome || isDarkHome
                    ? "text-white"
                    : "text-foreground"
                }`}
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
                  prefetch={false}
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

            {/* <Link href="/trips" prefetch={false}>
              <Button className="btn-primary">Explore Trips</Button>
            </Link> */}

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-3">
              {!isMounted ? (
                <div className="h-10 w-[78px]" />
              ) : user ? (
                <div className="relative profile-dropdown-container">
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-body-sm font-medium border transition-all duration-300 ${
                      isTransparentAndHome
                        ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                      {displayName[0].toUpperCase()}
                    </div>
                    <span>Hi, {displayName.split(" ")[0]}</span>
                    <ChevronDown
                      className={`w-4 h-4 opacity-70 transition-transform duration-300 ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu Card */}
                  {isProfileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-40 rounded-2xl bg-card border border-border shadow-xl py-2 z-50 animate-scale-in"
                      style={{ animationDuration: "150ms" }}
                    >
                      {/* <div className="px-4 py-2 border-b border-border/60">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Signed in as
                        </p>
                        <p className="text-sm font-medium text-foreground truncate mt-0.5">
                          {user.name}
                        </p>
                      </div> */}
                      <Link
                        href="/profile"
                        prefetch={false}
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <User className="w-4 h-4 text-muted-foreground" />
                        View Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition-colors border-t border-border/60"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" prefetch={false}>
                  <Button
                    variant="outline"
                    className={
                      isTransparentAndHome
                        ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                        : ""
                    }
                  >
                    Login/Signup
                  </Button>
                </Link>
              )}
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
                  className={`w-6 h-6 transition-colors duration-75 ease-in-out ${isTransparentAndHome ? "text-white" : "text-foreground hover:text-primary cursour-pointer"}`}
                />
              ) : (
                <Menu
                  className={`w-6 h-6 transition-colors duration-75 ease-in-out ${isTransparentAndHome ? "text-white" : "text-foreground hover:text-primary cursour-pointer"}`}
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
                  prefetch={false}
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

              {!isMounted ? (
                <div className="h-12" />
              ) : user ? (
                <>
                  <div className="px-4 py-2 border-t border-b border-border/60 my-1 bg-muted/30 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Signed in as
                    </p>
                    <p className="text-sm font-medium text-foreground truncate mt-0.5">
                      {displayName}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    prefetch={false}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-body font-medium rounded-lg transition-colors duration-200 text-foreground hover:text-primary hover:bg-muted"
                  >
                    <User className="w-5 h-5 text-muted-foreground" />
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2.5 px-4 py-3 text-body font-medium rounded-lg transition-colors duration-200 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-left w-full cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  prefetch={false}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-body font-medium rounded-lg transition-colors duration-200 text-foreground hover:text-primary hover:bg-muted"
                >
                  Login
                </Link>
              )}

              {/* <Link
                href="/trips"
                prefetch={false}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2"
              >
                <Button className="btn-primary w-full">Explore Trips</Button>
              </Link> */}
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
