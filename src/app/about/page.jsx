import React from "react";
import Footer from "../components/Footer";
import Image from "next/image";
import DescriptiveInfo from "../components/DescriptiveInfo";
import { LuShield } from "react-icons/lu";
import { GoPeople } from "react-icons/go";
import { FaRegHeart } from "react-icons/fa6";
import { MdOutlineWifiTethering } from "react-icons/md";
import Link from "next/link";
import Navbar from "../components/Navbar";

function page() {
  const coFounders = [
    {
      id: 1,
      initials: "DR",
      name: "Depane Rao",
      designation: "Co-Founder",
      description:
        "Adventure enthusiast with a background in technology, passionate about making travel accessible to everyone.",
    },
    {
      id: 2,
      initials: "AK",
      name: "Akash Kashyap",
      designation: "Co-Founder",
      description:
        "Serial traveler and product designer, dedicated to creating seamless user experiences.",
    },
  ];
  return (
    <div>
      <Navbar />

      <div className="relative w-full h-96 -z-10">
        <Image
          src="/about_us.jpg"
          alt="Travellers"
          fill
          className="object-cover"
        />
      </div>

      <div className="">
        <div className="py-14 px-10 md:py-28 lg:px-14 flex flex-col items-center">
          <p className="text-4xl md:text-5xl font-bold tracking-tight pb-6">
            Our Mission
          </p>
          <p className="text-xl text-center text-overlay-muted leading-8">
            We built TripTribe to solve a simple problem: comparing community
            trips was messy, time-consuming, and frustrating. Multiple tabs,
            inconsistent information, and hidden prices made planning harder
            than the trip itself. We&apos;re changing that by bringing all the
            best group travel experiences into one transparent, easy-to-use
            platform.
          </p>
        </div>

        <div className="">
          <div className="bg-gray-50 py-14 px-10 md:py-28 lg:px-24 flex flex-col items-center">
            <p className="text-4xl md:text-5xl font-bold tracking-tight pb-3 text-foreground">
              Our Values
            </p>
            <p className="text-xl text-center text-overlay-muted tracking-wide leading-8">
              What drives us every day
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 tems-center mt-20 gap-12 md:gap-20">
              <DescriptiveInfo
                icon={LuShield}
                bgColor="bg-primary-aqua"
                heading="Transparency"
                description="No hidden fees, no commissions. Just honest information."
              />

              <DescriptiveInfo
                icon={GoPeople}
                bgColor="bg-[#398ff9]"
                heading="Community"
                description="Building connections between travelers and operators."
              />

              <DescriptiveInfo
                icon={MdOutlineWifiTethering}
                bgColor="bg-[#ee7c2b]"
                heading="Simplicity"
                description="Making complex decisions easy and enjoyable."
              />

              <DescriptiveInfo
                icon={FaRegHeart}
                bgColor="bg-foreground"
                heading="Passion"
                description="We love travel and we love making it better."
              />
            </div>
          </div>

          <div className="py-14 md:py-28 md:px-14 lg:px-20 flex flex-col items-center">
            <p className="text-4xl md:text-5xl font-bold pb-4 text-center">
              Meet the Founders
            </p>
            <p className="text-xl text-center text-overlay-muted tracking-wide leading-8">
              Two travelers on a mission to simplify group travel
            </p>

            <div className="flex flex-col md:flex-row items-center justify-between gap-14 mt-20 md:mt-28">
              {coFounders.map((f) => {
                return (
                  <div key={f.id}>
                    <div className="flex flex-col gap-4 items-center">
                      <div className="p-6 text-white bg-[#6dd5ce]/20 rounded-full">
                        <p className="text-3xl font-bold text-[#6dd5ce]">
                          {f.initials}
                        </p>
                      </div>
                      <p className="text-2xl font-bold">{f.name}</p>
                      <p className="text-gray-500 tracking-wide">
                        {f.designation}
                      </p>
                      <p className="text-overlay-muted text-base text-center tracking-wide">
                        {f.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-50 py-14 px-5 md:py-28 md:px-14 lg:px-20 flex flex-col items-center">
            <p className="text-4xl md:text-5xl font-bold tracking-tight pb-10">
              Our Story
            </p>

            <p className="text-overlay-muted text-lg text-justify">
              TripTribe started from a simple frustration. While planning a
              Ladakh trip, we spent hours jumping between operator websites,
              comparing prices on spreadsheets, and trying to figure out what
              was actually included. There had to be a better way.<br></br>
              <br></br> We realized that community travel operators were doing
              amazing work, but travelers had no easy way to discover and
              compare their offerings. At the same time, these operators needed
              more visibility without giving up control of their bookings or
              margins.
              <br></br>
              <br></br> That&apos;s when we built TripTribe — a platform that
              brings clarity to the chaos. We&apos;re not a booking platform.
              We&apos;re not adding markups. We&apos;re simply making it easier
              for travelers to find their perfect trip and for operators to
              reach more people.<br></br>
              <br></br> Today, we&apos;re proud to be India&apos;s first
              community trip aggregator, helping thousands of travelers discover
              their next adventure with confidence and transparency.
            </p>
          </div>

          <div className="py-14 px-5 md:py-20 flex flex-col gap-6 justify-center items-center mb-20 md:mb-10">
            <p className="text-4xl md:text-5xl font-bold tracking-tight">
              Ready to Explore?
            </p>
            <p className="text-xl text-center text-overlay-muted tracking-wide leading-6">
              Start comparing trips and find your perfect adventure today
            </p>
            <div className="flex flex-col md:flex-row md:justify-center gap-5 text-sm items-center w-full text-foreground">
              <Link href="/explore">
                <button className="px-8 py-2 rounded-lg bg-primary-aqua font-medium text-white cursor-pointer hover:shadow-lg">
                  Explore Trips
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-2 rounded-lg border-gray-200 border hover:bg-[#5298ed] hover:text-white cursor-pointer font-extralight">
                  Get in Touch
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default page;
