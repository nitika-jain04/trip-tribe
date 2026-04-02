"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, Loader2, Plus, X } from "lucide-react";
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
import Input from "@/app/components/ui/input";

export default function TripEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [trip, setTrip] = useState(null);
  const [tripTypesData, setTripTypesData] = useState(["All Types"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isModified, setIsModified] = useState(false);
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

      if (!res.ok) {
        toast({
          title: "Error",
          description: data?.error?.message || "Upload failed",
          variant: "destructive",
        });
        return;
      }

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
      setIsModified(Object.keys(requestBody).length === 0);
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
        <ArrowLeft size={25} />
        Back to Details
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight mb-6 sm:mb-8">
          Edit Trip
        </h1>

        {/* Enhanced Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* BASIC INFO */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 sm:mb-8">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Trip Name*
                </label>
                <Input
                  value={formData.name}
                  required
                  onChange={(e) =>
                    handleChange("name", e.target.value.replace(/^\s+/, ""))
                  }
                  className="w-full text-sm bg-white border-slate-200 focus:ring-teal-500/20"
                />
                {errors.name && (
                  <p className="text-xs text-admin-error mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Price*
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  required
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="w-full text-sm bg-white border-slate-200 focus:ring-teal-500/20"
                />
                {errors.price && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.price}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Start Date*
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  required
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className="w-full text-sm bg-white border-slate-200 focus:ring-teal-500/20"
                />
                {errors.start_date && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.start_date}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  End Date*
                </label>
                <Input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  className="w-full text-sm bg-white border-slate-200 focus:ring-teal-500/20"
                />
                {errors.end_date && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.end_date}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Total Seats*
                </label>
                <Input
                  type="number"
                  value={formData.total_seats}
                  onChange={(e) => handleChange("total_seats", e.target.value)}
                  className="w-full text-sm bg-white border-slate-200 focus:ring-teal-500/20"
                />
                {errors.total_seats && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.total_seats}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Difficulty*
                </label>
                <Select
                  value={formData.difficulty || ""}
                  onValueChange={(value) => handleChange("difficulty", value)}
                >
                  <SelectTrigger className="w-full text-sm bg-white border-slate-200 h-10 focus:ring-teal-500/20">
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

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Trip Type*
                </label>
                <Select
                  value={formData.type_id?.toString() || ""}
                  onValueChange={(value) => handleChange("type_id", value)}
                >
                  <SelectTrigger className="w-full text-sm bg-white border-slate-200 h-10 focus:ring-teal-500/20">
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

            <div className="mt-4 space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 tracking-wide">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
              {errors.description && (
                <p className="text-xs text-admin-error mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </section>

          {/* IMAGES */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 sm:mb-8">
              Images
            </h3>

            <div className="space-y-4">
              <div className="relative group">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full border-slate-200 bg-white hover:border-teal-500 file:bg-teal-50 file:text-teal-700 file:border-0 file:px-4 file:py-2 file:rounded-xl file:text-xs file:font-bold hover:file:bg-teal-100 transition-all cursor-pointer"
                />
                {uploadingImage && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white/80 px-2 rounded-full">
                    <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                    <span className="text-[10px] font-bold text-teal-700">
                      UPLOADING
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative group/img">
                    <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-transform group-hover/img:scale-105">
                      <img
                        src={img}
                        alt={`Trip ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(i)}
                      className="absolute -top-2 -right-2 bg-slate-900 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {formData.images.length === 0 && (
                  <div className="h-24 w-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-sm">
                    No images uploaded yet
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* INCLUSIONS */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 sm:mb-8">
              Inclusions
            </h3>

            <div className="space-y-4">
              {formData.inclusions.map((item, i) => (
                <div key={i} className="flex gap-3 group">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleArrayChange("inclusions", i, e.target.value)
                    }
                    className="flex-1 text-sm bg-white border-slate-200 focus:ring-teal-500/20"
                    placeholder="e.g., Accommodation"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem("inclusions", i)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove inclusion"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addItem("inclusions")}
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-all active:scale-95 mt-2"
              >
                <Plus className="w-4 h-4" />
                Add Inclusion
              </button>
            </div>
          </section>

          {/* EXCLUSIONS */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 sm:mb-8">
              Exclusions
            </h3>

            <div className="space-y-4">
              {formData.exclusions.map((item, i) => (
                <div key={i} className="flex gap-3 group">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleArrayChange("exclusions", i, e.target.value)
                    }
                    className="flex-1 text-sm bg-white border-slate-200 focus:ring-teal-500/20"
                    placeholder="e.g., Personal Expenses"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem("exclusions", i)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove exclusion"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addItem("exclusions")}
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-all active:scale-95 mt-2"
              >
                <Plus className="w-4 h-4" />
                Add Exclusion
              </button>
            </div>
          </section>

          {/* ITINERARY */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-lg font-bold text-slate-800">Itinerary</h3>
              <button
                type="button"
                onClick={addDay}
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Day
              </button>
            </div>

            <div className="space-y-6">
              {formData.itinerary.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 sm:p-6 relative"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-md">
                        DAY {day.day}
                      </div>
                      <h4 className="font-bold text-slate-800">
                        Plan for Day {day.day}
                      </h4>
                    </div>

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
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove day"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {day.activities.map((act, i) => (
                      <div key={i} className="flex gap-3 group">
                        <Input
                          value={act}
                          required
                          onChange={(e) =>
                            handleItineraryChange(dayIndex, i, e.target.value)
                          }
                          className="flex-1 text-sm bg-white border-slate-200 focus:ring-teal-500/20"
                          placeholder={`Activity ${i + 1}`}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formData.itinerary];
                            updated[dayIndex].activities = updated[
                              dayIndex
                            ].activities.filter((_, index) => index !== i);

                            if (updated[dayIndex].activities.length === 0) {
                              updated[dayIndex].activities = [""];
                            }

                            setFormData((prev) => ({
                              ...prev,
                              itinerary: updated,
                            }));
                          }}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addActivity(dayIndex)}
                    className="mt-4 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-wider"
                  >
                    + Add activity to day {day.day}
                  </button>
                </div>
              ))}

              {formData.itinerary.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 italic">
                  No itinerary days added yet
                </div>
              )}
            </div>
          </section>

          {/* SUBMIT */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all duration-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isModified || saving || uploadingImage}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-linear-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(saving || uploadingImage) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
