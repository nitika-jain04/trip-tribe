"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  MoreHorizontal,
  Eye,
  Loader2,
  AlertCircle,
  Trash,
  CheckCheck,
  CheckCircle,
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
import { useToast } from "@/app/hooks/use-toast";
import { IoClose } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { BiComment } from "react-icons/bi";
import { formatPhoneNumber } from "@/lib/utils";
import { Skeleton } from "@/app/components/ui/skeleton";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function Enquiries() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [enquiryFilter, setEnquiryFilter] = useState("all");

  const [enquiries, setEnquiries] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // date filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const { toast } = useToast();
  const router = useRouter();

  const fetchEnquiries = useCallback(async () => {
    const token = Cookies.get("token");

    if (!token) {
      router.push("/");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (debouncedSearch) params.append("search", debouncedSearch);

      if (statusFilter !== "all") {
        params.append("status", statusFilter.toUpperCase());
      }

      if (enquiryFilter !== "all") {
        params.append("inquiry_type", enquiryFilter);
      }

      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/enquiries/admin?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch enquiries");

      const data = await res.json();

      if (data.success) {
        setEnquiries(data.result.data || []);
        setTotalPages(data.result.pagination?.pages || 1);
        setTotalItems(data.result.pagination?.total || 0);
        setPage(data.result.pagination?.page || 1);
        setLimit(data.result.pagination?.limit || 10);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false); // ✅ important
    }
  }, [
    debouncedSearch,
    statusFilter,
    enquiryFilter,
    page,
    limit,
    fromDate,
    toDate,
    router,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      router.push("/");
      return;
    }

    fetchEnquiries();
  }, [fetchEnquiries, router]);

  const handleDelete = async (id) => {
    const token = Cookies.get("token");
    if (!token) return;

    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/enquiries/admin/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete enquiry");
      }

      toast({
        title: "Enquiry Deleted",
        description: "Enquiry deleted successfully",
      });

      fetchEnquiries();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleCloseEnquiry = async (id) => {
    const token = Cookies.get("token");
    if (!token) return;

    if (!confirm("Are you sure you want to close this enquiry?")) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/enquiries/admin/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "CLOSED" }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to close enquiry");
      }

      toast({
        title: "Enquiry Closed",
        description: "Enquiry closed successfully",
      });

      fetchEnquiries();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Error
  if (error) {
    return (
      <div className="p-6 text-red-500">
        <AlertCircle />
        {error}
      </div>
    );
  }

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
        <Skeleton className="h-10 w-48" />
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
          <div className="grid grid-cols-5 gap-4 border-b pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>

          {/* Table rows */}
          {Array.from({ length: 10 }).map((_, i) => (
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
          <div className="flex justify-between items-center pt-4 border-t">
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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Enquiries</h1>
        <p className="text-muted-foreground">Manage all traveller enquiries</p>
      </div>
      {/* Filters */}
      {/* <Card> */}
      <CardContent className="pt-2 flex gap-2 flex-wrap w-full">
        <div className="relative w-80">
          <Search className="absolute left-3 top-3 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={enquiryFilter}
          onValueChange={(value) => {
            setPage(1);
            setEnquiryFilter(value);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Inquiry Type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Enquiry Type</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
            <SelectItem value="TRIP">Trip</SelectItem>
            <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
            <SelectItem value="SUPPORT">Support</SelectItem>
            <SelectItem value="FEEDBACK">Feedback</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type={fromDate ? "date" : "text"}
          placeholder="Start Date"
          value={fromDate}
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = "text";
          }}
          onChange={(e) => {
            setPage(1);
            setFromDate(e.target.value);
          }}
          className="w-fit focus:outline-none focus:border-none placeholder:text-black"
        />

        <Input
          type={toDate ? "date" : "text"}
          placeholder="End Date"
          value={toDate}
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = "text";
          }}
          onChange={(e) => {
            setPage(1);
            setToDate(e.target.value);
          }}
          className="w-fit focus:outline-none focus:border-none placeholder:text-black"
        />
      </CardContent>
      {/* </Card> */}

      {!loading && !error && enquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50">
          <BiComment className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">No Enquiries found</p>
          <p className="text-sm text-gray-400 mt-1">
            {search && "No enquiries match your search criteria"}
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-6 p-6">
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading enquiries...</p>
              <p className="text-sm text-gray-400 mt-1">
                Please wait while we fetch your data
              </p>
            </div>
          </CardContent>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Enquiries ({totalItems})</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Enquiry Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {enquiries.map((enquiry) => (
                  <TableRow key={enquiry.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{enquiry.full_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatPhoneNumber(enquiry.phone_number)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {enquiry.inquiry_type ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            enquiry.inquiry_type === "GENERAL"
                              ? "bg-blue-100 text-blue-500"
                              : enquiry.inquiry_type === "TRIP"
                                ? "bg-yellow-100 text-yellow-700"
                                : enquiry.inquiry_type === "PARTNERSHIP"
                                  ? "bg-green-100 text-green-700"
                                  : enquiry.inquiry_type === "FEEDBACK"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {enquiry.inquiry_type
                            .replace("_", " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell>{enquiry.email}</TableCell>

                    <TableCell>
                      {new Date(enquiry.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={enquiry.status.toLowerCase()} />
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/enquiries/${enquiry.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleCloseEnquiry(enquiry.id)}
                          >
                            <CheckCircle className="mr-2" size={15} />
                            Mark as Closed
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDelete(enquiry.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2" size={15} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, totalItems)} of {totalItems}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Enquiries;
