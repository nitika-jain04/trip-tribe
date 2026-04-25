"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense, useMemo } from "react";
import {
  MapPin,
  Shield,
  Calendar,
  Users,
  Clock,
  ChevronLeft,
  ImageIcon,
  Check,
  X,
} from "lucide-react";
import { Rating } from "@/app/components/ui/rating";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import PhoneInput from "@/app/components/ui/PhoneInput";
import { useToast } from "@/app/hooks/use-toast";
import { useOnlineStatus } from "@/app/hooks/use-online-status";
import { MdOutlineVerified } from "react-icons/md";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default function TripDetailClient({ trip, locationMap }) {
  const { id } = useParams();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();

  const [activeImage, setActiveImage] = useState(trip?.images?.[0] || null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    message: "",
    email: "",
    subject: "Book Trip",
  });
  const [selectedCategory, setSelectedCategory] = useState(
    trip?.price_categories?.[0] || null,
  );
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const handlePhoneValidation = useCallback(
    (valid) => setIsPhoneValid(valid),
    [],
  );

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showForm]);

  const handleSubmit = () => {
    if (
      !formData.name.trim() ||
      !formData.phone_number.trim() ||
      !formData.email.trim()
    ) {
      toast({
        title: "Form",
        description: "Please fill required fields",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast({
        title: "Form",
        description: "Enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!isPhoneValid) {
      toast({
        title: "Invalid phone number",
        description:
          "Please enter a valid phone number for the selected country.",
        variant: "destructive",
      });
      return;
    }

    const rawNumber = trip.provider.phone_number || "";
    const whatsappNumber = rawNumber.replace(/\D/g, "");

    if (!whatsappNumber) {
      toast({
        title: "Contact Info Missing",
        description:
          "We couldn't find a contact number for this provider. Please try again later or contact support.",
        variant: "destructive",
      });
      return;
    }

    const currentUrl = window.location.href;
    const startDate = new Date(trip.startDate).toLocaleDateString("en-IN");
    const categoryInfo = selectedCategory
      ? `• *Option:* ${selectedCategory.category} (₹${Number(selectedCategory.price).toLocaleString("en-IN")})`
      : "";

    const message = `Hi, I wanted to confirm the availability for the following trip:

*Trip Details*
• *Trip:* ${trip.name}
• *Operator:* ${trip.provider.name}
• *Start Date:* ${startDate}
${categoryInfo}

*View details for ${trip.name}:*
${currentUrl}`;

    const url = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(
      message,
    )}`;

    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number,
        inquiry_type: "TRIP",
        trip_id: trip.id,
        subject: "Book Trip",
        message: `${selectedCategory ? `[Selected Option: ${selectedCategory.category}] ` : ""}${formData.message?.trim() || `User is interested in ${trip.name}`}`,
      }),
    };

    fetch(`${BASE_URL}/api/${API_VERSION}/enquiries`, payload).catch(
      (error) => {
        console.error("Enquiry error:", error);
      },
    );

    setShowForm(false);
    setFormData({
      name: "",
      phone_number: "",
      message: "",
      email: "",
      subject: "Book Trip",
    });
    setIsPhoneValid(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [trip?.id]);

  if (!trip)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-muted-foreground">Trip not found</p>
      </div>
    );

  return (
    <>
      <section className="relative pt-24">
        <div className="container-premium">
          <Link
            href="/trips"
            prefetch={false}
            className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Trips
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-14/10 rounded-2xl overflow-hidden">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={trip.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              {trip.images?.length > 1 && (
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
                    {/* <Shield className="w-4 h-4" /> */}
                    <MdOutlineVerified className="w-4 h-4" />
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
                {locationMap?.[trip.destination_id]?.name ||
                  "Destination"},{" "}
                {locationMap?.[trip.destination_id]?.region || ""}
              </div>

              <div className="card-premium p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                    {trip.provider?.logo ? (
                      <img
                        src={trip.provider.logo}
                        alt={trip.provider.name || "Provider logo"}
                        className="max-w-full max-h-full object-cover"
                      />
                    ) : (
                      <Shield className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-body-sm text-muted-foreground">
                      Organized by
                    </p>
                    <p className="font-semibold text-foreground">
                      {trip.provider.name}
                    </p>
                  </div>
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

              <div className="card-premium p-6 bg-linear-to-br from-primary/5 via-background to-background border-primary/20 shadow-glow/5">
                <div className="flex flex-col gap-6 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-body-sm text-muted-foreground">
                        Packages
                      </p>
                      {trip.price_categories?.length > 1 && (
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
                          {trip.price_categories.length} Options Available
                        </span>
                      )}
                    </div>
                    <p className="font-display text-4xl text-foreground">
                      ₹
                      {Number(
                        selectedCategory?.price || trip.priceFrom,
                      ).toLocaleString("en-IN")}
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      per person
                    </p>
                  </div>

                  {trip.price_categories?.length > 0 && (
                    <div className="space-y-3">
                      {/* <div className="grid gap-2">
                        {trip.price_categories.map((cat, i) => {
                          const isSelected =
                            selectedCategory?.category === cat.category;
                          const isStarting = cat.price === trip.priceFrom;

                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedCategory(cat)}
                              className={`group relative text-left p-3 rounded-xl border transition-all duration-300 ${
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                                  : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-body-sm font-semibold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}
                                    >
                                      {cat.category}
                                    </span>
                                    {isStarting && !isSelected && (
                                      <span className="text-[9px] font-black bg-success/10 text-success uppercase px-1.5 py-0.5 rounded-sm">
                                        Starting
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`font-display text-lg ${isSelected ? "text-primary-foreground" : "text-primary"}`}
                                >
                                  ₹{cat.price.toLocaleString("en-IN")}
                                </span>
                              </div>

                              {isSelected && (
                                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-white rounded-full p-0.5 shadow-md">
                                  <Check className="w-3 h-3 text-primary stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div> */}
                      <div className="grid gap-2">
                        {trip.price_categories.map((cat, i) => {
                          const isSelected =
                            selectedCategory?.category === cat.category;
                          const isStarting = cat.price === trip.priceFrom;

                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedCategory(cat)}
                              className={`group relative w-full max-w-full overflow-hidden text-left p-3 rounded-xl border transition-all duration-300 ${
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary shadow-lg"
                                  : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 min-w-0">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`text-body-sm font-semibold break-words whitespace-normal ${
                                        isSelected
                                          ? "text-primary-foreground"
                                          : "text-foreground"
                                      }`}
                                    >
                                      {cat.category}
                                    </span>

                                    {isStarting && !isSelected && (
                                      <span className="shrink-0 text-[9px] font-black bg-success/10 text-success uppercase px-1.5 py-0.5 rounded-sm">
                                        Starting
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span
                                  className={`shrink-0 text-right font-display text-base sm:text-lg ${
                                    isSelected
                                      ? "text-primary-foreground"
                                      : "text-primary"
                                  }`}
                                >
                                  ₹{Number(cat.price).toLocaleString("en-IN")}
                                </span>
                              </div>

                              {isSelected && (
                                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-white rounded-full p-0.5 shadow-md">
                                  <Check className="w-3 h-3 text-primary stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  className="btn-primary w-full text-body py-9 md:py-6 shadow-glow hover:shadow-glow-lg transition-all active:scale-[0.98] whitespace-normal break-words text-center"
                  onClick={() => setShowForm(true)}
                >
                  Confirm Booking with{" "}
                  {selectedCategory?.category || "Base Price"}
                </Button>
                {/* <Button
                  className="btn-primary w-full text-body py-7 shadow-glow hover:shadow-glow-lg transition-all active:scale-[0.98]"
                  onClick={() => setShowForm(true)}
                >
                  Confirm Booking with{" "}
                  {selectedCategory?.category || "Base Price"}
                </Button> */}
                {/* <p className="text-[10px] text-center text-muted-foreground mt-3">
                  No immediate payment required • Instant WhatsApp confirmation
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container-premium">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent mb-8 overflow-x-auto flex-nowrap scrollbar-hide">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 sm:px-6 py-4 whitespace-nowrap"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="itinerary"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 sm:px-6 py-4 whitespace-nowrap"
              >
                Itinerary
              </TabsTrigger>
              <TabsTrigger
                value="inclusions"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 sm:px-6 py-4 whitespace-nowrap"
              >
                Inclusions
              </TabsTrigger>
              {trip.cancellation_policy && (
                <TabsTrigger
                  value="policy"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 sm:px-6 py-4 whitespace-nowrap"
                >
                  Cancellation Policy
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
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
                          {locationMap?.[trip.source_id]?.name || "-"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Destination</dt>
                        <dd className="font-medium">
                          {locationMap?.[trip.destination_id]?.name || "-"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Region</dt>
                        <dd className="font-medium">
                          {locationMap?.[trip.destination_id]?.region || "-"}
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
                      {trip.hotelCategory > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground mt-1">
                            Hotel Category
                          </dt>
                          <dd className="font-medium -mr-1">
                            <Rating value={trip.hotelCategory} />
                          </dd>
                        </div>
                      )}
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
                  {trip.highlights?.map((dayItem, index) => (
                    <div key={index} className="flex gap-4">
                      <h4 className="font-semibold h-fit p-1.5 rounded-sm mb-2 bg-primary text-primary-foreground">
                        Day {dayItem.day}
                      </h4>
                      <div className="flex-1 card-premium py-3 px-4">
                        <ul className="space-y-2">
                          {dayItem.activities?.map((activity, i) => (
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
              <div
                className={
                  trip.exclusions?.length > 0
                    ? "grid md:grid-cols-2 gap-x-12 gap-y-8"
                    : "max-w-3xl"
                }
              >
                <div>
                  <h3 className="font-display text-heading-md sm:text-heading-lg text-foreground mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                    <Check
                      className="w-6 h-6 sm:w-7 sm:h-7 text-success"
                      strokeWidth={3}
                    />
                    What&apos;s Included
                  </h3>
                  <ul className="space-y-4">
                    {trip.inclusions?.map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-body">
                        <Check
                          className="w-5 h-5 text-success shrink-0 mt-0.5"
                          strokeWidth={2.5}
                        />
                        <span className="text-muted-foreground leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {trip.exclusions?.length > 0 && (
                  <div>
                    <h3 className="font-display text-heading-md sm:text-heading-lg text-foreground mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                      <X
                        className="w-6 h-6 sm:w-7 sm:h-7 text-error"
                        strokeWidth={3}
                      />
                      What&apos;s Not Included
                    </h3>
                    <ul className="space-y-4">
                      {trip.exclusions?.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-4 text-body"
                        >
                          <X
                            className="w-5 h-5 text-error shrink-0 mt-0.5"
                            strokeWidth={2.5}
                          />
                          <span className="text-muted-foreground leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            {trip.cancellation_policy && (
              <TabsContent value="policy" className="mt-0">
                <div className="max-w-3xl">
                  <h3 className="font-display text-heading-md sm:text-heading-lg text-foreground mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                    <Clock
                      className="w-6 h-6 sm:w-7 sm:h-7 text-primary"
                      strokeWidth={2.5}
                    />
                    Cancellation Policy
                  </h3>
                  <div className="card-premium p-4 sm:p-6 overflow-hidden">
                    <pre className="whitespace-pre-wrap break-words text-body text-muted-foreground font-sans leading-relaxed text-sm sm:text-base">
                      {trip.cancellation_policy}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </section>

      {showForm &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground w-full max-w-sm rounded-[14px] shadow-2xl ring-1 ring-border relative overflow-hidden border border-border flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="px-5 pt-5 pb-2">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Booking Request
                </h3>
              </div>

              <div className="px-5 py-3 overflow-y-auto space-y-3">
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-shadow"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <PhoneInput
                  className="h-10 text-foreground [&_input]:bg-background [&_input]:border-input [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_.react-international-phone-country-selector-button]:bg-background [&_.react-international-phone-country-selector-button]:border-input"
                  value={formData.phone_number}
                  onChange={(phone) =>
                    setFormData({ ...formData, phone_number: phone })
                  }
                  onValidationChange={handlePhoneValidation}
                  placeholder="Enter phone number"
                />

                <Input
                  type="email"
                  placeholder="Email id"
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-shadow"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    value={trip.provider.name}
                    disabled
                    className="w-full h-9 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground truncate cursor-not-allowed"
                  />
                  <Input
                    type="text"
                    value={trip.name}
                    disabled
                    className="w-full h-9 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground truncate cursor-not-allowed"
                  />
                </div>

                <textarea
                  placeholder="Any special requests? (Optional)"
                  className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base md:text-sm text-foreground placeholder:text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-shadow"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />

                <Button
                  onClick={handleSubmit}
                  className="w-full btn-primary h-11 mt-1 text-sm font-semibold shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-[0.98]"
                  disabled={!isOnline}
                >
                  {!isOnline ? "No Internet (Offline)" : "Send Request"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
