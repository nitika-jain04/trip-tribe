"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

import {
  MapPin,
  Shield,
  Calendar,
  Users,
  Clock,
  ChevronLeft,
  Loader2,
  ImageIcon,
  Check,
  X,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import useLocations from "@/app/hooks/use-locations";
import { Button } from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import { useToast } from "@/app/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function TripPage() {
  const { id } = useParams();
  const { locationMap } = useLocations();
  const { toast } = useToast();

  const [trip, setTrip] = useState(null);
  const [tripReviews, setTripReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    message: "",
    email: "",
    subject: "Book Trip",
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone_number) {
      toast({
        title: "Form",
        description: "Please fill required fields",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;

    if (!phoneRegex.test(formData.phone_number.trim())) {
      // newErrors.phone = "Enter valid phone number";
      toast({
        title: "Phone Number",
        description: "Enter valid phone number",
        variant: "destructive",
      });
      return;
    }

    const currentUrl = window.location.href;

    try {
      // ✅ 1. Call Enquiry API
      await fetch(`${BASE_URL}/api/${API_VERSION}/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: "trip.provider.email",
          phone_number: formData.phone_number.startsWith("+91")
            ? formData.phone_number
            : `+91${formData.phone_number}`,
          inquiry_type: "TRIP",
          trip_id: trip.id,
          subject: "Book Trip",
          message: formData?.remark || `User is interested in ${trip.name}`,
        }),
      });

      // ✅ 2. Prepare WhatsApp message
      const startDate = new Date(trip.startDate).toLocaleDateString("en-IN");

      const message = `Hi, I wanted to confirm the availability for the following trip:

*Trip Details*
• *Trip:* ${trip.name}
• *Operator:* ${trip.provider.name}
• *Start Date:* ${startDate}

*View details for ${trip.name}:*
${currentUrl}`;

      const whatsappNumber = "917007755306"; // with country code

      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message,
      )}`;

      // ✅ 3. Redirect to WhatsApp (more reliable on mobile than window.open)
      window.location.href = url;

      setShowForm(false);
    } catch (error) {
      console.error("Enquiry error:", error);
      toast({
        title: "Form",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!id) return;

    // ✅ Initialize AbortController to manage this specific request
    const controller = new AbortController();

    async function fetchTrip() {
      try {
        setLoading(true);

        // Fetch trip details
        const res = await fetch(`${BASE_URL}/api/${API_VERSION}/trips/${id}`, {
          signal: controller.signal, // ✅ Attach signal to fetch
        });
        const data = await res.json();

        if (!data?.success) {
          setTrip(null);
          return;
        }

        const raw = Array.isArray(data.result?.trips)
          ? data.result.trips[0]
          : data.result;
        if (!raw) return setTrip(null);

        const start = new Date(raw.start_date);
        const end = new Date(raw.end_date);
        const days = Math.max(
          1,
          Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
        );

        setActiveImage(raw.images?.[0]);

        setTrip({
          id: raw.id,
          name: raw.name,
          description: raw.description || "",
          images: raw.images?.length ? raw.images : [],
          source_id: raw.source_id,
          destination_id: raw.destination_id,
          provider: {
            name: raw.operator.name || "Unknown",
            rating: 4.8,
            reviewCount: 0,
          },
          priceFrom: Number(raw.price) || 0,
          duration: `${days}`,
          groupSize: raw.total_seats || 0,
          difficulty: raw.difficulty || "N/A",
          rating: 4.7,
          reviewCount: 0,
          verified: true,
          type: "Adventure",
          startDate: raw.start_date,
          highlights: raw.itinerary || [],
          inclusions: raw.inclusions || [],
          exclusions: raw.exclusions || [],
        });

        setTripReviews([]);
      } catch (err) {
        // ✅ Silently handle aborted requests
        if (err.name === "AbortError") return;

        console.error("Trip fetch error:", err);
        setTrip(null);
      } finally {
        // ✅ Only update loading if this request wasn't replaced
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchTrip();

    // ✅ Cleanup function: Abort the fetch if the component unmounts or id changes
    return () => controller.abort();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
      </div>
    );
  if (!trip)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Trip not found</p>
      </div>
    );

  return (
    <Suspense fallback={<div className="p-8">Loading trip...</div>}>
      <section className="relative pt-24">
        <div className="container-premium">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Trips
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-4/3 rounded-2xl overflow-hidden">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={trip.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : null}

                <div
                  className={`w-full h-full items-center justify-center bg-gray-100 ${
                    trip.image ? "hidden" : "flex"
                  }`}
                >
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              {trip.images?.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {trip.images?.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg overflow-hidden bg-muted"
                      onClick={() => setActiveImage(img)}
                    >
                      <img
                        src={img}
                        alt={trip.name}
                        className={`w-full h-full object-cover cursor-pointer transition-opacity ${
                          activeImage === img
                            ? "opacity-100 ring-2 ring-primary"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                {trip.verified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-body-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Verified Trip
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-body-sm font-medium">
                  {trip.type}
                </span>
              </div>

              <h1 className="font-display text-display text-foreground mb-2">
                {trip.name}
              </h1>

              <div className="flex items-center gap-2 text-body text-muted-foreground mb-4">
                <MapPin className="w-5 h-5" />
                {locationMap[trip.destination_id]?.name || "Loading..."},{" "}
                {locationMap[trip.destination_id]?.region || ""}
              </div>

              {/* <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">
                    {trip.rating}
                  </span>
                  <span className="text-muted-foreground">
                    ({trip.reviewCount} reviews)
                  </span>
                </div>
              </div> */}

              <div className="card-premium p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body-sm text-muted-foreground">
                      Organized by
                    </p>
                    <p className="font-semibold text-foreground">
                      {trip.provider.name}
                    </p>
                  </div>
                  {/* <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="font-medium">
                        {trip.provider.rating}
                      </span>
                    </div>
                    <p className="text-body-sm text-muted-foreground">
                      {trip.provider.reviewCount} reviews
                    </p>
                  </div> */}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="card-premium p-4">
                  <Calendar className="w-5 h-5 text-primary mb-2" />
                  <p className="text-body-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold text-foreground">
                    {trip.duration} days
                  </p>
                </div>
                <div className="card-premium p-4">
                  <Users className="w-5 h-5 text-primary mb-2" />
                  <p className="text-body-sm text-muted-foreground">
                    Group Size
                  </p>
                  <p className="font-semibold text-foreground">
                    {trip.groupSize} people
                  </p>
                </div>
                <div className="card-premium p-4">
                  <Clock className="w-5 h-5 text-primary mb-2" />
                  <p className="text-body-sm text-muted-foreground">
                    Start Date
                  </p>
                  <p className="font-semibold text-foreground">
                    {new Date(trip.startDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="card-premium p-4">
                  <MapPin className="w-5 h-5 text-primary mb-2" />
                  <p className="text-body-sm text-muted-foreground">
                    Difficulty
                  </p>
                  <p className="font-semibold text-foreground">
                    {trip.difficulty}
                  </p>
                </div>
              </div>

              <div className="card-premium p-6 bg-primary/5 border-primary/20">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-body-sm text-muted-foreground">
                      Starting from
                    </p>
                    <p className="font-display text-display text-primary">
                      ₹{trip.priceFrom.toLocaleString()}
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      per person
                    </p>
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div> */}
                </div>
                {/* <Button className="btn-primary w-full text-body py-6">
                  Book This Trip
                </Button>
                <p className="text-body-sm text-muted-foreground text-center mt-3">
                  Free cancellation up to 7 days before
                </p> */}
                <Button
                  className="btn-primary w-full text-body py-6"
                  onClick={() => setShowForm(true)}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container-premium">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent mb-8">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="itinerary"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                Itinerary
              </TabsTrigger>
              <TabsTrigger
                value="inclusions"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                Inclusions
              </TabsTrigger>
              {/* <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                Reviews ({trip.reviewCount})
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* <div>
                    <h3 className="font-display text-heading-lg text-foreground mb-4">
                      Highlights
                    </h3>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {trip.highlights.map((highlight, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-body"
                        >
                          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary" />
                          </span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div> */}

                  <div>
                    <h3 className="font-display text-heading-lg text-foreground mb-4">
                      About This Trip
                    </h3>
                    <p className="text-body text-muted-foreground leading-relaxed">
                      {trip.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="card-premium p-6">
                    <h4 className="font-semibold text-foreground mb-4">
                      Trip Details
                    </h4>
                    <dl className="space-y-3 text-body-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Source</dt>
                        <dd className="font-medium">
                          {locationMap[trip.source_id]?.name || "-"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Destination</dt>
                        <dd className="font-medium">
                          {locationMap[trip.destination_id]?.name || "-"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Region</dt>
                        <dd className="font-medium">
                          {locationMap[trip.destination_id]?.region || "-"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Duration</dt>
                        <dd className="font-medium">{trip.duration} days</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Difficulty</dt>
                        <dd className="font-medium">{trip.difficulty}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Group Size</dt>
                        <dd className="font-medium">{trip.groupSize}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="itinerary" className="mt-0">
              <div className="max-w-3xl">
                <h3 className="font-display text-heading-lg text-foreground mb-6">
                  Day-by-Day Itinerary
                </h3>
                <div className="space-y-6">
                  {trip.highlights.map((dayItem, index) => (
                    <div key={index} className="flex gap-4">
                      {/* Day Number */}
                      <h4 className="font-semibold h-fit p-1.5 rounded-sm mb-2 bg-primary text-primary-foreground">
                        Day {dayItem.day}
                      </h4>

                      {/* Activities */}
                      <div className="flex-1 card-premium py-3 px-4">
                        {/* <h4 className="font-semibold w-fit p-1.5 rounded-sm mb-2 bg-primary text-primary-foreground">
                          Day {dayItem.day}
                        </h4> */}

                        <ul className="space-y-2">
                          {dayItem.activities.map((activity, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-body text-muted-foreground"
                            >
                              <span className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inclusions" className="mt-0">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display text-heading-lg text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-success" />
                    What&apos;s Included
                  </h3>
                  <ul className="space-y-3">
                    {trip.inclusions.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-body">
                        <Check className="w-5 h-5 text-success shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-display text-heading-lg text-foreground mb-6 flex items-center gap-2">
                    <X className="w-6 h-6 text-error" />
                    What&apos;s Not Included
                  </h3>
                  <ul className="space-y-3">
                    {trip.exclusions.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-body text-muted-foreground"
                      >
                        <X className="w-5 h-5 text-error shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* <TabsContent value="reviews" className="mt-0">
              <div className="max-w-3xl">
                <div className="flex items-center gap-6 mb-8">
                  <div className="text-center">
                    <p className="font-display text-display-lg text-primary">
                      {trip.rating}
                    </p>
                    <div className="flex items-center gap-1 justify-center mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(trip.rating)
                              ? "fill-accent text-accent"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-body-sm text-muted-foreground">
                      {trip.reviewCount} reviews
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-body-sm mb-1">
                      <span className="w-8">5★</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: "70%" }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-body-sm mb-1">
                      <span className="w-8">4★</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: "20%" }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-body-sm">
                      <span className="w-8">3★</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: "10%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {tripReviews.length > 0 ? (
                    tripReviews.map((review) => (
                      <div key={review.id} className="card-premium p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <img
                            src={review.userImage}
                            alt={review.userName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">
                                {review.userName}
                              </h4>
                              {review.verified && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs">
                                  <Shield className="w-3 h-3" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: review.rating }).map(
                                  (_, i) => (
                                    <Star
                                      key={i}
                                      className="w-4 h-4 fill-accent text-accent"
                                    />
                                  ),
                                )}
                              </div>
                              <span className="text-body-sm text-muted-foreground">
                                {new Date(review.date).toLocaleDateString(
                                  "en-IN",
                                  { month: "short", year: "numeric" },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <h5 className="font-medium text-foreground mb-2">
                          {review.title}
                        </h5>
                        <p className="text-body text-muted-foreground mb-4">
                          {review.content}
                        </p>
                        <button className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground">
                          <ThumbsUp className="w-4 h-4" />
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No reviews yet for this trip.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent> */}
          </Tabs>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-background w-full max-w-sm rounded-xl shadow-xl relative overflow-hidden border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="px-5 pt-5 pb-2">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Booking Request
              </h3>
            </div>

            {/* Content */}
            <div className="px-5 pb-5 overflow-y-auto space-y-3">
              <Input
                type="text"
                placeholder="Full Name"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground text-sm font-medium border-r border-border pr-2 z-10 select-none">
                  +91
                </span>
                <Input
                  type="tel"
                  id="phone"
                  className="w-full pl-14 pr-3 h-10 rounded-lg border border-input bg-background py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-medium tracking-wide transition-shadow"
                  value={formData.phone_number}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, phone_number: digits });
                  }}
                  placeholder="98765 43210"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  value={trip.provider.name}
                  disabled
                  className="w-full h-9 rounded-lg border border-input bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground truncate cursor-not-allowed"
                />
                <Input
                  type="text"
                  value={trip.name}
                  disabled
                  className="w-full h-9 rounded-lg border border-input bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground truncate cursor-not-allowed"
                />
              </div>

              <textarea
                placeholder="Any special requests? (Optional)"
                className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-shadow"
                value={formData.remark}
                onChange={(e) =>
                  setFormData({ ...formData, remark: e.target.value })
                }
              />

              <Button 
                onClick={handleSubmit} 
                className="w-full btn-primary h-11 mt-1 text-sm font-semibold shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-[0.98]"
              >
                Send Request
              </Button>
              
              {/* <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1 mt-2">
                <Shield className="w-3 h-3" />
                Secure form
              </p> */}
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
}

export default TripPage;
