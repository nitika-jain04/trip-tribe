"use client";

import AdminGuard from "@/app/components/AdminGuard";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Archive,
  Loader2,
  AlertCircle,
  MapPin,
  Star,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { StatusBadge } from "@/app/components/admin/StatusBadge";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { IoCloseSharp } from "react-icons/io5";
import { FaPlus, FaTrash, FaMapMarkedAlt } from "react-icons/fa";
import { SlLocationPin } from "react-icons/sl";

// Dynamically import map components to avoid SSR issues
const MapPicker = dynamic(() => import("@/app/components/MapPickerTrip"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
    </div>
  ),
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function Page() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTrips, setTotalTrips] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [operators, setOperators] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [operatorFilter, setOperatorFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const router = useRouter();

  const fetchOperators = async () => {
    setLoadingOperators(true);
    const token = Cookies.get("token");

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
    const token = Cookies.get("token");
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

      if (res.ok && data.success) {
        setTrips(data.result.trips || []);
        setTotalTrips(data.result.pagination?.total || 0);
        setTotalPages(data.result.pagination?.pages || 1);

        // Extract unique destinations
        const uniqueDests = [
          ...new Set(
            data.result.trips.map((t) => t.destination?.name).filter(Boolean),
          ),
        ];
        setDestinations(uniqueDests);
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
  }, [getAllTrips]);

  useEffect(() => {
    const interval = setInterval(getAllTrips, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getAllTrips]);

  const getOperatorName = (id) => {
    if (!id) return "N/A";
    const operator = operators.find((operator) => operator.id === id);
    return operator ? operator.name : "N/A";
  };

  const handleModalClose = (value) => {
    setShowModal(value);
    if (value === false) {
      getAllTrips();
    }
  };

  const handleViewTrip = (trip) => {
    router.push(`/admin/trips/${trip.id}`);
  };

  const handleEditTrip = (trip) => {
    router.push(`/admin/trips/edit/${trip.id}`);
  };

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.name?.toLowerCase().includes(search.toLowerCase()) ||
      trip.destination?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || trip.status === statusFilter.toUpperCase();
    const matchesDestination =
      destinationFilter === "all" ||
      trip.destination?.name === destinationFilter;
    const matchesOperator =
      operatorFilter === "all" || trip.operator_id === operatorFilter;
    const matchesDifficulty =
      difficultyFilter === "all" ||
      trip.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDestination &&
      matchesOperator &&
      matchesDifficulty
    );
  });

  const difficulties = ["EASY", "MODERATE", "HARD"];

  return (
    <AdminGuard>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trips</h1>
            <p className="text-muted-foreground mt-1">
              Manage all trip listings across operators
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            Add New Trip
          </Button>
        </div>

        {/* Filters */}
        {/* <Card> */}
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trips..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Live</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={destinationFilter}
              onValueChange={setDestinationFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Destinations</SelectItem>
                {destinations.map((dest) => (
                  <SelectItem key={dest} value={dest}>
                    {dest}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={operatorFilter} onValueChange={setOperatorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operators</SelectItem>
                {operators
                  .filter((o) => o.status === "ACTIVE")
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
              </SelectContent>
            </Select>

            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {difficulties.map((diff) => (
                  <SelectItem key={diff} value={diff.toLowerCase()}>
                    {diff.charAt(0) + diff.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        {/* </Card> */}

        {/* Trips Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Trips ({filteredTrips.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading trips...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-lg">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 font-medium">Failed to load trips</p>
                <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
                <Button onClick={getAllTrips} variant="destructive">
                  Try Again
                </Button>
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <MapPin className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">No trips found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {search
                    ? "No trips match your search criteria"
                    : "Get started by adding your first trip"}
                </p>
                {!search && (
                  <Button onClick={() => setShowModal(true)} className="mt-4">
                    Add Trip
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trip</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {trip.images && trip.images[0] ? (
                              <img
                                src={trip.images[0]}
                                alt={trip.name}
                                className="h-12 w-16 rounded object-cover"
                              />
                            ) : (
                              <div className="h-12 w-16 rounded bg-gray-100 flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">
                                {trip.name || "N/A"}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <SlLocationPin size={12} />
                                {trip.destination?.name || "N/A"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getOperatorName(trip.operator_id)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {trip.price?.toLocaleString("en-IN") || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {trip.start_date && trip.end_date ? (
                              <>
                                <p>
                                  {new Date(
                                    trip.start_date,
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-muted-foreground">
                                  {new Date(trip.end_date).toLocaleDateString()}
                                </p>
                              </>
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-medium ${
                              trip.difficulty === "EASY"
                                ? "text-success"
                                : trip.difficulty === "MODERATE"
                                  ? "text-primary"
                                  : trip.difficulty === "HARD"
                                    ? "text-warning"
                                    : "text-destructive"
                            }`}
                          >
                            {trip.difficulty || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={trip.status.toLowerCase()} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewTrip(trip)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditTrip(trip)}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredTrips.length} of {totalTrips} trips
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <AddTripModal
          handleModalClose={handleModalClose}
          operators={operators}
        />
      )}
    </AdminGuard>
  );
}

function AddTripModal({ handleModalClose, operators }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSourceMap, setShowSourceMap] = useState(false);
  const [showDestinationMap, setShowDestinationMap] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    start_date: "",
    end_date: "",
    difficulty: "HARD",
    total_seats: "",
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
    status: "PUBLISHED",
    images: [],
    inclusions: [""],
    exclusions: [""],
    itinerary: [{ day: 1, activities: [""] }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("source.") || name.startsWith("destination.")) {
      const [location, field] = name.split(".");
      setFormData((p) => ({
        ...p,
        [location]: {
          ...p[location],
          [field]: value,
        },
      }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleLocationSelect = async (type, locationData) => {
    const token = Cookies.get("token");

    const payload = {
      name: locationData.name || locationData.address || "Unknown",
      region: locationData.region || "",
      latitude: String(locationData.lat ?? locationData.latitude),
      longitude: String(locationData.lng ?? locationData.longitude),
      type: "CITY", // temporarily hardcode for testing
    };

    console.log("Creating location with:", payload);

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

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create location");
      }

      // 🔥 Save location WITH returned ID
      setFormData((prev) => ({
        ...prev,
        [type]: {
          id: data.result.id,
          name: data.result.name,
          region: data.result.region,
          latitude: data.result.latitude,
          longitude: data.result.longitude,
          type: data.result.type,
        },
      }));

      if (type === "source") {
        setShowSourceMap(false);
      } else {
        setShowDestinationMap(false);
      }
    } catch (err) {
      console.error("Location creation failed:", err);
      alert(err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = Cookies.get("token");
    setUploadingImage(true);

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

      if (res.ok && data.success) {
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
  };

  const addListItem = (key) =>
    setFormData((p) => ({ ...p, [key]: [...p[key], ""] }));

  const removeListItem = (key, index) => {
    if (formData[key].length === 1) return;
    const arr = formData[key].filter((_, i) => i !== index);
    setFormData((p) => ({ ...p, [key]: arr }));
  };

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

    // Validation
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      alert("End date must be after start date");
      return;
    }

    if (!formData.source.id) {
      alert("Please select source location from map");
      return;
    }

    if (!formData.destination.id) {
      alert("Please select destination location from map");
      return;
    }

    if (!formData.operator_id) {
      alert("Please select operator");
      return;
    }

    if (!formData.name.trim()) {
      alert("Trip name required");
      return;
    }

    const token = Cookies.get("token");
    setLoading(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      start_date: formData.start_date,
      end_date: formData.end_date,
      difficulty: formData.difficulty,
      total_seats: Number(formData.total_seats),
      operator_id: formData.operator_id,
      source_id: formData.source.id,
      destination_id: formData.destination.id,
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

    console.log("req trip", payload);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[90vw] max-w-6xl h-[90vh] rounded-lg shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Create New Trip</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleModalClose(false)}
          >
            <IoCloseSharp size={20} />
          </Button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-8"
        >
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Trip Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Himalayan Base Camp Trek"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Price (₹) *
                </label>
                <Input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="45000"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Total Seats *
                </label>
                <Input
                  name="total_seats"
                  type="number"
                  value={formData.total_seats}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="15"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Difficulty *
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="EASY">Easy</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Start Date *
                </label>
                <Input
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  End Date *
                </label>
                <Input
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Operator */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Operator</h3>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Operator *
              </label>
              <select
                name="operator_id"
                value={formData.operator_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Operator</option>
                {operators.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Source Location */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Source Location</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    {formData.source.name ? (
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Name:</span>{" "}
                          {formData.source.name}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Region:</span>{" "}
                          {formData.source.region || "N/A"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Coordinates:</span>{" "}
                          {formData.source.latitude},{" "}
                          {formData.source.longitude}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No location selected
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSourceMap(true)}
                  >
                    <FaMapMarkedAlt className="h-4 w-4 mr-2" />
                    {formData.source.name
                      ? "Change Location"
                      : "Select from Map"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Destination Location */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Destination Location</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    {formData.destination.name ? (
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Name:</span>{" "}
                          {formData.destination.name}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Region:</span>{" "}
                          {formData.destination.region || "N/A"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Coordinates:</span>{" "}
                          {formData.destination.latitude},{" "}
                          {formData.destination.longitude}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No location selected
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDestinationMap(true)}
                  >
                    <FaMapMarkedAlt className="h-4 w-4 mr-2" />
                    {formData.destination.name
                      ? "Change Location"
                      : "Select from Map"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Map Modals */}
          {showSourceMap && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
              <div className="bg-white w-[90vw] max-w-4xl h-[80vh] rounded-lg flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">
                    Select Source Location
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSourceMap(false)}
                  >
                    <IoCloseSharp size={20} />
                  </Button>
                </div>
                <div className="flex-1 p-4 z-999">
                  <MapPicker
                    onLocationSelect={(location) =>
                      handleLocationSelect("source", location)
                    }
                    initialCenter={[20.5937, 78.9629]}
                    initialZoom={5}
                  />
                </div>
              </div>
            </div>
          )}

          {showDestinationMap && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
              <div className="bg-white w-[90vw] max-w-4xl h-[80vh] rounded-lg flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">
                    Select Destination Location
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDestinationMap(false)}
                  >
                    <IoCloseSharp size={20} />
                  </Button>
                </div>
                <div className="flex-1 p-4 z-999">
                  <MapPicker
                    onLocationSelect={(location) =>
                      handleLocationSelect("destination", location)
                    }
                    initialCenter={[20.5937, 78.9629]}
                    initialZoom={5}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
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

          {/* Images */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Images</h3>
              <div>
                <Input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("imageUpload")?.click()
                  }
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Trip ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <FaTrash size={10} />
                  </Button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <div className="col-span-6 text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No images uploaded yet
                </div>
              )}
            </div>
          </section>

          {/* Inclusions */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Inclusions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addListItem("inclusions")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.inclusions.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleListChange("inclusions", index, e.target.value)
                    }
                    placeholder={`Inclusion ${index + 1}`}
                  />
                  {formData.inclusions.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeListItem("inclusions", index)}
                    >
                      <FaTrash size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Exclusions */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Exclusions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addListItem("exclusions")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.exclusions.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleListChange("exclusions", index, e.target.value)
                    }
                    placeholder={`Exclusion ${index + 1}`}
                  />
                  {formData.exclusions.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeListItem("exclusions", index)}
                    >
                      <FaTrash size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Itinerary */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Itinerary</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDay}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </div>

            {formData.itinerary.map((day, dayIndex) => (
              <Card key={dayIndex}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Day {day.day}</h4>
                    {formData.itinerary.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeDay(dayIndex)}
                      >
                        <FaTrash size={14} className="mr-2" />
                        Remove Day
                      </Button>
                    )}
                  </div>

                  {day.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="flex gap-2">
                      <Input
                        value={activity}
                        onChange={(e) =>
                          handleActivity(dayIndex, actIndex, e.target.value)
                        }
                        placeholder={`Activity ${actIndex + 1}`}
                      />
                      {day.activities.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeActivity(dayIndex, actIndex)}
                        >
                          <FaTrash size={14} />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addActivity(dayIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleModalClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Trip"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Page;
