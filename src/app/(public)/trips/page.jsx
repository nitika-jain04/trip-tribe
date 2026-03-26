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
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripTypesData, setTripTypesData] = useState(["All Types"]);
  const { toast } = useToast();
  const router = useRouter();

  // Track if data is already fetching
  const isFetchingRef = useRef(false);
  const initialLoadRef = useRef(false);

  // Memoize the fetch function to prevent recreation
  const fetchTripsAndUpdateCache = useCallback(
    async (showLoader = true) => {
      // Prevent duplicate fetches
      if (isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;
        if (showLoader) setLoadingTrips(true);

        let url = `${BASE_URL}/api/${API_VERSION}/trips`;

        const params = new URLSearchParams();

        // ✅ Only apply filters if search exists
        if (search) {
          params.set("group_by", groupBy || "location");
          if (locationType) params.set("location_type", locationType);
          params.set("search", search);
        } else {
          // ✅ Default trips list
          params.set("page", 1);
          params.set("limit", 10);
        }

        url += `?${params.toString()}`;

        const res = await fetch(url);
        // if (!res.ok) throw new Error("Failed to fetch trips");
        if (!res.ok) {
          toast({
            title: "Error",
            description: "Failed to fetch trips",
            variant: "destructive",
          });
          return;
        }

        const data = await res.json();
        if (!data.success) return;

        let rawTrips = [];

        if (search && (groupBy || "location") === "location") {
          const groups = data.result?.groups || [];
          rawTrips = groups.flatMap((g) => g.trips || []);
        } else {
          rawTrips = data.result?.trips || [];
        }

        // Extract UNIQUE IDs
        const operatorIds = [
          ...new Set(rawTrips.map((t) => t.operator_id).filter(Boolean)),
        ];
        const locationIds = [
          ...new Set(
            rawTrips
              .flatMap((t) => [t.source_id, t.destination_id])
              .filter(Boolean),
          ),
        ];

        // Batch fetch PARALLEL
        const [operatorsRes, locationsRes] = await Promise.all([
          fetch(
            `${BASE_URL}/api/${API_VERSION}/operators?ids=${operatorIds.join(",")}`,
          ),
          fetch(
            `${BASE_URL}/api/${API_VERSION}/locations?ids=${locationIds.join(",")}`,
          ),
        ]);

        const operatorsData = await operatorsRes.json();
        const locationsData = await locationsRes.json();

        // Build lookup maps
        const operatorMap = {};
        (operatorsData?.result.operators || []).forEach((op) => {
          operatorMap[op.id] = op.name;
        });

        const locationMap = {};
        (locationsData?.result.locations || []).forEach((loc) => {
          locationMap[loc.id] = {
            name: loc.name,
            region: loc.region,
          };
        });

        // Enrich trips
        const enrichedTrips = rawTrips.map((trip) => {
          const start = new Date(trip.start_date);
          const end = new Date(trip.end_date);
          const durationDays =
            Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

          const destination = locationMap[trip.destination_id] || {
            name: "Unknown",
            region: "Unknown",
          };

          return {
            id: trip.id,
            name: trip.name,
            image: trip.images[0],
            destination: destination.name,
            region: destination.region,
            provider: {
              name: operatorMap[trip.operator_id] || "Unknown",
            },
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

        // Update UI once with final data
        setTrips(enrichedTrips);

        // Cache everything
        sessionStorage.setItem("trips_cache", JSON.stringify(enrichedTrips));
        sessionStorage.setItem("trips_cache_timestamp", Date.now().toString());
        sessionStorage.setItem("operator_map", JSON.stringify(operatorMap));
        sessionStorage.setItem("location_map", JSON.stringify(locationMap));

        setLoadingTrips(false);
      } catch (err) {
        console.error("Fetch failed", err);
        setLoadingTrips(false);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [groupBy, locationType, search],
  );

  // Optimized getPublishedTrips with cache validation
  const getPublishedTrips = useCallback(async () => {
    try {
      const cachedTrips = sessionStorage.getItem("trips_cache");
      const cachedTimestamp = sessionStorage.getItem("trips_cache_timestamp");
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

      const isCacheValid =
        cachedTrips &&
        cachedTimestamp &&
        Date.now() - parseInt(cachedTimestamp) < CACHE_DURATION;

      if (isCacheValid) {
        setTrips(JSON.parse(cachedTrips));
        setLoadingTrips(false);

        // ✅ Only revalidate in background if cache is old (but still valid)
        const timeSinceCache = Date.now() - parseInt(cachedTimestamp);
        if (timeSinceCache > CACHE_DURATION / 2) {
          // Revalidate in background without showing loader
          fetchTripsAndUpdateCache(false);
        }
        return;
      }

      // No valid cache, fetch fresh
      await fetchTripsAndUpdateCache(true);
    } catch (err) {
      console.error("Failed to get trips", err);
      setLoadingTrips(false);
    }
  }, [fetchTripsAndUpdateCache]);

  // Get trip types with caching
  const getTripTypes = useCallback(async () => {
    try {
      const cachedTypes = sessionStorage.getItem("trip_types_cache");
      const cachedTimestamp = sessionStorage.getItem("trip_types_timestamp");
      const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache for types

      if (
        cachedTypes &&
        cachedTimestamp &&
        Date.now() - parseInt(cachedTimestamp) < CACHE_DURATION
      ) {
        setTripTypesData(JSON.parse(cachedTypes));
        return;
      }

      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/trip-types`);
      // if (!res.ok) throw new Error("Failed to fetch trip types");
      if (!res.ok)
        toast({
          title: "Error",
          description: "Failed to fetch trip types",
          variant: "destructive",
        });

      const data = await res.json();
      const types = data?.result?.trip_types || [];
      const formatted = ["All Types", ...types.map((t) => t.name)];

      setTripTypesData(formatted);
      sessionStorage.setItem("trip_types_cache", JSON.stringify(formatted));
      sessionStorage.setItem("trip_types_timestamp", Date.now().toString());
    } catch (err) {
      console.error("Failed to fetch trip types", err);
    }
  }, []);

  useEffect(() => {
    fetchTripsAndUpdateCache(true);
  }, [groupBy, locationType, search]);

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
    setCompareList((prev) =>
      prev.includes(tripId)
        ? prev.filter((id) => id !== tripId)
        : prev.length < 3
          ? [...prev, tripId]
          : prev,
    );
  }, []);

  const compareTrips = useMemo(
    () => trips.filter((t) => compareList.includes(t.id)),
    [trips, compareList],
  );

  const handleClearSearch = () => {
    setSearchQuery("");

    // ✅ This removes ALL query params → /trips
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
          {["All", "Easy", "Moderate", "Hard"].map((diff) => (
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
      <section className="relative pt-28 pb-12 bg-linear-to-br from-primary-light via-background to-background">
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
              <div className="flex flex-wrap items-center justify-between gap-4">
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
                      {/* <SelectItem value="rating">Highest Rated</SelectItem> */}
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-5">
                {!loadingTrips && filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="card-premium overflow-hidden group"
                    >
                      {" "}
                      <Link href={`/trip/${trip.id}`}>
                        {" "}
                        <div className="aspect-16/10 relative overflow-hidden">
                          {" "}
                          <img
                            src={trip.image}
                            alt={trip.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />{" "}
                          {trip.verified && (
                            <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-success/90 text-background text-xs font-medium">
                              {" "}
                              <Shield className="w-3 h-3" /> Verified{" "}
                            </div>
                          )}{" "}
                          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/90 text-foreground text-xs font-medium">
                            {" "}
                            {trip.type}{" "}
                          </div>{" "}
                        </div>{" "}
                      </Link>{" "}
                      <div className="p-6">
                        {" "}
                        <div className="flex items-center gap-2 text-body-sm text-muted-foreground mb-2">
                          {" "}
                          <MapPin className="w-4 h-4" /> {trip.destination}{" "}
                          {trip.region !== "Unknown" && `, ${trip.region}`}{" "}
                        </div>{" "}
                        <Link href={`/trip/${trip.id}`}>
                          {" "}
                          <h3 className="font-display text-heading-sm text-foreground mb-2 group-hover:text-primary transition-colors">
                            {" "}
                            {trip.name}{" "}
                          </h3>{" "}
                        </Link>{" "}
                        <div className="flex items-center gap-4 text-body-sm text-muted-foreground mb-3">
                          {" "}
                          <span className="flex items-center gap-1">
                            {" "}
                            <Calendar className="w-4 h-4" />{" "}
                            {trip.duration}{" "}
                          </span>{" "}
                          <span className="flex items-center gap-1">
                            {" "}
                            <Users className="w-4 h-4" /> {trip.groupSize}{" "}
                          </span>{" "}
                          <span
                            className={`px-2 py-0.5 rounded-sm text-xs ${trip.difficulty === "Easy" ? "bg-success/10 text-success" : trip.difficulty === "Moderate" ? "bg-warning/10 text-warning" : "bg-error/10 text-error"}`}
                          >
                            {" "}
                            {trip.difficulty}{" "}
                          </span>{" "}
                        </div>{" "}
                        <p className="text-body-sm text-muted-foreground mb-4">
                          {" "}
                          by{" "}
                          <span className="text-foreground font-medium">
                            {" "}
                            {trip.provider.name}{" "}
                          </span>{" "}
                        </p>{" "}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          {" "}
                          {/* <div className="flex items-center gap-1"> <Star className="w-4 h-4 fill-accent text-accent" /> <span className="text-body-sm font-medium"> {trip.rating} </span> <span className="text-body-sm text-muted-foreground"> ({trip.reviewCount} reviews) </span> </div> */}{" "}
                          <p className="font-display text-heading-sm text-primary">
                            {" "}
                            ₹{trip.priceFrom.toLocaleString()}{" "}
                          </p>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-3 mt-4">
                          {" "}
                          <div className="flex items-center gap-2">
                            {" "}
                            <Checkbox
                              id={`compare-${trip.id}`}
                              checked={compareList.includes(trip.id)}
                              onCheckedChange={() => toggleCompare(trip.id)}
                            />{" "}
                            <label
                              htmlFor={`compare-${trip.id}`}
                              className="text-body-sm text-muted-foreground cursor-pointer"
                            >
                              {" "}
                              Compare{" "}
                            </label>{" "}
                          </div>{" "}
                          <Link href={`/trip/${trip.id}`} className="flex-1">
                            {" "}
                            <Button className="btn-primary w-full">
                              {" "}
                              View Details{" "}
                            </Button>{" "}
                          </Link>{" "}
                        </div>{" "}
                      </div>{" "}
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
                        {/* <div className="flex justify-between">
                          <span className="text-muted-foreground">Rating</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-accent text-accent" />
                            {trip.rating}
                          </span>
                        </div> */}
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

                      <Link href={`/trip/${trip.id}`} className="block mt-4">
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
