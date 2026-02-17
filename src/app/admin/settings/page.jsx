"use client";

import AdminGuard from "@/app/components/AdminGuard";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SlLocationPin } from "react-icons/sl";
import { LuTag } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import { LiaEditSolid } from "react-icons/lia";
import { Button } from "@/app/adminFunctionCalls";
import dynamic from "next/dynamic";
import { X, Loader2, AlertCircle, MapPin, Search } from "lucide-react";
const API_URL =
  "https://trip-tribe-backend.onrender.com/api/v1/locations/admin";

function Page() {
  const [activeTab, setActiveTab] = useState("destinations");

  return (
    <AdminGuard>
      <div className="px-5 py-10 flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage platform configurations and content</p>
        </div>

        <div className="flex gap-2 items-center bg-gray-100 w-fit p-2 rounded-lg">
          <button
            className={`flex items-center gap-1 text-sm px-3 py-2 rounded-lg transition-all ${
              activeTab === "destinations"
                ? "bg-white shadow-sm"
                : "hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("destinations")}
          >
            <SlLocationPin size={18} />
            Destinations
          </button>

          <button
            className={`flex items-center gap-1 text-sm px-3 py-2 rounded-lg transition-all ${
              activeTab === "categories"
                ? "bg-white shadow-sm"
                : "hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("categories")}
          >
            <LuTag size={18} />
            Categories
          </button>
        </div>

        {activeTab === "destinations" ? <Destinations /> : <Categories />}
      </div>
    </AdminGuard>
  );
}

//////////////////// DESTINATIONS ////////////////////

function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllDestinations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setError("Authentication token missing");
        return;
      }

      const res = await fetch(
        "https://trip-tribe-backend.onrender.com/api/v1/locations/admin?page=1&limit=10",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch destinations");
      }

      const data = await res.json();

      // Safe API parsing
      const locations = data?.result?.locations ?? [];

      setDestinations(locations);
    } catch (err) {
      console.error(err);
      setError("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllDestinations();
  }, [getAllDestinations]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between">
        <p className="text-[#65758b]">
          Manage travel destinations displayed on the platform
        </p>

        <Button label="Add Destination" fnClose={() => setShowModal(true)} />
      </div>

      {/* Enhanced Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading destinations...</p>
          <p className="text-sm text-gray-400 mt-1">
            Please wait while we fetch your data
          </p>
        </div>
      )}

      {/* Enhanced Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-600 font-medium">
            Failed to load destinations
          </p>
          <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
          <button
            onClick={getAllDestinations}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Enhanced Empty State */}
      {!loading && !error && destinations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <MapPin className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">No destinations found</p>
          <p className="text-sm text-gray-400 mt-1">
            Get started by adding your first destination
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Add Destination
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && destinations.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden mt-5">
          <div className="grid grid-cols-[1.5fr_2fr_2fr_2fr_1fr] bg-gray-100 px-3 py-4 text-sm font-medium">
            <div>Destination</div>
            <div>Region</div>
            <div>Type</div>
            <div>Trips</div>
            <div>Actions</div>
          </div>

          {destinations.map((des, i) => (
            <div
              key={des.id || i}
              className="grid grid-cols-[1.5fr_2fr_2fr_2fr_1fr] px-3 py-4 hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              <div className="font-medium">{des?.name || "-"}</div>
              <div className="text-gray-600">{des?.region || "-"}</div>
              <div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {des?.type || "-"}
                </span>
              </div>
              <div className="text-gray-600">{des?.tripCount ?? 0}</div>

              <div className="flex gap-2">
                <LiaEditSolid
                  size={20}
                  className="cursor-pointer text-gray-600 hover:text-teal-600 transition-colors"
                />
                <RiDeleteBinLine
                  size={20}
                  className="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
                />
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="bg-gray-50 px-3 py-3 border-t border-gray-200 text-sm text-gray-600">
            Showing {destinations.length} destinations
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddDestinationModal
          onClose={() => setShowModal(false)}
          refresh={() => {
            getAllDestinations();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

//////////////////// MODAL ////////////////////
function AddDestinationModal({ onClose, refresh }) {
  const MapPicker = dynamic(() => import("@/app/components/MapPicker"), {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    ),
  });

  const [form, setForm] = useState({
    name: "",
    region: "",
    type: "",
    latitude: "",
    longitude: "",
  });

  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [marker, setMarker] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchTimeout = useRef(null);

  const controllerRef = useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    clearTimeout(searchTimeout.current);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        // cancel previous request
        if (controllerRef.current) controllerRef.current.abort();

        controllerRef.current = new AbortController();

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value,
          )}&countrycodes=in&limit=5`,
          { signal: controllerRef.current.signal },
        );

        const data = await res.json();

        setResults(data || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const selectPlace = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    setForm((f) => ({
      ...f,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));

    setMarker([lat, lng]);
    setSearchText(place.display_name);
    setResults([]);
  };

  const handleMapSelect = (lat, lng) => {
    const latStr = lat.toString();
    const lngStr = lng.toString();

    setMarker([lat, lng]);

    setForm((f) => ({
      ...f,
      latitude: latStr,
      longitude: lngStr,
    }));
  };

  const handleSubmit = async () => {
    if (!form.latitude || !form.longitude) {
      alert("Pick a location first.");
      return;
    }

    const token = localStorage.getItem("token");
    setSaving(true);

    const payload = {
      ...form,
      latitude: String(form.latitude || ""),
      longitude: String(form.longitude || ""),
    };

    console.log("req", payload);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        refresh();
        onClose();
      } else {
        alert("Failed to save destination");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving destination");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[650px] p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Destination</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <input
          placeholder="Destination Name"
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Region"
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
        />

        <input
          placeholder="Type"
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        />

        {/* 🔍 Search */}
        <div className="relative">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              placeholder="Search location..."
              className="border pl-10 pr-10 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchText}
              onChange={handleSearchChange}
            />
            {searching && (
              <Loader2
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-500 animate-spin"
                size={18}
              />
            )}
          </div>

          {results.length > 0 && (
            <div className="absolute bg-white border w-full min-h-36 overflow-y-hidden z-999 shadow-lg rounded mt-1">
              {results.map((p) => (
                <div
                  key={p.place_id}
                  onClick={() => selectPlace(p)}
                  className="p-3 hover:bg-teal-50 cursor-pointer text-sm border-b last:border-b-0"
                >
                  <p className="font-medium">{p.display_name.split(",")[0]}</p>
                  <p className="text-gray-500 text-xs truncate">
                    {p.display_name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🗺 Map */}
        <div className="border rounded-lg overflow-hidden">
          <MapPicker
            marker={marker}
            setMarker={setMarker}
            onSelect={handleMapSelect}
          />
        </div>

        <div className="text-sm bg-gray-100 p-3 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Latitude:</span>
              <span className="ml-2 font-mono">{form.latitude || "-"}</span>
            </div>
            <div>
              <span className="text-gray-500">Longitude:</span>
              <span className="ml-2 font-mono">{form.longitude || "-"}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded w-full hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-teal-600 text-white px-4 py-2 rounded w-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Destination"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

//////////////////// CATEGORIES ////////////////////

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Simulate API fetch with loading state
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockCategories = [
          { id: 1, category: "Treks", trips: 32, color: "green" },
          { id: 2, category: "Backpacking", trips: 20, color: "pink" },
          { id: 3, category: "Workstations", trips: 8, color: "blue" },
          { id: 4, category: "Weekend Trips", trips: 12, color: "teal" },
          { id: 5, category: "Wellness", trips: 3, color: "yellow" },
        ];

        setCategories(mockCategories);
      } catch (err) {
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const colorMap = {
    green: "bg-green-100 text-green-600",
    pink: "bg-pink-100 text-pink-600",
    blue: "bg-blue-100 text-blue-600",
    teal: "bg-teal-100 text-teal-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[#65758b] text-base">
          Manage trip categories and tags
        </p>

        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-500 text-white text-base px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
        >
          + Add Category
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200 mt-5">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading categories...</p>
          <p className="text-sm text-gray-400 mt-1">
            Please wait while we fetch your data
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-lg border border-red-200 mt-5">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-600 font-medium">Failed to load categories</p>
          <p className="text-sm text-red-400 mt-1">{error}</p>
        </div>
      )}

      {/* Categories Table */}
      {!loading && !error && (
        <div className="border border-gray-200 rounded-lg overflow-hidden mt-5">
          {/* Header Row */}
          <div className="grid grid-cols-[2.5fr_2fr_1fr] gap-2 text-[#65758b] bg-gray-100 px-3 py-4 text-sm font-medium tracking-wide">
            <div>Category</div>
            <div>Trips</div>
            <div>Actions</div>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No categories found
            </div>
          ) : (
            categories.map((category, index) => (
              <div
                key={category.id}
                className="grid grid-cols-[2.5fr_2fr_1fr] gap-5 items-center px-3 py-4 hover:bg-gray-50 transition border-t border-gray-100"
              >
                {/* Category */}
                <div>
                  <span
                    className={`text-sm tracking-wide px-3 py-1 rounded-full ${
                      colorMap[category.color]
                    }`}
                  >
                    {category.category}
                  </span>
                </div>

                {/* Trips */}
                <div className="text-gray-600">{category.trips}</div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <LiaEditSolid
                    size={20}
                    className="cursor-pointer text-gray-600 hover:text-teal-600 transition-colors"
                  />
                  <RiDeleteBinLine
                    size={20}
                    className="text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                  />
                </div>
              </div>
            ))
          )}

          {/* Summary */}
          {categories.length > 0 && (
            <div className="bg-gray-50 px-3 py-3 border-t border-gray-200 text-sm text-gray-600">
              Showing {categories.length} categories
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal - To be implemented */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[450px] p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add Category</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-500 text-center py-8">
              Category creation form will go here
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="border px-4 py-2 rounded w-full hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="bg-teal-600 text-white px-4 py-2 rounded w-full hover:bg-teal-700">
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Page;
