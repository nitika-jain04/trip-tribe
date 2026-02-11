"use client";

import React, { useState } from "react";
import Link from "next/link";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-20 py-4 md:py-5 sticky top-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        {/* Logo */}
        <Link href="/" onClick={() => setIsMenuOpen(false)}>
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
              className="w-7 h-7 md:w-8 md:h-8 text-teal-600 transition-transform group-hover:scale-110"
            >
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
            <span className="text-xl md:text-2xl font-semibold text-gray-900">
              TripTribe
            </span>
          </div>
        </Link>

        {/* Navigation Links - Hidden on mobile, shown on medium+ */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm lg:text-[15px] tracking-wide font-medium">
          <Link
            href="/"
            className="text-gray-700 hover:text-teal-600 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-gray-700 hover:text-teal-600 transition-colors duration-200"
          >
            About
          </Link>
          {/* <Link
            href="/explore"
            className="text-gray-700 hover:text-teal-600 transition-colors duration-200"
          >
            Explore Trips
          </Link> */}
          <Link
            href="/partners"
            className="text-gray-700 hover:text-teal-600 transition-colors duration-200"
          >
            Become a partner
          </Link>
          <Link
            href="/contact"
            className="text-gray-700 hover:text-teal-600 transition-colors duration-200"
          >
            Contact
          </Link>
        </div>

        {/* Right Section - CTA Button on desktop, Menu button on mobile */}
        <div className="flex items-center gap-4">
          {/* CTA Button - Hidden on mobile, shown on medium+ */}
          <div className="hidden md:block">
            <Link href="/explore">
              <button className="rounded-lg text-sm bg-teal-500 hover:bg-teal-600 px-5 py-2.5 font-semibold text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                Explore Trips
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-teal-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-white">
          {/* Mobile Menu Content */}
          <div className="flex flex-col px-6 py-8 space-y-1 border-t border-gray-100">
            <Link
              href="/"
              className="py-4 px-3 text-gray-800 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className="py-4 px-3 text-gray-800 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore Trips
            </Link>
            <Link
              href="/partners"
              className="py-4 px-3 text-gray-800 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Partners
            </Link>
            <Link
              href="/about"
              className="py-4 px-3 text-gray-800 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="py-4 px-3 text-gray-800 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-colors text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>

            {/* Mobile CTA Button */}
            <div className="pt-6 mt-4 border-t border-gray-100">
              <Link href="/partners" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full rounded-xl bg-teal-500 hover:bg-teal-600 px-6 py-4 font-semibold text-white text-base transition-all duration-200 shadow-sm hover:shadow-md">
                  Join as Partner
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 top-16 bg-black/20 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}

export default Navbar;
