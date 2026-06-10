"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { m, LazyMotion, domAnimation, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import { format } from "date-fns";

const DatePicker = dynamic(() => import("react-datepicker"), { ssr: false });
import "react-datepicker/dist/react-datepicker.css";
import { animatedScrollTo } from "@/lib/scroll-utils";
import {
  ArrowRight,
  Search,
  Shield,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Calendar,
  GitCompare,
  CheckCircle2,
  ImageIcon,
  ChevronDown,
  Compass,
} from "lucide-react";
import dynamic from "next/dynamic";
const ComparePortal = dynamic(() => import("@/app/components/website/ComparePortal"), { ssr: false });
import CompareCheckbox from "@/app/components/website/CompareCheckbox";
import { useCompare } from "@/app/hooks/use-compare";
import { Libre_Baskerville } from "next/font/google";
import { MdOutlineVerified } from "react-icons/md";

const baskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const features = [
  {
    icon: Search,
    title: "Discover & Search",
    description:
      "Search trips by destination, dates, and type. Find the perfect group trip from multiple providers.",
  },
  {
    icon: GitCompare,
    title: "Compare Side-by-Side",
    description:
      "Compare trips from different providers. See pricing, inclusions, reviews, and group sizes at a glance.",
  },
  {
    icon: Shield,
    title: "Verified Reviews",
    description:
      "Read authentic reviews from verified travelers. Make informed decisions with real experiences.",
  },
];

const steps = [
  {
    number: "01",
    title: "Search Your Destination",
    description:
      "Enter where you want to go and your travel dates. We search across all verified providers.",
  },
  {
    number: "02",
    title: "Compare & Choose",
    description:
      "Browse trips from multiple providers. Compare prices, inclusions, reviews, and group sizes side-by-side.",
  },
  {
    number: "03",
    title: "Book with Confidence",
    description:
      "Read verified reviews, check provider credentials, and book your perfect group trip.",
  },
];

