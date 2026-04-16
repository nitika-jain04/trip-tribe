"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SlLocationPin } from "react-icons/sl";
import { LuTag } from "react-icons/lu";
import dynamic from "next/dynamic";
import { Button } from "@/app/components/ui/button";
import {
  X,
  Loader2,
  AlertCircle,
  MapPin,
  Search,
  Trash,
  Edit,
  Plus,
} from "lucide-react";
import Cookies from "js-cookie";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useToast } from "@/app/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import useLocations from "@/app/hooks/use-locations";
import {
  useAdminLocations,
  useAdminTripTypes,
} from "@/app/hooks/use-admin-settings";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const formatName = (value) => {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get("tab") || "destinations";
  const { toast } = useToast();

  const handleTabChange = (tab) => {
    const params = new URLSearchParams(); // Fresh params for the new tab
    params.set("tab", tab);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="p-3 py-6 sm:p-6 sm:py-10 flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage platform configurations and content
          </p>
        </div>

        <div className="flex gap-2 items-center bg-gray-100 w-fit p-2 rounded-lg">
          <button
            className={`flex items-center gap-1 text-sm px-3 py-2 rounded-lg transition-all ${
              activeTab === "destinations"
                ? "bg-white shadow-sm"
                : "hover:bg-gray-200"
            }`}
            onClick={() => handleTabChange("destinations")}
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
            onClick={() => handleTabChange("categories")}
          >
            <LuTag size={18} />
            Categories
          </button>
        </div>

        {activeTab === "destinations" ? <Destinations /> : <Categories />}
      </div>
    </>
  );
}

//////////////////// DESTINATIONS ////////////////////

