"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Save, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { useToast } from "@/app/hooks/use-toast";

export default function TripEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [trip, setTrip] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  // Fetch trip
  useEffect(() => {
    const fetchTrip = async () => {
      const token = Cookies.get("token");
      setError("");

      try {
        const res = await fetch(
          `${BASE_URL}/api/${API_VERSION}/trips/admin/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();

        if (data.success) {
          setTrip(data.result);
          setFormData({
            name: data.result.name || "",
            price: data.result.price || "",
            start_date: data.result.start_date || "",
            end_date: data.result.end_date || "",
            difficulty: data.result.difficulty || "",
            total_seats: data.result.total_seats || "",
            description: data.result.description || "",
            images: data.result.images || [],
            inclusions: data.result.inclusions || [],
            exclusions: data.result.exclusions || [],
            itinerary: data.result.itinerary || [],
            status: data.result.status || "",
          });
        } else {
          throw new Error(data.message || "Failed to fetch trip");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch trip");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTrip();
  }, [id]);

  // Basic field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Array input handler (comma separated)
  const handleArrayChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value.split(",").map((v) => v.trim()),
    }));
  };

  // Itinerary update
  const handleItineraryChange = (index, value) => {
    const updated = [...formData.itinerary];
    updated[index].activities = value.split(",").map((v) => v.trim());

    setFormData((prev) => ({ ...prev, itinerary: updated }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!trip) return;

    setSaving(true);
    setError("");

    const token = Cookies.get("token");

    const requestBody = {};
    Object.keys(formData).forEach((key) => {
      if (JSON.stringify(formData[key]) !== JSON.stringify(trip[key])) {
        requestBody[key] = formData[key];
      }
    });

    if (Object.keys(requestBody).length === 0) {
      toast({
        title: "No Changes",
        description: "No Changes Detected",
      });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/trips/admin/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.message || "Update failed");

      toast({
        title: "Trip Update",
        description: "Trip Updated Successfully!",
      });
      router.push(`/admin/trips/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft size={16} /> Back to Trips
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
  if (error && !formData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft size={16} /> Back to Trips
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
  if (!formData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft size={16} /> Back to Trips
        </Link>
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">Trip not found</p>
            <p className="text-sm text-gray-400 mt-1">
              The trip you&apos;re looking for doesn&apos;t exist or has been
              removed
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <Link
        href={`/admin/trips/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-teal-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Details
      </Link>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h1 className="text-2xl font-semibold mb-6">Edit Trip</h1>

        {/* Enhanced Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-2 gap-5">
          {/* Basic fields */}
          {[
            ["name", "Trip Name"],
            ["price", "Price (₹)"],
            ["total_seats", "Total Seats"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                placeholder={`Enter ${label.toLowerCase()}`}
                type={
                  key === "price" || key === "total_seats" ? "number" : "text"
                }
              />
            </div>
          ))}

          {/* Dates */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Dropdowns */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="DRAFT">Draft</option>
              {/* <option value="LIVE">Live</option> */}
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="Describe the trip in detail..."
            />
          </div>

          {/* Arrays */}
          {["images", "inclusions", "exclusions"].map((key) => (
            <div key={key} className="col-span-2">
              <label className="text-sm font-medium text-gray-700 capitalize">
                {key}
              </label>
              <input
                value={formData[key].join(", ")}
                onChange={(e) => handleArrayChange(key, e.target.value)}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                placeholder="Comma separated values"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter values separated by commas (e.g., item1, item2, item3)
              </p>
            </div>
          ))}

          {/* Itinerary */}
          <div className="col-span-2 space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Itinerary
            </label>
            {formData.itinerary.map((day, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Day {day.day}
                </p>
                <input
                  value={day.activities.join(", ")}
                  onChange={(e) => handleItineraryChange(index, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder={`Activities for day ${day.day} (comma separated)`}
                />
              </div>
            ))}
          </div>

          <div className="col-span-2 flex justify-end gap-3 pt-6 border-t">
            <Link
              href={`/admin/trips/${id}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
