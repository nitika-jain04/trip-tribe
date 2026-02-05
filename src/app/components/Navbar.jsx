import React from "react";
import Link from "next/link";

function Navbar() {
  return (
    <nav className="flex gap-20 items-center justify-evenly py-5 sticky top-0 bg-white/80">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center gap-2 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-teal-600 transition-transform group-hover:scale-110"
          >
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
          </svg>
          <span className="text-2xl font-semibold">TripTribe</span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-5 md:gap-10 text-[15px] tracking-wide font-medium">
        <Link href="/" className="hover:text-primary-aqua text-foreground">
          Home
        </Link>
        <Link
          href="/explore"
          className="text-sm font-medium hover:text-primary-aqua text-foreground"
        >
          Explore Trips
        </Link>
        <Link
          href="/partners"
          className="text-sm font-medium hover:text-primary-aqua text-foreground"
        >
          Partners
        </Link>
        {/* <Link href="/blog">Blog</Link> */}
        <Link
          href="/about"
          className="text-sm font-medium hover:text-primary-aqua text-foreground"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="text-sm font-medium hover:text-primary-aqua text-foreground"
        >
          Contact
        </Link>
      </div>

      {/* CTA */}
      <div>
        <Link href="/partners">
          <button className="rounded-lg text-sm bg-[#6dd5ce] px-4 py-2 font-semibold text-white cursor-pointer">
            Join as Partner
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
