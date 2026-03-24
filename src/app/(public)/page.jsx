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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const baskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
});

console.log(BASE_URL, API_VERSION);

const stats = [
  { value: "20+", label: "Curated Trips" },
  { value: "10+", label: "Verified Providers" },
  // { value: "25K+", label: "Happy Travelers" },
  // { value: "4.8", label: "Average Rating" },
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

const testimonials = [
  {
    quote:
      "TripTribe made comparing group trips so easy. I found the perfect Spiti Valley trip and the provider was amazing!",
    author: "Priya Sharma",
    role: "Solo Traveler",
    rating: 5,
  },
  {
    quote:
      "Finally, a platform where I can trust the reviews. Booked with confidence and had an incredible experience.",
    author: "Rahul Menon",
    role: "Adventure Enthusiast",
    rating: 5,
  },
  {
    quote:
      "The comparison feature saved me hours of research. Highly recommend for anyone looking for group travel.",
    author: "Ananya Patel",
    role: "Weekend Explorer",
    rating: 5,
  },
];

// Mock images for destinations (since API doesn't provide images)
const destinationImages = {
  Manali: "https://images.unsplash.com/photo-1626621341517-bfba3f99e922?w=800",
  Shimla: "https://images.unsplash.com/photo-1626621341517-bfba3f99e922?w=800",
  Udaipur: "https://images.unsplash.com/photo-1626621341517-bfba3f99e922?w=800",
  Panaji: "https://images.unsplash.com/photo-1626621341517-bfba3f99e922?w=800",
  Leh: "https://images.unsplash.com/photo-1626621341517-bfba3f99e922?w=800",
  Rishikesh:
    "https://images.unsplash.com/photo-1626621341517-bfba3f99e922?w=800",
  Darjeeling:
    "https://images.unsplash.com/photo-1626621341517-bfba3f99e922?w=800",
  Coorg: "https://images.unsplash.com/photo-1626621341517-bfba3f99e922?w=800",
  Munnar: "https://images.unsplash.com/photo-1626621341517-bfba3f99e922?w=800",
};

export default function Page() {
  const router = useRouter();

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [searchDates, setSearchDates] = useState("");
  const [operators, setOperators] = useState([]);
  const [trips, setTrips] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingOperators, setLoadingOperators] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState(null);

  async function getLocations() {
    try {
      setLoadingLocations(true);
      setError(null);

      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/trips?group_by=location`,
        {
          method: "GET",
        },
      );

      if (!res.ok) throw new Error("Failed to fetch destinations");

      const data = await res.json();

      if (!data.success) return;

      const groups = data.result?.groups || [];

      const locationCache = {};

      const fetchLocation = async (id) => {
        if (!id) return { region: "Unknown" };
        if (locationCache[id]) return locationCache[id];

        try {
          const res = await fetch(
            `${BASE_URL}/api/${API_VERSION}/locations/${id}`,
          );

          const data = await res.json();

          const locationData = {
            region: data?.result?.region || "Unknown",
          };

          locationCache[id] = locationData;
          return locationData;
        } catch {
          return { region: "Unknown" };
        }
      };

      const transformedLocations = await Promise.all(
        groups.map(async (group) => {
          const firstTrip = group.trips?.[0];

          const locationData = await fetchLocation(firstTrip?.destination_id);

          return {
            id: firstTrip?.destination_id || group.location_name,
            name: group.location_name,
            region: locationData.region,
            type: "destination",
            trips: group.total_trips,
            image:
              firstTrip?.images?.[0] ||
              destinationImages[group.location_name] ||
              "/loginimg.jpeg",
          };
        }),
      );

      setLocations(transformedLocations);
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setError("Failed to load destinations");
    } finally {
      setLoadingLocations(false);
    }
  }

  async function getActiveOperators() {
    try {
      setLoadingOperators(true);
      setError(null);

      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators?page=1&limit=10`,
        {
          method: "GET",
        },
      );

      if (!res.ok) throw new Error("Failed to fetch operators");

      const data = await res.json();
      console.log("active operators", data.result?.operators);

      if (data.success) {
        setOperators(data.result?.operators || []);
      }
    } catch (err) {
      console.error("Error fetching operators:", err);
      setError("Failed to load operators");
    } finally {
      setLoadingOperators(false);
    }
  }

  async function getPublishedTrips() {
    try {
      setLoadingTrips(true);
      setError(null);

      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/trips?page=1&limit=10`,
      );

      if (!res.ok) throw new Error("Failed to fetch trips");

      const data = await res.json();
      if (!data.success) return;

      const rawTrips = data.result?.trips || [];

      const operatorIds = [...new Set(rawTrips.map((t) => t.operator_id))];
      const locationIds = [
        ...new Set(
          rawTrips.flatMap((t) =>
            [t.source_id, t.destination_id].filter(Boolean),
          ),
        ),
      ];

      const operators = await Promise.all(
        operatorIds.map(async (id) => {
          try {
            const res = await fetch(
              `${BASE_URL}/api/${API_VERSION}/operators/${id}`,
            );
            const data = await res.json();
            return [id, data?.result?.name || "Unknown"];
          } catch {
            return [id, "Unknown"];
          }
        }),
      );

      const operatorMap = Object.fromEntries(operators);

      /* -----------------------------
       fetch locations in parallel
    ------------------------------ */

      const locations = await Promise.all(
        locationIds.map(async (id) => {
          try {
            const res = await fetch(
              `${BASE_URL}/api/${API_VERSION}/locations/${id}`,
            );
            const data = await res.json();

            return [
              id,
              {
                name: data?.result?.name || "Unknown",
                region: data?.result?.region || "Unknown",
              },
            ];
          } catch {
            return [id, { name: "Unknown", region: "Unknown" }];
          }
        }),
      );

      const locationMap = Object.fromEntries(locations);

      /* -----------------------------
       transform trips
    ------------------------------ */

      const enrichedTrips = rawTrips.map((trip) => {
        const source = locationMap[trip.source_id] || {};
        const destination = locationMap[trip.destination_id] || {};

        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);

        const durationDays =
          Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        return {
          id: trip.id,
          name: trip.name,

          images: trip.images?.length ? trip.images : ["/loginimg.jpeg"],

          destination: destination.name,
          region: destination.region,

          provider: operatorMap[trip.operator_id] || "Unknown",

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
      });

      setTrips(enrichedTrips);
    } catch (err) {
      console.error("Failed to get trips", err);
      setError("Failed to load trips");
    } finally {
      setLoadingTrips(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchDestination) params.set("destination", searchDestination);
    if (searchDates) params.set("dates", searchDates);
    router.push(`/trips?${params.toString()}`);
  };

  useEffect(() => {
    getLocations();
    getActiveOperators();
    getPublishedTrips();
  }, []);

  // Create datalist options from locations
  const locationNames = locations.map((loc) => loc.name);

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
              <div className="bg-background/95 backdrop-blur-lg rounded-2xl p-3 md:p-4 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Where do you want to go?"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      className="pl-12 h-14 rounded-xl border-border bg-muted/50 text-body text-foreground"
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
                    {/* <Input
                      type="date"
                      placeholder="When? (optional)"
                      value={searchDates}
                      onChange={(e) => setSearchDates(e.target.value)}
                      className="pl-12 h-14 rounded-xl border-border bg-muted/50 text-body text-foreground"
                    /> */}
                    <Input
                      type={searchDates ? "date" : "text"}
                      placeholder="When? (optional)"
                      value={searchDates}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                      }}
                      onChange={(e) => setSearchDates(e.target.value)}
                      className="pl-12 h-14 rounded-xl border-border bg-muted/50 text-body text-foreground"
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

          {/* Loading State for Trips */}
          {loadingTrips && (
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

          {/* Error State for Trips */}
          {!loadingTrips && error && (
            <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 font-medium">Failed to load trips</p>
              <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
              <button
                onClick={getPublishedTrips}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Empty State for Trips */}
          {!loadingTrips && !error && trips.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No trips available</p>
              <p className="text-sm text-gray-400 mt-1">
                Check back soon for new adventures
              </p>
            </div>
          )}

          {/* Trips Grid */}
          {!loadingTrips && !error && trips.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.slice(0, 3).map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trip/${trip.id}`}
                  className="card-premium overflow-hidden group"
                >
                  <div className="aspect-16/10 relative overflow-hidden bg-gray-100">
                    {trip.images?.[0] ? (
                      <img
                        src={trip.images[0]}
                        alt={trip.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "/loginimg.jpeg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
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
                      {/* <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="text-body-sm font-medium">
                          {trip.rating}4.5
                        </span>
                        <span className="text-body-sm text-muted-foreground">
                          ({trip.reviewCount})12
                        </span>
                      </div> */}
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

          {/* Loading State for Locations */}
          {loadingLocations && (
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

          {/* Error State for Locations */}
          {!loadingLocations && error && (
            <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 font-medium">
                Failed to load destinations
              </p>
              <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
              <button
                onClick={getLocations}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Empty State for Locations */}
          {!loadingLocations && !error && locations.length === 0 && (
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
          {!loadingLocations && !error && locations.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.slice(0, 6).map((location) => (
                <Link
                  key={location.name}
                  href={`/trips?location_type=destination}`}
                  className="group relative aspect-4/3 rounded-2xl overflow-hidden"
                >
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-110"
                    // onError={(e) => {
                    //   e.currentTarget.src = "/loginimg.jpeg";
                    // }}
                  />
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

      {/* Testimonials */}
      {/* <section className="section bg-foreground text-background">
        <div className="container-premium">
        <div className="text-center max-w-3xl mx-auto mb-16">
        <p className="text-body-sm font-medium text-primary uppercase tracking-wider mb-4">
        Testimonials
        </p>
        <h2 className="font-display text-display text-background mb-6">
        Trusted by Travelers
        </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-background/5 backdrop-blur-sm rounded-2xl p-8 border border-background/10"
                >
                <Quote className="w-10 h-10 text-primary/50 mb-4" />
                <p className="text-body-lg text-background/90 mb-6">
                &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                  </div>
                  <div>
                  <p className="font-semibold text-background">
                  {testimonial.author}
                  </p>
                  <p className="text-body-sm text-background/60">
                  {testimonial.role}
                  </p>
                  </div>
                  </div>
                  ))}
                  </div>
                  </div>
      </section> */}

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

          {/* Loading State for Providers */}
          {loadingOperators && (
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
          {!loadingOperators && operators.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
              {operators.slice(0, 6).map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center gap-3 px-6 py-3 rounded-full bg-muted/50"
                >
                  <Shield className="w-5 h-5 text-success" />
                  <span className="font-medium text-foreground">
                    {provider.name}
                  </span>
                  {/* <span className="flex items-center gap-1 text-body-sm">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    {provider.rating}
                    </span> */}
                </div>
              ))}
            </div>
          )}

          {/* Empty State for Providers */}
          {!loadingOperators && operators.length === 0 && (
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
              <Link href="/blog">
                <Button className="btn-secondary text-body px-8 py-6">
                  Read Travel Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
