"use client";

import AdminGuard from "@/app/components/AdminGuard";
import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Loader2,
  AlertCircle,
  MapPin,
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
import { Skeleton } from "@/app/components/ui/skeleton";
import Link from "next/link";
import { useToast } from "@/app/hooks/use-toast";

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
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [showModal, setShowModal] = useState(false);
  const [operators, setOperators] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const { toast } = useToast();

  const fetchOperators = async () => {
    setLoadingOperators(true);
    const token = Cookies.get("token");

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators/admin?status=ACTIVE&application_status=APPROVED`,
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
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter.toUpperCase());
      }

      if (difficultyFilter && difficultyFilter !== "all") {
        params.append("difficulty", difficultyFilter.toUpperCase());
      }

      const searchValue = debouncedSearch?.trim();
      if (searchValue && searchValue.length >= 2) {
        params.append("search", searchValue);
      }

      if (sortBy) {
        params.append("sortBy", sortBy);
      }

      const url = `${BASE_URL}/api/${API_VERSION}/trips/admin?${params.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

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
      setInitialLoading(false);
    }
  }, [page, limit, statusFilter, sortBy, difficultyFilter, debouncedSearch]);

  useEffect(() => {
    fetchOperators();
  }, []);

  useEffect(() => {
    const searchValue = debouncedSearch?.trim();

    if (searchValue && searchValue.length < 2) {
      setTrips([]);
      setTotalTrips(0);
      setTotalPages(1);
      setError(null);
      setLoading(false);
      return;
    }

    getAllTrips();
  }, [getAllTrips, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const value = search.trim();

      if (value.length === 0) {
        setSearchError("");
        setDebouncedSearch("");
        setPage(1);
      } else if (value.length < 2) {
        setSearchError("Search must be at least 2 characters");
        setTrips([]);
        setTotalTrips(0);
        setTotalPages(1);
      } else {
        setSearchError("");
        setDebouncedSearch(value);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

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

  const difficulties = ["EASY", "MODERATE", "HARD"];

  const PageSkeleton = () => (
    <div className="space-y-6 p-6">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Table header */}
          <div className="grid grid-cols-7 gap-4 border-b pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>

          {/* Table rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-4 items-center py-2">
              <div className="flex items-center gap-3 col-span-2">
                <Skeleton className="h-12 w-16 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              <Skeleton className="h-4 w-24" />

              <Skeleton className="h-4 w-20" />

              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>

              <Skeleton className="h-4 w-16" />

              <Skeleton className="h-6 w-20 rounded-full" />

              <Skeleton className="h-8 w-8 ml-auto rounded-md" />
            </div>
          ))}

          {/* Pagination skeleton */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (initialLoading) {
    return <PageSkeleton />;
  }

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
        <CardContent className="pt-2">
          <div className="flex flex-col sm:flex-row gap-4 w-190">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trips..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchError && (
                <p className="text-sm text-admin-error mt-1">{searchError}</p>
              )}
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
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
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="all">All</SelectItem> */}
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Create Date</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="start_date">Start Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        {/* Trips Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Trips ({totalTrips})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading trips...</p>
                <p className="text-sm text-gray-400 mt-1">
                  Please wait while we fetch your data
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 font-medium">Failed to load trips</p>
                <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
                <Button onClick={getAllTrips} variant="destructive">
                  Try Again
                </Button>
              </div>
            ) : trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
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
                      <TableHead className="w-[300px]">Trip</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.map((trip) => (
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
                              <p
                                className="font-medium line-clamp-1"
                                title={trip.name}
                              >
                                {trip.name || "N/A"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <p
                            className="line-clamp-1"
                            title={getOperatorName(trip.operator_id)}
                          >
                            {getOperatorName(trip.operator_id)}
                          </p>
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
                                <p className="whitespace-nowrap">
                                  {new Date(
                                    trip.start_date,
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-muted-foreground whitespace-nowrap">
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
                                ? "text-green-600"
                                : trip.difficulty === "MODERATE"
                                  ? "text-orange-600"
                                  : trip.difficulty === "HARD"
                                    ? "text-red-600"
                                    : "text-gray-500"
                            }`}
                          >
                            {trip.difficulty || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={trip.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/trips/${trip.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/trips/edit/${trip.id}`}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem> */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, totalTrips)} of {totalTrips}
          </span>

          <span className="px-3 py-1 text-center text-sm">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
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
  const [error, setError] = useState("");
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    start_date: "",
    end_date: "",
    difficulty: "",
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
    status: "",
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

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create location");
      }

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
      setError(err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = Cookies.get("token");
    setUploadingImage(true);
    setError("");

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
      setError(err.message || "Failed to upload image");
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
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "desctructive",
      });
      return;
    }

    if (!formData.source.id) {
      toast({
        title: "Error",
        description: "Please select source location from map",
        variant: "desctructive",
      });
      return;
    }

    if (!formData.destination.id) {
      toast({
        title: "Error",
        description: "Please select destination location from map",
        variant: "desctructive",
      });
      return;
    }

    if (!formData.operator_id) {
      toast({
        title: "Error",
        description: "Please select operator",
        variant: "desctructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Trip name required",
        variant: "desctructive",
      });
      return;
    }

    const token = Cookies.get("token");
    setLoading(true);
    setError("");

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

      toast({
        title: "Trip Update",
        description: "Trip updated successfully!",
        variant: "success",
      });
      handleModalClose(false);
    } catch (err) {
      console.error("Create failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-[90vw] max-w-6xl h-[90vh] rounded-xl shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#14181F]">
            Create New Trip
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleModalClose(false)}
            disabled={loading || uploadingImage}
          >
            <IoCloseSharp size={20} />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-admin-error text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
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
                  <label className="text-sm text-gray-600 mb-1 block">
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
                  <label className="text-sm text-gray-600 mb-1 block">
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
                  <label className="text-sm text-gray-600 mb-1 block">
                    Difficulty *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#4ED0C3]"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#4ED0C3]"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
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
                  <label className="text-sm text-gray-600 mb-1 block">
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
                <label className="text-sm text-gray-600 mb-1 block">
                  Operator *
                </label>
                <select
                  name="operator_id"
                  value={formData.operator_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#4ED0C3]"
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
                  <div className="flex-1 p-4">
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
                  <div className="flex-1 p-4">
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
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#4ED0C3]"
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
                        <FaPlus className="h-4 w-4 mr-2" />
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
                  <FaPlus className="h-4 w-4 mr-2" />
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
                  <FaPlus className="h-4 w-4 mr-2" />
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
                  <FaPlus className="h-4 w-4 mr-2" />
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
                      <FaPlus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t">
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
                  ? "Creating..."
                  : uploadingImage
                    ? "Uploading..."
                    : "Create Trip"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Page;
