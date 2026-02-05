import React from "react";
import Footer from "../components/Footer";
import { LuShield } from "react-icons/lu";
import { HiMiniArrowTrendingUp } from "react-icons/hi2";
import { GoPeople } from "react-icons/go";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa6";
import { RiShareBoxLine } from "react-icons/ri";
import Navbar from "../components/Navbar";

const partners = [
  {
    id: 1,
    img: "/about_us.jpg",
    name: "WanderOn",
    description:
      "India's leading community travel platform offering unique experiences across diverse destinations.",
    webLink: "https://wanderon.in/",
    igLink: "https://www.instagram.com/wanderon.in",
  },
  {
    id: 2,
    img: "/about_us.jpg",
    name: "Safarnama",
    description:
      "Curating authentic travel experiences with a focus on cultural immersion and adventure.",
    webLink: "https://www.safarnama.com/",
    igLink: "https://www.instagram.com/safarnama",
  },
  {
    id: 3,
    img: "/about_us.jpg",
    name: "Capture A Trip",
    description:
      "Photography-focused travel experiences for creative travelers and adventure enthusiasts.",
    webLink: "https://www.captureatrip.com/",
    igLink: "https://www.instagram.com/captureatrip",
  },
  {
    id: 4,
    img: "/about_us.jpg",
    name: "Go4Explore",
    description:
      "Adventure travel specialists offering treks, expeditions, and unique wilderness experiences.",
    webLink: "https://go4explore.com/",
    igLink: "https://www.instagram.com/go4explore",
  },
  {
    id: 5,
    img: "/about_us.jpg",
    name: "WanderSaga",
    description:
      "Creating memorable journeys with a blend of adventure, comfort, and local experiences.",
    webLink: "https://www.wandersaga.com/",
    igLink: "https://www.instagram.com/wandersaga",
  },
  {
    id: 6,
    img: "/spiti-valley.jpg",
    name: "Byko Journeys",
    description:
      "Motorcycle tours and road trips across India's most scenic routes and challenging terrains.",
    webLink: "https://www.bykojourneys.com/",
    igLink: "https://www.instagram.com/bykojourneys",
  },
];

const whypartner = [
  {
    id: 1,
    icon: <HiMiniArrowTrendingUp size={30} />,
    heading: "Increase Visibility",
    description:
      "Reach thousands of qualified travelers actively searching for their next adventure",
    color: "bg-primary-aqua",
  },
  {
    id: 2,
    icon: <LuShield size={30} />,
    heading: "No Markups",
    description:
      "We don't take commissions. Keep 100% of your revenue while we drive traffic",
    color: "bg-primary-blue",
  },
  {
    id: 3,
    icon: <GoPeople size={30} />,
    heading: "Quality Leads",
    description:
      "Connect with travelers who have already compared and are ready to book",
    color: "bg-primary-orange",
  },
];

const partnerWorking = [
  {
    id: 1,
    heading: "Share Your Details",
    description:
      "Fill out our simple partner form with your company information and trip offerings",
    color: "bg-primary-aqua",
  },
  {
    id: 2,
    heading: "List Your Trips",
    description:
      "We'll work with you to showcase your trips on our platform with accurate details",
    color: "bg-primary-blue",
  },
  {
    id: 3,
    heading: "Connect With Travellers",
    description:
      "Start receiving qualified leads directly to your website with UTM tracking",
    color: "bg-primary-orange",
  },
];

