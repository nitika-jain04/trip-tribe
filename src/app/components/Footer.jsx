import React from "react";
import { LuFacebook } from "react-icons/lu";
import { BsInstagram } from "react-icons/bs";
import { LuTwitter } from "react-icons/lu";
import { LuLinkedin } from "react-icons/lu";
import Link from "next/link";
import { FiMail } from "react-icons/fi";

function Footer() {
  return (
    <div className="bg-[#061020] text-white p-10 md:py-20 lg:px-28">
      <div className="flex flex-col md:flex-row gap-10 md:gap-20">
        <div className="flex flex-col gap-4 md:w-1/3 lg:w-2/6">
          <div className="flex items-center gap-2 group cursor-pointer">
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
              className="w-8 h-8 text-teal-600"
            >
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
            <span className="text-2xl font-semibold">TripTribe</span>
          </div>

          <p className="w-full text-sm text-surface-light">
            India&apos;s first community trip aggregator. Compare, discover, and
            book trusted group travel experiences.
          </p>

          <div className="flex gap-4 items-center">
            <LuFacebook
              size={19}
              className="hover:text-primary-aqua cursor-pointer"
            />
            <BsInstagram
              size={19}
              className="hover:text-primary-aqua cursor-pointer"
            />
            <LuTwitter
              size={19}
              className="hover:text-primary-aqua cursor-pointer"
            />
            <LuLinkedin
              size={19}
              className="hover:text-primary-aqua cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col w-full md:flex-row gap-10 md:gap-16 xl:gap-56">
          <div className="text-sm tracking-wide flex flex-col w-fit md:w-auto">
            <p className="font-semibold mb-2 text-base">Quick Links</p>
            <div className="flex flex-col gap-2 text-surface-light">
              <Link href="/" className="hover:text-primary-aqua">
                Home
              </Link>
              <Link href="/explore" className="hover:text-primary-aqua">
                Explore Trips
              </Link>
              <Link href="/partners" className="hover:text-primary-aqua">
                Partners
              </Link>
              <Link href="/about" className="hover:text-primary-aqua">
                About Us
              </Link>
            </div>
          </div>

          <div className="text-sm tracking-wide flex flex-col w-fit md:w-auto">
            <p className="font-semibold mb-2 text-base">Resources</p>
            <div className="flex flex-col gap-2 text-surface-light">
              <Link href="/contact" className="hover:text-primary-aqua">
                Contact Us
              </Link>
              <Link href="/privacy" className="hover:text-primary-aqua">
                Privacy Policy
              </Link>
              <Link href="termsofuse" className="hover:text-primary-aqua">
                Terms of Use
              </Link>
            </div>
          </div>

          <div className="text-sm tracking-wide flex flex-col w-fit md:w-auto">
            <p className="font-semibold mb-2 text-base">Get in Touch</p>
            <a
              href="mailto:contact@triptribe.in?subject=TripTribe%20Support%20Inquiry&body=Hi%20TripTribe%20Team,%0A%0AI'm%20reaching%20out%20regarding%20...%0A%0AThanks,"
              className="flex items-center gap-2 hover:text-primary-aqua cursor-pointer text-surface-light"
            >
              <span>
                <FiMail size={20} />
              </span>
              contact@triptribe.in
            </a>
          </div>
        </div>
      </div>

      <div className="py-10">
        <hr className="border-t border-white/10" />
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:gap-10 items-center justify-center lg:justify-between text-sm text-overlay-light mb-10 lg:mb-0">
        <p>© 2026 TripTribe. All rights reserved.</p>

        <p className="text-center md:text-right">
          TripTribe is a comparison and referral platform. All bookings occur on
          partner sites.
        </p>
      </div>
    </div>
  );
}

export default Footer;
