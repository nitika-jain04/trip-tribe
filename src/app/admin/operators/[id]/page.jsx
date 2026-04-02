"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  Building2,
  Globe,
  Youtube,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Cookies from "js-cookie";
import { formatPhoneNumber } from "@/lib/utils";
import { StatusBadge } from "@/app/components/admin/StatusBadge";
import Image from "next/image";
import { useToast } from "@/app/hooks/use-toast";
import { FaRegUser } from "react-icons/fa";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default function OperatorDetail() {
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const socialIcons = {
    youtube: Youtube,
    instagram: Instagram,
    linkedin: Linkedin,
    facebook: Facebook,
    twitter: Twitter,
  };

  useEffect(() => {
    const fetchOperator = async () => {
      const token = Cookies.get("token");
      setError(null);
      try {
        const res = await fetch(
          `${BASE_URL}/api/${API_VERSION}/operators/admin/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (data.success) setOperator(data.result);
        else
          toast({
            title: "Error",
            description: "Failed to fetch operator",
            variant: "destructive",
          });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch operator");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOperator();
  }, [id]);

  if (loading) {
    return (
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/operators"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft size={25} /> Back to Operators
        </Link>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">
            Loading operator details...
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Please wait while we fetch the data
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/operators"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft size={25} /> Back to Operators
        </Link>
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-600 font-medium">Failed to load operator</p>
            <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/operators"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft size={25} /> Back to Operators
        </Link>
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <Building2 className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">Operator not found</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              The operator you&apos;re looking for doesn&apos;t exist or has
              been removed
            </p>
            <Link href="/admin/operators">
              <Button className="mt-2">Back to Operators</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      <Link
        href="/admin/operators"
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-teal-600 transition-colors"
      >
        <ArrowLeft size={25} /> Back to Operators
      </Link>

      {/* Header Card */}
      <div className="bg-white sm:mt-3 rounded-lg shadow-sm border p-4 sm:px-6 sm:py-4 flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
        <div className="flex justify-center items-center w-50">
          {operator.logo_url ? (
            <Image
              height={200}
              width={200}
              src={operator.logo_url}
              alt={operator.name}
              className="rounded-xl object-cover border"
              onError={(e) => (e.currentTarget.src = "/vercel.svg")}
            />
          ) : (
            <FaRegUser className="text-gray-500" size={30} />
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center gap-3 flex-wrap">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">{operator.name}</h1>
              <div className="flex gap-2">
                <StatusBadge
                  status={operator.status?.toLowerCase()}
                  // status={
                  //   operator.application_status?.toUpperCase() === "PENDING"
                  //     ? operator.application_status?.toLowerCase()
                  //     : operator.status?.toLowerCase()
                  // }
                  className="w-fit"
                />
                <StatusBadge
                  // status={operator.status?.toLowerCase()}
                  status={operator.application_status?.toLowerCase()}
                  className="w-fit"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/operators/edit/${id}`)}
              className="flex items-center gap-2"
            >
              <Edit size={16} /> Edit Profile
            </Button>
          </div>

          <div className="text-muted-foreground">
            {operator.description || "No description provided"}
          </div>

          <div className="flex flex-wrap justify-between text-sm text-muted-foreground pt-2 gap-3">
            <span className="flex items-center gap-2">
              <Mail size={17} />
              <p className="text-black/80 font-medium">
                <a href={`mailto:${operator.email}`}>
                  {operator.email || "N/A"}
                </a>
              </p>
            </span>
            <span className="flex items-center gap-2">
              <Phone size={17} />
              <a
                href={`tel:+91 ${operator.phone_number}`}
                className="text-black/80 font-medium"
              >
                {formatPhoneNumber(operator.phone_number)}
              </a>
            </span>
            {operator.website_url && (
              <a
                href={operator.website_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <Globe size={17} />{" "}
                <span className="text-black/80 font-medium">
                  {operator.website_url}
                </span>
              </a>
            )}

            <span className="flex items-center gap-2">
              <Calendar size={17} />
              <p className="text-black/80 font-medium">
                Joined{" "}
                {operator.createdAt
                  ? new Date(operator.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Trips" value={operator.trip?.length ?? 0} />
        {/* <StatCard label="Trips Per Year" value={operator.trips_per_year ?? 0} /> */}
        <StatCard
          label="Member Since"
          value={
            operator.createdAt
              ? new Date(operator.createdAt).toLocaleDateString("en-IN")
              : "N/A"
          }
        />
        <StatCard
          label="Last Updated"
          value={
            operator.updatedAt
              ? new Date(operator.updatedAt).toLocaleDateString("en-IN")
              : "N/A"
          }
        />
        {/* <StatCard
          label="Application Status"
          value={operator.application_status}
        /> */}
      </div>

      {/* Details Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold mb-4">Business Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <DetailItem
            label="Contact Person"
            value={operator.contact_name || "N/A"}
          />
          <DetailItem label="Website" value={operator.website_url ?? "N/A"} />
          <DetailItem label="Total Trips" value={operator.trip?.length ?? 0} />
          {/* <DetailItem label="Trips Per Year" value={operator.trips_per_year} /> */}
          <DetailItem
            label="Regions"
            value={operator.regions?.join(", ") || "N/A"}
          />

          {operator.social_links &&
            Object.keys(operator.social_links).map((key) => {
              return (
                <DetailItem
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={
                    <a
                      href={operator.social_links[key]}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-600 hover:underline"
                    >
                      {operator.social_links[key]}
                    </a>
                  }
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
      <p className="text-xl font-medium">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-sm wrap-break-word">{value || "N/A"}</p>
    </div>
  );
}
