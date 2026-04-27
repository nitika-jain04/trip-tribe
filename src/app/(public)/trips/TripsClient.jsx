"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/app/hooks/use-fetcher";
import { Button } from "@/app/components/ui/button";
import {
  Search,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Users,
  X,
  GitCompare,
  SlidersHorizontal,
} from "lucide-react";
import Input from "@/app/components/ui/input";
import { animatedScrollTo } from "@/lib/utils";
import { Slider } from "@/app/components/ui/slider";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
import { TripCardSkeleton } from "@/app/components/website/Skeletons";
import { MdOutlineVerified } from "react-icons/md";
import { useCompare } from "@/app/hooks/use-compare";
import ComparePortal from "@/app/components/website/ComparePortal";
import CompareCheckbox from "@/app/components/website/CompareCheckbox";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const FiltersContent = ({
  selectedType,
  setSelectedType,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedOperator,
  setSelectedOperator,
  operators,
  setIsSheetOpen,
  tripTypesData,
  setCurrentPage,
  priceRange,
  setPriceRange,
  appliedPriceRange,
  setAppliedPriceRange,
  scrollToFilters,
}) => {
  const p0 = priceRange[0] === "" ? "" : Number(priceRange[0]);
  const p1 = priceRange[1] === "" ? "" : Number(priceRange[1]);

  const isApplyDisabled =
    p0 === "" ||
    p1 === "" ||
    (p0 === appliedPriceRange[0] && p1 === appliedPriceRange[1]) ||
    p0 < 0 ||
    p1 < 0 ||
    p1 < p0;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-foreground mb-3">Trip Type</h4>
        <div className="space-y-1">
          {tripTypesData.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type);
                setCurrentPage(1);
                setIsSheetOpen?.(false);
                scrollToFilters?.();
              }}
              className={`relative block w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors duration-300 ${
                selectedType.id === type.id
                  ? "text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {selectedType.id === type.id && (
                <motion.div
                  layoutId="activeType"
                  className="absolute inset-0 bg-primary rounded-lg z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-foreground mb-3">
          Select Price Range
        </h4>
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative mt-2">
              <span className="absolute -top-2 left-3 bg-background px-1 text-[10px] text-muted-foreground z-10">
                Min. Amount
              </span>
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => {
                  const val = e.target.value;
                  setPriceRange([val === "" ? "" : Number(val), priceRange[1]]);
                }}
                className="w-full h-12 rounded-lg border-muted-foreground/30 bg-transparent px-3 text-body-md"
              />
            </div>
            <div className="flex-1 relative mt-2">
              <span className="absolute -top-2 left-3 bg-background px-1 text-[10px] text-muted-foreground z-10">
                Max. Amount
              </span>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => {
                  const val = e.target.value;
                  setPriceRange([priceRange[0], val === "" ? "" : Number(val)]);
                }}
                className="w-full h-12 rounded-lg border-muted-foreground/30 bg-transparent px-3 text-body-md"
              />
            </div>
          </div>
          <div className="px-2 pt-2 pb-1">
            <Slider
              max={100000}
              step={100}
              value={[p0 || 0, p1 || 0]}
              onValueChange={setPriceRange}
              className="w-full"
            />
          </div>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setAppliedPriceRange([p0 || 0, p1 || 0]);
              setCurrentPage(1);
              setIsSheetOpen?.(false);
              scrollToFilters?.();
            }}
            disabled={isApplyDisabled}
            className="w-full mt-4 btn-primary"
          >
            Apply
          </Button>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-foreground mb-3">Difficulty</h4>
        <div className="space-y-1">
          {["All", "Easy", "Moderate", "Hard"].map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                setCurrentPage(1);
                setIsSheetOpen?.(false);
                scrollToFilters?.();
              }}
              className={`relative block w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors duration-300 ${
                selectedDifficulty === diff
                  ? "text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {selectedDifficulty === diff && (
                <motion.div
                  layoutId="activeDifficulty"
                  className="absolute inset-0 bg-primary rounded-lg z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{diff}</span>
            </button>
          ))}
        </div>
      </div>

      {operators?.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-3">Operator</h4>
          <div className="space-y-1">
            <button
              onClick={() => {
                setSelectedOperator("All");
                setCurrentPage(1);
                setIsSheetOpen?.(false);
                scrollToFilters?.();
              }}
              className={`relative block w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors duration-300 ${
                selectedOperator === "All"
                  ? "text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {selectedOperator === "All" && (
                <motion.div
                  layoutId="activeOperator"
                  className="absolute inset-0 bg-primary rounded-lg z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">All Operators</span>
            </button>
            {operators.map((op) => (
              <button
                key={op.id}
                onClick={() => {
                  setSelectedOperator(op.id);
                  setCurrentPage(1);
                  setIsSheetOpen?.(false);
                  scrollToFilters?.();
                }}
                className={`relative block w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors duration-300 ${
                  selectedOperator === op.id
                    ? "text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {selectedOperator === op.id && (
                  <motion.div
                    layoutId="activeOperator"
                    className="absolute inset-0 bg-primary rounded-lg z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{op.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PublicTripCard = ({ trip, isCompared, onToggleCompare }) => {
  const [imgError, setImgError] = useState(false);
  const [[currentImgIndex, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  const images =
    trip.images?.length > 0 ? trip.images : ["/placeholder-trip.jpg"];

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
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="card-premium overflow-hidden group h-full relative"
    >
      <Link href={`/trip/${trip.id}`} prefetch={false} className="block">
        <div className="aspect-14/10 relative overflow-hidden bg-muted">
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
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
              onError={() => setImgError(true)}
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
              <MdOutlineVerified className="w-4 h-4" /> Verified
            </div>
          )}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/90 text-foreground text-xs font-medium z-10">
            {trip.type}
          </div>
        </div>
      </Link>

      <div className="p-6 flex flex-col h-[calc(100%-aspect-14/10)]">
        <Link href={`/trip/${trip.id}`} prefetch={false} className="block">
          <div className="flex items-center gap-2 text-body-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            {trip.destination_name}
            {trip.destination_region && `, ${trip.destination_region}`}
          </div>

          <h3
            className="font-display text-heading-sm text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1 truncate"
            title={trip.name}
          >
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
            className={`px-2 py-0.5 rounded-sm text-xs ${
              trip.difficulty === "Easy"
                ? "bg-success/10 text-success"
                : trip.difficulty === "Moderate"
                  ? "bg-warning/10 text-warning"
                  : "bg-error/10 text-error"
            }`}
          >
            {trip.difficulty}
          </span>
        </div>

        <p className="text-body-sm text-muted-foreground mb-4">
          by{" "}
          <span className="text-foreground font-medium">{trip.provider}</span>
        </p>

        <div className="mt-auto">
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="font-display text-heading-sm text-primary">
              ₹{Number(trip.priceFrom).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <CompareCheckbox
              tripId={trip.id}
              isCompared={isCompared}
              onToggleCompare={onToggleCompare}
            />

            <Link href={`/trip/${trip.id}`} className="flex-1" prefetch={false}>
              <Button className="btn-primary w-full">View Details</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TripsClient({
  initialTrips,
  locationMap,
  tripTypesData,
  operatorsData,
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || searchParams.get("location_name") || "",
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const searchScrollRef = useRef(null);

  const [sortBy, setSortBy] = useState("recommended");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState(tripTypesData[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedOperator, setSelectedOperator] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 100000]);
  const operators = operatorsData || [];
  const [offlineData, setOfflineData] = useState(null);

  // Load from cache on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem("tt_trips_cache");
      if (cached) setOfflineData(JSON.parse(cached));
    } catch (e) {
      console.error("Cache load failed", e);
    }
  }, []);

  const locationName = searchParams.get("location_name") || "";

  const tripsContainerRef = useRef(null);

  const scrollToFilters = () => {
    requestAnimationFrame(() => {
      const el = document.getElementById("filters");
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (debouncedSearchQuery.trim().length >= 2) {
      params.set("search", debouncedSearchQuery.trim());
      params.delete("location_name");
      params.delete("location_type");
      params.delete("group_by");
    } else {
      params.delete("search");
      params.delete("location_name");
      params.delete("location_type");
      params.delete("group_by");
    }

    const nextUrl = params.toString()
      ? `/trips?${params.toString()}`
      : "/trips";
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl !== nextUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [debouncedSearchQuery, router]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const params = new URLSearchParams();
  if (debouncedSearchQuery.trim().length >= 2) {
    params.set("search", debouncedSearchQuery.trim());
  }

  if (selectedType.id !== "all") {
    params.set("type_id", selectedType.id);
  }

  if (selectedDifficulty !== "All") {
    params.set("difficulty", selectedDifficulty.toUpperCase());
  }

  if (selectedOperator !== "All") {
    params.set("operator_id", selectedOperator);
  }

  let apiSortBy = "updated_at";
  let apiOrder = "DESC";

  if (sortBy === "price-low") {
    apiSortBy = "price";
    apiOrder = "ASC";
  } else if (sortBy === "price-high") {
    apiSortBy = "price";
    apiOrder = "DESC";
  } else if (sortBy === "duration") {
    apiSortBy = "updated_at";
    apiOrder = "DESC";
  } else if (sortBy === "start-date") {
    apiSortBy = "start_date";
    apiOrder = "ASC";
  }

  const tripsUrl = `${BASE_URL}/api/${API_VERSION}/trips?sortBy=${apiSortBy}&order=${apiOrder}&${params.toString()}`;

  // Capture the initial (unfiltered) URL once so we can match against it.
  const initialUrlRef = useRef(tripsUrl);

  const { data: swrData, isLoading: swrLoading } = useSWR(tripsUrl, fetcher, {
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  // Use server-rendered data only for the initial unfiltered URL
  const tripsData =
    swrData || (tripsUrl === initialUrlRef.current ? initialTrips : undefined);
  const loadingTrips = swrLoading && !tripsData;

  // Pagination is now calculated after filteredTrips

  // Save to cache on success
  useEffect(() => {
    if (tripsData?.success && tripsData?.result?.trips?.length > 0) {
      try {
        localStorage.setItem("tt_trips_cache", JSON.stringify(tripsData));
      } catch (e) {
        console.error("Cache save failed", e);
      }
    }
  }, [tripsData]);

  const trips = useMemo(() => {
    const activeData = tripsData || offlineData;
    let rawTrips = activeData?.result?.trips || [];
    if (activeData?.result?.groups) {
      rawTrips = activeData.result.groups.flatMap((g) => g.trips);
    }

    return rawTrips.map((trip) => {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      let durationDays = 0;
      if (!isNaN(start) && !isNaN(end)) {
        durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }

      const destination = (locationMap && locationMap[trip.destination_id]) || {
        name: "Unknown",
        region: "",
      };

      const source = (locationMap && locationMap[trip.source_id]) || {
        name: "Unknown",
        region: "",
      };

      return {
        id: trip.id,
        name: trip.name,
        images: trip.images || (trip.image ? [trip.image] : []),
        image: trip.images?.[0] || trip.image || null,
        destination_name: destination.name,
        destination_region: destination.region,
        source_name: source.name,
        source_region: source.region,
        provider: trip.operator?.name || "Unknown",
        priceFrom: Number(
          trip.price_categories?.find(
            (c) => c.category?.toLowerCase() === "base price",
          )?.price || trip.price,
        ),
        startDate: trip.start_date,
        endDate: trip.end_date,
        duration: `${durationDays} days`,
        groupSize: `${trip.total_seats} people`,
        difficulty: trip.difficulty
          ? trip.difficulty.charAt(0).toUpperCase() +
            trip.difficulty.slice(1).toLowerCase()
          : "Moderate",
        rating: 4.5,
        reviewCount: 0,
        verified: true,
        inclusions: trip.inclusions || [],
        exclusions: trip.exclusions || [],
        itinerary: trip.itinerary || [],
        type: trip.type?.name || "Other",
        description: trip.description || "",
        priceCategories: trip.price_categories || [],
        hotelCategory: trip.hotel_category || 0,
        destination_full: `${destination.name}${destination.region !== "" ? `, ${destination.region}` : ""}`,
        source_full: `${source.name}${source.region !== "" ? `, ${source.region}` : ""}`,
        cancellation_policy: trip.cancellation_policy || "",
      };
    });
  }, [tripsData, locationMap]);

  const {
    compareList,
    setCompareList,
    showCompare,
    setShowCompare,
    showInterstitial,
    setShowInterstitial,
    interstitialChoiceMade,
    setInterstitialChoiceMade,
    showLandscapeAlert,
    triggerCompare,
    toggleCompare,
    compareTrips,
  } = useCompare(trips);

  const filteredTrips = useMemo(() => {
    let result = trips.filter(
      (trip) =>
        trip.priceFrom >= appliedPriceRange[0] &&
        trip.priceFrom <= appliedPriceRange[1],
    );

    if (sortBy === "price-low") {
      result.sort((a, b) => a.priceFrom - b.priceFrom);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.priceFrom - a.priceFrom);
    } else if (sortBy === "duration") {
      result.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    } else if (sortBy === "start-date") {
      result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }
    return result;
  }, [trips, sortBy, appliedPriceRange]);

  const pagination = useMemo(() => {
    const limit = 10;
    const total = filteredTrips.length;
    const pages = Math.ceil(total / limit) || 1;
    return {
      page: currentPage,
      limit,
      total,
      pages,
    };
  }, [filteredTrips.length, currentPage]);

  const paginatedTrips = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return filteredTrips.slice(startIndex, startIndex + 10);
  }, [filteredTrips, currentPage]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleClearSearch = (e) => {
    e?.preventDefault();
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setPriceRange([0, 100000]);
    setAppliedPriceRange([0, 100000]);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("location_name");
    params.delete("location_type");
    params.delete("group_by");

    router.replace(
      params.toString() ? `/trips?${params.toString()}` : "/trips",
      { scroll: false },
    );

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  };

  return (
    <>
      <section
        className="relative pt-28 pb-12 bg-linear-to-br from-primary-light via-background to-background"
        id="trips"
      >
        <div className="container-premium">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="font-display text-display text-foreground mb-4">
              {locationName || debouncedSearchQuery
                ? `Trips in ${locationName || debouncedSearchQuery}`
                : "Explore Community Trips"}
            </h1>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search destinations, trips..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={(e) => {
                  if (window.innerWidth < 640) {
                    searchScrollRef.current = window.scrollY;
                    setTimeout(() => {
                      const rect = e.target.getBoundingClientRect();
                      const targetY = window.scrollY + rect.top - 80;
                      animatedScrollTo(Math.max(0, targetY));
                    }, 300);
                  }
                }}
                className="pl-12 pr-4 h-14 rounded-xl border-border bg-background shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className="section bg-background scroll-mt-28"
        id="filters"
        ref={tripsContainerRef}
      >
        <div className="container-premium">
          <div className="flex gap-8">
            <div className="hidden lg:block w-64 shrink-0">
              {/* <div className="sticky top-24 card-premium p-6 max-h-[calc(200vh-8rem)] overflow-y-auto scrollbar-hide"> */}
              <div className="card-premium p-6 max-h-[calc(200vh-8rem)] overflow-y-auto">
                <h3 className="font-display text-heading-sm text-foreground mb-6">
                  Filters
                </h3>
                <FiltersContent
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedDifficulty={selectedDifficulty}
                  setSelectedDifficulty={setSelectedDifficulty}
                  selectedOperator={selectedOperator}
                  setSelectedOperator={setSelectedOperator}
                  operators={operators}
                  tripTypesData={tripTypesData}
                  setCurrentPage={setCurrentPage}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  appliedPriceRange={appliedPriceRange}
                  setAppliedPriceRange={setAppliedPriceRange}
                  scrollToFilters={scrollToFilters}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="overflow-y-auto pr-6">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FiltersContent
                          selectedType={selectedType}
                          setSelectedType={setSelectedType}
                          selectedDifficulty={selectedDifficulty}
                          setSelectedDifficulty={setSelectedDifficulty}
                          selectedOperator={selectedOperator}
                          setSelectedOperator={setSelectedOperator}
                          operators={operators}
                          setIsSheetOpen={setIsSheetOpen}
                          tripTypesData={tripTypesData}
                          setCurrentPage={setCurrentPage}
                          priceRange={priceRange}
                          setPriceRange={setPriceRange}
                          appliedPriceRange={appliedPriceRange}
                          setAppliedPriceRange={setAppliedPriceRange}
                          scrollToFilters={scrollToFilters}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="flex items-center gap-3">
                  {compareList.length > 1 && (
                    <Button onClick={triggerCompare} className="btn-secondary">
                      <GitCompare className="w-4 h-4 mr-2" />
                      Compare ({compareList.length})
                    </Button>
                  )}

                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value);
                      setCurrentPage(1);
                      scrollToFilters();
                    }}
                  >
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
                      {/* <SelectItem value="duration">Duration</SelectItem> */}
                      <SelectItem value="start-date">Start Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!loadingTrips && pagination.total > 0 && (
                <div className="mt-6 mb-2">
                  <p className="text-body-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(
                        (pagination.page - 1) * pagination.limit + 1,
                        pagination.total,
                      )}
                    </span>
                    -
                    <span className="font-medium text-foreground">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {pagination.total}
                    </span>{" "}
                    trips
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mt-5">
                {/* <AnimatePresence initial={false}> */}
                {!loadingTrips && paginatedTrips.length > 0 ? (
                  paginatedTrips.map((trip) => (
                    <PublicTripCard
                      key={trip.id}
                      trip={trip}
                      isCompared={compareList.includes(trip.id)}
                      onToggleCompare={() => toggleCompare(trip.id)}
                    />
                  ))
                ) : !loadingTrips ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full"
                  >
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 px-6 py-14 text-center">
                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm border border-border">
                        <Search className="h-7 w-7 text-muted-foreground" />
                      </div>

                      <h3 className="font-display text-heading-md text-foreground mb-2">
                        No trips found
                      </h3>

                      <p className="max-w-md text-body-sm text-muted-foreground mb-6">
                        We couldn’t find any trips matching your current search
                        or filters. Try changing your keywords or clearing
                        filters to explore more trips.
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {(searchQuery || locationName) && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              handleClearSearch();
                              requestAnimationFrame(() => {
                                tripsContainerRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              });
                            }}
                          >
                            {searchQuery
                              ? "Clear Search"
                              : "Clear Location Filter"}
                          </Button>
                        )}

                        {(selectedType.id !== "all" ||
                          selectedDifficulty !== "All") && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedType(tripTypesData[0]);
                              setSelectedDifficulty("All");
                              setPriceRange([0, 100000]);
                              setCurrentPage(1);
                              requestAnimationFrame(() => {
                                tripsContainerRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              });
                            }}
                          >
                            Reset Filters
                          </Button>
                        )}

                        <Button
                          className="btn-primary"
                          onClick={() => {
                            handleClearSearch();
                            setSelectedType(tripTypesData[0]);
                            setSelectedDifficulty("All");
                            setPriceRange([0, 100000]);
                            setCurrentPage(1);
                            requestAnimationFrame(() => {
                              tripsContainerRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            });
                          }}
                        >
                          Explore All Trips
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
                {/* </AnimatePresence> */}
              </div>

              {loadingTrips && (
                <div className="grid md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TripCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {!loadingTrips && pagination.pages > 1 && (
                <Pagination className="mt-10">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#trips"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                            scrollToFilters();
                          }
                        }}
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from({
                      length: Math.min(5, pagination.pages),
                    }).map((_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else {
                        const start = Math.max(
                          1,
                          Math.min(currentPage - 2, pagination.pages - 4),
                        );
                        pageNum = start + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#trips"
                            isActive={currentPage === pageNum}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNum);
                              scrollToFilters();
                            }}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#trips"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < pagination.pages) {
                            setCurrentPage(currentPage + 1);
                            scrollToFilters();
                          }
                        }}
                        className={
                          currentPage >= pagination.pages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
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
        setInterstitialChoiceMade={setInterstitialChoiceMade}
        showLandscapeAlert={showLandscapeAlert}
      />
    </>
  );
}