function Destinations() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [showModal, setShowModal] = useState(false);
  
  // Derive from URL
  const page = Number(searchParams.get("page")) || 1;
  const region = searchParams.get("region") || "";
  const limit = 10;

  // Handle URL sync
  const updateQuery = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (!updates.page) {
        params.set("page", "1");
      }

      const currentQuery = searchParams.toString();
      const newQuery = params.toString();

      if (currentQuery !== newQuery) {
        router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, {
          scroll: false,
        });
      }
    },
    [searchParams, pathname, router],
  );

  // Fetch using SWR
  const { locations, pagination, isLoading, error, mutate } = useAdminLocations(
    {
      page,
      limit,
      region: region === "all" ? "" : region,
    },
  );

  const totalPages = pagination?.pages || 1;
  const totalItems = pagination?.total || 0;

  // Optimized regions list (fetch all once to populate dropdown)
  const { locations: allLocations } = useAdminLocations({ limit: 1000 });
  const regionsList = useMemo(() => {
    const uni = Array.from(
      new Set(
        allLocations
          .map((loc) => loc.region?.trim())
          .filter(Boolean)
          .map((r) => formatName(r)),
      ),
    ).sort();
    return uni;
  }, [allLocations]);

  const deleteDestination = async (locationId) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        toast({
          title: "Auth Error",
          description: "Token Missing!",
          variant: "destructive",
        });
        return;
      }

      if (!window.confirm("Are you sure you want to delete this destination?"))
        return;

      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/locations/admin/${locationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json().catch(() => null);

      if (data?.error?.code === "VALIDATION_ERROR") {
        toast({
          title: "Cannot Delete",
          description:
            data?.error?.message || "Trips exist for this destination.",
          variant: "destructive",
        });
        return;
      }

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description: data?.error?.message || "Failed to delete destination",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Destination deleted successfully",
        variant: "success",
      });
      mutate(); // Refresh current page data
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Logic moved to derivations and event handlers

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between">
        <p className="text-[#65758b] hidden md:visible">
          Manage travel destinations displayed on the platform
        </p>

        <div className="w-full flex justify-end">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select
              value={region || "all"}
              onValueChange={(value) => {
                updateQuery({ region: value === "all" ? "" : value });
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select Region">
                  {region || "All Regions"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>

                {regionsList.map((reg) => (
                  <SelectItem key={reg} value={reg}>
                    {reg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Destination
            </Button>
          </div>
        </div>
      </div>

      {isLoading && <DestinationSkeleton />}

      {/* Enhanced Error State */}
      {error && !isLoading && (
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
      {!isLoading && !error && locations.length === 0 && (
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

      {/* Desktop Table */}
      {!isLoading && !error && locations.length > 0 && (
        <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden mt-5">
          <div className="grid grid-cols-[2.5fr_2fr_2fr_1fr] bg-gray-100 px-3 py-4 text-sm font-medium">
            <div>Destination</div>
            <div>Region</div>
            <div>Type</div>
            {/* <div>Trips</div> */}
            <div>Actions</div>
          </div>

          {locations.map((des, i) => (
            <div
              key={des.id || i}
              className="grid grid-cols-[2.5fr_2fr_2fr_1fr] px-3 py-4 hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              <div className="font-medium">{des?.name || "-"}</div>
              <div className="text-gray-600">{des?.region || "-"}</div>
              <div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {des?.type || "-"}
                </span>
              </div>
              {/* <div className="text-gray-600">{des?.tripCount ?? 0}</div> */}

              <div className="flex gap-2">
                {/* <Edit
                  size={20}
                  className="cursor-pointer text-gray-600 hover:text-teal-600 transition-colors"
                /> */}
                <Trash
                  size={20}
                  onClick={() => deleteDestination(des.id)}
                  className="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Card Layout */}
      {!isLoading && !error && locations.length > 0 && (
        <div className="md:hidden space-y-4 mt-5">
          {locations.map((des, i) => (
            <div
              key={des.id || i}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{des?.name || "-"}</h3>
                  <p className="text-sm text-gray-500">{des?.region || "-"}</p>
                </div>
                <button
                  onClick={() => deleteDestination(des.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash size={18} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {des?.type || "-"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, totalItems)} of {totalItems}
          </span>
          <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => updateQuery({ page: (page - 1).toString() })}
            className="flex-1 sm:flex-none"
          >
            Previous
          </Button>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => updateQuery({ page: (page + 1).toString() })}
            className="flex-1 sm:flex-none"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddDestinationModal
          onClose={() => setShowModal(false)}
          refresh={() => {
            mutate();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

//////////////////// MODAL ////////////////////
function AddDestinationModal({ onClose, refresh }) {
  const { toast } = useToast();
  const { refreshLocations } = useLocations();

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
  const [locationTypes, setLocationTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [marker, setMarker] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchTimeout = useRef(null);

  const controllerRef = useRef(null);

  useEffect(() => {
    const getLocationTypes = async () => {
      try {
        setTypesLoading(true);

        const res = await fetch(
          `${BASE_URL}/api/${API_VERSION}/locations/types/all`,
        );

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          toast({
            title: "Error",
            description: "Failed to fetch location types",
            variant: "destructive",
          });
        }

        setLocationTypes(data?.result?.types || []);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load location types",
          variant: "destructive",
        });
      } finally {
        setTypesLoading(false);
      }
    };

    getLocationTypes();
  }, [toast]);

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
    if (!form.name) {
      toast({
        title: "Name",
        description: "Enter the location name!",
        variant: "destructive",
      });
      return;
    }

    if (!form.region) {
      toast({
        title: "Region",
        description: "Enter the region!",
        variant: "destructive",
      });
      return;
    }

    if (!form.latitude || !form.longitude) {
      toast({
        title: "Location",
        description: "Pick a location first!",
        variant: "destructive",
      });
      return;
    }

    if (!form.type) {
      toast({
        title: "Type",
        description: "Please select a destination type",
        variant: "destructive",
      });
      return;
    }

    const token = Cookies.get("token");
    setSaving(true);

    const payload = {
      ...form,
      name: formatName(form.name),
      region: formatName(form.region),
      latitude: String(form.latitude || ""),
      longitude: String(form.longitude || ""),
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

      const data = await res.json().catch(() => null);

      // ✅ HANDLE DUPLICATE FIRST (NO THROW)
      if (data?.error?.code === "VALIDATION_ERROR") {
        toast({
          title: "Duplicate Destination",
          description: "A destination with this name already exists",
          variant: "destructive",
        });
        return; // ❗ stop here, no throw
      }

      // ❌ Other errors
      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description:
            data?.error?.message ||
            data?.message ||
            "Failed to save destination",
          variant: "destructive",
        });
        return;
      }

      // ✅ Success
      toast({
        title: "Success",
        description: "Destination created successfully",
        variant: "success",
      });

      refreshLocations();

      refresh();
      onClose();
    } catch (err) {
      console.error(err);

      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-[80vw] md:w-[70vw] max-w-6xl h-[70vh] lg:h-[90vh] p-4 rounded-xl shadow-lg flex flex-col">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-500">
            Add Destination
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl p-1"
          >
            <IoCloseSharp />
          </button>
        </div>

        <input
          placeholder="Destination Name"
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: formatName(e.target.value) })
          }
        />

        <input
          placeholder="Region"
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={form.region}
          onChange={(e) =>
            setForm({ ...form, region: formatName(e.target.value) })
          }
        />

        <Select
          value={form.type}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, type: value }))
          }
          disabled={typesLoading}
        >
          <SelectTrigger className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
            <SelectValue
              placeholder={
                typesLoading ? "Loading types..." : "Select destination type"
              }
            />
          </SelectTrigger>

          <SelectContent>
            {!typesLoading &&
              locationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replaceAll("_", " ")}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  
  // Derive from URL
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;
  const sortBy = searchParams.get("sortBy") || "created_at";
  const order = searchParams.get("order") || "DESC";
  const isActive = searchParams.get("isActive") || "true";
  const debouncedSearch = searchParams.get("search") || "";

  // Local state for immediate typing responsiveness
  const [search, setSearch] = useState(debouncedSearch);
  const [searchError, setSearchError] = useState("");

  // Handle URL sync
  const updateQuery = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (!updates.page) {
        params.set("page", "1");
      }

      const currentQuery = searchParams.toString();
      const newQuery = params.toString();

      if (currentQuery !== newQuery) {
        router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, {
          scroll: false,
        });
      }
    },
    [searchParams, pathname, router],
  );

  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = search.trim();
      if (value !== debouncedSearch) {
        updateQuery({ search: value });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch, updateQuery]);

  // Fetch using SWR
  const {
    categories: rawCategories,
    pagination,
    isLoading,
    error,
    mutate,
  } = useAdminTripTypes({
    page,
    limit,
    sortBy,
    order,
    is_active: isActive === "all" ? undefined : isActive,
    search: debouncedSearch,
  });

  const categories = useMemo(() => {
    return (rawCategories || []).map((item, index) => ({
      id: item.id,
      category: item.name,
      description: item.description,
      is_active: item.is_active,
      trips: item.trip_count ?? 0,
      color: ["green", "pink", "blue", "teal", "yellow"][index % 5],
    }));
  }, [rawCategories]);

  const totalPages = pagination?.pages || 1;
  const totalItems = pagination?.total || 0;

  const colorMap = {
    green: "bg-green-100 text-green-600",
    pink: "bg-pink-100 text-pink-600",
    blue: "bg-blue-100 text-blue-600",
    teal: "bg-teal-100 text-teal-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <>
      <div className="flex justify-between">
        <p className="text-[#65758b] hidden md:visible">
          Manage trip categories and tags
        </p>

        <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        {/* 🔍 Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder="Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <Select value={sortBy} onValueChange={(val) => updateQuery({ sortBy: val })}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Created</SelectItem>
            <SelectItem value="updated_at">Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Select value={order} onValueChange={(val) => updateQuery({ order: val })}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ASC">Ascending</SelectItem>
            <SelectItem value="DESC">Descending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={isActive} onValueChange={(val) => updateQuery({ isActive: val })}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && <CategorySkeleton />}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-lg border border-red-200 mt-5">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-600 font-medium">Failed to load categories</p>
          <p className="text-sm text-red-400 mt-1">{error}</p>
        </div>
      )}

      {/* Categories Desktop Table */}
      {!isLoading && !error && (
        <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden mt-5">
          {/* Header Row */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-2 text-[#65758b] bg-gray-100 px-3 py-4 text-sm font-medium tracking-wide">
            <div>Category</div>
            <div>Description</div>
            <div>Trips</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No categories found
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-5 items-center px-3 py-4 hover:bg-gray-50 transition border-t border-gray-100"
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

                <div
                  className="truncate cursor-pointer"
                  title={category.description}
                >
                  {category.description}
                </div>

                {/* Trips */}
                <div className="text-gray-600">{category.trips}</div>

                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      category.is_active
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {category.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Edit
                    size={20}
                    onClick={() => setEditData(category)}
                    className="cursor-pointer text-gray-600 hover:text-teal-600 transition-colors"
                  />
                  {/* <RiDeleteBinLine
                    size={20}
                    className="text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                  /> */}
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

      {/* Categories Mobile Card Layout */}
      {!isLoading && !error && categories.length > 0 && (
        <div className="md:hidden space-y-4 mt-5">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`text-sm tracking-wide px-3 py-1 rounded-full ${
                    colorMap[category.color]
                  }`}
                >
                  {category.category}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditData(category)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {category.description}
              </p>
              <div className="flex justify-between items-center text-sm border-t pt-3">
                <div className="text-gray-500">
                  Trips:{" "}
                  <span className="text-gray-900 font-medium">
                    {category.trips}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    category.is_active
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {category.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && categories.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
            <span>
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, totalItems)} of {totalItems}
            </span>
            <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>
              Page {page} of {totalPages}
            </span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => updateQuery({ page: (page - 1).toString() })}
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => updateQuery({ page: (page + 1).toString() })}
              className="flex-1 sm:flex-none"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Category Modal - To be implemented */}
      {showModal && (
        <AddCategoryModal
          onClose={() => setShowModal(false)}
          refresh={() => {
            mutate();
            setShowModal(false);
          }}
        />
      )}

      {editData && (
        <EditCategoryModal
          data={editData}
          onClose={() => setEditData(null)}
          refresh={() => {
            mutate();
            setEditData(null);
          }}
        />
      )}
    </>
  );
}

function AddCategoryModal({ onClose, refresh }) {
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const token = Cookies.get("token");

      if (!token) {
        toast({
          title: "Auth Error",
          description: "Token missing",
        });
        return;
      }

      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/trip-types/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast({
          title: "Error",
          description: data?.error?.message || "Failed to create category",
          variant: "destructive",
        });
        return;
      }

      refresh();

      toast({
        title: "Success",
        description: "Category created successfully",
        variant: "success",
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Category</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Inputs */}
        <input
          placeholder="Category Name"
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <textarea
          placeholder="Description"
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="border px-4 py-2 rounded w-full hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-teal-600 text-white px-4 py-2 rounded w-full hover:bg-teal-700 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Category"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
function EditCategoryModal({ data, onClose, refresh }) {
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: data.category || "",
    description: data.description || "",
    is_active: data.is_active ?? false,
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const token = Cookies.get("token");

      if (!token) {
        toast({
          title: "Auth Error",
          description: "Token missing",
        });
        return;
      }

      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/trip-types/admin/${data.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        },
      );

      const responseData = await res.json().catch(() => null);

      if (!res.ok || !responseData?.success) {
        toast({
          title: "Error",
          description:
            responseData?.error?.message ||
            responseData?.message ||
            "Failed to update category",
          variant: "destructive",
        });
        return;
      }

      onClose();
      refresh?.(responseData.result);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Category</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Inputs */}
        <input
          placeholder="Category Name"
          className="border p-2 w-full rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <textarea
          placeholder="Description"
          className="border p-2 w-full rounded"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Active toggle */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                is_active: e.target.checked,
              }))
            }
          />
          Active
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="border px-4 py-2 rounded w-full"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-teal-600 text-white px-4 py-2 rounded w-full flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Category"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;

function DestinationSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-5 animate-pulse">
      {/* Header - Desktop Only */}
      <div className="hidden md:grid grid-cols-[1.5fr_2fr_2fr_2fr_1fr] bg-gray-100 px-3 py-4">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
        <div className="h-4 bg-gray-300 rounded w-20"></div>
        <div className="h-4 bg-gray-300 rounded w-16"></div>
        <div className="h-4 bg-gray-300 rounded w-12"></div>
        <div className="h-4 bg-gray-300 rounded w-10"></div>
      </div>

      {/* Grid for desktop, stack for mobile */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr_2fr_2fr_1fr] gap-4 px-3 py-4 border-t"
        >
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-28 md:block hidden"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-10 md:block hidden"></div>
          <div className="flex gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-5 animate-pulse">
      <div className="hidden md:grid grid-cols-[2.5fr_2fr_1fr] bg-gray-100 px-3 py-4">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
        <div className="h-4 bg-gray-300 rounded w-16"></div>
        <div className="h-4 bg-gray-300 rounded w-10"></div>
      </div>

      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-1 md:grid-cols-[2.5fr_2fr_1fr] gap-4 px-3 py-4 border-t"
        >
          <div className="h-4 bg-gray-200 rounded w-28"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="flex gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
