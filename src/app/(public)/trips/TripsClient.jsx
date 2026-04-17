"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
import { TripCardSkeleton } from "@/app/components/website/Skeletons";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const FiltersContent = ({
  selectedType,
  setSelectedType,
  selectedDifficulty,
  setSelectedDifficulty,
  setIsSheetOpen,
  tripTypesData,
}) => (
  <div className="space-y-6">
    <div>
      <h4 className="font-medium text-foreground mb-3">Trip Type</h4>
      <div className="space-y-2">
        {tripTypesData.map((type) => (
          <button
            key={type}
            onClick={() => {
              setSelectedType(type);
              setTimeout(() => setIsSheetOpen?.(false), 500);
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
              setTimeout(() => setIsSheetOpen?.(false), 500);
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
  </div>
);

export default function TripsClient({ initialTrips, locationMap, tripTypesData }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialChoiceMade, setInterstitialChoiceMade] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const searchScrollRef = useRef(null);
  const isFirstLoad = useRef(true);
  const isFirstPageLoad = useRef(true);

  // Sync state when URL search param changes
  useEffect(() => {
    const s = searchParams.get("search") || "";
    if (s !== searchQuery) {
      setSearchQuery(s);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Debounce searchQuery
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Update URL based on debounced search
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentUrlSearch = params.get("search") || "";
    if (debouncedSearchQuery !== currentUrlSearch) {
      if (debouncedSearchQuery.trim().length > 0) {
        params.set("search", debouncedSearchQuery.trim());
        if (debouncedSearchQuery.trim().length >= 2) {
          params.delete("page");
          params.delete("limit");
        }
      } else {
        params.delete("search");
      }
      const queryString = params.toString();
      router.replace(queryString ? `/trips?${queryString}` : "/trips", {
        scroll: false,
      });
    }
  }, [debouncedSearchQuery, searchParams, router]);

  const params = new URLSearchParams();
  if (debouncedSearchQuery.trim().length >= 2) {
    params.set("search", debouncedSearchQuery.trim());
  }
  params.set("page", currentPage);
  params.set("limit", 10);
  if (selectedType !== "All Types") {
    params.set("type", selectedType.toLowerCase());
  }
  if (selectedDifficulty !== "All") {
    params.set("difficulty", selectedDifficulty.toUpperCase());
  }

  const tripsUrl = `${BASE_URL}/api/${API_VERSION}/trips?sortBy=updated_at&order=DESC&${params.toString()}`;
  const { data: tripsData, isLoading: loadingTrips } = useSWR(
    tripsUrl,
    fetcher,
    {
      fallbackData: initialTrips,
      revalidateOnFocus: false, // Prevent redundant calls when switching tabs/windows
      revalidateIfStale: false, // Trust the SSR data on mount
    }
  );

  const pagination = tripsData?.result?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  const trips = useMemo(() => {
    const rawTrips = tripsData?.result?.trips || [];
    return rawTrips.map((trip) => {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      const destination = locationMap[trip.destination_id] || { name: "Unknown", region: "" };
      const source = locationMap[trip.source_id] || { name: "Unknown", region: "" };

      return {
        id: trip.id,
        name: trip.name,
        image: trip.images ? trip.images[0] : null,
        destination_name: destination.name,
        destination_region: destination.region,
        source_name: source.name,
        source_region: source.region,
        provider: trip.operator?.name || "Unknown",
        priceFrom: Number(trip.price),
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
      };
    });
  }, [tripsData, locationMap]);

  const filteredTrips = useMemo(() => {
    let result = [...trips];
    if (sortBy === "price-low") result.sort((a, b) => a.priceFrom - b.priceFrom);
    else if (sortBy === "price-high") result.sort((a, b) => b.priceFrom - a.priceFrom);
    else if (sortBy === "duration") result.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    else if (sortBy === "start date") result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
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
    router.replace(params.toString() ? `/trips?${params.toString()}` : "/trips");
  };

  const toggleCompare = useCallback((tripId) => {
    setCompareList((prev) => {
      const isAdding = !prev.includes(tripId);
      if (isAdding && prev.length < 3) {
        if (prev.length + 1 === 3) setShowCompare(true);
        else {
          setInterstitialChoiceMade(false);
          setShowInterstitial(true);
        }
      }
      return isAdding
        ? prev.length < 3 ? [...prev, tripId] : prev
        : prev.filter((id) => id !== tripId);
    });
  }, []);

  const compareTrips = useMemo(
    () => trips.filter((t) => compareList.includes(t.id)),
    [trips, compareList],
  );

  return (
    <>
      <section className="relative pt-28 pb-12 bg-linear-to-br from-primary-light via-background to-background" id="trips">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="font-display text-display text-foreground mb-4">Explore Community Trips</h1>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search destinations, trips..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 pr-4 h-14 rounded-xl border-border bg-background shadow-sm"
              />
              {searchQuery && (
                <button onClick={handleClearSearch} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-background" id="filters">
        <div className="container-premium">
          <div className="flex gap-8">
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 card-premium p-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
                <h3 className="font-display text-heading-sm text-foreground mb-6">Filters</h3>
                <FiltersContent
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedDifficulty={selectedDifficulty}
                  setSelectedDifficulty={setSelectedDifficulty}
                  tripTypesData={tripTypesData}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="overflow-y-auto pr-6">
                      <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                      <div className="mt-6">
                        <FiltersContent
                          selectedType={selectedType}
                          setSelectedType={setSelectedType}
                          selectedDifficulty={selectedDifficulty}
                          setSelectedDifficulty={setSelectedDifficulty}
                          setIsSheetOpen={setIsSheetOpen}
                          tripTypesData={tripTypesData}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="flex items-center gap-3">
                  {compareList.length > 1 && (
                    <Button onClick={() => setShowCompare(true)} className="btn-secondary">
                      <GitCompare className="w-4 h-4 mr-2" /> Compare ({compareList.length})
                    </Button>
                  )}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-45">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                      <SelectItem value="start date">Start Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-5 mb-8">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <div key={trip.id} className="card-premium overflow-hidden group">
                      <Link href={`/trip/${trip.id}`} prefetch={false}>
                        <div className="aspect-16/10 relative overflow-hidden">
                          {trip.image && <img src={trip.image} alt={trip.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
                          {!trip.image && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          {trip.verified && (
                            <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-success/90 text-background text-xs font-medium">
                              <Shield className="w-3 h-3" /> Verified
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-body-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" /> {trip.destination_name}
                        </div>
                        <Link href={`/trip/${trip.id}`} prefetch={false}>
                          <h3 className="font-display text-heading-sm text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                            {trip.name}
                          </h3>
                        </Link>
                        <p className="text-body-sm text-muted-foreground mb-4">by {trip.provider}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <p className="font-display text-heading-sm text-primary">₹{trip.priceFrom.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          <Checkbox
                            id={`compare-${trip.id}`}
                            checked={compareList.includes(trip.id)}
                            onCheckedChange={() => toggleCompare(trip.id)}
                          />
                          <label htmlFor={`compare-${trip.id}`} className="text-body-sm text-muted-foreground cursor-pointer">Compare</label>
                          <Link href={`/trip/${trip.id}`} className="flex-1" prefetch={false}>
                            <Button className="btn-primary w-full">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : !loadingTrips && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">No trips found.</div>
                )}
              </div>

              {loadingTrips && (
                <div className="grid md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => <TripCardSkeleton key={i} />)}
                </div>
              )}

              {!loadingTrips && pagination.pages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    <PaginationItem><PaginationLink isActive>{currentPage}</PaginationLink></PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage < pagination.pages) setCurrentPage(currentPage + 1); }}
                        className={currentPage >= pagination.pages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Compare Dialog */}
      <Dialog open={showCompare} onOpenChange={(open) => { setShowCompare(open); if (!open) setCompareList([]); }}>
        <DialogContent className="max-w-5xl w-[calc(90%-2rem)] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader><DialogTitle className="font-display text-heading-lg">Compare Trips</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {compareTrips.map((trip) => (
              <div key={trip.id} className="border border-border rounded-xl overflow-hidden flex flex-col">
                <img src={trip.image} alt={trip.name} className="w-full h-40 object-cover" />
                <div className="p-4 flex-1">
                  <h4 className="font-medium mb-1">{trip.name}</h4>
                  <p className="text-body-sm text-muted-foreground mb-4">{trip.provider}</p>
                  <div className="space-y-2 text-body-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-semibold text-primary">₹{trip.priceFrom.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{trip.duration}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Difficulty</span><span>{trip.difficulty}</span></div>
                  </div>
                  <Link href={`/trip/${trip.id}`} prefetch={false} className="block mt-4">
                    <Button className="btn-primary w-full">View Trip</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Interstitial Dialog */}
      <Dialog open={showInterstitial} onOpenChange={(open) => { setShowInterstitial(open); if (!open && !interstitialChoiceMade) setCompareList([]); }}>
        <DialogContent className="max-w-sm w-[calc(90%-2rem)] p-6 rounded-2xl">
          <DialogHeader>
            <GitCompare className="w-12 h-12 text-primary mb-4" />
            <DialogTitle className="font-display text-heading-md">Add to Compare</DialogTitle>
            <p className="text-body-sm text-muted-foreground mt-2">You can compare up to 3 trips side-by-side.</p>
          </DialogHeader>
          <div className="mt-6 flex flex-col gap-3">
            <Button className="btn-primary h-12" onClick={() => { setInterstitialChoiceMade(true); setShowInterstitial(false); if (compareList.length === 2) setShowCompare(true); }}>Proceed</Button>
            <Button variant="outline" className="h-12" onClick={() => { setCompareList([]); setInterstitialChoiceMade(true); setShowInterstitial(false); }}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
