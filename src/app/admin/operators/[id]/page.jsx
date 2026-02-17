"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Edit,
  LoaderCircleIcon,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  Building2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

export default function OperatorDetail() {
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const router = useRouter();

  const formatPhone = (phone) => {
    if (!phone) return "N/A";

    // Remove spaces and non-numeric chars except +
    let cleaned = phone.replace(/[^\d+]/g, "");

    // Remove + if present for processing
    cleaned = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;

    // Handle Indian numbers
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      return `+91 ${cleaned.slice(2)}`;
    }

    if (cleaned.length === 10) {
      return `+91 ${cleaned}`;
    }

    return `+${cleaned}`; // fallback
  };

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  useEffect(() => {
    const fetchOperator = async () => {
      const token = localStorage.getItem("token");
      setError(null);

    

      try {
        const res = await fetch(
          `${BASE_URL}/api/${API_VERSION}/operators/admin/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();
        if (data.success) {
          setOperator(data.result);
        } else {
          throw new Error(data.message || "Failed to fetch operator");
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch operator");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOperator();
  }, [id]);

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/operators"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft size={25} />
          Back to Operators
        </Link>
        <div className="">
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
      </div>
    );
  }

  // Enhanced Error State
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/operators"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft size={25} />
          Back to Operators
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
              <Loader2 className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!operator) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/operators"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft size={25} />
          Back to Operators
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

  const statusStyle =
    operator.status === "ACTIVE"
      ? "bg-green-100 text-green-700"
      : operator.status === "INACTIVE"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Back link */}
      <Link
        href="/admin/operators"
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-teal-600 transition-colors"
      >
        <ArrowLeft size={25} />
        Back to Operators
      </Link>

      {/* Header Card */}
      <div className="bg-white mt-3 rounded-lg shadow-sm border px-6 py-4 flex flex-col md:flex-row gap-6 items-start">
        <img
          src={operator.logo_url || "/vercel.svg"}
          alt={operator.name}
          className="h-36 w-36 rounded-xl object-cover border"
          onError={(e) => {
            e.currentTarget.src = "/vercel.svg";
          }}
        />

        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center gap-3 flex-wrap">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">{operator.name}</h1>
              <p
                className={`px-3 py-1 text-xs rounded-full w-fit font-medium ${statusStyle}`}
              >
                {operator.status}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/operators/edit/${id}`)}
              className="flex items-center gap-2"
            >
              <Edit size={16} /> Edit Profile
            </Button>
          </div>

          {/* <div
            className={`px-3 py-1 text-xs rounded-full w-fit font-medium ${statusStyle}`}
          >
            {operator.status}
          </div> */}

          <div className="text-muted-foreground">
            {operator.description || "No description provided"}
          </div>

          <div className="flex flex-wrap justify-between text-sm text-muted-foreground pt-2">
            <span className="flex items-center gap-2">
              <Mail size={17} />
              <p className="text-black/80 font-medium">
                {operator.email || "N/A"}
              </p>
            </span>
            <span className="flex items-center gap-2">
              <Phone size={17} />
              <p className="text-black/80 font-medium">
                {formatPhone(operator.phone_number)}
              </p>
            </span>
            {/* {operator.website_url && (
              <a
                href={operator.website_url}
                target="_blank"
                className="hover:underline"
              >
                {operator.website_url}
              </a>
            )} */}
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
        <StatCard
          label="Total Trips"
          value={operator.total_trips || operator.tripsCount || 0}
        />
        {/* <StatCard
          label="Member Since"
          value={
            operator.createdAt
              ? new Date(operator.createdAt).toLocaleDateString("en-IN")
              : "N/A"
          }
        /> */}
        {/* <StatCard
          label="Last Updated"
          value={
            operator.updatedAt
              ? new Date(operator.updatedAt).toLocaleDateString("en-IN")
              : "N/A"
          }
        /> */}
      </div>

      {/* Details Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Business Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* <DetailItem label="Email" value={operator.email} />
          <DetailItem label="Phone" value={operator.phone_number} /> */}
          <DetailItem
            label="Contact Person"
            value={operator.contact_name || "N/A"}
          />
          <DetailItem label="Website" value={operator.website_url || "N/A"} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
      <p className="text-xl font-semibold">{value}</p>
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
