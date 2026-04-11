"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  ArrowRight,
  Search,
  Shield,
  MapPin,
  ChevronRight,
  Calendar,
  GitCompare,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ImageIcon,
  ChevronDown,
  Compass,
} from "lucide-react";
import { Libre_Baskerville } from "next/font/google";
import { useToast } from "../hooks/use-toast";
import useLocations from "../hooks/use-locations";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

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

export default function Page() {
  const router = useRouter();

  const [searchDestination, setSearchDestination] = useState("");
  const [searchDates, setSearchDates] = useState("");
  const [operators, setOperators] = useState([]);
  const [totalOperators, setTotalOperators] = useState(0);
  const [rawTrips, setRawTrips] = useState([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [rawLocationsGroups, setRawLocationsGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { locationMap } = useLocations();
  const { toast } = useToast();

  const safeFetch = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      toast({
        title: "Network Error",
        description: err.message || "Failed to fetch data",
        variant: "destructive",
      });
      // Return null instead of throwing
      return null;
    }
  };

  const fetchHomePageData = async () => {
    setLoading(true);
    setError(null);

    const [locationsData, operatorsData, tripsData] = await Promise.all([
      safeFetch(`${BASE_URL}/api/${API_VERSION}/trips?group_by=location`),
      safeFetch(`${BASE_URL}/api/${API_VERSION}/operators?page=1&limit=10`),
      safeFetch(`${BASE_URL}/api/${API_VERSION}/trips?page=1&limit=9`),
    ]);

    // If any fetch failed, just stop and return
    if (!locationsData || !operatorsData || !tripsData) {
      setError("Failed to load homepage data");
      setRawLocationsGroups([]);
      setOperators([]);
      setTotalOperators(0);
      setRawTrips([]);
      setTotalTrips(0);
      setLoading(false);
      return;
    }

    // Process operators (since it doesn't depend on locationMap for initial display)
    const processedOperators = operatorsData.success
      ? operatorsData.result?.operators || []
      : [];

    // Update state with raw data
    setRawLocationsGroups(
      locationsData.success ? locationsData.result?.groups || [] : [],
    );
    setOperators(processedOperators);
    setTotalOperators(
      operatorsData.success
        ? operatorsData.result?.pagination?.total || processedOperators.length
        : 0,
    );
    const loadedTrips = tripsData.success ? tripsData.result?.trips || [] : [];
    setRawTrips(loadedTrips);
    setTotalTrips(
      tripsData.success
        ? tripsData.result?.pagination?.total || loadedTrips.length
        : 0,
    );
    setLoading(false);
  };

  const processLocations = (groups, locationMap) => {
    if (!groups || !groups.length) return [];

    return groups.map((group) => {
      const firstTrip = group.trips?.[0];

      const locationData = locationMap[firstTrip?.destination_id] || {};

      return {
        id: firstTrip?.destination_id || group.location_name,
        name: group.location_name,
        region: locationData?.region || "",
        type: "destination",
        trips: group.total_trips,
        image: firstTrip?.images?.[0] || null,
      };
    });
  };

  const enrichTripsWithDetails = (rawTrips, locationMap) => {
    if (!rawTrips.length) return [];

    return rawTrips.map((trip) => {
      const source = locationMap[trip.source_id] || {};
      const destination = locationMap[trip.destination_id] || {};

      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      return {
        id: trip.id,
        name: trip.name,
        images: trip.images?.length ? trip.images : [],
        destination: destination.name || "Unknown",
        region: destination.region || "Unknown",
        provider: trip.operator?.name || "Unknown",
        price: Number(trip.price) || 0,
        duration: `${durationDays} days`,
        groupSize: `${trip.total_seats} people`,
        difficulty:
          trip.difficulty?.charAt(0) +
            trip.difficulty?.slice(1).toLowerCase() || "Moderate",
        rating: trip.operator?.rating || 4.5,
        reviewCount: 0,
        verified: true,
      };
    });
  };

  // Memoized processed data
  const locations = useMemo(() => {
    return processLocations(rawLocationsGroups, locationMap);
  }, [rawLocationsGroups, locationMap]);

  const trips = useMemo(() => {
    return enrichTripsWithDetails(rawTrips, locationMap);
  }, [rawTrips, locationMap]);

  const filteredLocations = useMemo(() => {
    if (!searchDestination) return locations;
    return locations.filter((loc) =>
      loc.name.toLowerCase().includes(searchDestination.toLowerCase()),
    );
  }, [locations, searchDestination]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchDestination) params.set("search", searchDestination);
    if (searchDates) params.set("dates", searchDates);
    router.push(`/trips?${params.toString()}`);
  };

  useEffect(() => {
    fetchHomePageData();
  }, []);

  // Create datalist options from locations
  const locationNames = locations.map((loc) => loc.name);

  // Combined loading state
  const isLoading = loading;

  // Combined error state
  const hasError = error && !loading;

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
              Find your tribe.
              <span className="block">Travel together.</span>
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
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => {
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      className="pl-10 h-14 rounded-xl border-border bg-muted/50 text-body text-foreground"
                    />
                    {/* Custom Suggestions Dropdown */}
                    {showSuggestions && locations.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 border border-border rounded-xl shadow-2xl overflow-hidden z-[1000] animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* "Take me anywhere" Option */}
                        <button
                          type="button"
                          onClick={() => router.push("/trips")}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 cursor-pointer hover:bg-muted/60 transition-all text-left group"
                        >
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Compass className="text-primary" size={15} />
                          </div>
                          <div className="text-left">
                            <p className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                              Take me anywhere
                            </p>
                          </div>
                        </button>
                        {/* Location Suggestions */}
                        <div className="relative">
                          <div className="max-h-33 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 hover:scrollbar-thumb-muted-foreground/50">
                            {filteredLocations.length > 0 ? (
                              filteredLocations.map((loc) => (
                                <button
                                  key={loc.id}
                                  type="button"
                                  onClick={() => {
                                    setSearchDestination(loc.name);
                                    setShowSuggestions(false);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 cursor-pointer hover:bg-muted/60 transition-all text-left group"
                                >
                                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <MapPin
                                      className="text-primary"
                                      size={15}
                                    />
                                  </div>
                                  <div>
                                    <p className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                                      {loc.name}
                                    </p>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-8 text-center">
                                <p className="text-sm text-muted-foreground">
                                  No destinations found
                                </p>
                              </div>
                            )}
                          </div>
                          {/* Scroll fade indicator */}
                          {filteredLocations.length > 4 && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-background to-transparent pointer-events-none rounded-b-xl" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                    <DatePicker
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
                <CheckCircle2 className="w-5 h-5 text-success" /> Free
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
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-background/60 hover:text-background transition-all duration-300 animate-bounce group cursor-pointer"
          aria-label="Scroll to content"
        >
          <div className="flex flex-col items-center gap-2" id="next-section">
            <span className="text-xs font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                {totalTrips}+
              </p>
              <p className="text-body-sm text-muted-foreground">
                Curated Trips
              </p>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <p
                className={`text-display text-primary ${baskerville.className}`}
              >
                {totalOperators}+
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
            <Link href="/trips">
              <Button className="btn-secondary">
                View All Trips
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">
                Loading featured trips...
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Discover amazing adventures
              </p>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 font-medium">Failed to load trips</p>
              <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
              <button
                onClick={fetchHomePageData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasError && trips.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No trips available</p>
              <p className="text-sm text-gray-400 mt-1">
                Check back soon for new adventures
              </p>
            </div>
          )}

          {/* Trips Grid */}
          {!isLoading && !hasError && trips.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.slice(0, 9).map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trip/${trip.id}`}
                  className="card-premium overflow-hidden group"
                >
                  <div className="aspect-16/10 relative overflow-hidden bg-gray-100">
                    {trip.images?.[0] && !imgError ? (
                      <img
                        src={trip.images[0]}
                        alt={trip.name}
                        className="w-full h-full object-fill transition-transform duration-500 group-hover:scale-110"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {trip.verified && (
                      <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-success/90 text-background text-xs font-medium">
                        <Shield className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="p-6">
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
                    <h3 className="font-display text-heading-sm text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {trip.name}
                    </h3>
                    <p className="text-body-sm text-muted-foreground mb-4">
                      by {trip.provider || "Unknown"}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-display text-heading-sm text-primary">
                        ₹{(trip.price ?? 0).toLocaleString()}{" "}
                        <span className="text-body-sm text-muted-foreground font-normal">
                          onwards
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
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
            <Link href="/trips">
              <Button className="btn-secondary">
                All Destinations
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">
                Loading destinations...
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Discover amazing places to visit
              </p>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 font-medium">
                Failed to load destinations
              </p>
              <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
              <button
                onClick={fetchHomePageData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasError && locations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
              <MapPin className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">
                No destinations available
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Check back soon for new destinations
              </p>
            </div>
          )}

          {/* Destinations Grid */}
          {!isLoading && !hasError && locations.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.slice(0, 9).map((location) => (
                <Link
                  key={location.name}
                  href={`/trips?group_by=location&location_type=destination&search=${location.name}`}
                  className="group relative aspect-4/3 rounded-2xl overflow-hidden"
                >
                  {location.image ? (
                    <img
                      src={location.image}
                      alt={location.name}
                      className="w-full h-full object-fill transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="hidden absolute inset-0 items-center justify-center bg-gray-100">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col justify-center items-center py-4">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">
                Loading Trusted Trip Organisers...
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Discover amazing adventures
              </p>
            </div>
          )}

          {/* Providers Grid */}
          {!isLoading && !hasError && operators.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
              {operators.slice(0, 9).map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center gap-3 px-5 py-1 rounded-full bg-muted/50 hover:bg-gray-100"
                >
                  {/* <Shield className="w-5 h-5 text-success" /> */}
                  {provider?.logo_url ? (
                    <img
                      src={provider.logo_url}
                      alt="Logo"
                      className="h-16 w-16 object-cover rounded-full"
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
          )}

          {/* Empty State */}
          {!isLoading && !hasError && operators.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No providers available at the moment</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/partners">
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
              <Link href="/trips">
                <Button className="btn-primary text-body px-8 py-6">
                  Explore Trips
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              {/* <Link href="/blog">
                <Button className="btn-secondary text-body px-8 py-6">
                  Read Travel Stories
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// "use client";

// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { useEffect, useState, Suspense } from "react";

// import {
//   MapPin,
//   Shield,
//   Calendar,
//   Users,
//   Clock,
//   ChevronLeft,
//   Loader2,
//   ImageIcon,
//   Check,
//   X,
// } from "lucide-react";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/app/components/ui/tabs";
// import useLocations from "@/app/hooks/use-locations";
// import { Button } from "@/app/components/ui/button";
// import Input from "@/app/components/ui/input";
// import { useToast } from "@/app/hooks/use-toast";

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

// function TripPage() {
//   const { id } = useParams();
//   const { locationMap } = useLocations();
//   const { toast } = useToast();

//   const [trip, setTrip] = useState(null);
//   const [tripReviews, setTripReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeImage, setActiveImage] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     phone_number: "",
//     message: "",
//     email: "nitikaaajain.04@gmail.com", // hardcoded
//     subject: "Book Trip",
//   });

//   const handleSubmit = async () => {
//     if (!formData.name || !formData.phone_number) {
//       toast({
//         title: "Form",
//         description: "Please fill required fields",
//         variant: "destructive",
//       });
//       return;
//     }

//     const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;

//     if (!phoneRegex.test(formData.phone_number.trim())) {
//       // newErrors.phone = "Enter valid phone number";
//       toast({
//         title: "Phone Number",
//         description: "Enter valid phone number",
//         variant: "destructive",
//       });
//       return;
//     }

//     const currentUrl = window.location.href;

//     try {
//       // ✅ 1. Call Enquiry API
//       await fetch(`${BASE_URL}/api/${API_VERSION}/enquiries`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           full_name: formData.name,
//           email: "nitikaaajain.04@gmail.com", // hardcoded
//           phone_number: formData.phone_number.startsWith("+91")
//             ? formData.phone_number
//             : `+91${formData.phone_number}`,
//           inquiry_type: "TRIP",
//           trip_id: trip.id,
//           subject: "Book Trip",
//           message: formData.remark || `User is interested in ${trip.name}`,
//         }),
//       });

//       // ✅ 2. Prepare WhatsApp message
//       const startDate = new Date(trip.startDate).toLocaleDateString("en-IN");

//       const message = `Hi, I wanted to confirm the availability for the following trip:

// *Trip Details*
// • *Trip:* ${trip.name}
// • *Operator:* ${trip.provider.name}
// • *Start Date:* ${startDate}

// *View details for ${trip.name}:*
// ${currentUrl}`;

//       const whatsappNumber = "917007755306"; // with country code

//       const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
//         message,
//       )}`;

//       // ✅ 3. Redirect to WhatsApp (more reliable on mobile than window.open)
//       window.location.href = url;

//       setShowForm(false);
//     } catch (error) {
//       console.error("Enquiry error:", error);
//       toast({
//         title: "Form",
//         description: "Something went wrong. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   useEffect(() => {
//     if (!id) return;

//     // ✅ Initialize AbortController to manage this specific request
//     const controller = new AbortController();

//     async function fetchTrip() {
//       try {
//         setLoading(true);

//         // Fetch trip details
//         const res = await fetch(`${BASE_URL}/api/${API_VERSION}/trips/${id}`, {
//           signal: controller.signal, // ✅ Attach signal to fetch
//         });
//         const data = await res.json();

//         if (!data?.success) {
//           setTrip(null);
//           return;
//         }

//         const raw = Array.isArray(data.result?.trips)
//           ? data.result.trips[0]
//           : data.result;
//         if (!raw) return setTrip(null);

//         const start = new Date(raw.start_date);
//         const end = new Date(raw.end_date);
//         const days = Math.max(
//           1,
//           Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
//         );

//         setActiveImage(raw.images?.[0]);

//         setTrip({
//           id: raw.id,
//           name: raw.name,
//           description: raw.description || "",
//           images: raw.images?.length ? raw.images : [],
//           source_id: raw.source_id,
//           destination_id: raw.destination_id,
//           provider: {
//             name: raw.operator.name || "Unknown",
//             rating: 4.8,
//             reviewCount: 0,
//           },
//           priceFrom: Number(raw.price) || 0,
//           duration: `${days}`,
//           groupSize: raw.total_seats || 0,
//           difficulty: raw.difficulty || "N/A",
//           rating: 4.7,
//           reviewCount: 0,
//           verified: true,
//           type: "Adventure",
//           startDate: raw.start_date,
//           highlights: raw.itinerary || [],
//           inclusions: raw.inclusions || [],
//           exclusions: raw.exclusions || [],
//         });

//         setTripReviews([]);
//       } catch (err) {
//         // ✅ Silently handle aborted requests
//         if (err.name === "AbortError") return;

//         console.error("Trip fetch error:", err);
//         setTrip(null);
//       } finally {
//         // ✅ Only update loading if this request wasn't replaced
//         if (!controller.signal.aborted) {
//           setLoading(false);
//         }
//       }
//     }

//     fetchTrip();

//     // ✅ Cleanup function: Abort the fetch if the component unmounts or id changes
//     return () => controller.abort();
//   }, [id]);

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
//       </div>
//     );
//   if (!trip)
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-muted-foreground">Trip not found</p>
//       </div>
//     );

//   return (
//     <Suspense fallback={<div className="p-8">Loading trip...</div>}>
//       <section className="relative pt-24">
//         <div className="container-premium">
//           <Link
//             href="/trips"
//             className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground mb-4"
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Back to Trips
//           </Link>

//           <div className="grid lg:grid-cols-2 gap-8">
//             <div className="space-y-4">
//               <div className="aspect-4/3 rounded-2xl overflow-hidden">
//                 {activeImage ? (
//                   <img
//                     src={activeImage}
//                     alt={trip.name}
//                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                   />
//                 ) : null}

//                 <div
//                   className={`w-full h-full items-center justify-center bg-gray-100 ${
//                     trip.image ? "hidden" : "flex"
//                   }`}
//                 >
//                   <ImageIcon className="w-12 h-12 text-gray-400" />
//                 </div>
//               </div>
//               {trip.images?.length > 0 && (
//                 <div className="grid grid-cols-4 gap-2">
//                   {trip.images?.map((img, i) => (
//                     <div
//                       key={i}
//                       className="aspect-square rounded-lg overflow-hidden bg-muted"
//                       onClick={() => setActiveImage(img)}
//                     >
//                       <img
//                         src={img}
//                         alt={trip.name}
//                         className={`w-full h-full object-cover cursor-pointer transition-opacity ${
//                           activeImage === img
//                             ? "opacity-100 ring-2 ring-primary"
//                             : "opacity-70 hover:opacity-100"
//                         }`}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div>
//               <div className="flex items-center gap-3 mb-4">
//                 {trip.verified && (
//                   <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-body-sm font-medium">
//                     <Shield className="w-4 h-4" />
//                     Verified Trip
//                   </span>
//                 )}
//                 <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-body-sm font-medium">
//                   {trip.type}
//                 </span>
//               </div>

//               <h1 className="font-display text-display text-foreground mb-2">
//                 {trip.name}
//               </h1>

//               <div className="flex items-center gap-2 text-body text-muted-foreground mb-4">
//                 <MapPin className="w-5 h-5" />
//                 {locationMap[trip.destination_id]?.name || "Loading..."},{" "}
//                 {locationMap[trip.destination_id]?.region || ""}
//               </div>

//               {/* <div className="flex items-center gap-4 mb-6">
//                 <div className="flex items-center gap-1">
//                   <Star className="w-5 h-5 fill-accent text-accent" />
//                   <span className="font-semibold text-foreground">
//                     {trip.rating}
//                   </span>
//                   <span className="text-muted-foreground">
//                     ({trip.reviewCount} reviews)
//                   </span>
//                 </div>
//               </div> */}

//               <div className="card-premium p-4 mb-6">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
//                     <Shield className="w-6 h-6 text-primary" />
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-body-sm text-muted-foreground">
//                       Organized by
//                     </p>
//                     <p className="font-semibold text-foreground">
//                       {trip.provider.name}
//                     </p>
//                   </div>
//                   {/* <div className="text-right">
//                     <div className="flex items-center gap-1">
//                       <Star className="w-4 h-4 fill-accent text-accent" />
//                       <span className="font-medium">
//                         {trip.provider.rating}
//                       </span>
//                     </div>
//                     <p className="text-body-sm text-muted-foreground">
//                       {trip.provider.reviewCount} reviews
//                     </p>
//                   </div> */}
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <div className="card-premium p-4">
//                   <Calendar className="w-5 h-5 text-primary mb-2" />
//                   <p className="text-body-sm text-muted-foreground">Duration</p>
//                   <p className="font-semibold text-foreground">
//                     {trip.duration} days
//                   </p>
//                 </div>
//                 <div className="card-premium p-4">
//                   <Users className="w-5 h-5 text-primary mb-2" />
//                   <p className="text-body-sm text-muted-foreground">
//                     Group Size
//                   </p>
//                   <p className="font-semibold text-foreground">
//                     {trip.groupSize} people
//                   </p>
//                 </div>
//                 <div className="card-premium p-4">
//                   <Clock className="w-5 h-5 text-primary mb-2" />
//                   <p className="text-body-sm text-muted-foreground">
//                     Start Date
//                   </p>
//                   <p className="font-semibold text-foreground">
//                     {new Date(trip.startDate).toLocaleDateString("en-IN")}
//                   </p>
//                 </div>
//                 <div className="card-premium p-4">
//                   <MapPin className="w-5 h-5 text-primary mb-2" />
//                   <p className="text-body-sm text-muted-foreground">
//                     Difficulty
//                   </p>
//                   <p className="font-semibold text-foreground">
//                     {trip.difficulty}
//                   </p>
//                 </div>
//               </div>

//               <div className="card-premium p-6 bg-primary/5 border-primary/20">
//                 <div className="flex items-end justify-between mb-4">
//                   <div>
//                     <p className="text-body-sm text-muted-foreground">
//                       Starting from
//                     </p>
//                     <p className="font-display text-display text-primary">
//                       ₹{trip.priceFrom.toLocaleString()}
//                     </p>
//                     <p className="text-body-sm text-muted-foreground">
//                       per person
//                     </p>
//                   </div>
//                   {/* <div className="flex items-center gap-2">
//                     <Button variant="outline" size="icon">
//                       <Heart className="w-5 h-5" />
//                     </Button>
//                     <Button variant="outline" size="icon">
//                       <Share2 className="w-5 h-5" />
//                     </Button>
//                   </div> */}
//                 </div>
//                 {/* <Button className="btn-primary w-full text-body py-6">
//                   Book This Trip
//                 </Button>
//                 <p className="text-body-sm text-muted-foreground text-center mt-3">
//                   Free cancellation up to 7 days before
//                 </p> */}
//                 <Button
//                   className="btn-primary w-full text-body py-6"
//                   onClick={() => setShowForm(true)}
//                 >
//                   Book Now
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="section bg-background">
//         <div className="container-premium">
//           <Tabs defaultValue="overview" className="w-full">
//             <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent mb-8">
//               <TabsTrigger
//                 value="overview"
//                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
//               >
//                 Overview
//               </TabsTrigger>
//               <TabsTrigger
//                 value="itinerary"
//                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
//               >
//                 Itinerary
//               </TabsTrigger>
//               <TabsTrigger
//                 value="inclusions"
//                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
//               >
//                 Inclusions
//               </TabsTrigger>
//               {/* <TabsTrigger
//                 value="reviews"
//                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
//               >
//                 Reviews ({trip.reviewCount})
//               </TabsTrigger> */}
//             </TabsList>

//             <TabsContent value="overview" className="mt-0">
//               <div className="grid lg:grid-cols-3 gap-8">
//                 <div className="lg:col-span-2 space-y-8">
//                   {/* <div>
//                     <h3 className="font-display text-heading-lg text-foreground mb-4">
//                       Highlights
//                     </h3>
//                     <ul className="grid sm:grid-cols-2 gap-3">
//                       {trip.highlights.map((highlight, i) => (
//                         <li
//                           key={i}
//                           className="flex items-center gap-3 text-body"
//                         >
//                           <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
//                             <Check className="w-4 h-4 text-primary" />
//                           </span>
//                           {highlight}
//                         </li>
//                       ))}
//                     </ul>
//                   </div> */}

//                   <div>
//                     <h3 className="font-display text-heading-lg text-foreground mb-4">
//                       About This Trip
//                     </h3>
//                     <p className="text-body text-muted-foreground leading-relaxed">
//                       {trip.description}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-6">
//                   <div className="card-premium p-6">
//                     <h4 className="font-semibold text-foreground mb-4">
//                       Trip Details
//                     </h4>
//                     <dl className="space-y-3 text-body-sm">
//                       <div className="flex justify-between">
//                         <dt className="text-muted-foreground">Source</dt>
//                         <dd className="font-medium">
//                           {locationMap[trip.source_id]?.name || "-"}
//                         </dd>
//                       </div>
//                       <div className="flex justify-between">
//                         <dt className="text-muted-foreground">Destination</dt>
//                         <dd className="font-medium">
//                           {locationMap[trip.destination_id]?.name || "-"}
//                         </dd>
//                       </div>
//                       <div className="flex justify-between">
//                         <dt className="text-muted-foreground">Region</dt>
//                         <dd className="font-medium">
//                           {locationMap[trip.destination_id]?.region || "-"}
//                         </dd>
//                       </div>
//                       <div className="flex justify-between">
//                         <dt className="text-muted-foreground">Duration</dt>
//                         <dd className="font-medium">{trip.duration} days</dd>
//                       </div>
//                       <div className="flex justify-between">
//                         <dt className="text-muted-foreground">Difficulty</dt>
//                         <dd className="font-medium">{trip.difficulty}</dd>
//                       </div>
//                       <div className="flex justify-between">
//                         <dt className="text-muted-foreground">Group Size</dt>
//                         <dd className="font-medium">{trip.groupSize}</dd>
//                       </div>
//                     </dl>
//                   </div>
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="itinerary" className="mt-0">
//               <div className="max-w-3xl">
//                 <h3 className="font-display text-heading-lg text-foreground mb-6">
//                   Day-by-Day Itinerary
//                 </h3>
//                 <div className="space-y-6">
//                   {trip.highlights.map((dayItem, index) => (
//                     <div key={index} className="flex gap-4">
//                       {/* Day Number */}
//                       <h4 className="font-semibold h-fit p-1.5 rounded-sm mb-2 bg-primary text-primary-foreground">
//                         Day {dayItem.day}
//                       </h4>

//                       {/* Activities */}
//                       <div className="flex-1 card-premium py-3 px-4">
//                         {/* <h4 className="font-semibold w-fit p-1.5 rounded-sm mb-2 bg-primary text-primary-foreground">
//                           Day {dayItem.day}
//                         </h4> */}

//                         <ul className="space-y-2">
//                           {dayItem.activities.map((activity, i) => (
//                             <li
//                               key={i}
//                               className="flex items-start gap-2 text-body text-muted-foreground"
//                             >
//                               <span className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
//                               {activity}
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="inclusions" className="mt-0">
//               <div className="grid md:grid-cols-2 gap-8">
//                 <div>
//                   <h3 className="font-display text-heading-lg text-foreground mb-6 flex items-center gap-2">
//                     <Check className="w-6 h-6 text-success" />
//                     What&apos;s Included
//                   </h3>
//                   <ul className="space-y-3">
//                     {trip.inclusions.map((item, i) => (
//                       <li key={i} className="flex items-center gap-3 text-body">
//                         <Check className="w-5 h-5 text-success shrink-0" />
//                         {item}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div>
//                   <h3 className="font-display text-heading-lg text-foreground mb-6 flex items-center gap-2">
//                     <X className="w-6 h-6 text-error" />
//                     What&apos;s Not Included
//                   </h3>
//                   <ul className="space-y-3">
//                     {trip.exclusions.map((item, i) => (
//                       <li
//                         key={i}
//                         className="flex items-center gap-3 text-body text-muted-foreground"
//                       >
//                         <X className="w-5 h-5 text-error shrink-0" />
//                         {item}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </TabsContent>

//             {/* <TabsContent value="reviews" className="mt-0">
//               <div className="max-w-3xl">
//                 <div className="flex items-center gap-6 mb-8">
//                   <div className="text-center">
//                     <p className="font-display text-display-lg text-primary">
//                       {trip.rating}
//                     </p>
//                     <div className="flex items-center gap-1 justify-center mb-1">
//                       {Array.from({ length: 5 }).map((_, i) => (
//                         <Star
//                           key={i}
//                           className={`w-5 h-5 ${
//                             i < Math.floor(trip.rating)
//                               ? "fill-accent text-accent"
//                               : "text-muted"
//                           }`}
//                         />
//                       ))}
//                     </div>
//                     <p className="text-body-sm text-muted-foreground">
//                       {trip.reviewCount} reviews
//                     </p>
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 text-body-sm mb-1">
//                       <span className="w-8">5★</span>
//                       <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-accent rounded-full"
//                           style={{ width: "70%" }}
//                         />
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2 text-body-sm mb-1">
//                       <span className="w-8">4★</span>
//                       <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-accent rounded-full"
//                           style={{ width: "20%" }}
//                         />
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2 text-body-sm">
//                       <span className="w-8">3★</span>
//                       <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-accent rounded-full"
//                           style={{ width: "10%" }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-6">
//                   {tripReviews.length > 0 ? (
//                     tripReviews.map((review) => (
//                       <div key={review.id} className="card-premium p-6">
//                         <div className="flex items-start gap-4 mb-4">
//                           <img
//                             src={review.userImage}
//                             alt={review.userName}
//                             className="w-12 h-12 rounded-full object-cover"
//                           />
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-1">
//                               <h4 className="font-semibold text-foreground">
//                                 {review.userName}
//                               </h4>
//                               {review.verified && (
//                                 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs">
//                                   <Shield className="w-3 h-3" />
//                                   Verified
//                                 </span>
//                               )}
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <div className="flex items-center gap-0.5">
//                                 {Array.from({ length: review.rating }).map(
//                                   (_, i) => (
//                                     <Star
//                                       key={i}
//                                       className="w-4 h-4 fill-accent text-accent"
//                                     />
//                                   ),
//                                 )}
//                               </div>
//                               <span className="text-body-sm text-muted-foreground">
//                                 {new Date(review.date).toLocaleDateString(
//                                   "en-IN",
//                                   { month: "short", year: "numeric" },
//                                 )}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                         <h5 className="font-medium text-foreground mb-2">
//                           {review.title}
//                         </h5>
//                         <p className="text-body text-muted-foreground mb-4">
//                           {review.content}
//                         </p>
//                         <button className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground">
//                           <ThumbsUp className="w-4 h-4" />
//                           Helpful ({review.helpful})
//                         </button>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-center py-8">
//                       <p className="text-muted-foreground">
//                         No reviews yet for this trip.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </TabsContent> */}
//           </Tabs>
//         </div>
//       </section>

//       {showForm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
//             {/* Close Button */}
//             <button
//               onClick={() => setShowForm(false)}
//               className="absolute top-3 right-3"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             <h3 className="text-lg font-semibold mb-4">Enter your details</h3>

//             <Input
//               type="text"
//               placeholder="Name"
//               className="w-full border rounded-md p-2 mb-3 text-base"
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData({ ...formData, name: e.target.value })
//               }
//             />

//             {/* <Input
//               type="tel"
//               placeholder="Phone Number"
//               className="w-full border rounded-md p-2 mb-3"
//               value={formData.phone_number}
//               onChange={(e) =>
//                 setFormData({ ...formData, phone_number: e.target.value })
//               }
//             /> */}
//             <div className="relative">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
//                 +91
//               </span>
//               <Input
//                 type="tel"
//                 id="phone"
//                 className="w-full border rounded-md p-2 mb-3 pl-10"
//                 value={formData.phone_number}
//                 onChange={(e) => {
//                   const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
//                   setFormData({ ...formData, phone_number: digits });
//                 }}
//                 // onChange={(e) =>
//                 //   setFormData({ ...formData, phone_number: e.target.value })
//                 // }
//                 placeholder="98765 43210"
//                 // className={`pl-12 text-sm ${errors.phone ? "border-red-500" : ""}`}
//                 // required
//               />
//             </div>

//             <Input
//               type="text"
//               value={trip.provider.name}
//               disabled
//               className="w-full border rounded-md p-2 mb-3 cursor-not-allowed"
//             />

//             <Input
//               type="text"
//               value={trip.name}
//               disabled
//               className="w-full border rounded-md p-2 mb-3 cursor-not-allowed"
//             />

//             <textarea
//               placeholder="Remarks (optional)"
//               className="w-full border rounded-md p-2 mb-4"
//               value={formData.remark}
//               onChange={(e) =>
//                 setFormData({ ...formData, remark: e.target.value })
//               }
//             />

//             <Button onClick={handleSubmit} className="w-full">
//               Continue to WhatsApp
//             </Button>
//           </div>
//         </div>
//       )}
//     </Suspense>
//   );
// }

// export default TripPage;
