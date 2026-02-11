// "use client";
// import React, { useState } from "react";
// import Footer from "../components/Footer";
// import { trips } from "../tripData";
// import Image from "next/image";
// import { MdOutlinePlace } from "react-icons/md";
// import { GrGroup } from "react-icons/gr";
// import { LuCalendar } from "react-icons/lu";
// import { TiStarFullOutline } from "react-icons/ti";
// import Link from "next/link";
// import TripDropdown from "../components/TripDropdown";
// import { CiSearch } from "react-icons/ci";
// import Navbar from "../components/Navbar";

// function Page() {
//   const slugify = (text) =>
//     text
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/(^-|-$)/g, "");

//   const [search, setSearch] = useState("");
//   const [destination, setDestination] = useState("All Destinations");
//   const [partner, setPartner] = useState("All Partners");
//   const [sortBy, setSortBy] = useState("popular");

//   const destinations = [
//     "All Destinations",
//     ...new Set(trips.map((t) => t.location)),
//   ];
//   const partners = ["All Partners", ...new Set(trips.map((t) => t.partner))];

//   const filteredTrips = trips
//     .filter((trip) => trip.name.toLowerCase().includes(search.toLowerCase()))
//     .filter((trip) =>
//       destination === "All Destinations" ? true : trip.location === destination,
//     )
//     .filter((trip) =>
//       partner === "All Partners" ? true : trip.partner === partner,
//     )
//     .sort((a, b) => {
//       if (sortBy === "low") return a.price - b.price;
//       else if (sortBy === "high") return b.price - a.price;
//       // if (sortBy === "rating") return b.rating - a.rating;
//       return 0;
//     });

//   return (
//     <div>
//       <Navbar />

//       <div className="flex flex-col gap-5 items-center px-10 lg:px-20">
//         <p className="text-5xl font-bold tracking-tight text-foreground text-center mt-5">
//           Explore Community Trips
//         </p>
//         <p className="text-xl text-center text-overlay-muted tracking-wide leading-6">
//           6 trips from verified providers
//         </p>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full py-10">
//           <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm">
//             <CiSearch size={20} className="text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search destinations, trips..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full text-sm outline-none bg-transparent placeholder:text-gray-400"
//             />
//           </div>

//           {/* <TripDropdown
//             options={destinations}
//             value={destination}
//             onChange={setDestination}
//           />

//           <TripDropdown
//             options={partners}
//             value={partner}
//             onChange={setPartner}
//           />

//           <TripDropdown
//             options={[
//               "Most Popular",
//               "Price: Low to High",
//               "Price: High to Low",
//             ]}
//             value={
//               sortBy === "popular"
//                 ? "Most Popular"
//                 : sortBy === "low"
//                   ? "Price: Low to High"
//                   : "Price: High to Low"
//             }
//             onChange={(val) => {
//               if (val === "Most Popular") setSortBy("popular");
//               if (val === "Price: Low to High") setSortBy("low");
//               if (val === "Price: High to Low") setSortBy("high");
//             }}
//           /> */}
//         </div>

//         <div className="w-full flex flex-col gap-10">
//           <p className="text-overlay-muted text-base">
//             Showing {filteredTrips.length}{" "}
//             {filteredTrips.length === 1 ? "trip" : "trips"}
//           </p>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:grid-cols-3 lg:gap-10 pb-20">
//             {filteredTrips.map((trip) => {
//               return (
//                 <div
//                   key={trip.id}
//                   className="rounded-lg shadow-xl hover:transition-transform hover:-translate-y-1 hover:duration-500 hover:ease-out"
//                 >
//                   <div className="h-44 w-full relative">
//                     <Image
//                       src={trip.img}
//                       alt="Image"
//                       fill
//                       objectFit="cover"
//                       className="rounded-t-xl"
//                     />
//                     <p className="absolute top-5 right-2 bg-surface-lighter rounded-xl font-medium tracking-wide text-xs px-2 hover:bg-foreground text-foreground hover:text-white">
//                       {trip.partner}
//                     </p>
//                   </div>

//                   <div className="p-5 flex flex-col gap-2 ">
//                     <p className="text-lg font-semibold tracking-normal text-foreground">
//                       {trip.name}
//                     </p>
//                     <p className="text-sm text-overlay-muted flex items-center gap-2">
//                       <MdOutlinePlace size={16} />
//                       {trip.location}
//                     </p>

