"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  IndianRupee,
  User,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Building2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { MdChairAlt } from "react-icons/md";
import { StatusBadge } from "@/app/components/admin/StatusBadge";
import { BiTrip } from "react-icons/bi";
import { GoTriangleUp } from "react-icons/go";
import { Rating } from "@/app/components/ui/rating";
import { useToast } from "@/app/hooks/use-toast";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { adminFetcher } from "@/app/hooks/use-admin-fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default function TripDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeImage, setActiveImage] = useState(null);

  // 1. Core Fetch
  const {
    data: tripData,
    error: tripError,
    isLoading: loading,
  } = useSWR(
    id ? `${BASE_URL}/api/${API_VERSION}/trips/admin/${id}` : null,
    adminFetcher,
  );

  const trip = tripData?.result || null;
  const error = tripError?.message || null;

  // 2. Dependent Fetches
  const { data: operatorData } = useSWR(
    trip?.operator_id
      ? `${BASE_URL}/api/${API_VERSION}/operators/admin/${trip.operator_id}`
      : null,
    adminFetcher,
  );
  const { data: sourceData } = useSWR(
    trip?.source_id
      ? `${BASE_URL}/api/${API_VERSION}/locations/admin/${trip.source_id}`
      : null,
    adminFetcher,
  );
  const { data: destData } = useSWR(
    trip?.destination_id
      ? `${BASE_URL}/api/${API_VERSION}/locations/admin/${trip.destination_id}`
      : null,
    adminFetcher,
  );

  const operator = operatorData?.result || null;
  const source = sourceData?.result || null;
  const destination = destData?.result || null;

  useEffect(() => {
    if (trip?.images?.[0] && !activeImage) {
      setActiveImage(trip.images[0]);
    }
  }, [trip, activeImage]);

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft size={25} />
          Back to Trips
        </Link>
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading trip details...</p>
            <p className="text-sm text-gray-400 mt-1">
              Please wait while we fetch the data
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Error State
  if (error) {
    return (
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft size={25} />
          Back to Trips
        </Link>
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-600 font-medium">Failed to load trip</p>
            <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!trip) {
    return (
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft size={25} />
          Back to Trips
        </Link>
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">Trip not found</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              The trip you&apos;re looking for doesn&apos;t exist or has been
              removed
            </p>
            <Link href="/admin/trips">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                Back to Trips
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen space-y-4 sm:space-y-6">
      <Link
        href="/admin/trips"
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-teal-600 transition-colors"
      >
        <ArrowLeft size={25} />
        Back to Trips
      </Link>

      {/* Hero Section */}
      <div className="bg-white mt-3 rounded-lg shadow-sm border px-1 py-4 flex flex-col md:flex-row gap-6 items-start">
        <div className="grid sm:grid-cols-1 lg:grid-cols-2 w-full">
          {activeImage ? (
            <img
              src={activeImage}
              alt={trip.name}
              className="w-full h-72 h-full object-cover bg-gray-100 rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "/vercel.svg";
              }}
            />
          ) : (
            <div className="w-full h-72 md:h-full bg-gray-100 flex items-center justify-center rounded-l-lg">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}

          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{trip.name}</h1>
              <StatusBadge
                status={trip.status}
                // className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle}`}
              />
            </div>

            <p className="text-muted-foreground">{trip.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoItem
                icon={<IndianRupee size={16} />}
                label="Base Price"
                value={`₹${
                  trip.price_categories?.find(
                    (c) => c.category.toLowerCase() === "base price",
                  )?.price ||
                  trip.price ||
                  "N/A"
                }`}
              />
              <InfoItem
                icon={<MapPin size={16} />}
                label="Difficulty"
                value={trip.difficulty}
              />
              <InfoItem
                icon={<Calendar size={16} />}
                label="Start"
                value={new Date(trip.start_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              />
              <InfoItem
                icon={<Calendar size={16} />}
                label="End"
                value={new Date(trip.end_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-sm">
              <InfoItem
                icon={<User size={16} />}
                label="Operator"
                value={operator?.name || "N/A"}
              />
              <InfoItem
                icon={<BiTrip size={16} />}
                label="Route"
                value={`${source?.name || "N/A"} → ${destination?.name || "N/A"}`}
              />
            </div>

            <div>
              <InfoItem
                label="Seats Available"
                icon={<MdChairAlt size={16} />}
                value={trip.total_seats}
              />
            </div>

            <div>
              <InfoItem
                label="Trip Type"
                icon={<GoTriangleUp size={16} />}
                value={trip.type?.name}
              />
            </div>

            <div>
              <InfoItem
                label="Hotel Category"
                icon={<Building2 size={16} />}
                value={
                  <div className="-ml-1">
                    <Rating value={trip.hotel_category || 0} />
                  </div>
                }
              />
            </div>
          </CardContent>
        </div>
      </div>

      {/* Price Categories Breakdown */}
      {trip.price_categories?.length > 1 && (
        <Card className="rounded-2xl shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">
              {/* <IndianRupee className="w-5 h-5 text-teal-600" /> */}
              Price Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {trip.price_categories.map((cat, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border bg-slate-50 flex justify-between items-center group hover:border-teal-300 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold tracking-wider">
                      {cat.category}
                    </p>
                    <p className="text-lg font-medium text-muted-foreground">
                      ₹{cat.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      cat.category.toLowerCase() === "base price"
                        ? "bg-teal-100 text-teal-700"
                        : "bg-slate-200 text-slate-600",
                    )}
                  >
                    {cat.category.toLowerCase() === "base price"
                      ? "Primary"
                      : "Option"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery */}
      {trip.images?.length > 1 && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trip.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`trip-${i}`}
                  onClick={() => setActiveImage(img)}
                  className={`h-32 w-full object-cover rounded-xl border cursor-pointer transition-all ${
                    activeImage === img
                      ? "border-teal-500 ring-2 ring-teal-300"
                      : "border-gray-200 hover:opacity-90"
                  }`}
                  onError={(e) => {
                    e.currentTarget.src = "/vercel.svg";
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Itinerary */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Itinerary</h2>
          <div className="space-y-4">
            {trip.itinerary?.length > 0 ? (
              trip.itinerary.map((day) => (
                <div key={day.day} className="border rounded-xl p-4 bg-gray-50">
                  <p className="font-semibold">Day {day.day}</p>
                  <ul className="list-disc ml-5 text-sm text-muted-foreground mt-2">
                    {day.activities.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No itinerary available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inclusions & Exclusions */}
      <div className="grid md:grid-cols-2 gap-6">
        <ListCard title="Inclusions" items={trip.inclusions} />
        <ListCard title="Exclusions" items={trip.exclusions} />
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-teal-600">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function ListCard({ title, items }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {items?.length > 0 ? (
          <ul className="space-y-2 text-sm text-muted-foreground list-disc ml-5">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No {title.toLowerCase()} listed
          </p>
        )}
      </CardContent>
    </Card>
  );
}
