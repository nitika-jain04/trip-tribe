"use client";

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
  AlertCircle,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
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
import Link from "next/link";
import { formatPhoneNumber } from "@/lib/utils";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useToast } from "@/app/hooks/use-toast";
import { FaRegUser } from "react-icons/fa";
import AddOperatorModal from "@/app/components/admin/AddOperatorModal";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function OperatorsPage() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalOperators, setTotalOperators] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedOperatorId, setSelectedOperatorId] = useState(null);
  const [operatorTrips, setOperatorTrips] = useState([]);

  const { toast } = useToast();

  // Fetch operators from API
  const getOperators = useCallback(async () => {
    const token = Cookies.get("token");

    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      params.append("page", String(page));
      params.append("limit", String(limit));

      if (sourceFilter && sourceFilter !== "all") {
        params.append("source", sourceFilter.toUpperCase());
      }

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter.toUpperCase());
      }

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

      if (searchValue && searchValue.length < 2) {
        setSearchError("Search must be at least 2 characters");
      } else if (searchValue && searchValue.length >= 2) {
        params.append("search", searchValue);
      }

      const url = `${BASE_URL}/api/${API_VERSION}/operators/admin?${params.toString()}`;

      // //console.log"Final URL:", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to fetch operators",
          variant: "destructive",
        });
        return;
      }

      const operatorsArray = data?.result?.operators || [];
      const pagination = data?.result?.pagination || {};

      setOperators(operatorsArray);
      setTotalOperators(pagination.total || 0);
      setTotalPages(pagination.pages || 1);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      console.error("Fetch error:", err);
      setError(err.message);
      setOperators([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [
    page,
    limit,
    statusFilter,
    sourceFilter,
    sortBy,
    sortOrder,
    debouncedSearch,
  ]);

  useEffect(() => {
    getOperators();
  }, [getOperators]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const value = searchQuery.trim();

      if (value.length === 0) {
        setSearchError("");
        setDebouncedSearch("");
        setPage(1);
      } else if (value.length < 2) {
        setSearchError("Search must be at least 2 characters");
      } else {
        setSearchError("");
        setDebouncedSearch(value);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddModalClose = (value, wasCreated = false) => {
    setShowAddModal(value);
    if (!value && wasCreated) getOperators();
  };

  const handleInactivateOperator = async (operatorId) => {
    const token = Cookies.get("token");

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators/admin/${operatorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        return toast({
          title: "Error",
          description: "Failed to fetch operator details",
          variant: "destructive",
        });
      }

      const trips = data?.result?.trip || [];

      // If trips exist → open dialog
      if (trips.length > 0) {
        setSelectedOperatorId(operatorId);
        setOperatorTrips(trips);
        setConfirmDialogOpen(true);
        return;
      }

      // No trips → directly update
      await handleUpdateOperator(operatorId, {
        status: "INACTIVE",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

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
          description: data?.error?.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Operator",
        description: "Operator updated successfully!",
        variant: "success",
      });
      // getOperators();
      setOperators((prev) =>
        prev.map((op) => (op.id === operatorId ? { ...op, ...payload } : op)),
      );
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

      if (!res.ok) {
        return toast({
          title: "Error",
          description: data?.error?.message,
          variant: "destructive",
        });
      }

      toast({
        title: "Operator",
        description: "Operator deleted successfully!",
        variant: "success",
      });

      getOperators(); // refresh list
      setOperators((prev) => prev.filter((op) => op.id !== operatorId));
      setTotalOperators((prev) => prev - 1);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const renderActions = (op) => (
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

        {op.application_status === "APPROVED" && op.status === "ACTIVE" && (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/admin/operators/edit/${op.id}`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-warning"
              onClick={() => handleInactivateOperator(op.id)}
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
          </>
        )}
        {op.application_status === "APPROVED" && op.status === "INACTIVE" && (
          <>
            <DropdownMenuItem
              className="text-warning"
              onClick={() =>
                handleUpdateOperator(op.id, {
                  status: "ACTIVE",
                })
              }
            >
              <UserX className="h-4 w-4 mr-2" />
              Activate
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleDeleteOperator(op.id)}
              className="text-error"
            >
              <Trash2 className="h-4 w-4 mr-2 text-error" />
              Delete
            </DropdownMenuItem>
          </>
        )}

        {op.application_status === "APPROVED" && op.status === "SUSPENDED" && (
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
              onClick={() => handleDeleteOperator(op.id)}
              className="text-error"
            >
              <Trash2 className="h-4 w-4 mr-2 text-error" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

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

      <Card className="hidden sm:block border shadow-sm">
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
    <>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Operators
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all trip operators
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
          <div className="flex flex-col lg:flex-row gap-3 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search operators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Filters */}
            <div
              className="
              grid grid-cols-2 gap-3
              lg:flex lg:flex-row lg:items-center
            "
            >
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="admin_created">Admin</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="created_at">Create Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search error */}
            {searchError && (
              <p className="text-sm text-admin-error">{searchError}</p>
            )}
          </div>
        </CardContent>

        {/* </Card> */}
        <Card className="hidden sm:block border shadow-sm">
          <CardHeader className="px-4 sm:px-6 pb-2">
            <CardTitle>All Operators ({totalOperators})</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pt-2">
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
              <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 font-medium">
                  Failed to load operators
                </p>
                <p className="text-sm text-red-400 mt-1 mb-4">{error}</p>
                <Button onClick={getOperators} variant="destructive">
                  Try Again
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
                      {/* <TableHead className="text-center whitespace-nowrap">
                        Trips
                      </TableHead> */}
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
                            <div className="relative h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                              {op.logo_url ? (
                                <Image
                                  src={op.logo_url || "/vercel.svg"}
                                  alt={op.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <FaRegUser
                                  className="text-gray-500"
                                  size={20}
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="font-medium truncate max-w-37.5 lg:max-w-50"
                                title={op.name}
                              >
                                {op.name}
                              </p>
                              <a
                                href={`mailto:${op.email}`}
                                className="text-sm text-muted-foreground truncate max-w-37.5 lg:max-w-50"
                                title={op.email}
                              >
                                {op.email}
                              </a>
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
                            <a
                              href={`tel:+91 ${op.phone_number}`}
                              className="text-sm text-muted-foreground truncate max-w-30 lg:max-w-37.5"
                              title={op.phone_number}
                            >
                              {formatPhoneNumber(op.phone_number)}
                            </a>
                          </div>
                        </TableCell>

                        <TableCell
                          className="text-muted-foreground max-w-37.5 truncate cursor-pointer"
                          title={op.regions}
                        >
                          {Array.isArray(op.regions) && op.regions.length > 0
                            ? op.regions.join(", ")
                            : "-"}
                        </TableCell>

                        {/* <TableCell className="text-center">
                          {op.total_trips !== undefined &&
                          op.total_trips !== null
                            ? Number(op.total_trips)
                            : "-"}
                        </TableCell> */}

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
                          {renderActions(op)}
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
            <h2 className="text-lg font-semibold">
              All Operators ({totalOperators})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-teal-500 w-8 h-8" />
            </div>
          ) : operators.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No operators found
            </p>
          ) : (
            operators.map((op) => (
              <Card key={op.id} className="border shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0">
                      {op.logo_url ? (
                        <Image
                          src={op.logo_url}
                          alt={op.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                          <FaRegUser className="text-gray-500" size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{op.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {op.contact_name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <StatusBadge
                      status={
                        op.application_status === "PENDING" ||
                        op.application_status === "REJECTED"
                          ? op.application_status?.toLowerCase()
                          : op.status?.toLowerCase()
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm mt-3 border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <a
                      href={`mailto:${op.email}`}
                      className="text-right truncate max-w-48 text-primary"
                    >
                      {op.email}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <a href={`tel:+91 ${op.phone_number}`}>
                      {formatPhoneNumber(op.phone_number)}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Region:</span>
                    <span className="text-right truncate max-w-48">
                      {Array.isArray(op.regions) && op.regions.length > 0
                        ? op.regions.join(", ")
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 w-full">
                  <Link href={`/admin/operators/${op.id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-sm h-9">
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                  </Link>
                  {renderActions(op)}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, totalOperators)} of {totalOperators}
          </p>

          <span className="px-3 py-1 text-center text-sm">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
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

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Inactivation</DialogTitle>
            <DialogDescription>
              This operator has {operatorTrips.length} trip(s). Are you sure you
              want to inactivate?
            </DialogDescription>
          </DialogHeader>

          {/* Optional: Show trip names */}
          <div className="max-h-40 overflow-y-auto text-sm text-muted-foreground">
            {operatorTrips.slice(0, 5).map((trip) => (
              <p key={trip.id}>• {trip.name}</p>
            ))}
            {operatorTrips.length > 5 && <p>...and more</p>}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={async () => {
                await handleUpdateOperator(selectedOperatorId, {
                  status: "INACTIVE",
                });
                setConfirmDialogOpen(false);
              }}
            >
              Yes, Inactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OperatorsPage;
