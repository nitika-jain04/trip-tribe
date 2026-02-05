"use client";

import AdminGuard from "@/app/components/AdminGuard";
import Dropdownadmin from "@/app/components/Dropdown-admin";
import DropdownActionsAdmin from "@/app/components/DropdownActionsAdmin";
import React, { useCallback, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { LiaEditSolid } from "react-icons/lia";
import { LuEye } from "react-icons/lu";
import { SlLocationPin, SlOptions } from "react-icons/sl";
import { HiOutlineArchive } from "react-icons/hi";
import { LuCopy } from "react-icons/lu";
import { Button, formatDateRange } from "@/app/adminFunctionCalls";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { IoIosCalendar } from "react-icons/io";

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

  const fetchOperators = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://trip-tribe-backend.onrender.com/api/v1/admin/operators?page=1&limit=100`,
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

    try {
      const res = await fetch(
        `https://trip-tribe-backend.onrender.com/api/v1/admin/trips?page=${page}&limit=10`,
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

  return (
    <AdminGuard>
      <div className="px-5 py-10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-admin-dark text-2xl font-semibold">Trips</p>
            <p className="text-admin-haze text-base">
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
            />
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

          {loading && (
            <div className="py-10 text-center text-gray-500 text-sm">
              Fetching trips...
            </div>
          )}

          {!loading && trips.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              No trips found
            </div>
          )}

          {/* Data Rows */}
          {!loading &&
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
                  <MdOutlineCurrencyRupee />
                  {trip.price ? `${trip.price}` : "N/A"}
                </div>

                {/* Dates */}
                <div className="text-sm text-admin-haze flex items-center gap-1">
                  <IoIosCalendar size={16} />
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
                      index: 1,
                      label: "View",
                      value: "View",
                      icon: <LuEye size={18} />,
                    },
                    {
                      index: 2,
                      label: "Edit",
                      value: "Edit",
                      icon: <LiaEditSolid size={18} />,
                    },
                    {
                      index: 3,
                      label: "Duplicate",
                      value: "Duplicate",
                      icon: <LuCopy />,
                    },
                    {
                      index: 4,
                      label: "Archive",
                      value: "Archive",
                      icon: <HiOutlineArchive size={18} />,
                    },
                  ]}
                />
              </div>
            ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-admin-haze text-sm">
              Showing {trips.length} of {totalTrips} trips
            </p>
          </div>

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
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    region: "",
    price: "",
    start_date: "",
    end_date: "",
    difficulty: "moderate",
    total_seats: "",
    description: "",
    itinerary: [
      {
        day: 1,
        activities: [""],
      },
    ],
    images: ["", "", ""],
    operator_id: "",
  });

  const [operators, setOperators] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [imageCount, setImageCount] = useState(3);

  useEffect(() => {
    const fetchOperators = async () => {
      const token = localStorage.getItem("token");
      setLoadingOperators(true);

      try {
        const res = await fetch(
          `https://trip-tribe-backend.onrender.com/api/v1/admin/operators?page=1&limit=100`,
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

    fetchOperators();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Handle image URL change
  function handleImageChange(index, value) {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData((prev) => ({ ...prev, images: updatedImages }));
  }

  // Add more image input
  function addImageField() {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
    setImageCount((prev) => prev + 1);
  }

  // Remove image input
  function removeImageField(index) {
    if (imageCount > 1) {
      const updatedImages = formData.images.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, images: updatedImages }));
      setImageCount((prev) => prev - 1);
    }
  }

  // Handle itinerary day changes
  function handleItineraryDayChange(dayIndex, field, value) {
    const updatedItinerary = [...formData.itinerary];
    if (field === "day") {
      updatedItinerary[dayIndex].day = parseInt(value) || 1;
    }
    setFormData((prev) => ({ ...prev, itinerary: updatedItinerary }));
  }

  // Handle itinerary activity changes
  function handleActivityChange(dayIndex, activityIndex, value) {
    const updatedItinerary = [...formData.itinerary];
    updatedItinerary[dayIndex].activities[activityIndex] = value;
    setFormData((prev) => ({ ...prev, itinerary: updatedItinerary }));
  }

  // Add new activity to a day
  function addActivity(dayIndex) {
    const updatedItinerary = [...formData.itinerary];
    updatedItinerary[dayIndex].activities.push("");
    setFormData((prev) => ({ ...prev, itinerary: updatedItinerary }));
  }

  // Remove activity from a day
  function removeActivity(dayIndex, activityIndex) {
    if (formData.itinerary[dayIndex].activities.length > 1) {
      const updatedItinerary = [...formData.itinerary];
      updatedItinerary[dayIndex].activities = updatedItinerary[
        dayIndex
      ].activities.filter((_, i) => i !== activityIndex);
      setFormData((prev) => ({ ...prev, itinerary: updatedItinerary }));
    }
  }

  // Add new day to itinerary
  function addDay() {
    const newDay = {
      day: formData.itinerary.length + 1,
      activities: [""],
    };
    setFormData((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, newDay],
    }));
  }

  // Remove day from itinerary
  function removeDay(dayIndex) {
    if (formData.itinerary.length > 1) {
      const updatedItinerary = formData.itinerary.filter(
        (_, i) => i !== dayIndex,
      );
      // Re-number days
      updatedItinerary.forEach((day, index) => {
        day.day = index + 1;
      });
      setFormData((prev) => ({ ...prev, itinerary: updatedItinerary }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate dates
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      alert("End date must be after start date");
      return;
    }

    // Clean up empty activities
    const cleanedItinerary = formData.itinerary
      .map((day) => ({
        ...day,
        activities: day.activities.filter((activity) => activity.trim() !== ""),
      }))
      .filter((day) => day.activities.length > 0); // Remove empty days

    // Clean up empty images
    const cleanedImages = formData.images.filter((img) => img.trim() !== "");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "https://trip-tribe-backend.onrender.com/api/v1/admin/trips",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            itinerary: cleanedItinerary,
            images: cleanedImages,
            price: parseFloat(formData.price),
            total_seats: parseInt(formData.total_seats),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add trip");
      }

      handleModalClose(false); // close modal on success
      alert("Trip added successfully!");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-[80vw] h-[90vh] rounded-xl shadow-lg flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#14181F]">Add Trip</h2>
          <button
            onClick={() => handleModalClose(false)}
            className="text-gray-500 hover:text-black text-xl"
          >
            <IoCloseSharp />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Trip Name */}
                <div>
                  <label className="text-sm text-gray-600">Trip Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Manali to Hampta Pass Trek"
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className="text-sm text-gray-600">Destination *</label>
                  <input
                    type="text"
                    name="destination"
                    required
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Hampta Pass"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="text-sm text-gray-600">Region *</label>
                  <input
                    type="text"
                    name="region"
                    required
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Himachal Pradesh"
                  />
                </div>

                {/* Operator */}
                <div>
                  <label className="text-sm text-gray-600">Operator *</label>
                  <select
                    name="operator_id"
                    required
                    value={formData.operator_id}
                    onChange={handleChange}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    disabled={loadingOperators}
                  >
                    <option value="">Select Operator</option>
                    {operators.map((operator) => (
                      <option key={operator.id} value={operator.id}>
                        {operator.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="text-sm text-gray-600">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="17999.00"
                  />
                </div>

                {/* Total Seats */}
                <div>
                  <label className="text-sm text-gray-600">Total Seats *</label>
                  <input
                    type="number"
                    name="total_seats"
                    required
                    value={formData.total_seats}
                    onChange={handleChange}
                    min="1"
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="18"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-sm text-gray-600">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="text-sm text-gray-600">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    required
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-sm text-gray-600">Difficulty *</label>
                  <select
                    name="difficulty"
                    required
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="text-sm text-gray-600">Description</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Describe the trip in detail..."
              />
            </div>

            {/* Itinerary */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-600">Itinerary</label>
                <button
                  type="button"
                  onClick={addDay}
                  className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100"
                >
                  <FaPlus size={12} /> Add Day
                </button>
              </div>

              {formData.itinerary.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="mb-6 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600">Day</label>
                      <input
                        type="number"
                        value={day.day}
                        onChange={(e) =>
                          handleItineraryDayChange(
                            dayIndex,
                            "day",
                            e.target.value,
                          )
                        }
                        min="1"
                        className="w-20 border border-gray-200 rounded px-2 py-1"
                      />
                    </div>
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

                  <div className="space-y-2">
                    {day.activities.map((activity, activityIndex) => (
                      <div
                        key={activityIndex}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) =>
                            handleActivityChange(
                              dayIndex,
                              activityIndex,
                              e.target.value,
                            )
                          }
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                          placeholder={`Activity ${activityIndex + 1}`}
                        />
                        {day.activities.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeActivity(dayIndex, activityIndex)
                            }
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addActivity(dayIndex)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <FaPlus size={12} /> Add Activity
                  </button>
                </div>
              ))}
            </div>

            {/* Images */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Images</h3>
                <button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100"
                >
                  <FaPlus size={12} /> Add Image URL
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      placeholder={`https://cdn.triptribe.com/trips/image-${index + 1}.jpg`}
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={() => handleModalClose(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#4ED0C3] text-white rounded-lg text-sm font-medium hover:bg-[#3db8ab]"
              >
                Create Trip
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Page;
