"use client";

import AdminGuard from "@/app/components/AdminGuard";
import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Search,
  Loader2,
  UserCheck,
  UserX,
  Trash2,
  Plus,
} from "lucide-react";
import Image from "next/image";
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
import { IoCloseSharp } from "react-icons/io5";
import Link from "next/link";
import { formatPhoneNumber } from "@/lib/utils";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useToast } from "@/app/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function OperatorsPage() {
  const [operators, setOperators] = useState([]);
  const [regions, setRegions] = useState([]);
  const [regionFilter, setRegionFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalOperators, setTotalOperators] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const { toast } = useToast();

  // Fetch operators from API
  const getOperators = useCallback(async () => {
    const token = Cookies.get("token");

    if (!token) {
      console.log("No token found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      params.append("page", String(page));
      params.append("limit", String(limit));

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter.toUpperCase());
      }

      // if (sourceFilter && sourceFilter !== "all") {
      //   params.append("source", sourceFilter);
      // }

      if (sortBy) {
        params.append("sortBy", sortBy);
      }

      if (sortOrder) {
        params.append("sortOrder", sortOrder);
      }

      const searchValue = debouncedSearch?.trim();

      if (searchValue && searchValue.length >= 2) {
        params.append("search", searchValue);
      }

      const url = `${BASE_URL}/api/${API_VERSION}/operators/admin?${params.toString()}`;

      // console.log("Final URL:", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("Response:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch operators");
      }

      const operatorsArray = data?.result?.operators || [];
      const pagination = data?.result?.pagination || {};

      setOperators(operatorsArray);
      setTotalOperators(pagination.total || 0);
      setTotalPages(pagination.pages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setOperators([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [page, limit, statusFilter, sortBy, sortOrder, debouncedSearch]);

  useEffect(() => {
    const searchValue = debouncedSearch?.trim();

    if (searchValue && searchValue.length < 2) {
      setOperators([]);
      setTotalOperators(0);
      setTotalPages(1);
      setError(null);
      setLoading(false);
      return;
    }

    getOperators();

    const interval = setInterval(() => getOperators(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getOperators, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const value = searchQuery.trim();

      if (value.length === 0) {
        setSearchError("");
        setDebouncedSearch("");
        setPage(1);
      } else if (value.length < 2) {
        setSearchError("Search must be at least 2 characters");
        setOperators([]);
        setTotalOperators(0);
        setTotalPages(1);
      } else {
        setSearchError("");
        setDebouncedSearch(value);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddModalClose = (value) => {
    setShowAddModal(value);
    if (!value) getOperators();
  };

  // const handleViewDetails = (operator) =>
  //   router.push(`/admin/operators/${operator.id}`);
  // const handleEditOperator = (operator) =>
  //   router.push(`/admin/operators/edit/${operator.id}`);

  const handleUpdateOperator = async (operatorId, payload) => {
    const token = Cookies.get("token");

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators/admin/${operatorId}`,
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
          description: err.message,
          variant: "destructive",
        });
      }

      toast({
        title: "Operator",
        description: "Operator updated successfully!",
        variant: "success",
      });
      getOperators();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteOperator = async (operatorId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this operator? This action cannot be undone.",
    );

    if (!confirmed) return;

    const token = Cookies.get("token");

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators/admin/${operatorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete operator");
      }

      toast({
        title: "Operator",
        description: "Operator deleted successfully!",
        variant: "success",
      });

      getOperators(); // refresh list
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const PageSkeleton = () => (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 sm:h-8 w-36 sm:w-48" />
        <Skeleton className="h-3 sm:h-4 w-56 sm:w-72" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-2 sm:flex-wrap">
        <Skeleton className="h-10 w-full sm:w-80" />
        <Skeleton className="h-10 w-full sm:w-40" />
      </div>

      {/* Mobile Cards Skeleton (visible on mobile, hidden on desktop) */}
      <div className="block sm:hidden space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton (hidden on mobile, visible on desktop) */}
      <Card className="hidden sm:block">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Table header */}
          <div className="grid grid-cols-5 gap-4 border-b pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>

          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 items-center py-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>

              <Skeleton className="h-4 w-28" />

              <Skeleton className="h-4 w-24" />

              <Skeleton className="h-6 w-20 rounded-full" />

              <Skeleton className="h-8 w-8 ml-auto rounded-md" />
            </div>
          ))}

          {/* Pagination skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
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
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Operators
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage trip operators on the platform
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Operator
          </Button>
        </div>

        {/* Filters */}
        {/* <Card> */}
        <CardContent className="pt-2">
          <div className="flex flex-col sm:flex-row gap-3 w-170">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search operators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                {/* <SelectItem value="pending">Pending</SelectItem> */}
              </SelectContent>
            </Select>

            {/* <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((region, index) => (
                    <SelectItem key={index} value={region}>
                      {" "}
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
          </div>
        </CardContent>
        {/* </Card> */}

        {/* Mobile View - Cards (visible on mobile, hidden on desktop) */}
        <div className="block sm:hidden">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-red-500">
                  <p className="text-center mb-4">{error}</p>
                  <Button onClick={getOperators} variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : operators.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-gray-500">
                  <p className="text-center">No operators found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {operators.map((op) => (
                <Card key={op.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={op.logo_url || "/vercel.svg"}
                          alt={op.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium truncate" title={op.name}>
                              {op.name}
                            </p>
                            <p
                              className="text-sm text-muted-foreground truncate"
                              title={op.email}
                            >
                              {op.email}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/operators/${op.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem asChild>
                                <Link href={`/admin/operators/edit/${op.id}`}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem> */}
                              {op.application_status === "PENDING" && (
                                <>
                                  <DropdownMenuItem
                                    className="text-success"
                                    onClick={() =>
                                      handleUpdateOperator(op.id, {
                                        application_status: "APPROVED",
                                      })
                                    }
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    className="text-warning"
                                    onClick={() =>
                                      handleUpdateOperator(op.id, {
                                        application_status: "REJECTED",
                                      })
                                    }
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {op.application_status === "APPROVED" &&
                                op.status === "SUSPENDED" && (
                                  <DropdownMenuItem
                                    className="text-success"
                                    onClick={() =>
                                      handleUpdateOperator(op.id, {
                                        status: "ACTIVE",
                                      })
                                    }
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                              {op.application_status === "APPROVED" &&
                                op.status === "ACTIVE" && (
                                  <>
                                    <DropdownMenuItem asChild>
                                      <Link
                                        href={`/admin/operators/edit/${op.id}`}
                                      >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() =>
                                        handleUpdateOperator(op.id, {
                                          status: "INACTIVE",
                                        })
                                      }
                                    >
                                      <UserX className="h-4 w-4 mr-2" />
                                      Inactivate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() =>
                                        handleUpdateOperator(op.id, {
                                          status: "SUSPENDED",
                                        })
                                      }
                                    >
                                      <UserX className="h-4 w-4 mr-2" />
                                      Suspend
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteOperator(op.id)
                                      }
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2 text-error" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              {op.application_status === "APPROVED" &&
                                op.status === "INACTIVE" && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      handleUpdateOperator(op.id, {
                                        status: "ACTIVE",
                                      })
                                    }
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                              {/* {op.application_status === "REJECTED" && (
                                <DropdownMenuItem
                                  className="text-success"
                                  onClick={() =>
                                    handleUpdateOperator(op.id, {
                                      application_status: "APPROVED",
                                    })
                                  }
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )} */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              Contact:
                            </span>{" "}
                            {op.contact_name}
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              Phone:
                            </span>{" "}
                            {formatPhoneNumber(op.phone_number)}
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              Region:
                            </span>{" "}
                            {Array.isArray(op.regions) && op.regions.length > 0
                              ? op.regions.join(", ")
                              : "-"}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <StatusBadge status={op.status?.toLowerCase()} />
                            <span className="text-sm text-muted-foreground">
                              Trips:{" "}
                              {op.total_trips !== undefined &&
                              op.total_trips !== null
                                ? Number(op.total_trips)
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Desktop View - Table (hidden on mobile, visible on desktop) */}
        <Card className="hidden sm:block">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>All Operators ({totalOperators})</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">
                  Loading operators...
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Please wait while we fetch your data
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center py-16 text-red-500">
                <p>{error}</p>
                <Button onClick={getOperators} className="mt-4">
                  Retry
                </Button>
              </div>
            ) : operators.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-500">
                <p>No operators found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        Operator
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Contact
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Region
                      </TableHead>
                      <TableHead className="text-center whitespace-nowrap">
                        Trips
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
                    {operators.map((op) => (
                      <TableRow key={op.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={op.logo_url || "/vercel.svg"}
                                alt={op.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="font-medium truncate max-w-37.5 lg:max-w-50"
                                title={op.name}
                              >
                                {op.name}
                              </p>
                              <p
                                className="text-sm text-muted-foreground truncate max-w-37.5 lg:max-w-50"
                                title={op.email}
                              >
                                {op.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="min-w-0">
                            <p
                              className="text-sm truncate max-w-30 lg:max-w-37.5"
                              title={op.contact_name}
                            >
                              {op.contact_name}
                            </p>
                            <p
                              className="text-sm text-muted-foreground truncate max-w-30 lg:max-w-37.5"
                              title={op.phone_number}
                            >
                              {formatPhoneNumber(op.phone_number)}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="text-muted-foreground max-w-37.5 truncate">
                          {Array.isArray(op.regions) && op.regions.length > 0
                            ? op.regions.join(", ")
                            : "-"}
                        </TableCell>

                        <TableCell className="text-center">
                          {op.total_trips !== undefined &&
                          op.total_trips !== null
                            ? Number(op.total_trips)
                            : "-"}
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={
                              op.application_status === "PENDING" ||
                              op.application_status === "REJECTED"
                                ? op.application_status?.toLowerCase()
                                : op.status?.toLowerCase()
                            }
                          />
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
                                <Link href={`/admin/operators/${op.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem asChild>
                                <Link href={`/admin/operators/edit/${op.id}`}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem> */}

                              {op.application_status === "PENDING" && (
                                <>
                                  <DropdownMenuItem
                                    className="text-success"
                                    onClick={() =>
                                      handleUpdateOperator(op.id, {
                                        application_status: "APPROVED",
                                      })
                                    }
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    className="text-warning"
                                    onClick={() =>
                                      handleUpdateOperator(op.id, {
                                        application_status: "REJECTED",
                                      })
                                    }
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}

                              {op.application_status === "APPROVED" &&
                                op.status === "ACTIVE" && (
                                  <>
                                    <DropdownMenuItem asChild>
                                      <Link
                                        href={`/admin/operators/edit/${op.id}`}
                                      >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-warning"
                                      onClick={() =>
                                        handleUpdateOperator(op.id, {
                                          status: "INACTIVE",
                                        })
                                      }
                                    >
                                      <UserX className="h-4 w-4 mr-2" />
                                      Inactivate
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() =>
                                        handleUpdateOperator(op.id, {
                                          status: "SUSPENDED",
                                        })
                                      }
                                    >
                                      <UserX className="h-4 w-4 mr-2" />
                                      Suspend
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteOperator(op.id)
                                      }
                                      className="text-error"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2 text-error" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              {op.application_status === "APPROVED" &&
                                op.status === "INACTIVE" && (
                                  <DropdownMenuItem
                                    className="text-success"
                                    onClick={() =>
                                      handleUpdateOperator(op.id, {
                                        status: "ACTIVE",
                                      })
                                    }
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                              {op.application_status === "APPROVED" &&
                                op.status === "SUSPENDED" && (
                                  <DropdownMenuItem
                                    className="text-success"
                                    onClick={() =>
                                      handleUpdateOperator(op.id, {
                                        status: "ACTIVE",
                                      })
                                    }
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                              {op.application_status === "REJECTED" && (
                                <DropdownMenuItem
                                  className="text-success"
                                  onClick={() =>
                                    handleUpdateOperator(op.id, {
                                      application_status: "APPROVED",
                                    })
                                  }
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <span className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, totalOperators)} of {totalOperators}
          </span>

          <span className="px-3 py-1 text-center text-sm order-1 sm:order-2">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2 order-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddOperatorModal handleModalClose={handleAddModalClose} />
      )}
    </AdminGuard>
  );
}

function AddOperatorModal({ handleModalClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    contact_name: "",
    regions: "",
    description: "",
    website_url: "",
    logo_url: "",
    rating: 4.5,
    status: "inactive",
    total_trips: 0,
    trips_per_year: 0,
    social_links: {
      instagram: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  function handleChange(e) {
    const { name, value } = e.target;

    if (name.startsWith("social_links.")) {
      const key = name.split(".")[1];

      setFormData((prev) => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

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

    console.log("req", formDataToSend);

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

  const validateForm = () => {
    const errors = {};

    const startsWithValidChar = /^[A-Za-z][A-Za-z\s.'-]*$/;

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = "Operator name must be at least 2 characters.";
    }

    if (!formData.contact_name || formData.contact_name.trim().length < 2) {
      errors.contact_name = "Contact person must be at least 2 characters.";
    } else if (!startsWithValidChar.test(formData.contact_name.trim())) {
      errors.contact_name =
        "Contact person cannot start with a special character.";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    // Phone validation
    if (!formData.phone_number) {
      errors.phone_number = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone_number)) {
      errors.phone_number = "Invalid Indian phone number";
    }

    // Website validation
    if (
      formData.website_url &&
      !/^https?:\/\/(www\.)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(
        formData.website_url,
      )
    ) {
      errors.website_url = "Enter valid website URL (https:// or http://)";
    }

    // Social links validation
    const socialPatterns = {
      instagram: /^https?:\/\/(www\.)?instagram\.com\/.+$/,
      facebook: /^https?:\/\/(www\.)?facebook\.com\/.+$/,
      twitter: /^https?:\/\/(www\.)?(twitter|x)\.com\/.+$/,
      linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+$/,
      youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    };

    Object.entries(formData.social_links).forEach(([platform, url]) => {
      if (url && !socialPatterns[platform].test(url)) {
        errors[`social_links.${platform}`] = `Enter valid ${platform} URL`;
      }
    });

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstError = document.querySelector(".text-admin-error");
      if (firstError) {
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      scrollToFirstError();
      return;
    }

    setLoading(true);
    setError("");

    const token = Cookies.get("token");

    const requestBody = {
      name: formData.name,
      description: formData.description,
      contact_name: formData.contact_name,
      email: formData.email,
      phone_number: formData.phone_number,
      regions: formData.regions
        ? formData.regions
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean)
        : [],
      website_url: formData.website_url || undefined,
      logo_url: formData.logo_url || undefined,
      // rating: parseFloat(formData.rating) || 4.5,
      // status: formData.status,

      total_trips:
        formData.total_trips !== "" ? Number(formData.total_trips) : undefined,

      trips_per_year:
        formData.trips_per_year !== ""
          ? Number(formData.trips_per_year)
          : undefined,

      social_links: {
        instagram: formData.social_links.instagram || undefined,
        facebook: formData.social_links.facebook || undefined,
        twitter: formData.social_links.twitter || undefined,
        youtube: formData.social_links.youtube || undefined,
        linkedin: formData.social_links.linkedin || undefined,
      },
    };

    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key],
    );

    console.log("add op req", requestBody);

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
    } catch (err) {
      console.error("Error adding operator:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-full sm:w-[90vw] md:w-[80vw] lg:w-[70vw] h-[90vh] sm:h-[85vh] rounded-t-xl sm:rounded-xl shadow-lg flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-[#14181F]">
            Add Operator
          </h2>
          <button
            onClick={() => handleModalClose(false)}
            className="text-gray-500 hover:text-black text-xl p-1"
            disabled={loading || uploadingImage}
          >
            <IoCloseSharp />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-admin-error text-sm">{error}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
          >
            {/* Logo Upload */}
            <div className="col-span-1 sm:col-span-2">
              <label className="text-sm text-gray-600 font-medium">
                Upload Logo
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-4 mt-1">
                <div className="flex-1 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:bg-[#4ED0C3]/10 file:text-[#4ED0C3] hover:file:bg-[#4ED0C3]/20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a logo image (JPG, PNG, SVG)
                  </p>
                </div>
                {formData.logo_url && (
                  <div className="flex flex-col items-center sm:items-start">
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
              <Input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-1"
                placeholder="Wanderlust Adventures"
              />
              {fieldErrors.name && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Contact Person Name */}
            <div>
              <label className="text-sm text-gray-600">
                Contact Person Name *
              </label>
              <Input
                type="text"
                name="contact_name"
                required
                value={formData.contact_name}
                onChange={handleChange}
                className="w-full mt-1"
                placeholder="Priya Sharma"
              />
              {fieldErrors.contact_name && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.contact_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email *</label>
              <Input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value.toLowerCase(),
                  }));
                }}
                className="w-full mt-1"
                placeholder="hello@wanders.com"
              />
              {fieldErrors.email && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-sm text-gray-600">Phone Number *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  +91
                </span>

                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone_number}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setFormData((prev) => ({
                      ...prev,
                      phone_number: digits,
                    }));
                  }}
                  className="pl-12 text-sm mt-1 w-full"
                  required
                />
              </div>
              {fieldErrors.phone_number && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.phone_number}
                </p>
              )}
            </div>

            {/* Region */}
            <div>
              <label className="text-sm text-gray-600">Region *</label>
              <Input
                type="text"
                name="regions"
                required
                value={formData.regions}
                onChange={handleChange}
                className="w-full mt-1"
                placeholder="North India, Himalayas"
              />
            </div>

            {/* Total Trips */}
            <div>
              <label className="text-sm text-gray-600">Total Trips</label>
              <Input
                type="number"
                name="total_trips"
                value={formData.total_trips}
                onChange={handleChange}
                min="0"
                className="w-full mt-1"
                placeholder="150"
              />
            </div>

            {/* Trips Per Year */}
            <div>
              <label className="text-sm text-gray-600">Trips Per Year</label>
              <Input
                type="number"
                name="trips_per_year"
                value={formData.trips_per_year}
                onChange={handleChange}
                min="0"
                className="w-full mt-1"
                placeholder="25"
              />
            </div>

            {/* Status - Commented out */}
            {/* <div>
              <label className="text-sm text-gray-600">Status *</label>
              <select
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
              >
                <option value="" className="placeholder:text-gray-600">
                  Select Status
                </option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div> */}

            {/* Social Links Section */}
            <div className="col-span-1 sm:col-span-2">
              <label className="text-sm text-gray-600">
                Social Media Links
              </label>
            </div>

            {/* Website URL */}
            <div>
              <label className="text-sm text-gray-600">Website URL</label>
              <Input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                className="w-full mt-1"
                placeholder="https://wanderlustadventures.com"
              />
              {fieldErrors.website_url && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.website_url}
                </p>
              )}
            </div>

            {/* Instagram */}
            <div>
              <label className="text-sm text-gray-600">Instagram URL</label>
              <Input
                type="url"
                name="social_links.instagram"
                value={formData.social_links.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/operator"
                className="w-full mt-1"
              />
              {fieldErrors["social_links.instagram"] && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors["social_links.instagram"]}
                </p>
              )}
            </div>

            {/* Facebook */}
            <div>
              <label className="text-sm text-gray-600">Facebook URL</label>
              <Input
                type="url"
                name="social_links.facebook"
                value={formData.social_links.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/operator"
                className="w-full mt-1"
              />
              {fieldErrors["social_links.facebook"] && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors["social_links.facebook"]}
                </p>
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="text-sm text-gray-600">LinkedIn URL</label>
              <Input
                type="url"
                name="social_links.linkedin"
                value={formData.social_links.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/operator"
                className="w-full mt-1"
              />
              {fieldErrors["social_links.linkedin"] && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors["social_links.linkedin"]}
                </p>
              )}
            </div>

            {/* Twitter */}
            <div>
              <label className="text-sm text-gray-600">Twitter URL</label>
              <Input
                type="url"
                name="social_links.twitter"
                value={formData.social_links.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/operator"
                className="w-full mt-1"
              />
              {fieldErrors["social_links.twitter"] && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors["social_links.twitter"]}
                </p>
              )}
            </div>

            {/* YouTube */}
            <div>
              <label className="text-sm text-gray-600">YouTube URL</label>
              <Input
                type="url"
                name="social_links.youtube"
                value={formData.social_links.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/@operator"
                className="w-full mt-1"
              />
              {fieldErrors["social_links.youtube"] && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors["social_links.youtube"]}
                </p>
              )}
            </div>

            {/* Rating - Commented out */}
            {/* <div>
              <label className="text-sm text-gray-600">Rating (0-5)</label>
              <Input
                type="number"
                name="rating"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                className="w-full mt-1"
                placeholder="4.5"
              />
            </div> */}

            {/* Description */}
            <div className="col-span-1 sm:col-span-2">
              <label className="text-sm text-gray-600">Description *</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                placeholder="Describe the operator's services, specialties, and experience..."
              ></textarea>
            </div>

            {/* Modal Footer */}
            <div className="col-span-1 sm:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6 mt-2 border-t">
              <button
                type="button"
                onClick={() => handleModalClose(false)}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                disabled={loading || uploadingImage}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="w-full sm:w-auto px-6 py-2 bg-[#4ED0C3] text-white rounded-lg text-sm font-medium hover:bg-[#3db8ab] disabled:opacity-50 disabled:cursor-not-allowed"
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

export default OperatorsPage;
