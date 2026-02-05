"use client";
import React, { useState } from "react";
import Footer from "../components/Footer";
import { trips } from "../tripData";
import Image from "next/image";
import { MdOutlinePlace } from "react-icons/md";
import { GrGroup } from "react-icons/gr";
import { LuCalendar } from "react-icons/lu";
import { TiStarFullOutline } from "react-icons/ti";
import Link from "next/link";
import TripDropdown from "../components/TripDropdown";
import { CiSearch } from "react-icons/ci";
import Navbar from "../components/Navbar";

function Page() {
  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const [search, setSearch] = useState("");
  const [destination, setDestination] = useState("All Destinations");
  const [partner, setPartner] = useState("All Partners");
  const [sortBy, setSortBy] = useState("popular");

  const destinations = [
    "All Destinations",
    ...new Set(trips.map((t) => t.location)),
  ];
  const partners = ["All Partners", ...new Set(trips.map((t) => t.partner))];

  const filteredTrips = trips
    .filter((trip) => trip.name.toLowerCase().includes(search.toLowerCase()))
    .filter((trip) =>
      destination === "All Destinations" ? true : trip.location === destination,
    )
    .filter((trip) =>
      partner === "All Partners" ? true : trip.partner === partner,
    )
    .sort((a, b) => {
      if (sortBy === "low") return a.price - b.price;
      else if (sortBy === "high") return b.price - a.price;
      // if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div>
      <Navbar />

      <div className="flex flex-col gap-5 items-center px-10 lg:px-20">
        <p className="text-5xl font-bold tracking-tight text-foreground text-center mt-5">
          Explore Trips
        </p>
        <p className="text-xl text-center text-overlay-muted tracking-wide leading-6">
          Compare and discover your perfect adventure
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full py-10">
          <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm">
            <CiSearch size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search destinations, trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm outline-none bg-transparent placeholder:text-gray-400"
            />
          </div>

          <TripDropdown
            options={destinations}
            value={destination}
            onChange={setDestination}
          />

          <TripDropdown
            options={partners}
            value={partner}
            onChange={setPartner}
          />

          <TripDropdown
            options={[
              "Most Popular",
              "Price: Low to High",
              "Price: High to Low",
            ]}
            value={
              sortBy === "popular"
                ? "Most Popular"
                : sortBy === "low"
                  ? "Price: Low to High"
                  : "Price: High to Low"
            }
            onChange={(val) => {
              if (val === "Most Popular") setSortBy("popular");
              if (val === "Price: Low to High") setSortBy("low");
              if (val === "Price: High to Low") setSortBy("high");
            }}
          />
        </div>

        <div className="w-full flex flex-col gap-10">
          <p className="text-overlay-muted text-base">
            Showing {filteredTrips.length} trips
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:grid-cols-3 lg:gap-10 pb-20">
            {filteredTrips.map((trip) => {
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

                  <div className="p-5 flex flex-col gap-2 ">
                    <p className="text-lg font-semibold tracking-normal text-foreground">
                      {trip.name}
                    </p>
                    <p className="text-sm text-overlay-muted flex items-center gap-2">
                      <MdOutlinePlace size={16} />
                      {trip.location}
                    </p>

                    <div className="flex items-center gap-5">
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
      </div>

      <Footer />
    </div>
  );
}

export default Page;
