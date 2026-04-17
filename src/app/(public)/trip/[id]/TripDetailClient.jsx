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
  Heart,
  Share2,
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default function TripDetailClient({ trip, locationMap }) {
  const { id } = useParams();
  const { toast } = useToast();

  const [activeImage, setActiveImage] = useState(trip?.images?.[0] || null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    message: "",
    email: "",
    subject: "Book Trip",
  });
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

    const message = `Hi, I wanted to confirm the availability for the following trip:

*Trip Details*
• *Trip:* ${trip.name}
• *Operator:* ${trip.provider.name}
• *Start Date:* ${startDate}

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
        message:
          formData.message?.trim() || `User is interested in ${trip.name}`,
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
                {locationMap?.[trip.destination_id]?.name || "Destination"},{" "}
                {locationMap?.[trip.destination_id]?.region || ""}
              </div>

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
                </div>
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
                      {trip.hotelCategory !== null && (
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
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display text-heading-lg text-foreground mb-6 flex items-center gap-2">
                    <Check className="w-6 h-6 text-success" />
                    What&apos;s Included
                  </h3>
                  <ul className="space-y-3">
                    {trip.inclusions?.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-body">
                        <Check className="w-5 h-5 text-success shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {trip.exclusions?.length > 0 && (
                  <div>
                    <h3 className="font-display text-heading-lg text-foreground mb-6 flex items-center gap-2">
                      <X className="w-6 h-6 text-error" />
                      What&apos;s Not Included
                    </h3>
                    <ul className="space-y-3">
                      {trip.exclusions?.map((item, i) => (
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
                )}
              </div>
            </TabsContent>
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
                >
                  Send Request
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
