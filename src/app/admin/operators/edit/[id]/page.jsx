"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Save, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import Input from "@/app/components/ui/input";
import { useToast } from "@/app/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function extractIndianNumber(value) {
  if (!value) return "";

  let digits = value.replace(/\D/g, "");

  // Remove 91 if present
  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.substring(2);
  }

  return digits.slice(-10);
}

function formatIndianNumber(digits) {
  if (!digits) return "";
  return `+91 ${digits}`;
}

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

  // Fetch operator
  useEffect(() => {
    const fetchOperator = async () => {
      const token = Cookies.get("token");

      try {
        const res = await fetch(
          `${BASE_URL}/api/${API_VERSION}/operators/admin/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();
        if (data.success) {
          setOperator(data.result);
          setFormData({
            name: data.result.name || "",
            email: data.result.email || "",
            phone_number: extractIndianNumber(data.result.phone_number || ""),
            contact_name: data.result.contact_name || "",
            description: data.result.description || "",
            website_url: data.result.website_url || "",
            logo_url: data.result.logo_url || "",
            status: data.result.status || "",

            total_trips: data.result.total_trips || "",
            trips_per_year: data.result.trips_per_year || "",
            regions: data.result.regions || [],
            trip: data.result.trip || [],
            social_links: data.result.social_links || {},
          });

          console.log("operator", data.result);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ 5MB validation
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

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }

      // ✅ update logo_url after upload
      setFormData((prev) => ({
        ...prev,
        logo_url: data.result.url,
      }));
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
    } else if (!startsWithValidChar.test(formData.name.trim())) {
      errors.name = "Operator name cannot start with a special character.";
    }

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

    if (!formData.phone_number) {
      errors.phone_number = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone_number)) {
      errors.phone_number = "Invalid phone number";
    }

    if (
      formData.website_url &&
      !/^https?:\/\/.+\..+/.test(formData.website_url)
    ) {
      errors.website_url = "Invalid website URL.";
    }

    if (formData.total_trips && formData.total_trips < 0) {
      errors.total_trips = "Total trips must be a positive number.";
    }

    if (formData.trips_per_year && formData.trips_per_year < 0) {
      errors.trips_per_year = "Trips per year must be a positive number.";
    }

    // Social links validation
    Object.entries(formData.social_links).forEach(([platform, url]) => {
      if (url && !/^https?:\/\/.+\..+/.test(url)) {
        errors[platform] = `Invalid URL for ${platform}`;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!operator) return;

    if (!validateForm()) {
      scrollToFirstError();
      setSaving(false);
      scrollToFirstError();
      return;
    }

    setSaving(true);
    setError("");

    const token = Cookies.get("token");

    const formattedPhone = formatIndianNumber(formData.phone_number);

    // Only changed fields
    const requestBody = {};

    Object.keys(formData).forEach((key) => {
      if (key === "phone_number") {
        if (formattedPhone !== operator.phone_number) {
          requestBody.phone_number = formattedPhone;
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
      } else if ((formData[key] ?? "") !== (operator[key] ?? "")) {
        requestBody[key] = formData[key];
      }
    });

    if (Object.keys(requestBody).length === 0) {
      // alert("No changes detected");
      toast({
        title: "Operator",
        description: "No changes detected!",
      });
      setSaving(false);
      return;
    }

    console.log("request", requestBody);

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
      if (!res.ok || !data.success)
        throw new Error(data.message || "Update failed");

      // alert("Operator updated successfully!");
      toast({
        title: "Operator",
        description: "Operator updated successfully!",
      });
      router.push(`/admin/operators/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Delete this operator permanently?");
    if (!confirmDelete) return;

    setSaving(true);
    setDeleteConfirm(true);

    const token = Cookies.get("token");

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators/admin/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Delete failed");

      // alert("Operator deleted");
      toast({
        title: "Operator",
        description: "Operator deleted successfully!",
      });
      router.push("/admin/operators");
    } catch (err) {
      setError(err.message);
      setSaving(false);
      setDeleteConfirm(false);
    }
  };

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 p-8">
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/operators"
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="text-center py-16 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium">Operator not found</p>
          </div>
        </div>
      </div>
    );
  }

  // regions input handler (comma separated)
  const handleRegionsChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      regions: value
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r.length > 0),
    }));
  };

  // social links handler
  const handleSocialLinkChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen space-y-6">
      <Link
        href={`/admin/operators/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-teal-600 transition-colors"
      >
        <ArrowLeft size={25} />
        Back to Details
      </Link>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight mb-6 sm:mb-8">
          Edit Operator
        </h1>
        {/* Enhanced Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5 sm:gap-6"
        >
          {/* Logo Upload with Better UX */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Logo
            </label>
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              {formData.logo_url && (
                <div className="flex flex-col items-center">
                  <img
                    src={formData.logo_url}
                    alt="Operator Logo"
                    className="h-24 w-24 object-cover rounded-xl border border-slate-200 shadow-sm"
                    onError={(e) => {
                      e.target.src = "/vercel.svg";
                      e.target.onerror = null;
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-1">
                    Current Logo
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100 disabled:opacity-50"
                  />
                  {uploadingImage && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a new logo (JPG, PNG, SVG). Max size 5MB.
                </p>
              </div>
            </div>
          </div>

          {[
            ["name", "Operator Name"],
            ["contact_name", "Contact Person"],
            ["email", "Email"],
            ["phone_number", "Phone"],
            ["website_url", "Website"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-semibold text-slate-700 tracking-wide">
                {label}
              </label>

              {key === "phone_number" ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    +91
                  </span>
                  <Input
                    name={key}
                    placeholder="9876543210"
                    value={formData.phone_number}
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      setFormData((prev) => ({
                        ...prev,
                        phone_number: digits,
                      }));
                    }}
                    className="pl-12 text-sm mt-1"
                    required
                  />
                  {/* {fieldErrors[key] && (
                    <p className="text-admin-error text-xs mt-1">
                    {fieldErrors[key]}
                    </p>
                    )} */}
                </div>
              ) : (
                <Input
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              )}
              {fieldErrors[key] && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors[key]}
                </p>
              )}
            </div>
          ))}
          <div>
            <label className="text-sm font-semibold text-slate-700 tracking-wide">
              Application Status
            </label>
            <p className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500">
              {operator?.application_status}
            </p>
            {/* <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select> */}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 tracking-wide">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={operator?.application_status === "PENDING"}
              className={`w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200
      ${operator?.application_status === "PENDING" ? "opacity-50 cursor-not-allowed" : ""}
    `}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            {operator?.application_status === "PENDING" && (
              <p className="text-xs text-gray-500 mt-1">
                Status cannot be changed while the operator approval is pending.
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
          {/* Regions */}
          <div className="col-span-2">
            <label className="text-sm font-semibold text-slate-700 tracking-wide">
              Regions (comma separated)
            </label>
            <Input
              value={formData.regions.join(", ")}
              onChange={handleRegionsChange}
              placeholder="West India, North India"
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>
          {/* Social Links */}
          <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-6">
            <label className="text-sm font-semibold text-slate-700 tracking-wide">
              Social Links
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
          <div className="col-span-2">
            <label className="text-sm font-semibold text-slate-700 tracking-wide">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              placeholder="Describe the operator's services, specialties, and experience..."
            />
          </div>
          <div className="col-span-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t">
            <div>
              {/* <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={saving || deleteConfirm}
                className="flex items-center gap-2"
              >
                {deleteConfirm ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </Button> */}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href={`/admin/operators/${id}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-linear-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  );
}
