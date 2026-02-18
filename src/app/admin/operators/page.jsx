"use client";

import AdminGuard from "@/app/components/AdminGuard";
import Dropdownadmin from "@/app/components/Dropdown-admin";
import DropdownActionsAdmin from "@/app/components/DropdownActionsAdmin";
import React, { useCallback, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import { LiaEditSolid } from "react-icons/lia";
import { LuCircleCheckBig, LuEye } from "react-icons/lu";
import { SlOptions } from "react-icons/sl";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Users } from "lucide-react";
import Cookies from "js-cookie";
import { Button } from "@/app/components/adminFunctionCalls";

function Page() {
  const [operators, setOperators] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalOperators, setTotalOperators] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [regions, setRegions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  const getAllRegions = useCallback(async () => {
    const token = Cookies.get("token");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/locations/admin`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      console.log("Regions:", data);

      if (data.success) {
        const locations = data?.result?.locations || [];

        // Extract only valid region strings
        const regionSet = new Set();

        locations.forEach((loc) => {
          if (loc?.region && typeof loc.region === "string") {
            regionSet.add(loc.region.trim());
          }
        });

        const regionOptions = [
          { index: 0, label: "All Regions", value: "All Regions" },
          ...Array.from(regionSet).map((region, i) => ({
            index: i + 1,
            label: region,
            value: region,
          })),
        ];

        setRegions(regionOptions);
      }
    } catch (err) {
      setError(err.message);
      setOperators([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllOperators = useCallback(async () => {
    const token = Cookies.get("token");
    setLoading(true);
    setError(null);

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators/admin?page=${page}&limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      console.log("Operators data:", data);

      if (data.success) {
        setOperators(data.result.operators || []);
        setTotalOperators(data.result.pagination?.total || 0);
        setTotalPages(data.result.pagination?.pages || 1);
        setError(null);
      } else {
        throw new Error(data.message || "No operators found");
      }
    } catch (err) {
      setError(err.message);
      setOperators([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Apply filters (status + search)
  useEffect(() => {
    let filtered = operators;

    // Apply region filter
    if (selectedRegion !== "All Regions") {
      filtered = filtered.filter((op) => op.region === selectedRegion);
    }

    // Apply status filter
    if (selectedStatus !== "All Status") {
      filtered = filtered.filter((op) => op.status === selectedStatus);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (op) =>
          op.name?.toLowerCase().includes(query) ||
          op.contact_name?.toLowerCase().includes(query) ||
          op.email?.toLowerCase().includes(query) ||
          op.phone_number?.toLowerCase().includes(query),
      );
    }

    setFilteredOperators(filtered);
  }, [operators, selectedStatus, searchQuery, selectedRegion]);

  useEffect(() => {
    getAllOperators();
    getAllRegions();

    const interval = setInterval(
      () => {
        getAllOperators();
        getAllRegions();
      },
      2 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [getAllOperators, getAllRegions]);

  function handleAddModalClose(value) {
    setShowAddModal(value);
    if (value === false) {
      getAllOperators();
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleViewDetails = (operator) => {
    const id = operator.id;
    router.push(`/admin/operators/${id}`);
  };

  // Edit operator
  const handleEditOperator = (operator) => {
    const id = operator.id;
    router.push(`/admin/operators/edit/${id}`);
  };

  return (
    <AdminGuard>
      <div className="px-5 py-10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Operators</h1>
            <p className="text-muted-foreground mt-1">
              Manage trip operators on the platform
            </p>
          </div>

          <div>
            <Button
              label="Add Operator"
              fnClose={setShowAddModal}
              bool="true"
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 w-1/2 border border-gray-200 rounded-lg p-2">
            <CiSearch size={17} />
            <input
              type="text"
              placeholder="Search operators..."
              className="placeholder:text-sm focus:outline-none w-full bg-admin-backseach"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <IoCloseSharp size={18} />
              </button>
            )}
          </div>

          <Dropdownadmin
            options={[
              { index: 1, label: "All Status", value: "All Status" },
              { index: 2, label: "Active", value: "ACTIVE" },
              { index: 3, label: "Inactive", value: "INACTIVE" },
              { index: 4, label: "Suspended", value: "SUSPENDED" },
            ]}
            onSelect={(value) => {
              setSelectedStatus(value);
              setPage(1);
            }}
            selectedValue={selectedStatus}
          />

          {/* <Dropdownadmin
            options={regions}
            onSelect={(value) => {
              setSelectedRegion(value);
              setPage(1);
            }}
            selectedValue={selectedRegion}
          /> */}
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-[3fr_1.5fr_1fr_1fr_0.5fr] gap-5 text-admin-haze bg-gray-100 px-4 py-3 text-sm font-medium tracking-wide">
            <div>Operator</div>
            <div>Contact</div>
            {/* <div>Region</div> */}
            <div>Trips</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Enhanced Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading operators...</p>
              <p className="text-sm text-gray-400 mt-1">
                Please wait while we fetch your data
              </p>
            </div>
          )}

          {/* Enhanced Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 bg-red-50">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 font-medium">
                Failed to load operators
              </p>
              <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
              <button
                onClick={getAllOperators}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Enhanced Empty State */}
          {!loading && !error && filteredOperators.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">
                {operators.length === 0
                  ? "No operators found"
                  : "No operators match your search criteria"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {operators.length === 0
                  ? "Get started by adding your first operator"
                  : "Try adjusting your search or filters"}
              </p>
              {operators.length === 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Add Operator
                </button>
              )}
            </div>
          )}

          {/* Data Rows */}
          {!loading &&
            !error &&
            filteredOperators.length > 0 &&
            filteredOperators.map((operator, index) => (
              <div
                key={operator._id || operator.id || index}
                className="grid grid-cols-[3fr_1.5fr_1fr_1fr_0.5fr] gap-5
                        items-center pl-3 py-4 hover:bg-gray-50 transition border-t border-gray-100"
              >
                {/* Operator */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <img
                        src={operator.logo_url || "/vercel.svg"}
                        alt={operator.name || "Operator Logo"}
                        className="h-10 w-10 object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = "/vercel.svg";
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <p className="font-medium text-admin-dark text-sm truncate">
                        {operator.name || "N/A"}
                      </p>
                      <p className="text-admin-haze text-sm truncate">
                        {operator.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact & Phone_number */}
                <div>
                  <div className="font-medium text-admin-dark text-sm">
                    {operator.contact_name || "N/A"}
                  </div>
                  <div className="text-sm text-admin-haze">
                    {operator.phone_number || "N/A"}
                  </div>
                </div>

                {/* Region */}
                {/* <div className="text-admin-haze text-sm">
                  {operator.region || "N/A"}
                </div> */}

                {/* Trips */}
                <div className="text-admin-dark text-sm">
                  {operator.total_trips || operator.tripsCount || 0}
                </div>

                {/* Status */}
                <div className="-ml-7">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium
                            ${
                              operator.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : operator.status === "INACTIVE"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                  >
                    {operator.status || "N/A"}
                  </span>
                </div>

                {/* Actions */}
                <DropdownActionsAdmin
                  labelText={<SlOptions />}
                  options={[
                    {
                      label: "View Details",
                      value: "View Details",
                      icon: <LuEye size={18} />,
                      onClick: () => handleViewDetails(operator),
                    },
                    {
                      label: "Edit",
                      value: "Edit",
                      icon: <LiaEditSolid size={18} />,
                      onClick: () => handleEditOperator(operator),
                    },
                    {
                      label:
                        operator.status === "SUSPENDED"
                          ? "Reactivate"
                          : "Suspend",
                      value:
                        operator.status === "SUSPENDED"
                          ? "Reactivate"
                          : "Suspend",
                      icon: <LuCircleCheckBig size={18} />,
                      onClick: () => {
                        // Handle suspend/reactivate
                        console.log(
                          `${operator.status === "SUSPENDED" ? "Reactivate" : "Suspend"} clicked`,
                        );
                      },
                    },
                  ]}
                />
              </div>
            ))}

          {/* Summary Row */}
          {!loading && !error && filteredOperators.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
              Showing {filteredOperators.length} of {totalOperators} operators
            </div>
          )}
        </div>

        <div className="flex items-center justify-end">
          <div className="flex gap-5 items-center">
            <button
              className={`border border-gray-100 bg-gray-50 p-2 text-sm rounded-lg cursor-pointer ${page === 1 ? "text-admin-haze" : "text-admin-dark"}`}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="border border-gray-100 bg-gray-50 p-2 text-sm rounded-lg cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Operator Modal */}
      {showAddModal && (
        <AddOperatorModal handleModalClose={handleAddModalClose} />
      )}
    </AdminGuard>
  );
}

// AddOperatorModal component (keep your existing AddOperatorModal code here)
function AddOperatorModal({ handleModalClose }) {
  // ... (your existing AddOperatorModal code)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    contact_name: "",
    // region: "",
    description: "",
    website: "",
    logo_url: "",
    rating: 4.5,
    status: "INACTIVE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    const token = Cookies.get("token");

    const formDataToSend = new FormData();
    formDataToSend.append("image", file);

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/uploads/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Image upload failed");
      }

      const imageUrl = data.result?.url;

      if (!imageUrl) {
        throw new Error("No image URL returned from server");
      }

      setFormData((prev) => ({
        ...prev,
        logo_url: imageUrl,
      }));
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err.message || "Something went wrong while uploading image");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = Cookies.get("token");

    // Validate phone number - accept Indian format
    if (!/^(\+91|91)?[6-9]\d{9}$/.test(formData.phone_number)) {
      alert(
        "Please enter a valid Indian phone number (e.g., 919876543210 or +919876543210)",
      );
      setLoading(false);
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Validate website URL if provided
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      alert(
        "Please enter a valid website URL (starting with http:// or https://)",
      );
      setLoading(false);
      return;
    }

    const requestBody = {
      name: formData.name,
      description: formData.description,
      contact_name: formData.contact_name,
      email: formData.email,
      phone_number: formData.phone_number,
      // region: formData.region,
      website: formData.website || undefined,
      logo_url: formData.logo_url || undefined,
      rating: parseFloat(formData.rating) || 4.5,
      status: formData.status,
    };

    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key],
    );

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || data.error?.message || "Failed to add operator",
        );
      }

      handleModalClose(false);
      alert("Operator added successfully!");
    } catch (err) {
      console.error("Error adding operator:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-[70vw] h-[85vh] rounded-xl shadow-lg flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#14181F]">Add Operator</h2>
          <button
            onClick={() => handleModalClose(false)}
            className="text-gray-500 hover:text-black text-xl"
            disabled={loading || uploadingImage}
          >
            <IoCloseSharp />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
            {/* Logo Upload */}
            <div className="col-span-2">
              <label className="text-sm text-gray-600 font-medium">
                Upload Logo
              </label>
              <div className="flex items-start gap-4 mt-1">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-[#4ED0C3]/10 file:text-[#4ED0C3] hover:file:bg-[#4ED0C3]/20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a logo image (JPG, PNG, SVG)
                  </p>
                </div>
                {formData.logo_url && (
                  <div className="flex flex-col items-center">
                    <img
                      src={formData.logo_url}
                      alt="Uploaded Logo"
                      className="h-16 w-16 object-cover rounded-md border"
                      onError={(e) => {
                        e.target.src = "/vercel.svg";
                        e.target.onerror = null;
                      }}
                    />
                    <span className="text-xs text-gray-500 mt-1">Preview</span>
                  </div>
                )}
              </div>
            </div>

            {/* Operator Name */}
            <div>
              <label className="text-sm text-gray-600">Operator Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Wanderlust Adventures"
              />
            </div>

            {/* Contact Person Name */}
            <div>
              <label className="text-sm text-gray-600">
                Contact Person Name *
              </label>
              <input
                type="text"
                name="contact_name"
                required
                value={formData.contact_name}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Priya Sharma"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="hello@wanderlust.com"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-sm text-gray-600">Phone Number *</label>
              <input
                type="tel"
                name="phone_number"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="+917007755306"
              />
            </div>

            {/* Region */}
            {/* <div>
              <label className="text-sm text-gray-600">Region *</label>
              <input
                type="text"
                name="region"
                required
                value={formData.region}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="North India"
              />
            </div> */}

            {/* Status */}
            <div>
              <label className="text-sm text-gray-600">Status *</label>
              <select
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Website URL */}
            <div>
              <label className="text-sm text-gray-600">Website URL</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="https://wanderlustadventures.com"
              />
            </div>

            {/* Rating */}
            {/* <div>
              <label className="text-sm text-gray-600">Rating (0-5)</label>
              <input
                type="number"
                name="rating"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="4.5"
              />
            </div> */}

            {/* Description */}
            <div className="col-span-2">
              <label className="text-sm text-gray-600">Description *</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Describe the operator's services, specialties, and experience..."
              ></textarea>
            </div>

            <div className="col-span-2 flex justify-end gap-3 pt-6 mt-4 border-t">
              <button
                type="button"
                onClick={() => handleModalClose(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                disabled={loading || uploadingImage}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="px-6 py-2 bg-[#4ED0C3] text-white rounded-lg text-sm font-medium hover:bg-[#3db8ab] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Adding..."
                  : uploadingImage
                    ? "Uploading..."
                    : "Add Operator"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Page;
