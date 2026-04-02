"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Trash2,
  Archive,
  CheckCircle,
  FilePen,
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
import { Skeleton } from "@/app/components/ui/skeleton";
import Link from "next/link";
import { useToast } from "@/app/hooks/use-toast";
import useTripTypes from "@/app/hooks/use-triptypes";
import AddTripModal from "@/app/components/admin/AddTripModal";

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
  const [refresh, setRefresh] = useState(0);
  const { toast } = useToast();

  const { tripTypes } = useTripTypes();

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("all");
  const [searchError, setSearchError] = useState("");

  const fetchOperators = useCallback(async () => {
    setLoadingOperators(true);
    const token = Cookies.get("token");

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators/admin?application_status=APPROVED`,
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
  }, []);

  const getAllTrips = useCallback(async () => {
    const token = Cookies.get("token");
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page,
        limit,
        sortBy,
      });

      if (statusFilter !== "all")
        params.set("status", statusFilter.toUpperCase());

      if (operatorFilter && operatorFilter !== "all") {
        params.set("operator_id", operatorFilter);
      }

      if (typeFilter !== "all") {
        // console.log(typeFilter);
        params.set("type_id", typeFilter);
      }

      if (difficultyFilter !== "all")
        params.set("difficulty", difficultyFilter.toUpperCase());

      const searchValue = debouncedSearch?.trim();
      if (searchValue && searchValue.length < 2) {
        setSearchError("Search must be at least 2 characters");
      } else if (searchValue && searchValue.length >= 2) {
        params.append("search", searchValue);
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
        // throw new Error(data.message || "Failed to fetch trips");
        toast({
          title: "Error",
          description: "Failed to fetch trips",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      setError(err.message);
      setTrips([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [
    page,
    limit,
    sortBy,
    statusFilter,
    operatorFilter,
    typeFilter,
    difficultyFilter,
    debouncedSearch,
    toast,
  ]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, difficultyFilter, sortBy, typeFilter, operatorFilter]);

  useEffect(() => {
    fetchOperators();
  }, []);

  useEffect(() => {
    getAllTrips();
  }, [getAllTrips]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const value = search.trim();

      if (value.length === 0) {
        setSearchError("");
        setDebouncedSearch("");
        setPage(1);
      } else if (value.length < 2) {
        setSearchError("Search must be at least 2 characters");
        // setTrips([]);
        // setTotalTrips(0);
        // setTotalPages(1);
      } else {
        setSearchError("");
        setDebouncedSearch(value);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const operatorMap = useMemo(
    () => Object.fromEntries(operators.map((op) => [op.id, op.name])),
    [operators],
  );

  const getOperatorName = (id) => operatorMap[id] || "N/A";

  const handleModalClose = (value) => {
    setShowModal(value);
    if (value === false) getAllTrips(); // explicit, one-time refetch
  };

  const handleUpdateTrip = useCallback(
    async (tripId, payload) => {
      const token = Cookies.get("token");

      try {
        const res = await fetch(
          `${BASE_URL}/api/${API_VERSION}/trips/admin/${tripId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          toast({
            title: "Error",
            description: data.message || "Failed to update trip",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Trip",
          description: "Trip updated successfully!",
          variant: "success",
        });
        setRefresh((prev) => prev + 1);
        getAllTrips();
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const handleDeleteTrip = useCallback(
    async (tripId) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this trip? This action cannot be undone.",
      );

      if (!confirmed) return;

      const token = Cookies.get("token");

      try {
        const res = await fetch(
          `${BASE_URL}/api/${API_VERSION}/trips/admin/${tripId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();

        if (!res.ok) {
          return toast({
            title: "Error",
            description: data?.error?.message,
            variant: "destructive",
          });
        }

        toast({
          title: "Trip",
          description: "Trip deleted successfully!",
          variant: "success",
        });

        if (trips.length === 1 && page > 1) {
          setPage((prev) => prev - 1);
        } else {
          getAllTrips();
        }
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    },
    [getAllTrips, toast],
  );

  const handleDuplicateTrip = useCallback(
    async (trip) => {
      const token = Cookies.get("token");

      try {
        // ✅ Prepare clean payload
        const payload = {
          name: `Copy of ${trip.name}`,
          price: trip.price,
          start_date: trip.start_date,
          end_date: trip.end_date,
          difficulty: trip.difficulty,
          total_seats: trip.total_seats,
          description: trip.description,
          itinerary: trip.itinerary,
          images: trip.images,
          inclusions: trip.inclusions,
          exclusions: trip.exclusions,
          operator_id: trip.operator_id,
          source_id: trip.source_id,
          destination_id: trip.destination_id,
          type_id: trip.type_id,
          status: "DRAFT",
        };

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
          return toast({
            title: "Error",
            description: data.message || "Failed to duplicate trip",
            variant: "destructive",
          });
        }

        toast({
          title: "Success",
          description: "Trip duplicated successfully!",
          variant: "success",
        });

        getAllTrips(); // refresh list
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    },
    [toast, getAllTrips],
  );

  const difficulties = ["EASY", "MODERATE", "HARD"];

  const renderActions = (trip) => (
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
        {trip.status === "DRAFT" && (
          <>
            <DropdownMenuItem
              className="text-success"
              onClick={() =>
                handleUpdateTrip(trip.id, {
                  status: "PUBLISHED",
                })
              }
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Activate
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-error"
              onClick={() => handleDeleteTrip(trip.id)}
            >
              <Trash2 className="h-4 w-4 mr-2 text-error" />
              Delete
            </DropdownMenuItem>
          </>
        )}
        {trip.status === "ARCHIVED" && (
          <>
            <DropdownMenuItem
              className="text-success"
              onClick={() =>
                handleUpdateTrip(trip.id, {
                  status: "DRAFT",
                })
              }
            >
              <FilePen className="h-4 w-4 mr-2" />
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-error"
              onClick={() => handleDeleteTrip(trip.id)}
            >
              <Trash2 className="h-4 w-4 mr-2 text-error" />
              Delete
            </DropdownMenuItem>
          </>
        )}
        {trip.status === "PUBLISHED" && (
          <DropdownMenuItem
            className="text-accent"
            onClick={() =>
              handleUpdateTrip(trip.id, {
                status: "ARCHIVED",
              })
            }
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </DropdownMenuItem>
        )}
        {trip.status === "CANCELLED" && (
          <DropdownMenuItem
            className="text-error"
            onClick={() => handleDeleteTrip(trip.id)}
          >
            <Trash2 className="h-4 w-4 mr-2 text-error" />
            Delete
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => handleDuplicateTrip(trip)}>
          <FilePen className="h-4 w-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
    <>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
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
          <div className="flex flex-col lg:flex-row gap-3 w-full">
            {/* 🔍 Search */}
            <div className="w-full lg:flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trips..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 w-full"
                />
              </div>

              {searchError && (
                <p className="text-sm text-admin-error mt-1">{searchError}</p>
              )}
            </div>

            {/* 🎛 Filters */}
            <div
              className="
        grid grid-cols-2 gap-3 w-full
        lg:flex lg:flex-row lg:items-center lg:w-auto
      "
            >
              <Select value={operatorFilter} onValueChange={setOperatorFilter}>
                <SelectTrigger className="w-full lg:w-44">
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operators</SelectItem>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Live</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-36">
                  <SelectValue placeholder="Trip Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {tripTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter}
              >
                <SelectTrigger className="w-full lg:w-36">
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
                <SelectTrigger className="w-full lg:w-36">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="created_at">Create Date</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="start_date">Start Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>

        {/* Trips Table */}
        <Card className="hidden sm:block border shadow-sm">
          <CardHeader className="px-4 sm:px-6 pb-2">
            <CardTitle>All Trips ({totalTrips})</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pt-2">
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-75">Trip</TableHead>
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
                                loading="lazy"
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
                          {renderActions(trip)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile View: Cards */}
        <div className="sm:hidden space-y-4 pt-2">
          <div className="px-1 pb-2">
            <h2 className="text-lg font-semibold">All Trips ({totalTrips})</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-teal-500 w-8 h-8" />
            </div>
          ) : trips.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No trips found
            </p>
          ) : (
            trips.map((trip) => (
              <Card key={trip.id} className="border shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3 w-full">
                    <div className="relative h-16 w-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                      {trip.images && trip.images[0] ? (
                        <img
                          src={trip.images[0]}
                          alt={trip.name}
                          loading="lazy"
                          className="object-cover h-full w-full"
                        />
                      ) : (
                        <MapPin className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-2 text-[15px]">
                        {trip.name || "N/A"}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {getOperatorName(trip.operator_id)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm mt-3 border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {trip.price?.toLocaleString("en-IN") || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dates:</span>
                    <span>
                      {trip.start_date
                        ? new Date(trip.start_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Diff / Status:
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${trip.difficulty === "EASY" ? "text-green-600" : trip.difficulty === "MODERATE" ? "text-orange-600" : trip.difficulty === "HARD" ? "text-red-600" : "text-gray-500"}`}
                      >
                        {trip.difficulty || "N/A"}
                      </span>
                      <StatusBadge status={trip.status} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 w-full items-center">
                  <Link href={`/admin/trips/${trip.id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-sm h-9">
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                  </Link>
                  {renderActions(trip)}
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          {/* 📄 Info */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
            <span>
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, totalTrips)} of {totalTrips}
            </span>

            <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 rounded-full"></span>

            <span>
              Page {page} of {totalPages}
            </span>
          </div>

          {/* 🔘 Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="flex-1 sm:flex-none"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {showModal && <AddTripModal handleModalClose={handleModalClose} />}
    </>
  );
}

export default Page;
