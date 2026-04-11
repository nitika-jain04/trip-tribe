"use client";

import {
  useState,
  useMemo,
  Suspense,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
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
} from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
import { useToast } from "@/app/hooks/use-toast";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function TripsContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const groupBy = searchParams.get("group_by");
  const locationType = searchParams.get("location_type");
  const search = searchParams.get("search");

  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialChoiceMade, setInterstitialChoiceMade] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripTypesData, setTripTypesData] = useState(["All Types"]);
  const { toast } = useToast();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const prevSearchRef = useRef(search);

  if (prevSearchRef.current !== search) {
    setCurrentPage(1);
    prevSearchRef.current = search;
  }

  // Track if data is already fetching
  const isFetchingRef = useRef(false);

  // Fetch all locations at once and map them by ID
  const fetchLocationsMap = async () => {
    const cached = sessionStorage.getItem("locations_cache");
    if (cached) return JSON.parse(cached);

    const res = await fetch(`${BASE_URL}/api/${API_VERSION}/locations`);
    const data = await res.json();
    if (!data.success) return {};

    const locMap = {};
    (data.result?.locations || []).forEach((loc) => {
      locMap[loc.id] = { name: loc.name, region: loc.region || "" };
    });

    sessionStorage.setItem("locations_cache", JSON.stringify(locMap));
    return locMap;
  };

  // Memoize the fetch function to prevent recreation
  const fetchTripsAndUpdateCache = useCallback(
    async (showLoader = true) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        if (showLoader) setLoadingTrips(true);

        // Fetch trips
        let url = `${BASE_URL}/api/${API_VERSION}/trips`;
        const params = new URLSearchParams();
        if (search) {
          params.set("group_by", groupBy || "location");
          if (locationType) params.set("location_type", locationType);
          params.set("search", search);
        }
        params.set("page", currentPage);
        params.set("limit", 10);

        if (selectedType !== "All Types") {
          params.set("type", selectedType.toLowerCase());
        }
        if (selectedDifficulty !== "All") {
          params.set("difficulty", selectedDifficulty.toUpperCase());
        }

        url += `?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.success) return;

        if (data.result?.pagination) {
          setPagination(data.result.pagination);
        } else {
          setPagination({ page: 1, limit: 10, total: 0, pages: 1 });
        }

        let rawTrips = [];
        if (search && (groupBy || "location") === "location") {
          const groups = data.result?.groups || [];
          rawTrips = groups.flatMap((g) => g.trips || []);
        } else {
          rawTrips = data.result?.trips || [];
        }

        const locationsMap = await fetchLocationsMap();

        const enrichedTrips = rawTrips.map((trip) => {
          const start = new Date(trip.start_date);
          const end = new Date(trip.end_date);
          const durationDays =
            Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

          const destination = locationsMap[trip.destination_id] || {
            name: "Unknown",
            region: "",
          };
          const source = locationsMap[trip.source_id] || {
            name: "Unknown",
            region: "",
          };

          return {
            id: trip.id,
            name: trip.name,
            image: trip.images[0],
            destination_name: destination.name,
            destination_region: destination.region,
            source_name: source.name,
            source_region: source.region,
            provider: trip.operator?.name || "Unknown",
            priceFrom: Number(trip.price),
            duration: `${durationDays} days`,
            groupSize: `${trip.total_seats} people`,
            difficulty:
              trip.difficulty?.charAt(0) +
                trip.difficulty?.slice(1).toLowerCase() || "Moderate",
            rating: 4.5,
            reviewCount: 0,
            verified: true,
            inclusions: trip.inclusions || [],
            type: trip.type?.name || "Other",
          };
        });

        setTrips(enrichedTrips);
        setLoadingTrips(false);
        // sessionStorage.setItem("trips_cache", JSON.stringify(enrichedTrips));
      } catch (err) {
        console.error("Fetch failed", err);
        setLoadingTrips(false);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [
      groupBy,
      locationType,
      search,
      currentPage,
      selectedType,
      selectedDifficulty,
    ],
  );

  const getTripTypes = useCallback(
    async (forceRefresh = false) => {
      try {
        const cachedTypes = sessionStorage.getItem("trip_types_cache");
        const cachedTimestamp = sessionStorage.getItem("trip_types_timestamp");
        const CACHE_DURATION = 30 * 60 * 1000;

        // ✅ Use cache if valid AND not forcing refresh
        if (
          !forceRefresh &&
          cachedTypes &&
          cachedTimestamp &&
          Date.now() - parseInt(cachedTimestamp) < CACHE_DURATION
        ) {
          setTripTypesData(JSON.parse(cachedTypes));
          return;
        }

        const res = await fetch(`${BASE_URL}/api/${API_VERSION}/trip-types`);
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: "Error",
            description: data?.error?.message || "Failed to fetch trip types",
            variant: "destructive",
          });
          return;
        }

        const types = data?.result?.trip_types || [];
        const formatted = ["All Types", ...types.map((t) => t.name)];

        setTripTypesData(formatted);

        // ✅ Update cache
        sessionStorage.setItem("trip_types_cache", JSON.stringify(formatted));
        sessionStorage.setItem("trip_types_timestamp", Date.now().toString());
      } catch (err) {
        console.error("Failed to fetch trip types", err);
      }
    },
    [toast],
  );

  const lastFetchRef = useRef(0);

  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now();

      // refresh immediately, with a minor 5-second cooldown just to prevent glitchy focus loops
      if (now - lastFetchRef.current > 5 * 1000) {
        getTripTypes(true);
        lastFetchRef.current = now;
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [getTripTypes]);

  useEffect(() => {
    fetchTripsAndUpdateCache(true);
  }, [fetchTripsAndUpdateCache]);

  useEffect(() => {
    if (tripTypesData.length === 1) {
      getTripTypes();
    }
  }, []);

  useEffect(() => {
    const isFilterApplied =
      selectedType !== "All Types" || selectedDifficulty !== "All";

    const targetId = isFilterApplied ? "filters" : "trips";
    const el = document.getElementById(targetId);

    if (el) {
      const yOffset = -80; // adjust based on header height
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [selectedType, selectedDifficulty]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const el = document.getElementById("trips");
      if (el) {
        const yOffset = -80;
        const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentPage]);

  const filteredTrips = useMemo(() => {
    let result = [...trips];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (trip) =>
          trip.name.toLowerCase().includes(query) ||
          trip.destination_name.toLowerCase().includes(query) ||
          trip.destination_region.toLowerCase().includes(query),
      );
    }

    if (selectedType !== "All Types") {
      result = result.filter((trip) => trip?.type === selectedType);
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
  }, [trips, searchQuery, selectedType, selectedDifficulty, sortBy]);

  const toggleCompare = useCallback((tripId) => {
    setCompareList((prev) => {
      const isAdding = !prev.includes(tripId);
      if (isAdding && prev.length < 3) {
        if (prev.length + 1 === 3) {
          setShowCompare(true);
        } else {
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

  const handleClearSearch = () => {
    setSearchQuery("");

    router.push("/trips");
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-foreground mb-3">Trip Type</h4>
        <div className="space-y-2">
          {tripTypesData.map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setTimeout(() => setIsSheetOpen(false), 500);
              }}
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
          {["All", "Easy", "Moderate", "Hard"].map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                setTimeout(() => setIsSheetOpen(false), 500);
              }}
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

      {/* <div>
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
      </div> */}
    </div>
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
              Explore Community Trips
            </h1>
            <p className="text-body-lg text-muted-foreground">
              {filteredTrips.length > 0 &&
                `${filteredTrips.length} ${filteredTrips.length === 1 ? "trip" : "trips"} from verified providers`}
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

      {loadingTrips && (
        <div className="max-w-2xl mx-auto mt-4">
          <div className="h-4 w-40 bg-muted rounded animate-pulse mx-auto" />
        </div>
      )}

      <section className="section bg-background" id="filters">
        <div className="container-premium">
          <div className="flex gap-8">
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 card-premium p-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
                <h3 className="font-display text-heading-sm text-foreground mb-6">
                  Filters
                </h3>
                <FiltersContent />
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
                  {compareList.length > 1 && (
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
                      {/* <SelectItem value="rating">Highest Rated</SelectItem> */}
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-5 mb-8">
                {!loadingTrips && filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="card-premium overflow-hidden group"
                    >
                      <Link href={`/trip/${trip.id}`}>
                        <div className="aspect-16/10 relative overflow-hidden">
                          {trip.image ? (
                            <img
                              src={trip.image}
                              alt={trip.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextSibling.style.display =
                                  "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full items-center justify-center bg-gray-100 ${
                              trip.image ? "hidden" : "flex"
                            }`}
                          >
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                          {trip.verified && (
                            <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-success/90 text-background text-xs font-medium">
                              <Shield className="w-3 h-3" /> Verified
                            </div>
                          )}
                          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/90 text-foreground text-xs font-medium">
                            {trip.type}
                          </div>
                        </div>
                      </Link>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-body-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" /> {trip.destination_name}
                          {trip.destination_region
                            ? `, ${trip.destination_region}`
                            : ""}
                        </div>
                        <Link href={`/trip/${trip.id}`}>
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
                            <Users className="w-4 h-4" /> {trip.groupSize}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-sm text-xs ${trip.difficulty === "Easy" ? "bg-success/10 text-success" : trip.difficulty === "Moderate" ? "bg-warning/10 text-warning" : "bg-error/10 text-error"}`}
                          >
                            {trip.difficulty}
                          </span>
                        </div>
                        <p className="text-body-sm text-muted-foreground mb-4">
                          by{" "}
                          <span className="text-foreground font-medium">
                            {trip.provider}
                          </span>
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          {/* <div className="flex items-center gap-1"> <Star className="w-4 h-4 fill-accent text-accent" /> <span className="text-body-sm font-medium"> {trip.rating} </span> <span className="text-body-sm text-muted-foreground"> ({trip.reviewCount} reviews) </span> </div> */}
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
                          <Link href={`/trip/${trip.id}`} className="flex-1">
                            <Button className="btn-primary w-full">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : !loadingTrips ? (
                  <div className="col-span-full flex flex-col items-center justify-center text-center py-1">
                    <img
                      src="/no-result.webp"
                      alt="No results"
                      className="w-48 mb-6 opacity-80"
                    />

                    <h3 className="text-heading-md font-display mb-2 text-foreground">
                      No trips found
                    </h3>

                    <p className="text-muted-foreground mb-6 max-w-md">
                      We couldn’t find any trips for{" "}
                      <span className="font-medium text-foreground">
                        {searchQuery}
                      </span>
                      . Try a different destination or explore popular trips.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedType("All Types");
                          setSelectedDifficulty("All");
                          handleClearSearch();
                        }}
                      >
                        Clear Filters
                      </Button>

                      <Button
                        onClick={handleClearSearch}
                        className="btn-primary"
                      >
                        Explore All Trips
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              {!loadingTrips &&
                pagination.pages > 1 &&
                filteredTrips.length > 0 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                          className={
                            currentPage <= 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      {[...Array(pagination.pages)].map((_, i) => {
                        const page = i + 1;

                        // Show logic: first, last, current, adjacent
                        const showLeftEllipsis = page === 2 && currentPage > 3;
                        const showRightEllipsis =
                          page === pagination.pages - 1 &&
                          currentPage < pagination.pages - 2;

                        if (showLeftEllipsis || showRightEllipsis) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        if (
                          page === 1 ||
                          page === pagination.pages ||
                          Math.abs(currentPage - page) <= 1
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }

                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < pagination.pages) {
                              setCurrentPage(currentPage + 1);
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

              {loadingTrips && (
                <div className="grid md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TripCardSkeleton key={i} />
                  ))}
                </div>
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
        <DialogContent className="max-w-5xl w-[calc(90%-2rem)] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-heading-md sm:text-heading-lg">
              Compare Trips
            </DialogTitle>
          </DialogHeader>
          {compareTrips.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <div
                className={`grid grid-cols-1 gap-4 ${
                  compareTrips.length === 3
                    ? "sm:grid-cols-2 md:grid-cols-3"
                    : "sm:grid-cols-2"
                }`}
              >
                {compareTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="border border-border rounded-xl overflow-hidden"
                  >
                    <img
                      src={trip.image}
                      alt={trip.name}
                      className="w-full h-40 sm:h-48 md:h-60 object-cover"
                    />
                    <div className="p-3 sm:p-4">
                      <h4 className="font-medium text-foreground mb-1 text-sm sm:text-base">
                        {trip.name}
                      </h4>
                      <p className="text-body-sm text-muted-foreground mb-3 sm:mb-4">
                        {trip.provider}
                      </p>

                      <div className="space-y-1.5 text-body-sm">
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
                          <span className="text-muted-foreground">
                            Difficulty
                          </span>
                          <span>{trip.difficulty}</span>
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
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
                        href={`/trip/${trip.id}`}
                        className="block mt-3 sm:mt-4"
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

      <Dialog
        open={showInterstitial}
        onOpenChange={(open) => {
          setShowInterstitial(open);
          if (!open && !interstitialChoiceMade) {
            setCompareList([]);
          }
        }}
      >
        <DialogContent className="max-w-sm w-[calc(90%-2rem)] p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-0">
            <div className="bg-primary/5 p-6 border-b border-primary/10">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                <GitCompare className="w-6 h-6" />
              </div>
              <DialogTitle className="font-display text-heading-md text-foreground">
                Trip Comparison
              </DialogTitle>
              <p className="text-body-sm text-muted-foreground mt-2">
                You can compare up to 3 trips side-by-side to find your perfect
                adventure.
              </p>
            </div>
          </DialogHeader>
          <div className="p-2 space-y-3">
            {compareList.length === 1 ? (
              <>
                <Button
                  className="w-full btn-primary h-12 text-md"
                  onClick={() => {
                    setInterstitialChoiceMade(true);
                    setShowInterstitial(false);
                  }}
                >
                  Proceed
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 text-md border-border"
                  onClick={() => {
                    setCompareList([]);
                    setInterstitialChoiceMade(true);
                    setShowInterstitial(false);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="w-full btn-primary h-12 text-md"
                  onClick={() => {
                    setInterstitialChoiceMade(true);
                    setShowInterstitial(false);
                    setShowCompare(true);
                  }}
                >
                  Compare
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 text-md border-border"
                  onClick={() => {
                    setInterstitialChoiceMade(true);
                    setShowInterstitial(false);
                  }}
                >
                  Select more trips
                </Button>
              </>
            )}
          </div>
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

const TripCardSkeleton = () => (
  <div className="card-premium overflow-hidden animate-pulse">
    {/* Image */}
    <div className="aspect-16/10 bg-muted" />

    <div className="p-6">
      {/* Location */}
      <div className="h-4 w-1/3 bg-muted rounded mb-3" />

      {/* Title */}
      <div className="h-5 w-3/4 bg-muted rounded mb-3" />

      {/* Meta */}
      <div className="flex gap-3 mb-4">
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="h-4 w-12 bg-muted rounded" />
      </div>

      {/* Provider */}
      <div className="h-4 w-1/2 bg-muted rounded mb-4" />

      {/* Price */}
      <div className="h-6 w-24 bg-muted rounded mb-4" />

      {/* Buttons */}
      <div className="flex gap-3">
        <div className="h-10 w-24 bg-muted rounded" />
        <div className="h-10 flex-1 bg-muted rounded" />
      </div>
    </div>
  </div>
);
