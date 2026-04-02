"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { useToast } from "@/app/hooks/use-toast";
import { FaTrash } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export default function TripEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [trip, setTrip] = useState(null);
  const [tripTypesData, setTripTypesData] = useState(["All Types"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    start_date: "",
    end_date: "",
    difficulty: "",
    total_seats: "",
    source: {},
    destination: {},
    images: [],
    inclusions: [""],
    exclusions: [""],
    itinerary: [{ day: 1, activities: [""] }],
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // const operators = []; // TODO: fetch
  // const tripTypes = []; // TODO: fetch

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  async function getTripTypes() {
    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/trip-types`);

      // if (!res.ok) throw new Error("Failed to fetch trip types");
      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to fetch trip types",
          variant: "destructive",
        });
      }

      const data = await res.json();

      const types = data?.result?.trip_types || [];

      setTripTypesData(types);
    } catch (err) {
      console.error("Failed to fetch trip types", err);
    }
  }

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
          setTrip({
            ...data.result,
            difficulty: data.result.difficulty || "",
            type_id: data.result?.type?.id || "",
          });
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
            type_id: data.result?.type?.id || "",
          });
        } else {
          // throw new Error(data.message || "Failed to fetch trip");
          toast({
            title: "Error",
            description: "Failed to fetch trip",
            variant: "destructive",
          });
        }
      } catch (err) {
        setError(err.message || "Failed to fetch trip");
      } finally {
        setLoading(false);
      }
    };

    getTripTypes();

    if (id) fetchTrip();
  }, [id]);

  // Basic field change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Array input handler (comma separated)
  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  // Itinerary update
  const addItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeItem = (field, index) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const handleItineraryChange = (dayIndex, activityIndex, value) => {
    const updated = [...formData.itinerary];
    updated[dayIndex].activities[activityIndex] = value;
    setFormData((prev) => ({ ...prev, itinerary: updated }));
  };

  const addActivity = (dayIndex) => {
    const updated = [...formData.itinerary];
    updated[dayIndex].activities.push("");
    setFormData((prev) => ({ ...prev, itinerary: updated }));
  };

  const addDay = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { day: prev.itinerary.length + 1, activities: [""] },
      ],
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = Cookies.get("token");
    setUploadingImage(true);
    setError("");

    const formDataObj = new FormData();
    formDataObj.append("image", file);

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/uploads/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormData((p) => ({
          ...p,
          images: [...p.images, data.result.url],
        }));

        toast({
          title: "Uploaded",
          description: "Image uploaded successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to upload image",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const name = formData.name?.trim();

    if (!name) {
      newErrors.name = "Trip name is required";
    } else if (name.length < 2) {
      newErrors.name = "Trip name must be at least 2 characters";
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.total_seats || Number(formData.total_seats) <= 0) {
      newErrors.total_seats = "Total seats must be greater than 0";
    }

    if (!formData.difficulty) {
      newErrors.difficulty = "Please select difficulty";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.end_date) <= new Date(formData.start_date)
    ) {
      newErrors.end_date = "End date must be after start date";
    }

    if (!formData.type_id) {
      newErrors.type_id = "Trip type is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const el = document.querySelector(".text-admin-error");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted fields",
        variant: "destructive",
      });

      scrollToFirstError();
      return;
    }

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

      // if (!res.ok || !data.success)
      //   throw new Error(data.message || "Update failed");
      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to update",
          variant: "destructive",
        });
      }

      toast({
        title: "Trip Update",
        description: "Trip Updated Successfully!",
        variant: "success",
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
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
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
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
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
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
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
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen space-y-4 sm:space-y-6">
      <Link
        href={`/admin/trips/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-teal-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Details
      </Link>

      <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
        <h1 className="text-2xl font-semibold mb-6">Edit Trip</h1>

        {/* Enhanced Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* BASIC INFO */}
          <section className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-6">Basic Information</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Trip Name*</label>
                <input
                  value={formData.name}
                  required
                  onChange={(e) =>
                    handleChange("name", e.target.value.replace(/^\s+/, ""))
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                />
                {errors.name && (
                  <p className="text-xs text-admin-error mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Price*</label>
                <input
                  value={formData.price}
                  required
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                />
                {errors.price && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Start Date*</label>
                <input
                  type="date"
                  value={formData.start_date}
                  required
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
                {errors.start_date && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.start_date}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">End Date*</label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
                {errors.end_date && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.end_date}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Total Seats*</label>
                <input
                  value={formData.total_seats}
                  onChange={(e) => handleChange("total_seats", e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
                {errors.total_seats && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.total_seats}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Difficulty*</label>
                <Select
                  value={formData.difficulty || ""}
                  onValueChange={(value) => handleChange("difficulty", value)}
                >
                  <SelectTrigger className="mt-1 w-full border rounded-lg px-3 py-2">
                    <SelectValue placeholder="Select Difficulty" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MODERATE">Moderate</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>

                {errors.difficulty && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.difficulty}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Trip Type*</label>
                <Select
                  value={formData.type_id?.toString() || ""}
                  onValueChange={(value) => handleChange("type_id", value)}
                >
                  <SelectTrigger className="mt-1 w-full border rounded-lg px-3 py-2">
                    <SelectValue placeholder="Select Trip Type" />
                  </SelectTrigger>

                  <SelectContent>
                    {tripTypesData.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.type_id && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.type_id}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
              {errors.description && (
                <p className="text-xs text-admin-error mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </section>

          {/* IMAGES */}
          <section className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-6">Images</h3>

            <div className="flex items-center gap-3">
              <input
                type="file"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />

              {uploadingImage && (
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </span>
              )}
            </div>

            <div className="flex gap-3 mt-4 flex-wrap">
              {formData.images.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={img}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(i)}
                    className="absolute top-1 right-1 bg-black text-white text-xs px-2 py-0.5 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* INCLUSIONS */}
          <section className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-6">Inclusions</h3>

            {formData.inclusions.map((item, i) => (
              <div key={i} className="flex gap-2 mb-3">
                <input
                  value={item}
                  onChange={(e) =>
                    handleArrayChange("inclusions", i, e.target.value)
                  }
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => removeItem("inclusions", i)}
                  className="px-3 py-2 bg-red-50 text-red-500 rounded-lg"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addItem("inclusions")}
              className="mt-2 text-sm font-medium text-black"
            >
              + Add Inclusion
            </button>
          </section>

          {/* EXCLUSIONS */}
          <section className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-6">Exclusions</h3>

            {formData.exclusions.map((item, i) => (
              <div key={i} className="flex gap-2 mb-3">
                <input
                  value={item}
                  onChange={(e) =>
                    handleArrayChange("exclusions", i, e.target.value)
                  }
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => removeItem("exclusions", i)}
                  className="px-3 py-2 bg-red-50 text-red-500 rounded-lg"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addItem("exclusions")}
              className="mt-2 text-sm font-medium text-black"
            >
              + Add Exclusion
            </button>
          </section>

          {/* ITINERARY */}
          <section className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-6">Itinerary*</h3>

            {formData.itinerary.map((day, dayIndex) => (
              <div key={dayIndex} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-3">
                  <h4 className="font-medium">Day {day.day}</h4>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.itinerary.filter(
                        (_, i) => i !== dayIndex,
                      );
                      const reIndexed = updated.map((d, i) => ({
                        ...d,
                        day: i + 1,
                      }));
                      setFormData((prev) => ({
                        ...prev,
                        itinerary: reIndexed,
                      }));
                    }}
                    className="text-red-500 text-sm"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                {day.activities.map((act, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={act}
                      required
                      onChange={(e) =>
                        handleItineraryChange(dayIndex, i, e.target.value)
                      }
                      className="flex-1 border rounded-lg px-3 py-2"
                      placeholder="Activity"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...formData.itinerary];
                        updated[dayIndex].activities = updated[
                          dayIndex
                        ].activities.filter((_, index) => index !== i);

                        // prevent empty activities array
                        if (updated[dayIndex].activities.length === 0) {
                          updated[dayIndex].activities = [""];
                        }

                        setFormData((prev) => ({
                          ...prev,
                          itinerary: updated,
                        }));
                      }}
                      className="px-3 py-2 text-admin-error rounded-lg"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addActivity(dayIndex)}
                  className="text-sm text-black"
                >
                  + Add Activity
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addDay}
              className="text-sm font-medium text-black"
            >
              + Add Day
            </button>
          </section>

          {/* SUBMIT */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="px-6 py-2 bg-black text-white rounded-lg flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