//                     <div className="flex items-center gap-5">
//                       <p className="text-sm text-overlay-muted flex items-center gap-2">
//                         <LuCalendar size={16} />
//                         {trip.duration}
//                       </p>
//                       <p className="text-sm text-overlay-muted flex items-center gap-2">
//                         <GrGroup size={16} />
//                         {trip.groupSize}
//                       </p>
//                       {/* <p className="text-sm flex items-center gap-2">
//                         <TiStarFullOutline
//                           size={17}
//                           className="text-orange-300"
//                         />
//                         {trip.rating}
//                       </p> */}
//                     </div>

//                     <div className="py-2">
//                       <hr className="border-0 border-t border-gray-200" />
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-overlay-muted">
//                           Starting from
//                         </p>
//                         <p className="text-xl md:text-2xl font-semibold tracking-wide text-foreground">
//                           ₹{trip.price}
//                         </p>
//                       </div>

//                       <div className="flex items-center gap-3">
//                         <button className="px-2 py-1 md:px-3 border border-gray-200 text-sm text-foreground rounded-lg hover:bg-blue-400 hover:text-white cursor-pointer">
//                           Compare
//                         </button>
//                         <Link href={`/trip/${slugify(trip.name)}`}>
//                           {" "}
//                           <button className="px-2 py-1 md:px-3 text-white bg-primary-aqua text-sm rounded-lg cursor-pointer">
//                             View
//                           </button>
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

// export default Page;

"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Search,
  MapPin,
  Star,
  Shield,
  Calendar,
  Users,
  X,
  GitCompare,
  SlidersHorizontal,
} from "lucide-react";
import { trips, tripTypes, destinations } from "@/app/data/tripData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

