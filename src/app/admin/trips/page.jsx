"use client";

import AdminGuard from "@/app/components/AdminGuard";
import Dropdownadmin from "@/app/components/Dropdown-admin";
import DropdownActionsAdmin from "@/app/components/DropdownActionsAdmin";
import React, { useCallback, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { LiaEditSolid } from "react-icons/lia";
import { LuEye } from "react-icons/lu";
import { SlLocationPin, SlOptions } from "react-icons/sl";
import { Button, formatDateRange } from "@/app/adminFunctionCalls";
import { IoCloseSharp } from "react-icons/io5";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { IndianRupeeIcon, Loader2, AlertCircle, MapPin } from "lucide-react";

function Page() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTrips, setTotalTrips] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [operators, setOperators] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(false); // Add this line
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [destinationFilter, setDestinationFilter] =
    useState("All Destinations");
  const [searchQuery, setSearchQuery] = useState("");
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  const router = useRouter();

  const fetchOperators = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators/admin?page=1&limit=100`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setOperators(data.result.operators || []);
      }
    } catch (err) {
      console.error("Failed to fetch operators:", err);
    } finally {
      setLoadingOperators(false);
    }
  };

  const getAllTrips = useCallback(async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/trips/admin?page=${page}&limit=10`,

        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      console.log("data", data);

      if (res.ok && data.success) {
        setTrips(data.result.trips || []);
        setTotalTrips(data.result.pagination?.total || 0);
        setTotalPages(data.result.pagination?.pages || 1);
      } else {
        throw new Error(data.message || "Failed to fetch trips");
      }
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOperators();
    getAllTrips();

    const interval = setInterval(
      () => {
        getAllTrips();
      },
      2 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [getAllTrips]);

  function handleOperatorsName(id) {
    if (!id) return "N/A";

    const operator = operators.find((operator) => operator.id === id);
    return operator ? operator.name : "N/A";
  }

  function handleModalClose(value) {
    setShowModal(value);

    if (value === false) {
      getAllTrips();
    }
  }

  const handleViewTrip = (trip) => {
    const id = trip.id;
    router.push(`/admin/trips/${id}`);
  };

  const handleEditTrip = (trip) => {
    const id = trip.id;
    router.push(`/admin/trips/edit/${id}`);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  return (
    <AdminGuard>
      <div className="px-5 py-10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trips</h1>
            <p className="text-muted-foreground mt-1">
              Manage all trip listings across operators
            </p>
          </div>

          <div>
            <Button label="Add Trip" fnClose={setShowModal} bool="true" />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 w-1/2 border border-gray-200 rounded-lg p-2">
            <CiSearch size={17} />
            <input
              type="text"
              placeholder="Search trips..."
              className="placeholder:text-sm w-full focus:outline-none"
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
              { index: 2, label: "Live", value: "Live" },
              { index: 3, label: "Draft", value: "Draft" },
              { index: 4, label: "Archived", value: "Archived" },
            ]}
            onSelect={setStatusFilter}
            selectedValue={statusFilter}
          />

          <Dropdownadmin
            options={[
              {
                index: 1,
                label: "All Destinations",
                value: "All Destinations",
              },
              { index: 2, label: "Himalayas", value: "Himalayas" },
              { index: 3, label: "Beach", value: "Beach" },
              { index: 4, label: "Forest", value: "Forest" },
            ]}
            onSelect={setDestinationFilter}
            selectedValue={destinationFilter}
          />
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-[2.5fr_1.5fr_1fr_1.5fr_1fr_1fr_0.5fr] gap-5 text-admin-haze bg-gray-100 px-4 py-3 text-sm font-medium tracking-wide">
            {" "}
            <div>Trip</div>
            <div>Operator</div>
            <div>Price</div>
            <div>Dates</div>
            <div>Difficulty</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Enhanced Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading trips...</p>
              <p className="text-sm text-gray-400 mt-1">
                Please wait while we fetch your data
              </p>
            </div>
          )}

          {/* Enhanced Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 bg-red-50">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 font-medium">Failed to load trips</p>
              <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
              <button
                onClick={getAllTrips}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Enhanced Empty State */}
          {!loading && !error && trips.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50">
              <MapPin className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No trips found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery
                  ? "No trips match your search criteria"
                  : "Get started by adding your first trip"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Add Trip
                </button>
              )}
            </div>
          )}

          {/* Data Rows */}
          {!loading &&
            !error &&
            trips.length > 0 &&
            trips.map((trip, index) => (
              <div
                key={trip._id || index}
                className="grid grid-cols-[2.5fr_1.5fr_1fr_1.5fr_1fr_1fr_0.5fr] gap-5
                        items-center pl-3 py-4 hover:bg-gray-50 transition border-t border-gray-100"
              >
                {/* Trip Name and Destination */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">{trip.name || "N/A"}</p>
                    <p className="text-sm text-admin-haze flex items-center gap-1">
                      <span>
                        <SlLocationPin size={15} />
                      </span>
                      {trip.destination || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Operator */}
                <div className="text-sm text-admin-haze">
                  {handleOperatorsName(trip.operator_id)}
                </div>

                {/* Price */}
                <div className="text-sm flex items-center gap-1">
                  <IndianRupeeIcon size={12} />
                  {trip.price
                    ? Number(trip.price).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })
                    : "N/A"}
                </div>

                {/* Dates */}
                <div className="text-sm text-admin-haze flex items-center gap-1">
                  {/* <IoIosCalendar size={16} /> */}
                  {formatDateRange(trip.start_date, trip.end_date)}
                </div>

                {/* Difficulty */}
                <div className="text-sm">{trip.difficulty || "N/A"}</div>

                {/* Status */}
                <div>
                  <span
                    className={`px-2 py-1 text-xs tracking-wide rounded-full font-medium
                            ${
                              trip.status === "published" ||
                              trip.status === "active"
                                ? "bg-green-100 text-green-700"
                                : trip.status === "draft"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                  >
                    {trip.status || "N/A"}
                  </span>
                </div>

                {/* Actions */}
                <DropdownActionsAdmin
                  labelText={<SlOptions />}
                  options={[
                    {
                      label: "View",
                      value: "View",
                      icon: <LuEye size={18} />,
                      onClick: () => handleViewTrip(trip),
                    },
                    {
                      label: "Edit",
                      value: "Edit",
                      icon: <LiaEditSolid size={18} />,
                      onClick: () => handleEditTrip(trip),
                    },
                    // {
                    //   label: "Duplicate",
                    //   value: "Duplicate",
                    //   icon: <LuCopy />,
                    // },
                    // {
                    //   label: "Archive",
                    //   value: "Archive",
                    //   icon: <HiOutlineArchive size={18} />,
                    // },
                  ]}
                />
              </div>
            ))}

          {/* Summary Row */}
          {!loading && !error && trips.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
              Showing {trips.length} of {totalTrips} trips
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
      {showModal && <AddTripModal handleModalClose={handleModalClose} />}
    </AdminGuard>
  );
}

function AddTripModal({ handleModalClose }) {
  const [operators, setOperators] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    start_date: "",
    end_date: "",
    difficulty: "HARD",
    total_seats: "",
    operator_id: "",
    source_id: "",
    destination_id: "",
    status: "PUBLISHED",
    images: [],
    inclusions: [""],
    exclusions: [""],
    itinerary: [{ day: 1, activities: [""] }],
  });

  // Fetch operators + locations
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        const [opRes, locRes] = await Promise.all([
          fetch(`${BASE_URL}/api/${API_VERSION}/operators/admin`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/api/${API_VERSION}/locations/admin`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const opData = await opRes.json();
        const locData = await locRes.json();

        if (opData.success) setOperators(opData.result.operators || []);
        if (locData.success) setLocations(locData.result.locations || []);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/uploads/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Add the uploaded image URL to images array
        setFormData((p) => ({
          ...p,
          images: [...p.images, data.result.url],
        }));
      } else {
        throw new Error(data.message || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image from list
  const removeImage = (index) => {
    setFormData((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index),
    }));
  };

  // Generic list handlers (inclusions/exclusions)
  const handleListChange = (key, index, value) => {
    const arr = [...formData[key]];
    arr[index] = value;
    setFormData((p) => ({ ...p, [key]: arr }));
  };

  const addListItem = (key) =>
    setFormData((p) => ({ ...p, [key]: [...p[key], ""] }));

  const removeListItem = (key, index) => {
    if (formData[key].length === 1) return;
    const arr = formData[key].filter((_, i) => i !== index);
    setFormData((p) => ({ ...p, [key]: arr }));
  };

  // Itinerary handlers
  const addDay = () =>
    setFormData((p) => ({
      ...p,
      itinerary: [
        ...p.itinerary,
        { day: p.itinerary.length + 1, activities: [""] },
      ],
    }));

  const removeDay = (dayIndex) => {
    if (formData.itinerary.length === 1) return;
    const updatedItinerary = formData.itinerary.filter(
      (_, i) => i !== dayIndex,
    );
    // Re-number days
    updatedItinerary.forEach((day, index) => {
      day.day = index + 1;
    });
    setFormData((p) => ({ ...p, itinerary: updatedItinerary }));
  };

  const addActivity = (dayIndex) => {
    const it = [...formData.itinerary];
    it[dayIndex].activities.push("");
    setFormData((p) => ({ ...p, itinerary: it }));
  };

  const removeActivity = (dayIndex, activityIndex) => {
    if (formData.itinerary[dayIndex].activities.length === 1) return;
    const it = [...formData.itinerary];
    it[dayIndex].activities = it[dayIndex].activities.filter(
      (_, i) => i !== activityIndex,
    );
    setFormData((p) => ({ ...p, itinerary: it }));
  };

  const handleActivity = (d, a, value) => {
    const it = [...formData.itinerary];
    it[d].activities[a] = value;
    setFormData((p) => ({ ...p, itinerary: it }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dates
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      alert("End date must be after start date");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);

    // Clean up empty values and prepare payload
    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      start_date: formData.start_date,
      end_date: formData.end_date,
      difficulty: formData.difficulty,
      total_seats: Number(formData.total_seats),
      operator_id: formData.operator_id,
      source_id: formData.source_id,
      destination_id: formData.destination_id,
      status: formData.status,
      images: formData.images.filter(Boolean),
      inclusions: formData.inclusions.filter((item) => item.trim() !== ""),
      exclusions: formData.exclusions.filter((item) => item.trim() !== ""),
      itinerary: formData.itinerary
        .map((day) => ({
          day: day.day,
          activities: day.activities.filter((act) => act.trim() !== ""),
        }))
        .filter((day) => day.activities.length > 0),
    };

    console.log("Submitting payload:", payload);

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

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create trip");
      }

      alert("Trip created successfully!");
      handleModalClose(false);
    } catch (err) {
      console.error("Create failed:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[90vw] max-w-6xl h-[90vh] rounded-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Create New Trip</h2>
          <button
            onClick={() => handleModalClose(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseSharp size={24} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-8"
        >
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Trip Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Himalayan Base Camp Trek"
              />
              <Input
                label="Price (₹) *"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="45000"
              />
              <Input
                label="Total Seats *"
                name="total_seats"
                type="number"
                value={formData.total_seats}
                onChange={handleChange}
                required
                min="1"
                placeholder="15"
              />
              <Select
                label="Difficulty *"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
                options={[
                  { value: "EASY", label: "Easy" },
                  { value: "MODERATE", label: "Moderate" },
                  { value: "HARD", label: "Hard" },
                ]}
              />
              <Select
                label="Status *"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                options={[
                  { value: "PUBLISHED", label: "Published" },
                  { value: "DRAFT", label: "Draft" },
                  { value: "ARCHIVED", label: "Archived" },
                ]}
              />
              <Input
                label="Start Date *"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
              <Input
                label="End Date *"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          {/* Operator and Locations */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Operator & Locations
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Operator *"
                name="operator_id"
                value={formData.operator_id}
                onChange={handleChange}
                required
                options={operators.map((o) => ({ value: o.id, label: o.name }))}
              />
              <Select
                label="Source Location *"
                name="source_id"
                value={formData.source_id}
                onChange={handleChange}
                required
                options={locations.map((l) => ({
                  value: l.id,
                  label: `${l.name} (${l.region})`,
                }))}
              />
              <Select
                label="Destination Location *"
                name="destination_id"
                value={formData.destination_id}
                onChange={handleChange}
                required
                options={locations.map((l) => ({
                  value: l.id,
                  label: `${l.name} (${l.region})`,
                }))}
              />
            </div>
          </section>

          {/* Description */}
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">Description</h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="10-day trek to Everest Base Camp..."
            />
          </section>

          {/* Images with Upload */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Images</h3>
              <div className="relative">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="imageUpload"
                  className={`flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 ${
                    uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaPlus size={14} />
                      Upload Image
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Image List */}
            <div className="grid grid-cols-3">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Trip ${index + 1}`}
                    className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <div className="col-span-3 text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  No images uploaded yet
                </div>
              )}
            </div>
          </section>

          {/* Inclusions */}
          <DynamicList
            title="Inclusions"
            items={formData.inclusions}
            onChange={(i, v) => handleListChange("inclusions", i, v)}
            onAdd={() => addListItem("inclusions")}
            onRemove={(i) => removeListItem("inclusions", i)}
            placeholder="Accommodation"
          />

          {/* Exclusions */}
          <DynamicList
            title="Exclusions"
            items={formData.exclusions}
            onChange={(i, v) => handleListChange("exclusions", i, v)}
            onAdd={() => addListItem("exclusions")}
            onRemove={(i) => removeListItem("exclusions", i)}
            placeholder="Personal expenses"
          />

          {/* Itinerary */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Itinerary</h3>
              <button
                type="button"
                onClick={addDay}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <FaPlus size={14} /> Add Day
              </button>
            </div>

            {formData.itinerary.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-700">Day {day.day}</h4>
                  {formData.itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDay(dayIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>

                {day.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="flex gap-2">
                    <input
                      value={activity}
                      onChange={(e) =>
                        handleActivity(dayIndex, actIndex, e.target.value)
                      }
                      placeholder="Activity"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                    {day.activities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeActivity(dayIndex, actIndex)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {/* <button
                  type="button"
                  onClick={() => addActivity(dayIndex)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FaPlus size={12} /> Add Activity
                </button> */}
              </div>
            ))}
          </section>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => handleModalClose(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                "Create Trip"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

function Select({ label, options = [], ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        {...props}
        className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DynamicList({
  title,
  items,
  onChange,
  onAdd,
  onRemove,
  placeholder = "",
}) {
  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
        >
          <FaPlus size={14} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder={placeholder || `${title.slice(0, -1)} ${index + 1}`}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <FaTrash size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Page;
