import { useCallback, useEffect, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { IoCloseSharp } from "react-icons/io5";
import Input from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { useToast } from "@/app/hooks/use-toast";
import { Loader2, IndianRupee } from "lucide-react";
import { Rating } from "../ui/rating";
import { format } from "date-fns";

const DatePicker = dynamic(() => import("react-datepicker"), { ssr: false });
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon } from "lucide-react";
import useTripTypes from "@/app/hooks/use-triptypes";
import useAdminOperators from "@/app/hooks/use-admin-operators";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { FaPlus, FaTrash } from "react-icons/fa";
import { ChevronDown } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const MapPicker = dynamic(() => import("@/app/components/MapPickerTrip"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
    </div>
  ),
});

function AddTripModal({ handleModalClose, extraOperators = [] }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSourceMap, setShowSourceMap] = useState(false);
  const [showDestinationMap, setShowDestinationMap] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const { toast } = useToast();

  // Operator Pagination & Accumulation
  const [opPage, setOpPage] = useState(1);
  const {
    operators,
    pagination: opPagination,
    loadingOperators,
  } = useAdminOperators({
    status: "ACTIVE",
    page: opPage,
    limit: 10,
  });
  const [accumulatedOperators, setAccumulatedOperators] = useState([]);

  useEffect(() => {
    if (operators?.length > 0) {
      setAccumulatedOperators((prev) => {
        const existingIds = new Set(prev.map((o) => o.id));
        const newOps = operators.filter((o) => !existingIds.has(o.id));
        return [...prev, ...newOps];
      });
    }
  }, [operators]);

  const combinedOperators = useMemo(() => {
    return accumulatedOperators;
  }, [accumulatedOperators]);

  // Trip Type Pagination & Accumulation
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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_categories: [{ category: "Base Price", price: "" }],
    batches: [{ start_date: "", end_date: "" }],
    difficulty: "",
    total_seats: "",
    type_id: "",
    hotel_category: 0,
    operator_id: "",
    source: {
      name: "",
      region: "",
      latitude: "",
      longitude: "",
      type: "CITY",
      id: "",
    },
    destination: {
      name: "",
      region: "",
      latitude: "",
      longitude: "",
      type: "CITY",
      id: "",
    },
    status: "DRAFT",
    images: [],
    inclusions: [""],
    exclusions: [""],
    itinerary: [{ day: 1, activities: [""] }],
    cancellation_policy: "",
  });

  const handleBatchChange = (index, field, value) => {
    const updated = [...formData.batches];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((p) => ({ ...p, batches: updated }));
    setFieldErrors((p) => ({
      ...p,
      [`batch_${index}_${field}`]: "",
      batches: "",
    }));
  };

  const addBatch = () => {
    setFormData((p) => ({
      ...p,
      batches: [...p.batches, { start_date: "", end_date: "" }],
    }));
  };

  const removeBatch = (index) => {
    if (formData.batches.length === 1) return;
    setFormData((p) => ({
      ...p,
      batches: formData.batches.filter((_, i) => i !== index),
    }));
  };

  // Removed manual fetchOperators in favor of useAdminOperators hook

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("source.") || name.startsWith("destination.")) {
      const [location, field] = name.split(".");
      setFormData((p) => ({
        ...p,
        [location]: { ...p[location], [field]: value },
      }));
      setFieldErrors((p) => ({ ...p, [location]: "" }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
      setFieldErrors((p) => ({ ...p, [name]: "" }));
    }
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
        setFieldErrors((p) => ({ ...p, [type]: "" }));
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
          setFieldErrors((p) => ({ ...p, [type]: "" }));
        }
      }

      if (type === "source") setShowSourceMap(false);
      else setShowDestinationMap(false);
    } catch (err) {
      console.error("Location error:", err);
    }
  };

  const handleImageUpload = async (e) => {
    // const validTypes = [
    //   "image/jpeg",
    //   "image/png",
    //   "image/jpg",
    //   "image/heif",
    //   "image/heic",
    // ];

    const file = e.target.files[0];
    if (!file) return;

    // if (!validTypes.includes(file.type)) {
    //   toast({
    //     title: "Error",
    //     description: "Only JPG and PNG images are allowed",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    const token = Cookies.get("token");
    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormData((p) => ({ ...p, images: [...p.images, data.result.url] }));
        setFieldErrors((p) => ({ ...p, images: "" }));
      } else {
        toast({
          title: "Upload Failed",
          description: data?.error?.message || "Image upload failed.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);

      toast({
        title: "Upload Failed",
        description: err.message || "Network error while uploading image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index),
    }));
  };

  const handleListChange = (key, index, value) => {
    const arr = [...formData[key]];
    arr[index] = value;
    setFormData((p) => ({ ...p, [key]: arr }));
    setFieldErrors((p) => ({ ...p, [key]: "" }));
  };

  const addListItem = (key) =>
    setFormData((p) => ({ ...p, [key]: [...p[key], ""] }));

  const removeListItem = (key, index) => {
    if (formData[key].length === 1) return;
    setFormData((p) => ({
      ...p,
      [key]: formData[key].filter((_, i) => i !== index),
    }));
  };

  const handlePriceCategoryChange = (index, field, value) => {
    const categories = [...formData.price_categories];
    categories[index] = { ...categories[index], [field]: value };
    setFormData((p) => ({ ...p, price_categories: categories }));
    setFieldErrors((p) => ({ ...p, price_categories: "" }));
  };

  const addPriceCategory = () => {
    setFormData((p) => ({
      ...p,
      price_categories: [...p.price_categories, { category: "", price: "" }],
    }));
  };

  const removePriceCategory = (index) => {
    if (formData.price_categories.length === 1) return;
    setFormData((p) => ({
      ...p,
      price_categories: formData.price_categories.filter((_, i) => i !== index),
    }));
  };

  const addDay = () =>
    setFormData((p) => ({
      ...p,
      itinerary: [
        ...p.itinerary,
        { day: p.itinerary.length + 1, activities: [""] },
      ],
    }));

  const removeDay = (index) => {
    if (formData.itinerary.length === 1) return;
    const filtered = formData.itinerary.filter((_, i) => i !== index);
    const updated = filtered.map((d, i) => ({ ...d, day: i + 1 }));
    setFormData((p) => ({ ...p, itinerary: updated }));
  };

  const addActivity = (dIdx) => {
    const it = [...formData.itinerary];
    it[dIdx].activities.push("");
    setFormData((p) => ({ ...p, itinerary: it }));
  };

  const removeActivity = (dIdx, aIdx) => {
    if (formData.itinerary[dIdx].activities.length === 1) return;
    const it = [...formData.itinerary];
    it[dIdx].activities = it[dIdx].activities.filter((_, i) => i !== aIdx);
    setFormData((p) => ({ ...p, itinerary: it }));
  };

  const handleActivity = (dIdx, aIdx, val) => {
    const it = [...formData.itinerary];
    it[dIdx].activities[aIdx] = val;
    setFormData((p) => ({ ...p, itinerary: it }));
    setFieldErrors((p) => ({ ...p, itinerary: "" }));
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstError = document.querySelector(".text-admin-error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim() || formData.name.trim().length < 3) {
      errors.name = "Trip name must be at least 3 characters.";
    }

    if (
      !formData.description?.trim() ||
      formData.description.trim().length < 10
    ) {
      errors.description = "Description must be at least 10 characters.";
    }

    if (!formData.price_categories || formData.price_categories.length === 0) {
      errors.price_categories = "At least one price category is required.";
    } else {
      const basePrices = formData.price_categories.filter(
        (c) => c.category?.trim().toLowerCase() === "base price",
      );
      if (basePrices.length === 0) {
        errors.price_categories =
          "At least one price category (Base Price) is required.";
      } else if (basePrices.length > 1) {
        errors.price_categories =
          "Exactly one Base Price category is required.";
      } else if (
        formData.price_categories.some((c) => !c.category?.trim() || !c.price)
      ) {
        errors.price_categories = "Please fill all category names and prices.";
      } else if (formData.price_categories.some((c) => Number(c.price) <= 0)) {
        errors.price_categories = "Prices must be greater than 0.";
      }
    }

    if (!formData.total_seats || Number(formData.total_seats) <= 0) {
      errors.total_seats = "Total seats must be at least 1.";
    }

    if (!formData.difficulty) {
      errors.difficulty = "Please select difficulty.";
    }

    if (!formData.type_id) {
      errors.type_id = "Please select a trip type.";
    }

    if (!formData.operator_id) {
      errors.operator_id = "Please select an operator.";
    }

    if (!formData.batches || formData.batches.length === 0) {
      errors.batches = "At least one batch is required.";
    } else {
      formData.batches.forEach((batch, idx) => {
        if (!batch.start_date) {
          errors[`batch_${idx}_start_date`] = "Start date is required.";
        }
        if (!batch.end_date) {
          errors[`batch_${idx}_end_date`] = "End date is required.";
        }
        if (batch.start_date && batch.end_date) {
          if (new Date(batch.end_date) < new Date(batch.start_date)) {
            errors[`batch_${idx}_end_date`] = "End date cannot be before start date.";
          }
        }
      });
    }

    if (!formData.source.id) {
      errors.source = "Please select a source location.";
    }

    if (!formData.destination.id) {
      errors.destination = "Please select a destination location.";
    }

    if (!formData.images || formData.images.length === 0) {
      errors.images = "At least one trip image is required.";
    }

    if (!formData.inclusions || formData.inclusions.some((i) => !i.trim())) {
      errors.inclusions =
        "Please fill all inclusion fields or remove empty ones.";
    }

    // if (!formData.exclusions || formData.exclusions.some((i) => !i.trim())) {
    //   errors.exclusions =
    //     "Please fill all exclusion fields or remove empty ones.";
    // }

    const hasIncompleteItinerary = formData.itinerary.some(
      (day) => !day.activities || day.activities.some((a) => !a.trim()),
    );
    if (hasIncompleteItinerary) {
      errors.itinerary =
        "Please complete all itinerary days or remove empty activities.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      scrollToFirstError();
      return;
    }

    const token = Cookies.get("token");
    setLoading(true);

    const cleanedInclusions = formData.inclusions.map((item) => item.trim());

    const cleanedExclusions = formData.exclusions
      .map((item) => item.trim())
      .filter(Boolean);

    const cleanedItinerary = formData.itinerary.map((day) => ({
      ...day,
      activities: day.activities.map((activity) => activity.trim()),
    }));

    const basePrice = formData.price_categories.find(
      (c) => c.category?.trim().toLowerCase() === "base price"
    )?.price || 0;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(basePrice),
      price_categories: formData.price_categories.map((c) => ({
        category: c.category.trim(),
        price: Number(c.price),
      })),
      start_date: formData.batches[0]?.start_date || "",
      end_date: formData.batches[0]?.end_date || "",
      batches: formData.batches.map((b) => ({
        start_date: b.start_date,
        end_date: b.end_date,
      })),
      difficulty: formData.difficulty,
      total_seats: Number(formData.total_seats),
      trip_type_id: formData.type_id,
      ...(formData.hotel_category > 0 && {
        hotel_category: formData.hotel_category,
      }),
      operator_id: formData.operator_id,
      source: formData.source,
      destination: formData.destination,
      status: formData.status,
      images: formData.images,
      inclusions: cleanedInclusions,
      itinerary: cleanedItinerary,
      source_id: formData.source.id,
      destination_id: formData.destination.id,
      ...(cleanedExclusions.length > 0 && { exclusions: cleanedExclusions }),
      ...(formData.cancellation_policy?.trim() && {
        cancellation_policy: formData.cancellation_policy.trim(),
      }),
    };

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/trips/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // console.log("req", payload);

      if (res.ok && data.success) {
        toast({
          title: "Success",
          description: "Trip created!",
          variant: "success",
        });
        handleModalClose(false);
      } else {
        const errorMessage =
          Array.isArray(data?.error?.details) && data.error.details.length > 0
            ? data.error.details.map((detail) => detail.message).join(", ")
            : data?.error?.message === "Validation failed"
              ? data?.error?.details?.message || "Validation failed"
              : data?.error?.message || "Failed to create trip.";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Network error while creating trip.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-[80vw] md:w-[70vw] max-w-6xl h-[70vh] lg:h-[90vh] rounded-xl shadow-lg flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-[#14181F]">
            Create New Trip
          </h2>
          <button
            onClick={() => handleModalClose(false)}
            className="text-gray-500 hover:text-black text-xl p-1"
          >
            <IoCloseSharp size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* ── Section 1: Basic Information ── */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-slate-50/60 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-gray-200">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold shrink-0">1</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Basic Information</h3>
                  <p className="text-xs text-gray-400">Trip name, pricing, seats &amp; difficulty</p>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

            <div className="col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Trip Name <span className="text-red-400">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="E.g., Himalayan Base Camp"
              />
              {fieldErrors.name && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-600">
                  Price Categories <span className="text-red-400">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPriceCategory}
                  className="h-8 gap-1"
                >
                  <FaPlus className="w-3 h-3" /> Add Category
                </Button>
              </div>

              <div className="space-y-3">
                {formData.price_categories.map((cat, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="e.g. Base Price, Early Bird"
                        value={cat.category}
                        onChange={(e) =>
                          handlePriceCategoryChange(
                            idx,
                            "category",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="w-32 sm:w-40">
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={cat.price}
                          className="pl-9"
                          onChange={(e) =>
                            handlePriceCategoryChange(
                              idx,
                              "price",
                              e.target.value,
                            )
                          }
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
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <FaTrash />
                        </Button>
                      )}
                  </div>
                ))}
              </div>
              {fieldErrors.price_categories && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.price_categories}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Total Seats <span className="text-red-400">*</span>
              </label>
              <Input
                name="total_seats"
                type="number"
                value={formData.total_seats}
                onChange={handleChange}
              />
              {fieldErrors.total_seats && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.total_seats}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Difficulty <span className="text-red-400">*</span>
              </label>
              <Select
                value={formData.difficulty}
                onValueChange={(v) =>
                  handleChange({ target: { name: "difficulty", value: v } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MODERATE">Moderate</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.difficulty && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.difficulty}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Trip Type <span className="text-red-400">*</span>
              </label>
              <Select
                value={formData.type_id}
                onValueChange={(v) => {
                  setFormData((p) => ({ ...p, type_id: v }));
                  setFieldErrors((p) => ({ ...p, type_id: "" }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trip Type" />
                </SelectTrigger>
                <SelectContent>
                  {accumulatedTripTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
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
              {fieldErrors.type_id && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.type_id}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Hotel Category
              </label>
              <div className="flex items-center h-10 mt-1">
                <Rating
                  value={formData.hotel_category}
                  onChange={(val) =>
                    setFormData((p) => ({ ...p, hotel_category: val }))
                  }
                />
              </div>
            </div>

              </div>{/* end .p-5 grid */}
            </div>{/* end Section 1 card */}

            {/* ── Section 2: Trip Batches ── */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-slate-50/60 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-gray-200">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold shrink-0">2</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">Trip Batches</h3>
                  <p className="text-xs text-gray-400">Schedule one or more date batches</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBatch}
                  className="h-8 gap-1"
                >
                  <FaPlus className="w-3 h-3" /> Add Batch
                </Button>
              </div>
              <div className="p-5">

              <div className="space-y-4">
                {formData.batches.map((batch, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50/30 space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-600">Batch #{idx + 1}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                          SCHEDULED
                        </span>
                      </div>
                      {formData.batches.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBatch(idx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        >
                          <FaTrash size={12} />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium">Start Date *</label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10 pointer-events-none" />
                          <DatePicker
                            selected={batch.start_date ? new Date(batch.start_date) : null}
                            onChange={(date) => handleBatchChange(idx, "start_date", date ? format(date, "yyyy-MM-dd") : "")}
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
                        {fieldErrors[`batch_${idx}_start_date`] && (
                          <p className="text-admin-error text-xs mt-1">
                            {fieldErrors[`batch_${idx}_start_date`]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium">End Date *</label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10 pointer-events-none" />
                          <DatePicker
                            selected={batch.end_date ? new Date(batch.end_date) : null}
                            onChange={(date) => handleBatchChange(idx, "end_date", date ? format(date, "yyyy-MM-dd") : "")}
                            minDate={
                              batch.start_date
                                ? new Date(Math.max(new Date().getTime(), new Date(batch.start_date).getTime()))
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
                        {fieldErrors[`batch_${idx}_end_date`] && (
                          <p className="text-admin-error text-xs mt-1">
                            {fieldErrors[`batch_${idx}_end_date`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {fieldErrors.batches && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.batches}
                </p>
              )}
              </div>{/* end .p-5 */}
            </div>{/* end Section 2 card */}

            {/* ── Section 3: Operator & Locations ── */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-slate-50/60 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-gray-200">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold shrink-0">3</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Operator & Locations</h3>
                  <p className="text-xs text-gray-400">Assign operator, source &amp; destination</p>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

            <div className="col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Operator <span className="text-red-400">*</span>
              </label>
              <Select
                value={formData.operator_id}
                onValueChange={(v) =>
                  handleChange({ target: { name: "operator_id", value: v } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Operator" />
                </SelectTrigger>
                <SelectContent>
                  {combinedOperators.map((op) => (
                    <SelectItem key={op.id} value={String(op.id)}>
                      {op.name}
                    </SelectItem>
                  ))}

                  {opPagination?.pages > 1 && opPage < opPagination.pages && (
                    <div className="flex items-center justify-center py-2 absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t cursor-default z-10">
                      <div
                        className="p-1 hover:bg-slate-100 rounded-full transition-colors animate-bounce"
                        onMouseEnter={() => {
                          if (
                            opPage < opPagination.pages &&
                            !loadingOperators
                          ) {
                            setOpPage((prev) => prev + 1);
                          }
                        }}
                      >
                        <ChevronDown className="h-4 w-4 text-teal-600" />
                      </div>
                    </div>
                  )}
                </SelectContent>
              </Select>
              {fieldErrors.operator_id && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.operator_id}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Source Location <span className="text-red-400">*</span>
              </label>
              <Card className="border shadow-none">
                <CardContent className="p-3 flex justify-between items-center">
                  <span className="text-sm truncate mr-2">
                    {formData.source.name || "None selected"}
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
              {fieldErrors.source && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.source}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Destination Location <span className="text-red-400">*</span>
              </label>
              <Card className="border shadow-none">
                <CardContent className="p-3 flex justify-between items-center">
                  <span className="text-sm truncate mr-2">
                    {formData.destination.name || "None selected"}
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
              {fieldErrors.destination && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.destination}
                </p>
              )}
            </div>

              </div>{/* end .p-5 grid */}
            </div>{/* end Section 3 card */}

            {/* ── Section 4: Experience Details ── */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-slate-50/60 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-gray-200">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold shrink-0">4</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Experience Details</h3>
                  <p className="text-xs text-gray-400">Description, images, inclusions &amp; exclusions</p>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

            <div className="col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                // required
              />
              {fieldErrors.description && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-600">
                  Images <span className="text-red-400">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("imgUpload").click()}
                >
                  <FaPlus className="mr-2 h-3 w-3" /> Upload
                </Button>
                <input
                  type="file"
                  id="imgUpload"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {formData.images.map((url, i) => (
                  <div key={i} className="relative aspect-square">
                    <img
                      src={url}
                      className="w-full h-full object-cover rounded-lg border"
                      alt="trip"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <IoCloseSharp size={10} />
                    </button>
                  </div>
                ))}
              </div>
              {fieldErrors.images && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.images}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-600">
                  Inclusions <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => addListItem("inclusions")}
                  className="text-xs text-teal-600"
                >
                  + Add
                </button>
              </div>
              {formData.inclusions.map((item, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleListChange("inclusions", i, e.target.value)
                    }
                  />
                  {formData.inclusions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeListItem("inclusions", i)}
                      className="text-red-400 p-1 hover:bg-red-50 rounded"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
              ))}
              {fieldErrors.inclusions && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.inclusions}
                </p>
              )}
            </div>

            {formData?.exclusions && (
              <div className="col-span-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-600">
                    Exclusions
                  </label>
                  <button
                    type="button"
                    onClick={() => addListItem("exclusions")}
                    className="text-xs text-teal-600"
                  >
                    + Add
                  </button>
                </div>
                {formData.exclusions.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) =>
                        handleListChange("exclusions", i, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem("exclusions", i)}
                      className="text-red-400 p-1 hover:bg-red-50 rounded"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
                {fieldErrors.exclusions && (
                  <p className="text-admin-error text-xs mt-1">
                    {fieldErrors.exclusions}
                  </p>
                )}
              </div>
            )}

              </div>{/* end .p-5 grid */}
            </div>{/* end Section 4 card */}

            {/* ── Section 5: Itinerary ── */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-slate-50/60 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-gray-200">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold shrink-0">5</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">Itinerary</h3>
                  <p className="text-xs text-gray-400">Day-by-day plan with activities</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDay}
                >
                  <FaPlus className="mr-2 h-3 w-3" /> New Day
                </Button>
              </div>
              <div className="p-5">
              <div className="space-y-4">
                {formData.itinerary.map((day, dIdx) => (
                  <Card key={dIdx} className="bg-gray-50/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">
                          Day {day.day}
                        </span>
                        {formData.itinerary.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDay(dIdx)}
                            className="text-red-500 text-xs hover:underline bg-red-50 px-2 py-1 rounded"
                          >
                            <FaTrash size={10} className="inline mr-1" /> Delete
                            Day
                          </button>
                        )}
                      </div>
                      <div className="space-y-2 border-l-2 border-teal-500 pl-3">
                        {day.activities.map((act, aIdx) => (
                          <div key={aIdx} className="flex gap-2">
                            <Input
                              value={act}
                              onChange={(e) =>
                                handleActivity(dIdx, aIdx, e.target.value)
                              }
                              className="bg-white"
                            />
                            {day.activities.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeActivity(dIdx, aIdx)}
                                className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                              >
                                <FaTrash size={10} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addActivity(dIdx)}
                          className="text-xs text-teal-600 hover:underline"
                        >
                          + Add Activity
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {fieldErrors.itinerary && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.itinerary}
                </p>
              )}

              </div>{/* end .p-5 */}
            </div>{/* end Section 5 card */}

            {/* ── Section 6: Cancellation Policy ── */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-slate-50/60 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-gray-200">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold shrink-0">6</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Cancellation Policy</h3>
                  <p className="text-xs text-gray-400">Optional refund / cancellation terms</p>
                </div>
              </div>
              <div className="p-5">
              <pre
                contentEditable
                onBlur={(e) => {
                  const value = e.currentTarget.innerText || "";
                  setFormData((prev) => ({
                    ...prev,
                    cancellation_policy: value,
                  }));
                }}
                className="w-full min-h-[120px] p-4 text-sm border rounded-lg bg-slate-50/50 overflow-auto whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                suppressContentEditableWarning={true}
              >
                {formData.cancellation_policy}
              </pre>
              </div>
            </div>{/* end Section 6 card */}

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-2">
              <button
                type="button"
                onClick={() => handleModalClose(false)}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="w-full sm:w-auto px-8 py-2 bg-[#4ED0C3] text-white rounded-lg text-sm font-semibold hover:bg-[#3db8ab] shadow-sm"
              >
                {loading ? "Creating..." : "Create Trip"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Popups outside main layout flow */}
      {showSourceMap && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-[80vw] md:w-[60vw] h-[40vh] md:h-[65vh]  rounded-xl flex flex-col shadow-2xl overflow-hidden">
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
          <div className="bg-white w-[80vw] md:w-[60vw] h-[40vh] md:h-[65vh]  rounded-xl flex flex-col shadow-2xl overflow-hidden">
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

export default AddTripModal;