function TripsContent() {
  const searchParams = useSearchParams();

  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("destination") || "",
  );

  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const filteredTrips = useMemo(() => {
    let result = [...trips];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (trip) =>
          trip.name.toLowerCase().includes(query) ||
          trip.destination.toLowerCase().includes(query) ||
          trip.region.toLowerCase().includes(query),
      );
    }

    if (selectedType !== "All Types") {
      result = result.filter((trip) => trip.type === selectedType);
    }

    if (selectedDifficulty !== "All") {
      result = result.filter((trip) => trip.difficulty === selectedDifficulty);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.priceFrom - b.priceFrom);
        break;
      case "price-high":
        result.sort((a, b) => b.priceFrom - a.priceFrom);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "duration":
        result.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, selectedType, selectedDifficulty, sortBy]);

  const toggleCompare = (tripId) => {
    setCompareList((prev) =>
      prev.includes(tripId)
        ? prev.filter((id) => id !== tripId)
        : prev.length < 3
          ? [...prev, tripId]
          : prev,
    );
  };

  const compareTrips = trips.filter((t) => compareList.includes(t.id));

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-foreground mb-3">Trip Type</h4>
        <div className="space-y-2">
          {tripTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors ${
                selectedType === type
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-foreground mb-3">Difficulty</h4>
        <div className="space-y-2">
          {["All", "Easy", "Moderate", "Challenging"].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors ${
                selectedDifficulty === diff
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-foreground mb-3">
          Popular Destinations
        </h4>
        <div className="flex flex-wrap gap-2">
          {destinations.slice(0, 6).map((dest) => (
            <button
              key={dest.name}
              onClick={() => setSearchQuery(dest.name)}
              className="px-3 py-1 rounded-full text-body-sm bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {dest.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section className="relative pt-28 pb-12 bg-linear-to-br from-primary-light via-background to-background">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="font-display text-display text-foreground mb-4">
              Explore Community Trips
            </h1>
            <p className="text-body-lg text-muted-foreground">
              {filteredTrips.length} trips from verified providers
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search destinations, trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 rounded-xl border-border bg-background text-body shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container-premium">
          <div className="flex gap-8">
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 card-premium p-6">
                <h3 className="font-display text-heading-sm text-foreground mb-6">
                  Filters
                </h3>
                <FiltersContent />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FiltersContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {(selectedType !== "All Types" ||
                    selectedDifficulty !== "All") && (
                    <div className="flex items-center gap-2">
                      {selectedType !== "All Types" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-body-sm">
                          {selectedType}
                          <button onClick={() => setSelectedType("All Types")}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedDifficulty !== "All" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-body-sm">
                          {selectedDifficulty}
                          <button onClick={() => setSelectedDifficulty("All")}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {compareList.length > 0 && (
                    <Button
                      onClick={() => setShowCompare(true)}
                      className="btn-secondary"
                    >
                      <GitCompare className="w-4 h-4 mr-2" />
                      Compare ({compareList.length})
                    </Button>
                  )}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-45">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {filteredTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="card-premium overflow-hidden group"
                  >
                    <Link href={`/trip/${slugify(trip.name)}`}>
                      <div className="aspect-16/10 relative overflow-hidden">
                        <img
                          src={trip.image}
                          alt={trip.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {trip.verified && (
                          <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-success/90 text-background text-xs font-medium">
                            <Shield className="w-3 h-3" />
                            Verified
                          </div>
                        )}
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/90 text-foreground text-xs font-medium">
                          {trip.type}
                        </div>
                      </div>
                    </Link>

                    <div className="p-6">
                      <div className="flex items-center gap-2 text-body-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        {trip.destination}, {trip.region}
                      </div>

                      <Link href={`/trip/${slugify(trip.name)}`}>
                        <h3 className="font-display text-heading-sm text-foreground mb-2 group-hover:text-primary transition-colors">
                          {trip.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-4 text-body-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {trip.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {trip.groupSize}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            trip.difficulty === "Easy"
                              ? "bg-success/10 text-success"
                              : trip.difficulty === "Moderate"
                                ? "bg-warning/10 text-warning"
                                : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {trip.difficulty}
                        </span>
                      </div>

                      <p className="text-body-sm text-muted-foreground mb-4">
                        by{" "}
                        <span className="text-foreground font-medium">
                          {trip.provider.name}
                        </span>
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="text-body-sm font-medium">
                            {trip.rating}
                          </span>
                          <span className="text-body-sm text-muted-foreground">
                            ({trip.reviewCount} reviews)
                          </span>
                        </div>
                        <p className="font-display text-heading-sm text-primary">
                          ₹{trip.priceFrom.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`compare-${trip.id}`}
                            checked={compareList.includes(trip.id)}
                            onCheckedChange={() => toggleCompare(trip.id)}
                          />
                          <label
                            htmlFor={`compare-${trip.id}`}
                            className="text-body-sm text-muted-foreground cursor-pointer"
                          >
                            Compare
                          </label>
                        </div>
                        <Link
                          href={`/trip/${slugify(trip.name)}`}
                          className="flex-1"
                        >
                          <Button className="btn-primary w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTrips.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-body-lg text-muted-foreground mb-4">
                    No trips found matching your criteria.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedType("All Types");
                      setSelectedDifficulty("All");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-heading-lg">
              Compare Trips
            </DialogTitle>
          </DialogHeader>
          {compareTrips.length > 0 && (
            <div className="mt-6">
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${compareTrips.length}, 1fr)`,
                }}
              >
                {compareTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="border border-border rounded-xl overflow-hidden"
                  >
                    <img
                      src={trip.image}
                      alt={trip.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-medium text-foreground mb-1">
                        {trip.name}
                      </h4>
                      <p className="text-body-sm text-muted-foreground mb-4">
                        {trip.provider.name}
                      </p>

                      <div className="space-y-3 text-body-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price</span>
                          <span className="font-semibold text-primary">
                            ₹{trip.priceFrom.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Duration
                          </span>
                          <span>{trip.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Group Size
                          </span>
                          <span>{trip.groupSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rating</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-accent text-accent" />
                            {trip.rating}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Difficulty
                          </span>
                          <span>{trip.difficulty}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-body-sm font-medium mb-2">
                          Inclusions:
                        </p>
                        <ul className="text-body-sm text-muted-foreground space-y-1">
                          {trip.inclusions.slice(0, 4).map((inc, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-primary" />
                              {inc}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link
                        href={`/trip/${slugify(trip.name)}`}
                        className="block mt-4"
                      >
                        <Button className="btn-primary w-full">
                          View Trip
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function TripsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading trips...</div>}>
      <TripsContent />
    </Suspense>
  );
}
