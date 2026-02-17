"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LoaderCircleIcon,
  Save,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default function OperatorEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [operator, setOperator] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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
            phone_number: data.result.phone_number || "",
            contact_name: data.result.contact_name || "",
            description: data.result.description || "",
            website_url: data.result.website_url || "",
            logo_url: data.result.logo_url || "",
            status: data.result.status || "",
          });
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
      if (!res.ok || !data.success)
        throw new Error(data.message || "Upload failed");

      setFormData((prev) => ({ ...prev, logo_url: data.result.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!operator) return;

    setSaving(true);
    setError("");

    const token = Cookies.get("token");

    // Only changed fields
    const requestBody = {};
    // Object.keys(formData).forEach((key) => {
    //   if ((formData[key] || "") !== (operator[key] || "")) {
    //     requestBody[key] = formData[key] || null;
    //   }
    // });
    Object.keys(formData).forEach((key) => {
      if ((formData[key] ?? "") !== (operator[key] ?? "")) {
        requestBody[key] = formData[key];
      }
    });

    if (Object.keys(requestBody).length === 0) {
      alert("No changes detected");
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

      alert("Operator updated successfully!");
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

      alert("Operator deleted");
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
      <div className="p-6 bg-gray-50 min-h-screen">
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <Link
        href={`/admin/operators/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-teal-600 transition-colors"
      >
        <ArrowLeft size={25} />
        Back to Details
      </Link>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h1 className="text-2xl font-semibold mb-6">Edit Operator</h1>

        {/* Enhanced Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-2 gap-5">
          {/* Logo Upload with Better UX */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Logo
            </label>
            <div className="flex items-start gap-6">
              {formData.logo_url && (
                <div className="flex flex-col items-center">
                  <img
                    src={formData.logo_url}
                    alt="Operator Logo"
                    className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100 disabled:opacity-50"
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
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          ))}

          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            {/* <Dropdownadmin
              name="status"
              options={[
                { index: 1, label: "Active", value: "ACTIVE" },
                { index: 2, label: "Inactive", value: "INACTIVE" },
                { index: 3, label: "Suspended", value: "SUSPENDED" },
              ]}
              onSelect={handleChange}
              selectedValue={formData.status}
            /> */}
          </div>

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
              placeholder="Describe the operator's services, specialties, and experience..."
            />
          </div>

          <div className="col-span-2 flex justify-between items-center pt-6 border-t">
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

            <div className="flex gap-3">
              <Link
                href={`/admin/operators/${id}`}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
