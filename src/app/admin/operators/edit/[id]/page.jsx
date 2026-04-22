"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Save, ArrowLeft, AlertCircle, Loader2, X } from "lucide-react";
import Cookies from "js-cookie";
import Input from "@/app/components/ui/input";
import PhoneInput from "@/app/components/ui/PhoneInput";
import { useToast } from "@/app/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Rating } from "@/app/components/ui/rating";
import useSWR from "swr";
import { adminFetcher } from "@/app/hooks/use-admin-fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default function OperatorEditPage() {
  const { toast } = useToast();
  const { id } = useParams();
  const router = useRouter();

  const [operator, setOperator] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [regionInput, setRegionInput] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const handlePhoneValidation = useCallback(
    (valid) => setIsPhoneValid(valid),
    [],
  );

  const {
    data: operatorData,
    error: operatorFetchError,
    isLoading: loadingOperator,
    mutate: mutateOperator,
  } = useSWR(
    id ? `${BASE_URL}/api/${API_VERSION}/operators/admin/${id}` : null,
    adminFetcher,
    { revalidateOnFocus: false },
  );

  // Synchronize error states
  useEffect(() => {
    if (operatorFetchError) {
      setError(operatorFetchError);
      toast({
        title: "Error",
        description: operatorFetchError,
        variant: "destructive",
      });
    }
  }, [operatorFetchError, toast]);

  // Handle data load - Seed ONLY once when operator is null
  useEffect(() => {
    if (operatorData?.success && !operator) {
      const dbOp = operatorData.result;
      setOperator(dbOp);
      setFormData({
        name: dbOp.name || "",
        email: dbOp.email || "",
        phone_number: dbOp.phone_number || "",
        contact_name: dbOp.contact_name || "",
        business_description: dbOp.business_description || "",
        website_url: dbOp.website_url || "",
        logo_url: dbOp.logo_url || "",
        status: dbOp.status || "",
        hotel_category: dbOp.hotel_category || 0,
        total_trips: dbOp.total_trips || null,
        trips_per_year: dbOp.trips_per_year || null,
        regions: dbOp.regions || [],
        trip: dbOp.trip || [],
        social_links: dbOp.social_links || {},
      });
      setIsPhoneValid(true); // Trust existing data on load
      setLoading(false);
    }
  }, [operatorData, operator]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) setError("");
    setIsModified(true);
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

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    if (file.size > MAX_SIZE) {
      setError("Image size must be less than 5MB");
      e.target.value = ""; // reset input
      return;
    }

    setUploadingImage(true);
    setError("");

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

      // ✅ update logo_url after upload
      setFormData((prev) => ({
        ...prev,
        logo_url: data.result.url,
      }));
      setIsModified(true);
    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstError = document.querySelector(".text-admin-error");
      if (firstError) {
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  const validateForm = () => {
    const errors = {};

    // Regex: must start with letter or number
    const startsWithValidChar = /^[A-Za-z][A-Za-z\s.'-]*$/;

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = "Operator name must be at least 2 characters.";
    }

    if (
      !formData.business_description ||
      formData.business_description.trim().length < 25
    ) {
      errors.business_description =
        "Description must be at least 25 characters.";
    }

    if (!formData.regions || formData.regions.length === 0) {
      errors.regions = "Add at least 1 operating region.";
    }

    // if (!formData.logo_url) {
    //   errors.logo_url = "Add Image.";
    // }

    if (!formData.contact_name || formData.contact_name.trim().length < 2) {
      errors.contact_name = "Contact person must be at least 2 characters.";
    } else if (!startsWithValidChar.test(formData.contact_name.trim())) {
      errors.contact_name =
        "Contact person cannot start with a special character.";
    }

    if (!formData.email) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format.";
    }

    if (!isPhoneValid) {
      errors.phone_number = "Please enter a valid phone number";
    }

    if (
      formData.website_url &&
      !/^https?:\/\/.+\..+/.test(formData.website_url)
    ) {
      errors.website_url = "Invalid website URL.";
    }

    // Social links validation - Using keys that match JSX expectations
    Object.entries(formData.social_links || {}).forEach(([platform, url]) => {
      if (url && !/^https?:\/\/.+\..+/.test(url)) {
        errors[`social_links.${platform}`] = `Invalid URL for ${platform}`;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // console.log("operator", operator);
    if (!operator) return;

    if (!validateForm()) {
      setSaving(false);
      scrollToFirstError();
      return;
    }

    setSaving(true);
    setError("");

    const token = Cookies.get("token");

    // Only changed fields
    const requestBody = {};

    Object.keys(formData).forEach((key) => {
      if (key === "phone_number") {
        if (formData.phone_number !== operator.phone_number) {
          requestBody.phone_number = formData.phone_number;
        }
      } else if (key === "regions") {
        if (
          JSON.stringify(formData.regions) !== JSON.stringify(operator.regions)
        ) {
          requestBody.regions = formData.regions;
        }
      } else if (key === "social_links") {
        if (
          JSON.stringify(formData.social_links) !==
          JSON.stringify(operator.social_links)
        ) {
          requestBody.social_links = formData.social_links;
        }
      } else if (key === "total_trips" || key === "trips_per_year") {
        const newVal =
          formData[key] === "" || formData[key] === null
            ? 0
            : Number(formData[key]);
        const oldVal =
          operator[key] === null || operator[key] === undefined
            ? 0
            : Number(operator[key]);
        if (newVal !== oldVal) {
          requestBody[key] = newVal;
        }
      } else if (key === "hotel_category") {
        if (formData[key] && formData[key] > 0) {
          requestBody[key] = formData[key];
        }
      } else if ((formData[key] ?? "") !== (operator[key] ?? "")) {
        requestBody[key] = formData[key];
      }
    });

    if (Object.keys(requestBody).length === 0) {
      toast({
        title: "Operator",
        description: "No changes detected!",
        variant: "success",
      });
      router.push(`/admin/operators/${id}`);
      setSaving(false);
      setIsModified(false);
      return;
    }

    // console.log("req", requestBody);

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators/admin/${id}`,
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

      if (!res.ok || !data.success) {
        const errorMessage =
          Array.isArray(data?.error?.details) && data.error.details.length > 0
            ? data.error.details.map((detail) => detail.message).join(", ")
            : data?.error?.message === "Validation failed"
              ? data?.error?.details?.message || "Validation failed"
              : data?.error?.message || "Failed to update operator";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      mutateOperator(); // Refresh SWR cache with updated data
      toast({
        title: "Operator",
        description: "Operator updated successfully!",
        variant: "success",
      });

      // Small delay to let mutate finish before navigating
      setTimeout(() => {
        router.push(`/admin/operators/${id}`);
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="p-3 sm:p-6 bg-linear-to-br from-slate-50 via-white to-slate-100">
        {" "}
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
  if (error && !formData) {
    return (
      <div className="p-3 sm:p-6 bg-gray-50">
        <Link
          href="/admin/operators"
          prefetch={false}
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft size={25} />
          Back to Operators
        </Link>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl p-8 max-w-6xl mx-auto">
          {" "}
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

  if (!formData) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6">
          <div className="text-center py-16 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium">Operator not found</p>
          </div>
        </div>
      </div>
    );
  }

  // social links handler
  const handleSocialLinkChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
    setFieldErrors((prev) => ({ ...prev, [`social_links.${platform}`]: "" }));
    if (error) setError("");
    setIsModified(true);
  };

  return (
    <div className="">
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 last:pb-0">
        <Link
          prefetch={false}
          href={`/admin/operators/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium hover:text-teal-600 transition-colors"
        >
          <ArrowLeft size={25} />
          Back to Details
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight mb-6 sm:mb-8">
            Edit Operator
          </h1>
          {/* Enhanced Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-admin-error text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            {/* Logo Section */}
            <div className="bg-slate-50/80 p-2 rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-400 transition-colors">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">
                Operator Logo
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {formData.logo_url && (
                  <div className="shrink-0 group">
                    <div className="relative">
                      <img
                        src={formData.logo_url}
                        alt="Logo Preview"
                        className="h-32 w-32 object-cover rounded-2xl ring-4 ring-white shadow-xl transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = "/vercel.svg";
                          e.target.onerror = null;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                    </div>
                    <p className="mt-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Current Logo
                    </p>
                    {fieldErrors.logo_url && (
                      <p className="text-admin-error text-xs font-medium animate-in fade-in slide-in-from-top-1">
                        {fieldErrors.logo_url}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex-1 w-full space-y-4">
                  <div className="relative group">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="w-full border-slate-200 bg-white ring-offset-slate-50 hover:border-teal-500 focus-visible:ring-teal-500 file:bg-teal-50 file:text-teal-700 file:border-0 file:px-4 file:py-2 file:rounded-xl file:text-xs file:font-bold hover:file:bg-teal-100 transition-all"
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
                  <div className="flex flex-wrap gap-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                      PNG, JPG, HEIF, HEIC
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                      MAX 5MB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["name", "Operator Name"],
                ["contact_name", "Contact Person"],
                ["email", "Email"],
                ["phone_number", "Phone"],
                ["website_url", "Website"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 tracking-wide">
                    {label}
                  </label>

                  {key === "phone_number" ? (
                    <PhoneInput
                      value={formData.phone_number}
                      onChange={(phone) => {
                        setFormData((prev) => ({
                          ...prev,
                          phone_number: phone,
                        }));
                        setFieldErrors((prev) => ({
                          ...prev,
                          phone_number: "",
                        }));
                        if (error) setError("");
                        setIsModified(true);
                      }}
                      onValidationChange={handlePhoneValidation}
                      error={fieldErrors.phone_number}
                      showValidation={!fieldErrors.phone_number}
                      className="h-10"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <Input
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      className="w-full text-sm bg-white border-slate-200 focus:ring-teal-500/20"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  )}
                  {fieldErrors[key] && (
                    <p className="text-admin-error text-xs font-medium animate-in fade-in slide-in-from-top-1">
                      {fieldErrors[key]}
                    </p>
                  )}
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Application Status
                </label>
                <div className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-bold text-slate-600">
                  {operator?.application_status}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Status
                </label>

                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleChange({ target: { name: "status", value } })
                  }
                  disabled={operator?.application_status === "PENDING"}
                >
                  <SelectTrigger
                    className={`w-full bg-white border-slate-200 focus:ring-teal-500/20 text-sm h-10 ${
                      operator?.application_status === "PENDING"
                        ? "opacity-50 cursor-not-allowed bg-slate-50"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                {operator?.application_status === "PENDING" && (
                  <p className="text-[11px] text-slate-400 font-medium">
                    Status is locked while approval is pending
                  </p>
                )}
              </div>
              {/* Total Trips */}
              <div>
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  {" "}
                  Total Trips
                </label>
                <Input
                  type="number"
                  name="total_trips"
                  value={formData.total_trips}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                />
              </div>
              {/* Trips Per Year */}
              <div>
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                  Trips Per Year
                </label>
                <Input
                  type="number"
                  name="trips_per_year"
                  value={formData.trips_per_year}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 tracking-wide">
                Hotel Category
              </label>
              <div className="flex items-center h-10 mt-1">
                <Rating
                  value={formData.hotel_category || 0}
                  onChange={(val) => {
                    setFormData((p) => ({ ...p, hotel_category: val }));
                    setIsModified(true);
                  }}
                />
              </div>
            </div>

            {/* Regions */}
            <div className="border-t border-slate-100 pt-8 mt-4">
              <label className="text-sm font-semibold text-slate-700 tracking-wide mb-3 block">
                Regions of Operation
              </label>

              {/* Input + Add */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1 group">
                  <Input
                    placeholder="Type region and press Enter..."
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const value = regionInput.trim();
                        if (!value) return;
                        if (formData.regions.includes(value)) {
                          toast({
                            title: "Already Added",
                            description: `${value} is already in the list.`,
                            variant: "destructive",
                          });
                          return;
                        }
                        setFormData((prev) => ({
                          ...prev,
                          regions: [...prev.regions, value],
                        }));
                        setIsModified(true);
                        setRegionInput("");
                      }
                    }}
                    className="w-full bg-white border-slate-200 focus:ring-teal-500/20 pr-10"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const value = regionInput.trim();
                    if (!value) return;
                    if (formData.regions.includes(value)) {
                      toast({
                        title: "Already Added",
                        description: `${value} is already in the list.`,
                        variant: "destructive",
                      });
                      return;
                    }
                    setFormData((prev) => ({
                      ...prev,
                      regions: [...prev.regions, value],
                    }));
                    setIsModified(true);
                    setRegionInput("");
                  }}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-base font-bold shadow-sm hover:bg-black hover:shadow-md transition-all active:scale-95"
                >
                  Add
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap overflow-x-hidden gap-2.5">
                {formData.regions.map((region, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-base font-medium text-slate-600 transition-all hover:border-teal-500 hover:shadow-sm group"
                  >
                    {editingIndex === index ? (
                      <input
                        value={editingValue}
                        autoFocus
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => {
                          if (!editingValue.trim()) {
                            setEditingIndex(null);
                            return;
                          }
                          const updatedRegions = [...formData.regions];
                          updatedRegions[index] = editingValue.trim();
                          setFormData((prev) => ({
                            ...prev,
                            regions: updatedRegions,
                          }));
                          setIsModified(true);
                          setEditingIndex(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.target.blur();
                          }
                        }}
                        className="bg-transparent border-b-2 border-teal-500 outline-none w-24 text-slate-900"
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:text-teal-600"
                        onClick={() => {
                          setEditingIndex(index);
                          setEditingValue(region);
                        }}
                      >
                        {region}
                      </span>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          regions: prev.regions.filter((_, i) => i !== index),
                        }));
                        setIsModified(true);
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {formData.regions.length === 0 && (
                  <div className="flex items-center gap-2 text-slate-400 py-2 italic text-sm">
                    <span>No regions added yet</span>
                  </div>
                )}
                {fieldErrors.regions && (
                  <p className="text-admin-error text-xs font-medium animate-in fade-in slide-in-from-top-1">
                    {fieldErrors.regions}
                  </p>
                )}
              </div>
            </div>
            {/* Social Links */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <label className="text-sm font-semibold text-slate-700 tracking-wide">
                Social Links
              </label>
              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                <Input
                  placeholder="YouTube URL"
                  value={formData.social_links.youtube || ""}
                  onChange={(e) =>
                    handleSocialLinkChange("youtube", e.target.value)
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2"
                />
                {fieldErrors["social_links.youtube"] && (
                  <p className="text-admin-error text-xs mt-1">
                    {fieldErrors["social_links.youtube"]}
                  </p>
                )}
                <Input
                  placeholder="Instagram URL"
                  value={formData.social_links.instagram || ""}
                  onChange={(e) =>
                    handleSocialLinkChange("instagram", e.target.value)
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2"
                />
                <Input
                  placeholder="Facebook URL"
                  value={formData.social_links.facebook || ""}
                  onChange={(e) =>
                    handleSocialLinkChange("facebook", e.target.value)
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2"
                />
                <Input
                  placeholder="Twitter URL"
                  value={formData.social_links.twitter || ""}
                  onChange={(e) =>
                    handleSocialLinkChange("twitter", e.target.value)
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2"
                />
                <Input
                  placeholder="Linkedin URL"
                  value={formData.social_links.linkedin || ""}
                  onChange={(e) =>
                    handleSocialLinkChange("linkedin", e.target.value)
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 tracking-wide">
                Description
              </label>
              <textarea
                name="business_description"
                value={formData.business_description}
                onChange={handleChange}
                rows={8}
                className="w-full mt-2 leading-normal bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe the operator's services, specialties, and experience..."
              />
              {fieldErrors.business_description && (
                <p className="text-admin-error text-xs font-medium animate-in fade-in slide-in-from-top-1">
                  {fieldErrors.business_description}
                </p>
              )}
            </div>
            <div className="col-span-full flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  prefetch={false}
                  href={`/admin/operators`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-center text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all duration-200"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={!isModified || saving || uploadingImage}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-linear-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