function page() {
  return (
    <div>
      <Navbar />

      <div className="flex flex-col gap-5 py-28 items-center bg-[#12223b]">
        <p className="text-4xl md:text-5xl tracking-tight font-bold md:px-20 text-center text-white">
          Grow with TripTribe
        </p>
        <p className="text-xl md:text-2xl text-center text-surface-lighter px-5 lg:px-60 xl:px-80">
          Join India&apos;s first community trip aggregator and connect with
          thousands of travelers
        </p>
      </div>

      <div className="py-20 md:py-28 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center py-5 px-10">
          <p className="text-4xl md:text-5xl font-bold tracking-tight pb-6 text-foreground text-center">
            Why Partner With Us?
          </p>
          <p className="text-xl text-center text-overlay-muted leading-6">
            Transparent, traffic-driven, and built for growth
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-28 items-center justify-center px-10 pt-14 md:px-16 lg:px-24 md:pt-20">
          {whypartner.map((why) => {
            return (
              <div key={why.id} className="flex flex-col gap-4 items-center">
                <div className={`p-4 text-white ${why.color} rounded-full`}>
                  {why.icon}
                </div>
                <p className="text-2xl font-bold text-foreground text-center">
                  {why.heading}
                </p>
                <p className="text-gray-500 tracking-wide text-center">
                  {why.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 py-20 md:py-28 px-10 lg:px-20 flex flex-col items-center">
        <p className="text-4xl md:text-5xl font-bold tracking-tight pb-6 text-foreground">
          How it Works
        </p>

        <p className="text-overlay-muted text-xl text-center">
          Three simple steps to start growing
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-between px-5 lg:py-10 mt-10">
          {partnerWorking.map((working) => {
            return (
              <div
                key={working.id}
                className="flex flex-col gap-4 shadow-lg rounded-xl px-10 py-8"
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center text-white ${working.color} rounded-full font-bold text-xl`}
                >
                  {working.id}
                </div>
                <p className="text-2xl font-bold">{working.heading}</p>
                <p className="text-gray-500 tracking-wide">
                  {working.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="py-20 lg:px-20">
        <div className="flex flex-col gap-5 items-center px-10">
          <p className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-center">
            Our Partners
          </p>
          <p className="text-xl text-center text-overlay-muted leading-6">
            Trusted travel operators growing with TripTribe
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:grid-cols-3 lg:gap-10 pb-20 mt-20 px-10">
          {partners.map((partner, index) => {
            return (
              <div
                key={index}
                className="rounded-2xl shadow-lg p-6 flex flex-col gap-5 hover:shadow-2xl hover:-translate-y-2 hover:transition-transform hover:duration-700 hover:ease-out"
              >
                <div className="flex flex-col gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden">
                    <Image
                      src={partner.img}
                      alt={partner.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <p className="text-xl font-semibold tracking-wide">
                    {partner.name}
                  </p>
                  <p className="text-sm tracking-wider text-black/50">
                    {partner.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={partner.webLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-4 px-3 py-2 border border-gray-200 rounded-lg text-sm tracking-wide w-full text-center hover:text-white hover:bg-blue-400"
                  >
                    <span>
                      <RiShareBoxLine size={17} />
                    </span>
                    Website
                  </Link>
                  <Link
                    href={partner.igLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-center hover:text-white hover:bg-blue-400"
                  >
                    <FaInstagram size={17} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 py-20 px-5 md:py-24 md:px-10 lg:px-24 mb-20 bg-gray-50">
        <p className="text-4xl md:text-5xl font-bold text-center pb-2 text-foreground">
          Become a Partner{" "}
        </p>
        <p className="text-center text-gray-500 text-xl">
          Fill out the form below and we&apos;ll get back to you within 24 hours
        </p>

        <form
          action=""
          className="flex flex-col gap-5 bg-white px-5 py-3 rounded-lg mt-10"
        >
          <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
            <div className="flex flex-col w-full gap-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                required
                className="border border-gray-300 mt-2 rounded-md px-3 py-2 focus:outline-none focus:border-primary-aqua placeholder:text-sm"
              />
            </div>

            <div className="flex flex-col w-full gap-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                required
                className="border border-gray-300 mt-2 rounded-md px-3 py-2 focus:outline-none focus:border-primary-aqua placeholder:text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
            <div className="flex flex-col w-full gap-2">
              <label className="text-sm font-medium">Company Name</label>
              <input
                type="text"
                placeholder="Your Company"
                required
                className="border border-gray-300 mt-2 rounded-md px-3 py-2 focus:outline-none focus:border-primary-aqua"
              />
            </div>

            <div className="flex flex-col w-full gap-2">
              <label className="text-sm font-medium">Website</label>
              <input
                type="text"
                required
                placeholder="https://yourwebsite.com"
                className="border border-gray-300 mt-2 rounded-md px-3 py-2 focus:outline-none focus:border-primary-aqua"
              />
            </div>
          </div>

          <div className="flex flex-col w-full gap-2">
            <label className="text-sm font-medium">Message</label>
            <textarea
              required
              rows={5}
              className="border border-gray-300 mt-2 rounded-md px-3 py-2 focus:outline-none focus:border-primary-aqua placeholder:text-sm"
              placeholder="Tell us about your travel company and the trips you offer..."
            ></textarea>
          </div>

          <button className="mt-6 text-white text-sm bg-primary-aqua rounded-lg py-3 px-4">
            Send Message
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default page;
