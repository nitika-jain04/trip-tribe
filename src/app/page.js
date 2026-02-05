import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { LuCalendar, LuFilter, LuGlobe, LuSearch } from "react-icons/lu";
import Link from "next/link";
import { trips } from "./tripData";
import Image from "next/image";
import { MdOutlinePlace } from "react-icons/md";
import { GrGroup } from "react-icons/gr";
import { TiStarFullOutline } from "react-icons/ti";
import { FaArrowRight, FaInstagram } from "react-icons/fa6";
import { RiShareBoxLine } from "react-icons/ri";

export const metadata = {
  title: "Explore Group Trips Across India",
  description:
    "Discover curated group trips, adventures, and travel communities across India. Compare itineraries, prices, and partners on TripTribe.",
  alternates: {
    canonical: "https://triptribe.in",
  },
  openGraph: {
    title: "TripTribe – India's First Community Trip Aggregator",
    description:
      "Compare and explore group trips, adventures, and trusted travel communities across India.",
    url: "https://triptribe.in",
    siteName: "TripTribe",
    images: [
      {
        url: "https://triptribe.in/about_us.jpg",
        width: 1200,
        height: 630,
        alt: "TripTribe Home",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "TripTribe – India's First Community Trip Aggregator",
    description:
      "Explore curated group trips, adventures & travel communities across India.",
  },
};

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

const destinations = [
  { id: 1, heading: "Spiti Valley", totalTrips: 24 },
  { id: 2, heading: "Meghalaya", totalTrips: 18 },
  { id: 3, heading: "Ladakh", totalTrips: 32 },
  { id: 4, heading: "Goa", totalTrips: 15 },
  { id: 5, heading: "Kashmir", totalTrips: 21 },
];

const triptribework = [
  {
    id: 1,
    icon: <LuSearch size={30} />,
    heading: "1. Discover",
    description:
      "Browse verified community trips from top operators across India",
    color: "bg-primary-aqua",
  },
  {
    id: 2,
    icon: <LuFilter size={30} />,
    heading: "2. Compare",
    description: "See destinations, prices, and styles side by side",
    color: "bg-primary-blue",
  },
  {
    id: 3,
    icon: <LuGlobe size={30} />,
    heading: "3. Book",
    description: "Go directly to the operator's site — zero markups",
    color: "bg-primary-orange",
  },
];

export default function Home() {
  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <div>
      <div className="relative h-screen w-full">
        <Navbar />
        <Image
          src="/about_us.jpg"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="absolute inset-0 flex flex-col gap-5 items-center justify-center text-center px-4 sm:px-6 md:px-8">
          <p className="text-4xl xl:text-6xl font-bold text-white leading-tight">
            Find your tribe.
            <br />
            Travel together.
          </p>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl">
            Explore curated group trips. Compare price, duration, and vibe.
            <br />
            Book directly with trusted operators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <Link href="/explore">
              <button className="bg-primary-aqua text-white px-6 py-1 rounded-lg text-base md:text-lg cursor-pointer transition-all duration-200 hover:shadow-lg">
                Explore Trips
              </button>
            </Link>
            <Link href="/partners">
              <button className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-foreground cursor-pointer px-6 py-1 rounded-lg text-base md:text-lg transition-all duration-200">
                Join as Partner
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="py-20 flex flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-5">
          <p className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-center">
            How It Works
          </p>
          <p className="text-xl text-center text-overlay-muted tracking-wide px-5">
            Three simple steps to your perfect group travel experience
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-28 items-center justify-center px-10 pt-14 md:px-16 lg:px-24 md:pt-20">
          {triptribework.map((why) => {
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

      {/* <div className="py-20 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <p className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-center">
            Featured Destinations
          </p>
          <p className="text-xl text-center text-overlay-muted tracking-wide">
            Explore India&apos;s most breathtaking landscapes
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-28 items-center justify-center px-10 pt-14 md:px-16 lg:px-24 md:pt-20">
          {destinations.map((t) => {
            return (
              <div
                key={t.id}
                className="flex items-center bg-pink-200 justify-between h-[383] w-[320] border border-gray-500 rounded-xl px-5"
              >
                <div className="flex justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="p-4 text-3xl text-white rounded-full">
                      {t.heading}
                    </div>
                    <p className="text-2xl font-bold text-surface-lighter text-center">
                      {t.totalTrips} trips available
                    </p>
                  </div>
                </div>
                <FaArrowRight size={30} />
              </div>
            );
          })}
        </div>
      </div> */}

      <div className="flex flex-col gap-5 py-20 px-10 md:px-20 bg-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex flex-col gap-5 items-center md:items-start justify-start">
            <p className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-center">
              Featured Trips
            </p>
            <p className="text-xl text-center text-overlay-muted tracking-wide">
              Handpicked experiences from trusted partners
            </p>
          </div>

          <Link
            href="/explore"
            className="border border-gray-300 text-sm bg-white w-fit rounded-lg h-fit px-4 py-2"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:grid-cols-3 pb-20 mt-5">
          {trips.map((trip) => {
            return (
              <div
                key={trip.id}
                className="rounded-lg shadow-xl hover:transition-transform hover:-translate-y-1 hover:duration-500 hover:ease-out"
              >
                <div className="h-44 w-full relative">
                  <Image
                    src={trip.img}
                    alt="Image"
                    fill
                    objectFit="cover"
                    className="rounded-t-xl"
                  />
                  <p className="absolute top-5 right-2 bg-surface-lighter rounded-xl font-medium tracking-wide text-xs px-2 hover:bg-foreground text-foreground hover:text-white">
                    {trip.partner}
                  </p>
                </div>

                <div className="p-5 flex flex-col gap-2 tracking-wide">
                  <p className="text-lg font-semibold tracking-normal text-foreground">
                    {trip.name}
                  </p>
                  <p className="text-sm text-overlay-muted flex items-center gap-2 tracking-wider">
                    <MdOutlinePlace size={16} />
                    {trip.location}
                  </p>

                  <div className="flex items-center gap-5 tracking-wider">
                    <p className="text-sm text-overlay-muted flex items-center gap-2">
                      <LuCalendar size={16} />
                      {trip.duration}
                    </p>
                    <p className="text-sm text-overlay-muted flex items-center gap-2">
                      <GrGroup size={16} />
                      {trip.groupSize}
                    </p>
                    {/* <p className="text-sm flex items-center gap-2">
                      <TiStarFullOutline
                        size={17}
                        className="text-orange-300"
                      />
                      {trip.rating}
                    </p> */}
                  </div>

                  <div className="py-2">
                    <hr className="border-0 border-t border-gray-200" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-overlay-muted">
                        Starting from
                      </p>
                      <p className="text-xl md:text-2xl font-semibold tracking-wide text-foreground">
                        ₹{trip.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="px-2 py-1 md:px-3 border border-gray-200 text-sm text-foreground rounded-lg hover:bg-blue-400 hover:text-white cursor-pointer">
                        Compare
                      </button>
                      <Link href={`/trip/${slugify(trip.name)}`}>
                        {" "}
                        <button className="px-2 py-1 md:px-3 text-white bg-primary-aqua text-sm rounded-lg cursor-pointer">
                          View
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 px-10 justify-evenly items-center bg-[#1c2532] py-20 md:py-24">
        <p className="flex flex-col items-center gap-3 text-primary-aqua text-4xl md:text-5xl font-bold">
          10+
          <span className="text-base text-white/80 font-normal">
            Trusted Partners
          </span>
        </p>
        <p className="flex flex-col items-center gap-3 text-primary-aqua text-4xl md:text-5xl font-bold">
          100+
          <span className="text-base text-white/80 font-normal">
            Curated Trips
          </span>
        </p>
        <p className="flex flex-col items-center gap-3 text-primary-aqua text-4xl md:text-5xl font-bold">
          50,000+
          <span className="text-base text-white/80 font-normal">
            Happy Travelers
          </span>
        </p>
        <p className="flex flex-col items-center gap-3 text-primary-aqua text-4xl md:text-5xl font-bold">
          4.8
          <span className="text-base text-white/80 font-normal">
            Average Rating
          </span>
        </p>
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

      <div className="flex flex-col gap-5 px-20 justify-evenly items-center bg-primary-aqua py-24 text-center">
        <p className="text-white text-4xl md:text-5xl font-bold">
          Compare your next trip in minutes
        </p>
        <p className="text-xl text-surface-lighter">
          Stop endless searching. Start exploring with confidence.
        </p>
        <button className="bg-primary-orange rounded-lg text-sm text-white px-6 py-2 cursor-pointer hover:shadow-sm">
          Start Comparing
        </button>
      </div>

      <Footer />
    </div>
  );
}
