"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/app/hooks/use-fetcher";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Search,
  MapPin,
  Shield,
  Calendar,
  Users,
  X,
  GitCompare,
  SlidersHorizontal,
  ImageIcon,
  Star,
  RotateCcw,
} from "lucide-react";
import Input from "@/app/components/ui/input";
import { animatedScrollTo } from "@/lib/utils";
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
  DialogClose,
} from "@/app/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
import { TripCardSkeleton } from "@/app/components/website/Skeletons";
import { Rating } from "@/app/components/ui/rating";
import { MdOutlineVerified } from "react-icons/md";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const FiltersContent = ({
  selectedType,
  setSelectedType,
  selectedDifficulty,
  setSelectedDifficulty,
  setIsSheetOpen,
  tripTypesData,
  setCurrentPage,
}) => (
  <div className="space-y-6">
    <div>
      <h4 className="font-medium text-foreground mb-3">Trip Type</h4>
      <div className="space-y-1">
        {tripTypesData.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setSelectedType(type);
              setCurrentPage(1);
              setIsSheetOpen?.(false);

              const el = document.getElementById("filters");
              if (el) {
                el.scrollIntoView({ behavior: "auto", block: "start" });
              }
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
      <h4 className="font-medium text-foreground mb-3">Difficulty</h4>
      <div className="space-y-1">
        {["All", "Easy", "Moderate", "Hard"].map((diff) => (
          <button
            key={diff}
            onClick={() => {
              setSelectedDifficulty(diff);
              setCurrentPage(1);
              setIsSheetOpen?.(false);

              const el = document.getElementById("filters");
              if (el) {
                el.scrollIntoView({ behavior: "auto", block: "start" });
              }
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
  </div>
);

const PublicTripCard = ({ trip, isCompared, onToggleCompare }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="card-premium overflow-hidden group h-full">
      <Link href={`/trip/${trip.id}`} prefetch={false}>
        <div className="aspect-14/10 relative overflow-hidden bg-muted">
          {trip.image && !imgError ? (
            <img
              src={trip.image}
              alt={trip.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
            </div>
          )}
          {trip.verified && (
            <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-success/90 text-background text-xs font-medium">
              {/* <Shield className="w-3 h-3" /> */}
              <MdOutlineVerified className="w-4 h-4" /> Verified
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
          {trip.destination_name}
          {trip.destination_region !== "Unknown" &&
            `, ${trip.destination_region}`}
        </div>

        <Link href={`/trip/${trip.id}`} prefetch={false}>
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

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="font-display text-heading-sm text-primary">
            ₹{Number(trip.priceFrom).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`compare-${trip.id}`}
              checked={isCompared}
              onCheckedChange={onToggleCompare}
            />
            <label
              htmlFor={`compare-${trip.id}`}
              className="text-body-sm text-muted-foreground cursor-pointer"
            >
              Compare
            </label>
          </div>

          <Link href={`/trip/${trip.id}`} className="flex-1" prefetch={false}>
            <Button className="btn-primary w-full">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function TripsClient({
  initialTrips,
  locationMap,
  tripTypesData,
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || searchParams.get("location_name") || "",
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const searchScrollRef = useRef(null);

  const [sortBy, setSortBy] = useState("recommended");
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialChoiceMade, setInterstitialChoiceMade] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState(tripTypesData[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showLandscapeAlert, setShowLandscapeAlert] = useState(false);

  const triggerCompare = useCallback(() => {
    if (window.innerWidth < 768) {
      setShowLandscapeAlert(true);
      setTimeout(() => {
        setShowLandscapeAlert(false);
        setShowCompare(true);
      }, 5000);
    } else {
      setShowCompare(true);
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
  params.set("page", currentPage.toString());
  params.set("limit", "10");

  if (selectedType.id !== "all") {
    params.set("type_id", selectedType.id);
  }

  if (selectedDifficulty !== "All") {
    params.set("difficulty", selectedDifficulty.toUpperCase());
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

  const { data: tripsData, isLoading: loadingTrips } = useSWR(
    tripsUrl,
    fetcher,
    {
      fallbackData: initialTrips,
      revalidateOnFocus: true,
      revalidateIfStale: true,
      revalidateOnMount: false,
      keepPreviousData: true,
    },
  );

  const pagination = useMemo(() => {
    const rawPagination = tripsData?.result?.pagination;
    const total = rawPagination?.total ?? 0;
    const limit = 10;
    const pages = (rawPagination?.pages ?? Math.ceil(total / limit)) || 1;
    return {
      page: currentPage,
      limit,
      total,
      pages,
    };
  }, [tripsData, currentPage]);

  const trips = useMemo(() => {
    let rawTrips = tripsData?.result?.trips || [];
    if (tripsData?.result?.groups) {
      rawTrips = tripsData.result.groups.flatMap((g) => g.trips);
    }

    return rawTrips.map((trip) => {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const destination = locationMap[trip.destination_id] || {
        name: "Unknown",
        region: "",
      };

      const source = locationMap[trip.source_id] || {
        name: "Unknown",
        region: "",
      };

      return {
        id: trip.id,
        name: trip.name,
        image: trip.images ? trip.images[0] : null,
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
        difficulty:
          trip.difficulty?.charAt(0) +
            trip.difficulty?.slice(1).toLowerCase() || "Moderate",
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

  const filteredTrips = useMemo(() => {
    let result = [...trips];
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
  }, [trips, sortBy]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
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

  const toggleCompare = useCallback((tripId) => {
    setCompareList((prev) => {
      const isAdding = !prev.includes(tripId);
      if (isAdding && prev.length < 3) {
        if (prev.length + 1 === 3) {
          triggerCompare();
        } else if (prev.length + 1 === 2) {
          setInterstitialChoiceMade(false);
          setShowInterstitial(true);
        }
      }
      return isAdding
        ? prev.length < 3
          ? [...prev, tripId]
          : prev
        : prev.filter((id) => id !== tripId);
    });
  }, []);

  const compareTrips = useMemo(
    () => trips.filter((t) => compareList.includes(t.id)),
    [trips, compareList],
  );

  return (
    <>
      <section
        className="relative pt-28 pb-12 bg-linear-to-br from-primary-light via-background to-background"
        id="trips"
      >
        <div className="container-premium">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="font-display text-display text-foreground mb-4">
              {locationName
                ? `Trips in ${locationName}`
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
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className="section bg-background"
        id="filters"
        ref={tripsContainerRef}
      >
        <div className="container-premium">
          <div className="flex gap-8">
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 card-premium p-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
                <h3 className="font-display text-heading-sm text-foreground mb-6">
                  Filters
                </h3>
                <FiltersContent
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedDifficulty={selectedDifficulty}
                  setSelectedDifficulty={setSelectedDifficulty}
                  tripTypesData={tripTypesData}
                  setCurrentPage={setCurrentPage}
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
                          setIsSheetOpen={setIsSheetOpen}
                          tripTypesData={tripTypesData}
                          setCurrentPage={setCurrentPage}
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
                {!loadingTrips && filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
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

      <Dialog
        open={showCompare}
        onOpenChange={(open) => {
          setShowCompare(open);
          if (!open) setCompareList([]);
        }}
      >
        <DialogContent className="max-w-6xl w-[calc(95%-2rem)] max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-lg">
          <div className="sticky top-0 z-20 bg-background border-b border-border p-6 flex items-center justify-between">
            <DialogHeader className="p-0">
              <DialogTitle className="font-display text-heading-lg">
                Compare Trips
              </DialogTitle>
            </DialogHeader>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 hover:bg-primary transition-colors"
                id="close-compare-modal"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>

          <div className="p-4 sm:p-8">
            <div
              className={`grid gap-8  ${
                compareTrips.length === 3
                  ? "sm:grid-cols-3"
                  : compareTrips.length === 2
                    ? "sm:grid-cols-2"
                    : "grid-cols-1"
              }`}
            >
              {compareTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-background rounded-2xl shadow-sm border border-border/50 overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="aspect-16/9 relative overflow-hidden">
                    <img
                      src={trip.image}
                      alt={trip.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col space-y-6">
                    {/* Title & Provider */}
                    <div>
                      <h4 className="font-display text-heading-sm mb-1 line-clamp-2">
                        {trip.name}
                      </h4>
                      <p className="text-body-sm text-muted-foreground uppercase tracking-wider">
                        {trip.provider}
                      </p>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-body-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-bold text-success text-base">
                          ₹{Number(trip.priceFrom).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-body-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium text-foreground">
                          {trip.duration}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-body-sm">
                        <span className="text-muted-foreground">
                          Group Size
                        </span>
                        <span className="font-medium text-foreground">
                          {trip.groupSize}
                        </span>
                      </div>
                      {/* <div className="flex justify-between items-center text-body-sm">
                        <span className="text-muted-foreground">Rating</span>
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                          4.5
                        </div>
                      </div> */}
                      <div className="flex justify-between items-center text-body-sm">
                        <span className="text-muted-foreground">
                          Difficulty
                        </span>
                        <span className="font-medium text-foreground">
                          {trip.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Location & Dates (Minimal) */}
                    <div className="pt-4 border-t border-border/50 space-y-3">
                      <div className="flex justify-between text-body-xs">
                        <span className="text-muted-foreground">From</span>
                        <span className="font-medium text-right">
                          {trip.source_full}
                        </span>
                      </div>
                      <div className="flex justify-between text-body-xs">
                        <span className="text-muted-foreground">To</span>
                        <span className="font-medium text-right">
                          {trip.destination_full}
                        </span>
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div className="space-y-2 border-t border-border/50 pt-4">
                      <p className="font-bold text-body-sm text-foreground font-display">
                        Inclusions:
                      </p>
                      <ul className="space-y-1.5">
                        {trip.inclusions.map((item, i) => (
                          <li
                            key={i}
                            className="text-base leading-relaxed text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-success mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {trip.exclusions.length > 0 && (
                      <div className="space-y-2 border-t border-border/50 pt-4">
                        <p className="font-bold text-body-sm text-foreground font-display">
                          Exclusions:
                        </p>
                        <ul className="space-y-1.5">
                          {trip.exclusions.map((item, i) => (
                            <li
                              key={i}
                              className="text-base leading-relaxed text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-success mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Detailed Itinerary */}
                    <div className="space-y-3 border-t border-border/50 pt-4">
                      <p className="font-bold text-body-sm text-foreground font-display">
                        Detailed Itinerary
                      </p>
                      <div className="space-y-3">
                        {trip.itinerary.map((dayItem, i) => (
                          <details
                            key={i}
                            className="bg-muted/30 rounded-xl p-4 border border-border/30"
                          >
                            <summary className="text-base font-bold text-primary mb-1.5 uppercase tracking-wider">
                              Day {dayItem.day || i + 1}
                            </summary>
                            <ul className="space-y-1.5">
                              {dayItem.activities?.map((activity, j) => (
                                <li
                                  key={j}
                                  className="text-base leading-relaxed text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ))}
                      </div>
                    </div>

                    {/* Cancellation Policy */}
                    {trip.cancellation_policy && (
                      <div className="space-y-2">
                        <p className="font-bold text-body-sm text-foreground font-display">
                          Cancellation Policy:
                        </p>
                        <div className="bg-muted/10 rounded-xl p-4 overflow-hidden border border-border/50">
                          <pre className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans">
                            {trip.cancellation_policy}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-4 sticky bottom-0 bg-background pb-2 mt-auto">
                      <Link
                        href={`/trip/${trip.id}`}
                        prefetch={false}
                        className="block"
                      >
                        <Button className="btn-primary w-full h-11 text-sm font-semibold shadow-md active:scale-[0.98] transition-all">
                          View Trip
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showInterstitial}
        onOpenChange={(open) => {
          setShowInterstitial(open);
          if (!open && !interstitialChoiceMade) setCompareList([]);
        }}
      >
        <DialogContent className="max-w-sm w-[calc(90%-2rem)] p-6 rounded-2xl">
          <DialogHeader>
            <GitCompare className="w-12 h-12 text-primary mb-4" />
            <DialogTitle className="font-display text-heading-md">
              Add to Compare
            </DialogTitle>
            <p className="text-body-sm text-muted-foreground mt-2">
              You can compare up to 3 trips side-by-side.
            </p>
          </DialogHeader>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="outline"
              className="h-12"
              onClick={() => {
                setInterstitialChoiceMade(true);
                setShowInterstitial(false);
              }}
            >
              <p>
                Add 3<sup>rd</sup> trip
              </p>
            </Button>
            <Button
              className="btn-primary h-12"
              onClick={() => {
                setInterstitialChoiceMade(true);
                setShowInterstitial(false);
                triggerCompare();
              }}
            >
              Compare
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {showLandscapeAlert && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-[280px] w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <RotateCcw className="w-10 h-10 text-primary" />
                </motion.div>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                Rotate Your Screen
              </h3>
              <p className="text-body-sm text-muted-foreground leading-relaxed">
                Landscape mode provides the{" "}
                <span className="font-bold text-foreground">
                  best view for comparison
                </span>
                .
              </p>
              <div className="mt-8 flex justify-center">
                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