export default function HomeClient({
  initialLocations,
  initialOperators,
  initialTrips,
  locationMap: serverLocationMap,
  totalTrips: serverTotalTrips,
  totalOperators: serverTotalOperators,
}) {
  const router = useRouter();

  const [searchDestination, setSearchDestination] = useState("");
  const [searchDates, setSearchDates] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchScrollRef = useRef(null);
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);

  useEffect(() => {
    if (!showSuggestions && shouldRestoreScroll && window.innerWidth < 640) {
      const previousScroll = searchScrollRef.current;

      if (typeof previousScroll === "number") {
        setTimeout(() => {
          animatedScrollTo(previousScroll);
          setShouldRestoreScroll(false);
        }, 300);
      }
    }
  }, [showSuggestions, shouldRestoreScroll]);

  const [offlineTrips, setOfflineTrips] = useState(null);
  const [offlineLocations, setOfflineLocations] = useState(null);

  // Load from cache on mount
  useEffect(() => {
    try {
      const cachedTrips = localStorage.getItem("tt_home_trips");
      const cachedLocs = localStorage.getItem("tt_home_locations");
      if (cachedTrips) setOfflineTrips(JSON.parse(cachedTrips));
      if (cachedLocs) setOfflineLocations(JSON.parse(cachedLocs));
    } catch (e) {
      console.error("Home cache load failed", e);
    }
  }, []);

  // Save to cache on success
  useEffect(() => {
    if (initialTrips?.success)
      localStorage.setItem("tt_home_trips", JSON.stringify(initialTrips));
    if (initialLocations?.success)
      localStorage.setItem(
        "tt_home_locations",
        JSON.stringify(initialLocations),
      );
  }, [initialTrips, initialLocations]);

  const processLocations = (groups, lMap) => {
    if (!groups || !groups.length) return [];
    return groups.map((group) => {
      const firstTrip = group.trips?.[0];
      const locationData = (lMap && lMap[firstTrip?.destination_id]) || {};
      return {
        id: firstTrip?.destination_id || group.location_name,
        name: locationData?.name || group.location_name,
        region: locationData?.region || "",
        type: "destination",
        trips: group.total_trips,
        image: firstTrip?.images?.[0] || firstTrip?.image || null,
      };
    });
  };

  const enrichTripsWithDetails = (tripsList, lMap) => {
    if (!tripsList.length) return [];
    return tripsList.map((trip) => {
      const destination = (lMap && lMap[trip.destination_id]) || {
        name: "Unknown",
        region: "",
      };
      const source = (lMap && lMap[trip.source_id]) || {
        name: "Unknown",
        region: "",
      };
      let durationStr = "";
      const daysVal = trip.duration_days || trip.duration;
      if (daysVal) {
        durationStr = String(daysVal).toLowerCase().includes("day")
          ? String(daysVal)
          : `${daysVal} days`;
      } else {
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        if (!isNaN(start) && !isNaN(end)) {
          const computedDays = Math.max(
            1,
            Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
          );
          durationStr = `${computedDays} days`;
        } else {
          const firstBatch = trip.batches?.[0];
          if (firstBatch?.start_date && firstBatch?.end_date) {
            const startBatch = new Date(firstBatch.start_date);
            const endBatch = new Date(firstBatch.end_date);
            if (!isNaN(startBatch) && !isNaN(endBatch)) {
              const computedDays = Math.max(
                1,
                Math.ceil((endBatch - startBatch) / (1000 * 60 * 60 * 24)) + 1,
              );
              durationStr = `${computedDays} days`;
            }
          }
        }
      }
      if (!durationStr) {
        durationStr = "N/A";
      }

      return {
        id: trip.id,
        name: trip.name,
        images: trip.images?.length
          ? trip.images
          : trip.image
            ? [trip.image]
            : [],
        image: trip.images?.[0] || trip.image || null,
        destination: destination.name || "Unknown",
        region: destination.region || "Unknown",
        provider: trip.operator?.name || "Unknown",
        price:
          Number(
            trip.price_categories?.find(
              (c) => c.category?.toLowerCase() === "base price",
            )?.price || trip.price,
          ) || 0,
        priceFrom: Number(
          trip.price_categories?.find(
            (c) => c.category?.toLowerCase() === "base price",
          )?.price || trip.price,
        ),
        duration: durationStr,
        groupSize: `${trip.total_seats} people`,
        difficulty: trip.difficulty
          ? trip.difficulty.charAt(0).toUpperCase() +
            trip.difficulty.slice(1).toLowerCase()
          : "Moderate",
        rating: trip.operator?.rating || 4.5,
        reviewCount: 0,
        verified: true,
        inclusions: trip.inclusions || [],
        exclusions: trip.exclusions || [],
        itinerary: trip.itinerary || [],
        cancellation_policy: trip.cancellation_policy || "",
        destination_full: `${destination.name}${destination.region !== "" ? `, ${destination.region}` : ""}`,
        source_full: `${source.name}${source.region !== "" ? `, ${source.region}` : ""}`,
      };
    });
  };

  const activeLocations = initialLocations?.success
    ? initialLocations
    : offlineLocations;
  const rawLocationsGroups = activeLocations?.result?.groups || [];

  const processedOperators = initialOperators?.success
    ? initialOperators.result?.operators || []
    : [];
  const rawTrips = initialTrips?.success
    ? initialTrips.result?.trips || []
    : [];

  const trips = useMemo(() => {
    const activeTrips = initialTrips?.success ? initialTrips : offlineTrips;
    const rawTrips = activeTrips?.result?.trips || [];
    return enrichTripsWithDetails(rawTrips, serverLocationMap);
  }, [initialTrips, offlineTrips, serverLocationMap]);

  const {
    compareList,
    setCompareList,
    showCompare,
    setShowCompare,
    showInterstitial,
    setShowInterstitial,
    interstitialChoiceMade,
    showLandscapeAlert,
    triggerCompare,
    toggleCompare,
    compareTrips,
  } = useCompare(trips);

  const locations = useMemo(() => {
    return processLocations(rawLocationsGroups, serverLocationMap);
  }, [rawLocationsGroups, serverLocationMap]);

  const filteredLocations = useMemo(() => {
    if (!searchDestination) return locations;
    return locations.filter((loc) =>
      loc.name.toLowerCase().includes(searchDestination.toLowerCase()),
    );
  }, [locations, searchDestination]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchDestination) params.set("location_name", searchDestination);
    if (searchDates) params.set("start_date", searchDates);
    router.push(`/trips?${params.toString()}`);
  };

  const TripCard = ({ trip, isCompared, onToggleCompare }) => {
    const [cardImgError, setCardImgError] = useState(false);
    const [[currentImgIndex, direction], setPage] = useState([0, 0]);
    const [isHovered, setIsHovered] = useState(false);

    const images =
      trip.images?.length > 0 ? trip.images : ["/placeholder-trip.jpg"];

    // Preload all images for this card to prevent gray background flash on slide transition
    useEffect(() => {
      if (typeof window !== "undefined" && images && images.length > 1) {
        images.forEach((src) => {
          const img = new Image();
          img.src = src;
        });
      }
    }, [images]);

    const paginate = (newDirection) => {
      const nextIndex =
        (currentImgIndex + newDirection + images.length) % images.length;
      setPage([nextIndex, newDirection]);
    };

    const handleNext = (e) => {
      e.preventDefault();
      e.stopPropagation();
      paginate(1);
    };

    const handlePrev = (e) => {
      e.preventDefault();
      e.stopPropagation();
      paginate(-1);
    };

    const variants = {
      enter: (direction) => ({
        x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
      }),
      center: {
        zIndex: 1,
        x: 0,
      },
      exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? "100%" : direction > 0 ? "-100%" : 0,
      }),
    };

    return (
      <LazyMotion features={domAnimation}>
        <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="card-premium overflow-hidden group relative"
      >
        <Link prefetch={false} href={`/trip/${trip.id}`} className="block">
          <div className="aspect-14/10 relative overflow-hidden bg-gray-100">
            <AnimatePresence initial={false} custom={direction}>
              <m.img
                key={currentImgIndex}
                src={images[currentImgIndex]}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -50) {
                    handleNext(e);
                  } else if (info.offset.x > 50) {
                    handlePrev(e);
                  }
                }}
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                }}
                className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
                onError={() => setCardImgError(true)}
              />
            </AnimatePresence>

            {/* Navigation Buttons */}
            {images.length > 1 && isHovered && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm hidden md:flex items-center justify-center text-foreground hover:bg-white transition-all shadow-md z-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm hidden md:flex items-center justify-center text-foreground hover:bg-white transition-all shadow-md z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentImgIndex
                        ? "bg-white scale-110"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}

            {trip.verified && (
              <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-success/90 text-background text-xs font-medium z-10">
                <MdOutlineVerified className="w-4 h-4" />
                Verified
              </div>
            )}
          </div>
        </Link>
        <div className="p-5">
          <Link prefetch={false} href={`/trip/${trip.id}`} className="block">
            <div className="flex items-center gap-2 text-body-sm text-muted-foreground mb-2">
              <MapPin className="w-4 h-4" />
              {trip.destination || "Unknown"}
              {trip.duration && (
                <>
                  <span className="text-border">•</span>
                  {trip.duration}
                </>
              )}
            </div>
            <h3
              className="font-display text-heading-sm text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1"
              title={trip.name}
            >
              {trip.name}
            </h3>
            <p className="text-body-sm text-muted-foreground mb-4">
              by {trip.provider || "Unknown"}
            </p>
          </Link>
          <div className="flex items-center justify-between">
            <CompareCheckbox
              tripId={trip.id}
              isCompared={isCompared}
              onToggleCompare={onToggleCompare}
            />

            <p className="font-display text-heading-sm text-primary">
              ₹{Number(trip.price ?? 0).toLocaleString("en-IN")}{" "}
              <span className="text-body-sm text-muted-foreground font-normal">
                onwards
              </span>
            </p>
          </div>
        </div>
      </div>
      </LazyMotion>
    );
  };

  const LocationCard = ({ location }) => {
    const [cardImgError, setCardImgError] = useState(false);

    return (
      <Link
        prefetch={false}
        key={location.name}
        href={`/trips?location_name=${location.name}`}
        // href={`/trips?location_name=${location.name}&location_type=destination&group_by=location`}
        className="group relative aspect-4/3 rounded-2xl overflow-hidden"
      >
        {location.image && !cardImgError ? (
          <img
            src={location.image}
            alt={location.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setCardImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-display text-heading-sm text-background mb-1">
            {location.name}
            {location.region ? `, ${location.region}` : ""}
          </h3>
          <p className="text-body-sm text-background/70">
            {location.trips} trips available
          </p>
        </div>
      </Link>
    );
  };

  return (
    <>
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1920&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-foreground/60 via-foreground/50 to-foreground/70" />

        <div className="container-premium relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-display-sm md:text-display-xl lg:text-heading-2xl md:leading-20 lg:leading-24 text-background mb-6 mt-10 animate-fade-up">
              Find your tribe,
              <span className="block">travel together.</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-background/90 max-w-2xl mx-auto mb-10 animate-fade-up delay-100">
              Explore curated group trips.
              <span className="block md:inline">
                {" "}
                Compare price, duration, and vibe.
              </span>
              <span className="block md:inline">
                {" "}
                Book directly with trusted operators.
              </span>
            </p>

            <form
              onSubmit={handleSearch}
              className="max-w-3xl mx-auto animate-fade-up delay-150"
            >
              <div className="bg-background/95 backdrop-blur-lg rounded-2xl p-3 shadow-2xl relative z-[1000]">
                <div className="flex flex-col md:flex-row gap-1">
                  <div className="flex-1 relative z-[999]">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Where do you want to go?"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      onFocus={(e) => {
                        setShowSuggestions(true);
                        setShouldRestoreScroll(false);

                        if (window.innerWidth < 640) {
                          searchScrollRef.current = window.scrollY;
                          setTimeout(() => {
                            const rect = e.target.getBoundingClientRect();
                            const targetY = window.scrollY + rect.top - 120;
                            animatedScrollTo(Math.max(0, targetY));
                          }, 300);
                        }
                      }}
                      onBlur={() => {
                        setShouldRestoreScroll(true);
                        setShowSuggestions(false);
                      }} // onBlur={() => setShowSuggestions(false)}
                      className="pl-10 h-14 rounded-xl border-border bg-muted/50 text-body text-foreground"
                    />
                    {showSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden max-h-[350px] z-[1000] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-white border-b border-gray-100">
                          <button
                            type="button"
                            onMouseDown={() => {
                              setShouldRestoreScroll(false);
                              setShowSuggestions(false);
                              router.push("/trips");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-1.5 cursor-pointer hover:bg-gray-50 transition-all text-left group"
                          >
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                              <Compass className="text-emerald-600" size={16} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[15px] font-medium text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                                Take me anywhere
                              </p>
                            </div>
                          </button>
                        </div>

                        <div className="max-h-52 lg:max-h-32 overflow-y-auto bg-white">
                          {filteredLocations.length > 0 ? (
                            filteredLocations.map((loc) => (
                              <button
                                key={loc.id}
                                type="button"
                                onMouseDown={() => {
                                  setSearchDestination(loc.name);
                                  setShowSuggestions(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-1.5 cursor-pointer hover:bg-gray-50 transition-all text-left border-b border-gray-50 last:border-b-0 group"
                              >
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                  <MapPin
                                    className="text-emerald-600"
                                    size={16}
                                  />
                                </div>
                                <div
                                  className="min-w-0"
                                  onMouseDown={() => {
                                    setSearchDestination(loc.name);
                                    setShouldRestoreScroll(false);
                                    setShowSuggestions(false);
                                  }}
                                >
                                  <p
                                    className="text-[15px] font-medium text-gray-900 group-hover:text-emerald-700 transition-colors truncate"
                                    title={loc.name}
                                  >
                                    {loc.name}
                                  </p>
                                  {loc.region ? (
                                    <p className="text-sm text-gray-500 truncate">
                                      {loc.region}
                                    </p>
                                  ) : null}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center bg-white">
                              <p className="text-sm text-gray-500">
                                No destinations found
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                    <DatePicker
                      className="z-50"
                      selected={searchDates ? new Date(searchDates) : null}
                      onChange={(date) =>
                        setSearchDates(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      minDate={new Date()}
                      placeholderText="When? (optional)"
                      dateFormat="MMM d, yyyy"
                      wrapperClassName="w-full"
                      customInput={
                        <Input
                          readOnly
                          inputMode="none"
                          className="pl-10 h-14 rounded-xl border-border bg-muted/50 text-body text-foreground w-full"
                          onFocus={(e) => {
                            if (window.innerWidth < 640) {
                              searchScrollRef.current = window.scrollY;
                              setTimeout(() => {
                                const rect = e.target.getBoundingClientRect();
                                const targetY = window.scrollY + rect.top - 120;
                                animatedScrollTo(Math.max(0, targetY));
                              }, 300);
                            }
                          }}
                        />
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    className="btn-primary h-12 px-4 text-body"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </form>

            <div
              className={`flex flex-wrap items-center gap-5 md:gap-6 justify-center mt-8 animate-fade-up delay-200 transition-opacity duration-200 relative -z-10 ${showSuggestions ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              <div className="flex items-center gap-2 text-body-sm text-background/80">
                <CheckCircle2 className="w-5 h-5 text-success" /> Verified
                Providers
              </div>
              <div className="flex items-center gap-2 text-body-sm text-background/80">
                <CheckCircle2 className="w-5 h-5 text-success" /> Authentic
                Reviews
              </div>
              <div className="flex items-center gap-2 text-body-sm text-background/80">
                <CheckCircle2 className="w-5 h-5 text-success" /> Easy
                Comparison
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const nextSection = document.getElementById("next-section");
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-background/60 hover:text-background transition-all duration-300 animate-bounce group cursor-pointer z-20"
          aria-label="Scroll to content"
        >
          <div className="flex flex-col items-center gap-2" id="next-section">
            <span className="text-xs font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
              Discover More
            </span>
            <ChevronDown className="w-8 h-8 stroke-[1.5]" />
          </div>
        </button>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container-premium">
          <div className="grid grid-cols-2 justify-center items-center md:px-40">
            <div className="flex flex-col items-center justify-center text-center">
              <p
                className={`text-display text-primary ${baskerville.className}`}
              >
                {serverTotalTrips}+
              </p>
              <p className="text-body-sm text-muted-foreground">
                Curated Trips
              </p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <p
                className={`text-display text-primary ${baskerville.className}`}
              >
                {serverTotalOperators}+
              </p>
              <p className="text-body-sm text-muted-foreground">
                Verified Providers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-muted/30">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-display text-heading-lg md:text-display text-primary mb-4">
              Why TripTribe?
            </p>
            <h2 className="font-display text-heading-lg md:text-display text-foreground mb-6">
              One Platform to Compare and Choose{" "}
              <span className="text-gradient">Group Trips</span>
            </h2>
            <p className="text-body-lg text-muted-foreground">
              We curate group trips from verified providers and enable clear
              comparisons, so you can choose the right trip with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card-premium p-8 text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:bg-primary group-hover:shadow-glow">
                  <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-display text-heading-sm text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-body text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-background">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-body-sm font-medium text-primary uppercase tracking-wider mb-4">
              How It Works
            </p>
            <h2 className="font-display text-display md:text-display-lg text-foreground mb-6">
              Find Your Trip in <span className="text-gradient">3 Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-primary to-primary/30" />
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="card-premium p-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-display text-heading-sm mb-6">
                    {step.number}
                  </div>
                  <h3 className="font-display text-heading-sm text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-body text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trips */}
      <section className="section bg-muted/30">
        <div className="container-premium">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-body-sm font-medium text-primary uppercase tracking-wider mb-4">
                Featured Trips
              </p>
              <h2 className="font-display text-display text-foreground">
                Popular Group Trips
              </h2>
            </div>
            <Link prefetch={false} href="/trips">
              <Button className="btn-secondary">
                View All Trips
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>

          {trips.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.slice(0, 9).map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isCompared={compareList.includes(trip.id)}
                  onToggleCompare={() => toggleCompare(trip.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Destinations */}
      <section className="section bg-background">
        <div className="container-premium">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-body font-medium text-primary uppercase tracking-wider mb-4">
                Popular Destinations
              </p>
              <h2 className="font-display text-display text-foreground">
                Explore Incredible India
              </h2>
            </div>
            <Link prefetch={false} href="/trips">
              <Button className="btn-secondary">
                View All Destinations
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>

          {locations.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.slice(0, 9).map((location) => (
                <LocationCard key={location.name} location={location} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Providers Section */}
      <section className="section bg-background">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-body-sm font-medium text-primary uppercase tracking-wider mb-4">
              Verified Providers
            </p>
            <h2 className="font-display text-heading-lg text-foreground mb-4">
              Trusted Trip Organizers
            </h2>
            <p className="text-body text-muted-foreground">
              All providers on TripTribe are verified for safety, quality, and
              reliability.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
            {processedOperators.slice(0, 9).map((provider) => (
              <div
                key={provider.id}
                className="flex items-center gap-3 px-5 py-1 rounded-full bg-muted/50 hover:bg-gray-100"
              >
                {provider?.logo_url ? (
                  <img
                    src={provider.logo_url}
                    alt="Logo"
                    className="h-20 w-20 object-cover rounded-full"
                  />
                ) : (
                  <Shield className="w-5 h-5 text-success" />
                )}
                <span className="font-medium text-foreground">
                  {provider.name}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link prefetch={false} href="/partners">
              <Button className="btn-secondary">
                Become a Partner
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section bg-linear-to-br from-primary-light via-background to-background">
        <div className="container-premium text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-display md:text-display-lg text-foreground mb-6">
              Ready to Find Your Tribe?
            </h2>
            <p className="text-body-lg text-muted-foreground mb-8">
              Join thousands of travelers discovering amazing group trips.
              Search, compare, and book with confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link prefetch={false} href="/trips">
                <Button className="btn-primary text-body px-8 py-6">
                  Explore Trips
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ComparePortal
        compareList={compareList}
        triggerCompare={triggerCompare}
        showCompare={showCompare}
        setShowCompare={setShowCompare}
        compareTrips={compareTrips}
        setCompareList={setCompareList}
        showInterstitial={showInterstitial}
        setShowInterstitial={setShowInterstitial}
        interstitialChoiceMade={interstitialChoiceMade}
        showLandscapeAlert={showLandscapeAlert}
      />
    </>
  );
}
