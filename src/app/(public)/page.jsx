"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";

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
} from "lucide-react";
import { Libre_Baskerville } from "next/font/google";
import { useToast } from "../hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const locationCache = {};
const operatorCache = {};

const baskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
});

console.log(BASE_URL, API_VERSION);

const stats = [
  { value: "20+", label: "Curated Trips" },
  { value: "10+", label: "Verified Providers" },
];

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
  const [trips, setTrips] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [error, setError] = useState(null);
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

    // Use safeFetch for all requests
    const locationsData = await safeFetch(
      `${BASE_URL}/api/${API_VERSION}/trips?group_by=location`,
    );
    const operatorsData = await safeFetch(
      `${BASE_URL}/api/${API_VERSION}/operators?page=1&limit=10`,
    );
    const tripsData = await safeFetch(
      `${BASE_URL}/api/${API_VERSION}/trips?page=1&limit=10`,
    );

    // If any fetch failed, just stop and return
    if (!locationsData || !operatorsData || !tripsData) {
      setError("Failed to load homepage data");
      setLocations([]);
      setOperators([]);
      setTrips([]);
      setLoading(false);
      return;
    }

    // Process locations
    const processedLocations = await processLocations(locationsData);

    // Process operators
    const processedOperators = operatorsData.success
      ? operatorsData.result?.operators || []
      : [];

    processedOperators.forEach((op) => {
      operatorCache[op.id] = op.name;
    });

    // Process trips with enrichment
    const processedTrips = tripsData.success
      ? await enrichTripsWithDetails(tripsData.result?.trips || [])
      : [];

    // Update state
    setLocations(processedLocations);
    setOperators(processedOperators);
    setTrips(processedTrips);
    setLoading(false);
  };

  // Process locations helper function
  const processLocations = async (locationsData) => {
    if (!locationsData.success) return [];

    const groups = locationsData.result?.groups || [];

    return Promise.all(
      groups.map(async (group) => {
        const firstTrip = group.trips?.[0];

        const locationData = await getLocation(firstTrip?.destination_id);

        return {
          id: firstTrip?.destination_id || group.location_name,
          name: group.location_name,
          region: locationData.region,
          type: "destination",
          trips: group.total_trips,
          image: firstTrip?.images?.[0] || null,
        };
      }),
    );
  };

  const enrichTripsWithDetails = async (rawTrips) => {
    if (!rawTrips.length) return [];

    return Promise.all(
      rawTrips.map(async (trip) => {
        const [source, destination, operatorName] = await Promise.all([
          getLocation(trip.source_id),
          getLocation(trip.destination_id),
          getOperator(trip.operator_id),
        ]);

        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        const durationDays =
          Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        return {
          id: trip.id,
          name: trip.name,
          images: trip.images?.length ? trip.images : [],
          destination: destination.name,
          region: destination.region,
          provider: operatorName,
          price: Number(trip.price) || 0,
          duration: `${durationDays} days`,
          groupSize: `${trip.total_seats} people`,
          difficulty:
            trip.difficulty?.charAt(0) +
              trip.difficulty?.slice(1).toLowerCase() || "Moderate",
          rating: 4.5,
          reviewCount: 0,
          verified: true,
        };
      }),
    );
  };

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

  const locationPromises = {};

  const getLocation = async (id) => {
    if (!id) return { name: "Unknown", region: "Unknown" };

    if (locationCache[id]) return locationCache[id];

    if (locationPromises[id]) return locationPromises[id];

    locationPromises[id] = fetch(
      `${BASE_URL}/api/${API_VERSION}/locations/${id}`,
    )
      .then((res) => res.json())
      .then((data) => {
        const value = {
          name: data?.result?.name || "Unknown",
          region: data?.result?.region || "Unknown",
        };
        locationCache[id] = value;
        return value;
      });

    return locationPromises[id];
  };

  const operatorPromises = {};

  const getOperator = async (id) => {
    if (!id) return "Unknown";

    if (operatorCache[id]) return operatorCache[id];

    if (operatorPromises[id]) return operatorPromises[id];

    operatorPromises[id] = fetch(
      `${BASE_URL}/api/${API_VERSION}/operators/${id}`,
    )
      .then((res) => res.json())
      .then((data) => {
        const value = data?.result?.name || "Unknown";
        operatorCache[id] = value;
        return value;
      });

    return operatorPromises[id];
  };

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
              <div className="bg-background/95 backdrop-blur-lg rounded-2xl p-3 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-1">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Where do you want to go?"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      className="pl-10 h-14 rounded-xl border-border bg-muted/50 text-body text-foreground"
                      list="destinations-list"
                    />
                    <datalist id="destinations-list">
                      {locationNames.map((name) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                  </div>
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={searchDates ? "date" : "text"}
                      placeholder="When? (optional)"
                      value={searchDates}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                      }}
                      onChange={(e) => setSearchDates(e.target.value)}
                      className="pl-10 h-14 rounded-xl border-border bg-muted/50 text-body text-foreground"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="btn-primary h-14 px-8 text-body"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-5 md:gap-6 justify-center mt-8 animate-fade-up delay-200">
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-hite">
        <div className="container-premium">
          <div className="grid grid-cols-2 justify-center items-center md:px-40">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center text-center"
              >
                <p
                  className={`text-display text-primary ${baskerville.className}`}
                >
                  {stat.value}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
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
              {trips.slice(0, 10).map((trip) => (
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
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
              {locations.slice(0, 10).map((location) => (
                <Link
                  key={location.name}
                  href={`/trips?group_by=location&location_type=destination&search=${location.name}`}
                  className="group relative aspect-4/3 rounded-2xl overflow-hidden"
                >
                  {location.image ? (
                    <img
                      src={location.image}
                      alt={location.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                      {location.name}, {location.region}
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
              {operators.slice(0, 10).map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center gap-3 px-6 py-3 rounded-full bg-muted/50"
                >
                  <Shield className="w-5 h-5 text-success" />
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
