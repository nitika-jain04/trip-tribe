"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
import useAdminOperators from "@/app/hooks/use-admin-operators";
import useSWR from "swr";
import { adminFetcher } from "@/app/hooks/use-admin-fetcher";
import AddTripModal from "@/app/components/admin/AddTripModal";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AdminConfirmDialog } from "@/app/components/admin/AdminConfirmDialog";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Derive values from URL (Source of Truth)
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;
  const sortBy = searchParams.get("sortBy") || "created_at";
  const order = searchParams.get("order") || "DESC";
  const statusFilter = searchParams.get("status")?.toLowerCase() || "all";
  const typeFilter = searchParams.get("type_id") || "all";
  const difficultyFilter =
    searchParams.get("difficulty")?.toLowerCase() || "all";
  const operatorFilter = searchParams.get("operator_id") || "all";

  const [showModal, setShowModal] = useState(false);

  // Operator Pagination State
  const [opPage, setOpPage] = useState(1);
  const {
    operators,
    pagination: opPagination,
    loadingOperators,
  } = useAdminOperators({
    status: "ALL",
    page: opPage,
    limit: 10,
  });
  const [accumulatedOperators, setAccumulatedOperators] = useState([]);

  useEffect(() => {
    if (operators?.length > 0) {
      setAccumulatedOperators((prev) => {
        const existingIds = new Set(prev.map((o) => o.id));
        const newOps = operators.filter((o) => !existingIds.has(o.id));
        return [...prev, ...newOps];
      });
    }
  }, [operators]);

  // Trip Type Pagination State
  const [typePage, setTypePage] = useState(1);
  const {
    tripTypes,
    pagination: typePagination,
    loadingTripTypes,
  } = useTripTypes({
    status: "ACTIVE",
    page: typePage,
    limit: 10,
  });
  const [accumulatedTripTypes, setAccumulatedTripTypes] = useState([]);

  useEffect(() => {
    if (tripTypes?.length > 0) {
      setAccumulatedTripTypes((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newTypes = tripTypes.filter((t) => !existingIds.has(t.id));
        return [...prev, ...newTypes];
      });
    }
  }, [tripTypes]);

  const [operatorInfoMap, setOperatorInfoMap] = useState({});

  const { data: allTypesData } = useSWR(
    `${BASE_URL}/api/${API_VERSION}/trip-types/admin?limit=100&status=ACTIVE`,
    adminFetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Keep local search for typing responsiveness
  const debouncedSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(debouncedSearch);
  const [searchError, setSearchError] = useState("");

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

      // Always reset page to 1 when filters (other than page itself) change
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
      if (value.length === 0 || value.length >= 2) {
        setSearchError("");
        if (value !== debouncedSearch) {
          updateQuery({ search: value });
        }
      } else {
        setSearchError("Search must be at least 2 characters");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch, updateQuery]);

  // 1. Build Query String (for API)
  const apiParams = new URLSearchParams({ page, limit, sortBy, order });

  if (statusFilter !== "all")
    apiParams.set("status", statusFilter.toUpperCase());
  if (operatorFilter && operatorFilter !== "all")
    apiParams.set("operator_id", operatorFilter);
  if (typeFilter !== "all") apiParams.set("type_id", typeFilter);
  if (difficultyFilter !== "all")
    apiParams.set("difficulty", difficultyFilter.toUpperCase());

  const searchValue = debouncedSearch?.trim();
  if (searchValue && searchValue.length >= 2)
    apiParams.append("search", searchValue);

  const url = `${BASE_URL}/api/${API_VERSION}/trips/admin?${apiParams.toString()}`;

  // 2. Fetch using SWR
  const {
    data,
    error: fetchError,
    isLoading,
    mutate: refreshTrips,
  } = useSWR(url, adminFetcher, {
    keepPreviousData: true,
  });

  const trips = data?.result?.trips || [];
  const totalTrips = data?.result?.pagination?.total || 0;
  const totalPages = data?.result?.pagination?.pages || 1;

  useEffect(() => {
    if (!trips?.length) return;
    const uniqueIds = [
      ...new Set(
        trips
          .map((t) => t.operator_id)
          .filter((id) => id && !operatorInfoMap[String(id)]),
      ),
    ];

    uniqueIds.forEach(async (id) => {
      try {
        const res = await adminFetcher(
          `${BASE_URL}/api/${API_VERSION}/operators/admin/${id}`,
        );
        if (res?.success && res.result?.name) {
          setOperatorInfoMap((prev) => ({
            ...prev,
            [String(id)]: res.result.name,
          }));
        }
      } catch (e) {
        console.error(`Failed to fetch operator ${id}:`, e);
      }
    });
  }, [trips, operatorInfoMap]);
  const loading = isLoading;
  const initialLoading = isLoading && !data;
  const error = fetchError?.message || null;

  // No local state sync effects needed anymore as variables are derived from URL

  const operatorMap = useMemo(() => {
    const map = {};
    // Populate from accumulated dropdown results
    accumulatedOperators.forEach((op) => {
      if (op.id) map[String(op.id)] = op.name;
    });
    return map;
  }, [accumulatedOperators]);

  const combinedOperators = useMemo(() => {
    const existingIds = new Set(
      accumulatedOperators.map((op) => String(op.id)),
    );
    const additionalOps = Object.entries(operatorInfoMap)
      .filter(([id]) => !existingIds.has(id))
      .map(([id, name]) => ({ id: id, name: name }));
    return [...accumulatedOperators, ...additionalOps];
  }, [accumulatedOperators, operatorInfoMap]);

  const typeMap = useMemo(() => {
    const map = {};
    // Populate from accumulated dropdown results
    accumulatedTripTypes.forEach((t) => {
      if (t.id) map[String(t.id)] = t.name;
    });
    // Supplement with background batch data
    if (allTypesData?.result?.trip_types) {
      allTypesData.result.trip_types.forEach((t) => {
        if (t.id) map[String(t.id)] = t.name;
      });
    }
    return map;
  }, [accumulatedTripTypes, allTypesData]);

  const getOperatorName = (trip) =>
    trip.operator?.name ||
    (trip.operator_id
      ? operatorInfoMap[String(trip.operator_id)] ||
        operatorMap[String(trip.operator_id)]
      : null) ||
    "N/A";

  const getTripTypeName = (trip) =>
    trip.type?.name ||
    (trip.type_id ? typeMap[String(trip.type_id)] : null) ||
    "N/A";

  const getBasePrice = (trip) => {
    if (trip.price_categories?.length > 0) {
      const base = trip.price_categories.find(
        (c) => c.category?.toLowerCase() === "base price",
      );
      return base ? base.price : trip.price;
    }
    return trip.price;
  };

  const handleModalClose = (value) => {
    setShowModal(value);
    if (value === false) refreshTrips(); // explicit, one-time refetch
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
          const errorMessage =
            Array.isArray(data?.error?.details) && data.error.details.length > 0
              ? data.error.details.map((detail) => detail.message).join(", ")
              : data?.error?.message === "Validation failed"
                ? data?.error?.details?.message || "Validation failed"
                : data?.error?.message || "Failed to update trip";

          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Trip",
          description: "Trip updated successfully!",
          variant: "success",
        });

        refreshTrips();
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

  const handleDeleteTrip = useCallback(async (tripId) => {
    setSelectedTripId(tripId);
    setConfirmDialogOpen(true);
  }, []);

  const executeDeleteTrip = async () => {
    if (!selectedTripId) return;

    const token = Cookies.get("token");
    setIsActionLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/trips/admin/${selectedTripId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        const errorMessage =
          Array.isArray(data?.error?.details) && data.error.details.length > 0
            ? data.error.details.map((detail) => detail.message).join(", ")
            : data?.error?.message === "Validation failed"
              ? data?.error?.details?.message || "Validation failed"
              : data?.error?.message || "Failed to delete trip";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Trip",
        description: "Trip deleted successfully!",
        variant: "success",
      });

      if (trips.length === 1 && page > 1) {
        updateQuery({ page: (page - 1).toString() });
      } else {
        refreshTrips();
      }
      setConfirmDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDuplicateTrip = useCallback(
    async (trip) => {
      const token = Cookies.get("token");

      try {
        const basePrice =
          trip.price_categories?.find(
            (c) => c.category?.toLowerCase() === "base price",
          )?.price ||
          trip.price ||
          0;

        const dupStartDate = trip.batches?.[0]?.start_date || trip.start_date;
        const dupEndDate = trip.batches?.[0]?.end_date || trip.end_date;

        // ✅ Prepare clean payload
        const payload = {
          name: `Copy of ${trip.name}`,
          start_date: dupStartDate,
          end_date: dupEndDate,
          batches:
            trip.batches?.length > 0
              ? trip.batches.map((b) => ({
                  start_date: b.start_date,
                  end_date: b.end_date,
                }))
              : [{ start_date: dupStartDate, end_date: dupEndDate }],
          price: Number(basePrice),
          difficulty: trip.difficulty,
          total_seats: trip.total_seats,
          description: trip.description,
          itinerary: trip.itinerary,
          images: trip.images,
          inclusions: trip.inclusions,
          price_categories:
            trip.price_categories?.length > 0
              ? trip.price_categories
              : [{ category: "Base Price", price: trip.price }],
          ...(trip.exclusions &&
          ((Array.isArray(trip.exclusions) && trip.exclusions.length > 0) ||
            (!Array.isArray(trip.exclusions) && trip.exclusions !== ""))
            ? { exclusions: trip.exclusions }
            : {}),
          operator_id: trip.operator_id,
          source_id: trip.source_id,
          destination_id: trip.destination_id,
          trip_type_id: trip.type_id || trip.type?.id,
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
          const errorMessage =
            Array.isArray(data?.error?.details) && data.error.details.length > 0
              ? data.error.details.map((detail) => detail.message).join(", ")
              : data?.error?.message === "Validation failed"
                ? data?.error?.details?.message || "Validation failed"
                : data?.error?.message || "Failed to duplicate trip";

          return toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }

        toast({
          title: "Success",
          description: "Trip duplicated successfully!",
          variant: "success",
        });

        refreshTrips();
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    },
    [toast, refreshTrips],
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
          <Link href={`/admin/trips/${trip.id}`} prefetch={false}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/trips/edit/${trip.id}`} prefetch={false}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        {trip.status === "DRAFT" && (
          <>
            <DropdownMenuItem
              className="text-success"
              onSelect={() => {
                handleUpdateTrip(trip.id, {
                  status: "PUBLISHED",
                });
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Activate
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-error"
              onSelect={() => {
                handleDeleteTrip(trip.id);
              }}
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
              onSelect={() => {
                handleUpdateTrip(trip.id, {
                  status: "DRAFT",
                });
              }}
            >
              <FilePen className="h-4 w-4 mr-2" />
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-error"
              onSelect={() => {
                handleDeleteTrip(trip.id);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2 text-error" />
              Delete
            </DropdownMenuItem>
          </>
        )}
        {trip.status === "PUBLISHED" && (
          <DropdownMenuItem
            className="text-accent"
            onSelect={() => {
              handleUpdateTrip(trip.id, {
                status: "ARCHIVED",
              });
            }}
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

        <DropdownMenuItem onSelect={() => handleDuplicateTrip(trip)}>
          <FilePen className="h-4 w-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const PageSkeleton = () => (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-8 gap-4 border-b pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-8 gap-4 items-center py-2">
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

        <CardContent className="pt-2">
          <div className="flex flex-col lg:flex-row lg:items-start gap-3 w-full">
            <div className="w-full lg:flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trips..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  className="pl-10 w-full lg:w-70"
                />
              </div>
              {searchError && (
                <p className="text-sm text-admin-error mt-1">{searchError}</p>
              )}
            </div>

            <div
              className="
        grid grid-cols-2 gap-3 w-full
        lg:flex lg:flex-wrap lg:items-center lg:w-auto
      "
            >
              <Select
                value={operatorFilter}
                onValueChange={(val) => updateQuery({ operator_id: val })}
              >
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operators</SelectItem>
                  {combinedOperators.map((operator) => (
                    <SelectItem key={operator.id} value={String(operator.id)}>
                      {operator.name}
                    </SelectItem>
                  ))}

                  {opPagination?.pages > 1 && opPage < opPagination.pages && (
                    <div className="flex items-center justify-center py-2 absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t cursor-default z-10">
                      <div
                        className="p-1 hover:bg-slate-100 rounded-full transition-colors animate-bounce"
                        onMouseEnter={() => {
                          if (
                            opPage < opPagination.pages &&
                            !loadingOperators
                          ) {
                            setOpPage((prev) => prev + 1);
                          }
                        }}
                      >
                        <ChevronDown className="h-4 w-4 text-teal-600" />
                      </div>
                    </div>
                  )}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(val) => updateQuery({ status: val })}
              >
                <SelectTrigger className="w-full lg:w-40">
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

              <Select
                value={typeFilter}
                onValueChange={(val) => updateQuery({ type_id: val })}
              >
                <SelectTrigger className="w-full lg:w-28">
                  <SelectValue placeholder="Trip Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {accumulatedTripTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}

                  {typePagination?.pages > 1 &&
                    typePage < typePagination.pages && (
                      <div className="flex items-center justify-center py-2 absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t cursor-default z-10">
                        <div
                          className="p-1 hover:bg-slate-100 rounded-full transition-colors animate-bounce"
                          onMouseEnter={() => {
                            if (
                              typePage < typePagination.pages &&
                              !loadingTripTypes
                            ) {
                              setTypePage((prev) => prev + 1);
                            }
                          }}
                        >
                          <ChevronDown className="h-4 w-4 text-teal-600" />
                        </div>
                      </div>
                    )}
                </SelectContent>
              </Select>

              <Select
                value={difficultyFilter}
                onValueChange={(val) => updateQuery({ difficulty: val })}
              >
                <SelectTrigger className="w-full lg:w-40">
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

              <Select
                value={sortBy}
                onValueChange={(val) => updateQuery({ sortBy: val })}
              >
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="created_at">Create Date</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="start_date">Start Date</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={order}
                onValueChange={(val) => updateQuery({ order: val })}
              >
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">Ascending</SelectItem>
                  <SelectItem value="DESC">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>

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
                <Button onClick={refreshTrips} variant="destructive">
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
                      <TableHead className="min-w-50 whitespace-nowrap">
                        Trip
                      </TableHead>
                      <TableHead className="min-w-45 whitespace-nowrap">
                        Operator
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Price</TableHead>
                      <TableHead className="whitespace-nowrap">Dates</TableHead>
                      <TableHead className="whitespace-nowrap">
                        Duration
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Difficulty
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Status
                      </TableHead>
                      <TableHead className="text-right whitespace-nowrap">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.map((trip) => {
                      const startDate = trip.batches?.[0]?.start_date || trip.start_date;
                      const endDate = trip.batches?.[0]?.end_date || trip.end_date;
                      const isExpired =
                        startDate &&
                        new Date(startDate) < new Date();
                      return (
                        <TableRow
                          key={trip.id}
                          className={cn(
                            isExpired &&
                              "bg-admin-bg-error/60 hover:bg-admin-bg-error/80 border-l-2 border-l-admin-error",
                          )}
                        >
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
                              <div className="min-w-0 flex-1">
                                <p
                                  className="font-medium truncate cursor-pointer"
                                  title={trip.name}
                                >
                                  {trip.name || "N/A"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground min-w-0">
                            <p
                              className="truncate"
                              title={getOperatorName(trip)}
                            >
                              {getOperatorName(trip)}
                            </p>
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-3 w-3" />
                              {getBasePrice(trip)?.toLocaleString("en-IN") ||
                                "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {trip.batches && trip.batches.length > 1 ? (
                                <div className="flex flex-col gap-1">
                                  <span>
                                    {startDate ? new Date(startDate).toLocaleDateString("en-IN") : "N/A"}{" "}
                                    -{" "}
                                    {endDate ? new Date(endDate).toLocaleDateString("en-IN") : "N/A"}
                                  </span>
                                  <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded w-max">
                                    +{trip.batches.length - 1} more batches
                                  </span>
                                </div>
                              ) : startDate && endDate ? (
                                `${new Date(startDate).toLocaleDateString("en-IN")} - ${new Date(endDate).toLocaleDateString("en-IN")}`
                              ) : (
                                "N/A"
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {startDate && endDate
                              ? `${Math.ceil(
                                  (new Date(endDate) -
                                    new Date(startDate)) /
                                    (1000 * 60 * 60 * 24),
                                )} days`
                              : "N/A"}
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

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
            trips.map((trip) => {
              const startDate = trip.batches?.[0]?.start_date || trip.start_date;
              const endDate = trip.batches?.[0]?.end_date || trip.end_date;
              const isExpired =
                startDate && new Date(startDate) < new Date();
              return (
                <Card
                  key={trip.id}
                  className={cn(
                    "border shadow-sm p-4",
                    isExpired &&
                      "bg-admin-bg-error/30 border-l-4 border-l-admin-error",
                  )}
                >
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
                          {getOperatorName(trip)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mt-3 border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {getBasePrice(trip)?.toLocaleString("en-IN") || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dates:</span>
                      <span>
                        {trip.batches && trip.batches.length > 1 ? (
                          <span className="flex flex-col items-end gap-0.5">
                            <span>
                              {startDate ? new Date(startDate).toLocaleDateString("en-IN") : "N/A"}{" "}
                              -{" "}
                              {endDate ? new Date(endDate).toLocaleDateString("en-IN") : "N/A"}
                            </span>
                            <span className="text-[9px] font-semibold bg-teal-50 text-teal-700 px-1.5 py-0.2 rounded w-max">
                              +{trip.batches.length - 1} more batches
                            </span>
                          </span>
                        ) : startDate && endDate ? (
                          `${new Date(startDate).toLocaleDateString("en-IN")} - ${new Date(endDate).toLocaleDateString("en-IN")}`
                        ) : (
                          "N/A"
                        )}
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
                    <Link
                      href={`/admin/trips/${trip.id}`}
                      className="flex-1"
                      prefetch={false}
                    >
                      <Button variant="outline" className="w-full text-sm h-9">
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </Link>
                    {renderActions(trip)}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
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
              onClick={() => updateQuery({ page: (page - 1).toString() })}
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => updateQuery({ page: (page + 1).toString() })}
              className="flex-1 sm:flex-none"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {showModal && (
        <AddTripModal
          handleModalClose={handleModalClose}
          extraOperators={Object.entries(operatorInfoMap).map(([id, name]) => ({
            id,
            name,
          }))}
        />
      )}

      <AdminConfirmDialog
        isOpen={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete Trip"
        description="Are you sure you want to delete this trip? This action cannot be undone."
        confirmText="Delete Trip"
        onConfirm={executeDeleteTrip}
        isLoading={isActionLoading}
        variant="destructive"
      />
    </>
  );
}

export default Page;
