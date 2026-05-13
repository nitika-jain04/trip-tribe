"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Plus,
  X,
  ChevronDown,
  IndianRupee,
} from "lucide-react";
import Cookies from "js-cookie";
import { useToast } from "@/app/hooks/use-toast";
import { FaTrash } from "react-icons/fa";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DatePicker = dynamic(() => import("react-datepicker"), { ssr: false });
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import Input from "@/app/components/ui/input";
import { Rating } from "@/app/components/ui/rating";
import useSWR from "swr";
import { adminFetcher } from "@/app/hooks/use-admin-fetcher";
import useTripTypes from "@/app/hooks/use-triptypes";
import { Button } from "@/app/components/ui/button";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/app/components/ui/card";
import { IoCloseSharp } from "react-icons/io5";

const MapPicker = dynamic(() => import("@/app/components/MapPickerTrip"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
    </div>
  ),
});

export default function TripEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [trip, setTrip] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isModified, setIsModified] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_categories: [{ category: "Base Price", price: "" }],
    start_date: "",
    end_date: "",
    difficulty: "",
    total_seats: "",
    hotel_category: null,
    source: {},
    destination: {},
    images: [],
    inclusions: [""],
    exclusions: [""],
    itinerary: [{ day: 1, activities: [""] }],
    cancellation_policy: "",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSourceMap, setShowSourceMap] = useState(false);
  const [showDestinationMap, setShowDestinationMap] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  const [typePage, setTypePage] = useState(1);
  const {
    tripTypes,
    pagination: typePagination,
    loadingTripTypes,
  } = useTripTypes({
    status: "ACTIVE",
    page: typePage,
    limit: 10,
  });
  const [accumulatedTripTypes, setAccumulatedTripTypes] = useState([]);

  useEffect(() => {
    if (tripTypes?.length > 0) {
      setAccumulatedTripTypes((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newTypes = tripTypes.filter((t) => !existingIds.has(t.id));
        return [...prev, ...newTypes];
      });
    }
  }, [tripTypes]);

  const {
    data: tripData,
    error: tripFetchError,
    isLoading: loadingTrip,
    mutate: refreshTrip,
  } = useSWR(
    id ? `${BASE_URL}/api/${API_VERSION}/trips/admin/${id}` : null,
    adminFetcher,
    { revalidateOnFocus: false },
  );

  // Synchronize error states
  useEffect(() => {
    if (tripFetchError) {
      setError(tripFetchError);
      toast({
        title: "Error",
        description: tripFetchError,
        variant: "destructive",
      });
    }
  }, [tripFetchError, toast]);

  // Seed form data on successful data load
  useEffect(() => {
    if (tripData?.success) {
      const dbTrip = tripData.result;
      setTrip({
        ...dbTrip,
        difficulty: dbTrip.difficulty || "",
        type_id: dbTrip?.type?.id || "",
        cancellation_policy: dbTrip.cancellation_policy || "",
        source: dbTrip.source || {},
        destination: dbTrip.destination || {},
      });
      setFormData({
        name: dbTrip.name || "",
        price_categories:
          dbTrip.price_categories?.length > 0
            ? dbTrip.price_categories
            : [{ category: "Base Price", price: dbTrip.price || "" }],
        start_date: dbTrip.start_date || "",
        end_date: dbTrip.end_date || "",
        difficulty: dbTrip.difficulty || "",
        total_seats: dbTrip.total_seats || "",
        hotel_category: dbTrip.hotel_category || 0,
        description: dbTrip.description || "",
        images: dbTrip.images || [],
        inclusions: dbTrip.inclusions || [],
        exclusions: dbTrip.exclusions || [],
        itinerary: dbTrip.itinerary || [],
        status: dbTrip.status || "",
        type_id: dbTrip?.type?.id || "",
        cancellation_policy: dbTrip.cancellation_policy || "",
        source: dbTrip.source || {
          name: "",
          region: "",
          latitude: "",
          longitude: "",
          type: "CITY",
          id: "",
        },
        destination: dbTrip.destination || {
          name: "",
          region: "",
          latitude: "",
          longitude: "",
          type: "CITY",
          id: "",
        },
      });
      setLoading(false);
    }
  }, [tripData]);

  // Basic field change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    if (error) setError("");
    setIsModified(true);
  };

  // Array input handler (comma separated)
  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    if (error) setError("");
    setIsModified(true);
  };

  // Itinerary update
  const addItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
    setIsModified(true);
  };

  const removeItem = (field, index) => {
    if (formData.inclusions.length === 1) {
      toast({
        title: "Inclusions",
        description: "1 Inclusion in required",
        variant: "destructive",
      });
      return;
    }

    const updated = formData[field].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [field]: updated }));
    setIsModified(true);
  };

  const handleItineraryChange = (dayIndex, activityIndex, value) => {
    const updated = [...formData.itinerary];
    updated[dayIndex].activities[activityIndex] = value;
    setFormData((prev) => ({ ...prev, itinerary: updated }));
    if (error) setError("");
    setIsModified(true);
  };

  const handlePriceCategoryChange = (index, field, value) => {
    const categories = [...formData.price_categories];
    categories[index] = { ...categories[index], [field]: value };
    setFormData((prev) => ({ ...prev, price_categories: categories }));
    if (error) setError("");
    setIsModified(true);
  };

  const addPriceCategory = () => {
    setFormData((prev) => ({
      ...prev,
      price_categories: [...prev.price_categories, { category: "", price: "" }],
    }));
    setIsModified(true);
  };

  const removePriceCategory = (index) => {
    if (formData.price_categories.length === 1) return;
    if (
      formData.price_categories[index].category?.toLowerCase() === "base price"
    )
      return;
    const categories = formData.price_categories.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, price_categories: categories }));
    setIsModified(true);
  };

  const addActivity = (dayIndex) => {
    const updated = [...formData.itinerary];
    updated[dayIndex].activities.push("");
    setFormData((prev) => ({ ...prev, itinerary: updated }));
    setIsModified(true);
  };

  const addDay = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { day: prev.itinerary.length + 1, activities: [""] },
      ],
    }));
    setIsModified(true);
  };

  const handleLocationSelect = async (type, locationData) => {
    const token = Cookies.get("token");
    const payload = {
      name: locationData.name || locationData.address || "Unknown",
      region: locationData.region || "",
      latitude: String(locationData.lat ?? locationData.latitude),
      longitude: String(locationData.lng ?? locationData.longitude),
      type: "CITY",
    };

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/locations/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setFormData((prev) => ({ ...prev, [type]: data.result }));
        setErrors((p) => ({ ...p, [type]: "" }));
        setIsModified(true);
      } else if (data?.error?.message?.includes("already exists")) {
        const searchRes = await fetch(
          `${BASE_URL}/api/${API_VERSION}/locations/admin?search=${encodeURIComponent(payload.name)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const searchData = await searchRes.json();
        const existing = searchData.result.locations?.find(
          (loc) => loc.name.toLowerCase() === payload.name.toLowerCase(),
        );
        if (existing) {
          setFormData((prev) => ({ ...prev, [type]: existing }));
          setErrors((p) => ({ ...p, [type]: "" }));
          setIsModified(true);
        }
      }

      if (type === "source") setShowSourceMap(false);
      else setShowDestinationMap(false);
    } catch (err) {
      console.error("Location error:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/heif",
      "image/heic",
    ];

    const file = e.target.files[0];
    if (!file) return;

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPG and PNG images are allowed",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

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
        const errorMessage =
          Array.isArray(data?.error?.details) && data.error.details.length > 0
            ? data.error.details.map((detail) => detail.message).join(", ")
            : data?.error?.message === "Validation failed"
              ? data?.error?.details?.message || "Validation failed"
              : data?.error?.message || "Upload failed";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (res.ok && data.success) {
        setFormData((p) => ({
          ...p,
          images: [...p.images, data.result.url],
        }));
        setIsModified(true);

        toast({
          title: "Uploaded",
          description: "Image uploaded successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: data?.error?.message || "Failed to upload image",
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
    setIsModified(true);
  };

  const validateForm = () => {
    const newErrors = {};

    const name = formData.name?.trim();

    if (!name) {
      newErrors.name = "Trip name is required";
    } else if (name.length < 2) {
      newErrors.name = "Trip name must be at least 2 characters";
    }

    if (!formData.price_categories || formData.price_categories.length === 0) {
      newErrors.price_categories = "At least one price category is required";
    } else {
      const basePrices = formData.price_categories.filter(
        (c) => c.category?.trim().toLowerCase() === "base price",
      );
      if (basePrices.length === 0) {
        newErrors.price_categories = "Base Price category is required";
      } else if (basePrices.length > 1) {
        newErrors.price_categories = "Exactly one Base Price required";
      } else if (
        formData.price_categories.some((c) => !c.category?.trim() || !c.price)
      ) {
        newErrors.price_categories = "Incomplete categories detected";
      } else if (formData.price_categories.some((c) => Number(c.price) <= 0)) {
        newErrors.price_categories = "Prices must be greater than 0";
      }
    }

    if (!formData.images || formData.images.length == 0) {
      newErrors.images = "Atleast one image is required";
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

    if (!formData.inclusions || formData.inclusions.some((i) => !i.trim())) {
      newErrors.inclusions =
        "Please fill all inclusion fields or remove empty ones.";
    }

    if (!formData.exclusions || formData.exclusions.some((i) => !i.trim())) {
      newErrors.exclusions =
        "Please fill all exclusion fields or remove empty ones.";
    }

    const hasIncompleteItinerary = formData.itinerary.some(
      (day) => !day.activities || day.activities.some((a) => !a.trim()),
    );
    if (hasIncompleteItinerary) {
      newErrors.itinerary =
        "Please complete all itinerary days or remove empty activities.";
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

    // Always include source and destination if they exist
    if (formData.source?.id) {
      requestBody.source = formData.source;
      requestBody.source_id = formData.source.id;
    }
    if (formData.destination?.id) {
      requestBody.destination = formData.destination;
      requestBody.destination_id = formData.destination.id;
    }

    Object.keys(formData).forEach((key) => {
      if (key === "source" || key === "destination") return; // Already handled above

      if (JSON.stringify(formData[key]) !== JSON.stringify(trip[key])) {
        if (key === "price_categories") {
          requestBody[key] = formData[key].map((c) => ({
            ...c,
            price: Number(c.price),
          }));
        } else if (key === "hotel_category") {
          if (formData[key] && formData[key] > 0) {
            requestBody[key] = formData[key];
          }
        } else if (key === "cancellation_policy") {
          if (formData[key]?.trim()) {
            requestBody[key] = formData[key].trim();
          }
        } else {
          requestBody[key] = formData[key];
        }
      }
    });

    if (Object.keys(requestBody).length === 0) {
      toast({
        title: "No Changes",
        description: "No Changes Detected",
      });
      setSaving(false);
      setIsModified(false);
      router.push(`/admin/trips/${id}`);
      ``;
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

      // console.log("req body", requestBody);

      const data = await res.json();

      if (!res.ok) {
        const errorMessage =
          Array.isArray(data?.error?.details) && data.error.details.length > 0
            ? data.error.details.map((detail) => detail.message).join(", ")
            : data?.error?.message === "Validation failed"
              ? data?.error?.details?.message || "Validation failed"
              : data?.error?.message || "Failed to update";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        return;
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
          prefetch={false}
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
          prefetch={false}
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
          prefetch={false}
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
        prefetch={false}
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

              <div className="space-y-4 col-span-1 sm:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700 tracking-wide">
                    Price Categories*
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPriceCategory}
                    className="h-8 gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Category
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.price_categories.map((cat, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <Input
                          placeholder="Category (e.g. Base Price)"
                          value={cat.category}
                          onChange={(e) =>
                            handlePriceCategoryChange(
                              idx,
                              "category",
                              e.target.value,
                            )
                          }
                          readOnly={
                            cat.category?.toLowerCase() === "base price"
                          }
                          className={cn(
                            "w-full text-sm bg-white border-slate-200",
                            cat.category?.toLowerCase() === "base price" &&
                              "bg-slate-50 cursor-not-allowed",
                          )}
                        />
                      </div>
                      <div className="w-32 sm:w-40">
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="number"
                            placeholder="Price"
                            value={cat.price}
                            onChange={(e) =>
                              handlePriceCategoryChange(
                                idx,
                                "price",
                                e.target.value,
                              )
                            }
                            className="pl-9 w-full text-sm bg-white border-slate-200"
                          />
                        </div>
                      </div>
                      {formData.price_categories.length > 1 &&
                        cat.category?.toLowerCase() !== "base price" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePriceCategory(idx)}
                            className="text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-colors"
                          >
                            <FaTrash className="w-4 h-4" />
                          </Button>
                        )}
                    </div>
                  ))}
                </div>
                {errors.price_categories && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.price_categories}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Start Date*
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10 pointer-events-none" />
                  <DatePicker
                    selected={
                      formData.start_date ? new Date(formData.start_date) : null
                    }
                    onChange={(date) =>
                      handleChange(
                        "start_date",
                        date ? format(date, "yyyy-MM-dd") : "",
                      )
                    }
                    minDate={new Date()}
                    placeholderText="Pick a date"
                    dateFormat="MMM d, yyyy"
                    wrapperClassName="w-full"
                    customInput={
                      <Input
                        readOnly
                        inputMode="none"
                        className="pl-9 w-full text-sm bg-white border-slate-200 h-10"
                      />
                    }
                  />
                </div>
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
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10 pointer-events-none" />
                  <DatePicker
                    selected={
                      formData.end_date ? new Date(formData.end_date) : null
                    }
                    onChange={(date) =>
                      handleChange(
                        "end_date",
                        date ? format(date, "yyyy-MM-dd") : "",
                      )
                    }
                    minDate={
                      formData.start_date
                        ? new Date(
                            Math.max(new Date(), new Date(formData.start_date)),
                          )
                        : new Date()
                    }
                    placeholderText="Pick a date"
                    dateFormat="MMM d, yyyy"
                    wrapperClassName="w-full"
                    customInput={
                      <Input
                        readOnly
                        inputMode="none"
                        className="pl-9 w-full text-sm bg-white border-slate-200 h-10"
                      />
                    }
                  />
                </div>
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
                    {accumulatedTripTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}

                    {typePagination?.pages > 1 &&
                      typePage < typePagination.pages && (
                        <div className="flex items-center justify-center py-2 absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t cursor-default z-10">
                          <div
                            className="p-1 hover:bg-slate-100 rounded-full transition-colors animate-bounce"
                            onMouseEnter={() => {
                              if (
                                typePage < typePagination.pages &&
                                !loadingTripTypes
                              ) {
                                setTypePage((prev) => prev + 1);
                              }
                            }}
                          >
                            <ChevronDown className="h-4 w-4 text-teal-600" />
                          </div>
                        </div>
                      )}
                  </SelectContent>
                </Select>

                {errors.type_id && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.type_id}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Hotel Category
                </label>
                <div className="flex items-center h-10 mt-1">
                  <Rating
                    value={formData.hotel_category}
                    onChange={(val) => handleChange("hotel_category", val)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Source Location
                </label>
                <Card className="border border-slate-200 shadow-none">
                  <CardContent className="p-3 flex justify-between items-center">
                    <span className="text-sm truncate mr-2">
                      {formData.source?.name || "None selected"}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSourceMap(true)}
                    >
                      Map
                    </Button>
                  </CardContent>
                </Card>
                {errors.source && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.source}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Destination Location
                </label>
                <Card className="border border-slate-200 shadow-none">
                  <CardContent className="p-3 flex justify-between items-center">
                    <span className="text-sm truncate mr-2">
                      {formData.destination?.name || "None selected"}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDestinationMap(true)}
                    >
                      Map
                    </Button>
                  </CardContent>
                </Card>
                {errors.destination && (
                  <p className="text-xs text-admin-error mt-1">
                    {errors.destination}
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
            {errors.images && (
              <p className="text-xs text-admin-error mt-1">{errors.images}</p>
            )}
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
                    className="flex-1 text-base bg-white border-slate-200 focus:ring-teal-500/20"
                    placeholder="e.g., Accommodation"
                  />
                  {formData.inclusions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem("inclusions", i)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Remove inclusion"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
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
            {errors.inclusions && (
              <p className="text-admin-error text-xs font-medium animate-in fade-in slide-in-from-top-1 mt-2">
                {errors.inclusions}
              </p>
            )}
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
                    className="flex-1 text-base bg-white border-slate-200 focus:ring-teal-500/20"
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
            {errors.exclusions && (
              <p className="text-admin-error text-xs font-medium animate-in fade-in slide-in-from-top-1 mt-2">
                {errors.exclusions}
              </p>
            )}
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

                    {formData.itinerary.length > 1 && (
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
                    )}
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
                          className="flex-1 text-base bg-white border-slate-200 focus:ring-teal-500/20"
                          placeholder={`Activity ${i + 1}`}
                        />

                        {day.activities.length > 1 && (
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
                        )}
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
            {errors.itinerary && (
              <p className="text-admin-error text-xs font-medium animate-in fade-in slide-in-from-top-1 mt-2">
                {errors.itinerary}
              </p>
            )}
          </section>

          <div className="space-y-1.5 col-span-1 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-700 tracking-wide">
              Cancellation Policy
            </label>
            <pre
              contentEditable
              onInput={() => setIsModified(true)}
              onBlur={(e) => {
                const value = e.currentTarget.innerText;
                setFormData((prev) => ({
                  ...prev,
                  cancellation_policy: value,
                }));
                setIsModified(true);
              }}
              className="w-full min-h-[120px] p-4 text-sm border border-slate-200 rounded-lg bg-white overflow-auto whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-sans"
              suppressContentEditableWarning={true}
            >
              {formData.cancellation_policy}
            </pre>
          </div>

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
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-linear-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(saving || uploadingImage) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        </form>
      </div>

      {/* Map Popups */}
      {showSourceMap && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-[80vw] md:w-[60vw] h-[40vh] md:h-[65vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <span className="font-semibold text-gray-800">
                Select Source Location
              </span>
              <button onClick={() => setShowSourceMap(false)}>
                <IoCloseSharp size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-white">
              <MapPicker
                onLocationSelect={(loc) => handleLocationSelect("source", loc)}
                initialCenter={[20.5937, 78.9629]}
                initialZoom={5}
              />
            </div>
          </div>
        </div>
      )}

      {showDestinationMap && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-[80vw] md:w-[60vw] h-[40vh] md:h-[65vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <span className="font-semibold text-gray-800">
                Select Destination Location
              </span>
              <button onClick={() => setShowDestinationMap(false)}>
                <IoCloseSharp size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-white">
              <MapPicker
                onLocationSelect={(loc) =>
                  handleLocationSelect("destination", loc)
                }
                initialCenter={[20.5937, 78.9629]}
                initialZoom={5}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
