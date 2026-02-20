"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  MoreHorizontal,
  Eye,
  Loader2,
  AlertCircle,
  Inbox,
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function Enquiries() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // const [enquiryFilter, setEnquiryFilter] = useState("general");

  const [enquiries, setEnquiries] = useState([]);

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
      // setError("Authentication token missing");
      // setLoading(false);
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

      if (fromDate) params.append("from_date", fromDate);

      if (toDate) params.append("to_date", toDate);

      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/enquiries/admin?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch enquiries");
      }

      const data = await res.json();

      if (data.success) {
        setEnquiries(data.result.data || []);

        setTotalPages(data.result.pagination?.pages || 1);
        setTotalItems(data.result.pagination?.total || 0);
        setPage(data.result.pagination?.page || 1);
        setLimit(data.result.pagination?.limit || 10);
      } else {
        throw new Error(data.message || "Failed to fetch enquiries");
      }
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page, limit, fromDate, toDate, router]);

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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Enquiries</h1>
        <p className="text-muted-foreground">Manage all traveller enquiries</p>
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="pt-6 flex gap-5 flex-wrap w-full">
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
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* <Select
            value={enquiryFilter}
            onValueChange={(value) => {
              setPage(1);
              setEnquiryFilter(value);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Enquiry Type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="Partnership">Partnership</SelectItem>
              <SelectItem value="trip">Trip Question</SelectItem>
              <SelectItem value="support">SUPPORT</SelectItem>
              <SelectItem value="feedback">FEEDBACK</SelectItem>
            </SelectContent>
          </Select> */}

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
            className="w-fit focus:outline-none focus:border-none"
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
            className="w-fit focus:outline-none"
          />
        </CardContent>
      </Card>
      {loading ? (
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
                  <TableHead>Subject</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {enquiries.map((enquiry) => (
                  <TableRow key={enquiry.id}>
                    <TableCell>{enquiry.full_name}</TableCell>

                    <TableCell>{enquiry.subject}</TableCell>

                    <TableCell>{enquiry.email}</TableCell>

                    <TableCell>
                      {new Date(enquiry.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={enquiry.status.toLowerCase()} />
                    </TableCell>

                    <TableCell>
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
                              View
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleCloseEnquiry(enquiry.id)}
                          >
                            <IoClose className="mr-2" />
                            Close
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDelete(enquiry.id)}
                            className="text-red-600"
                          >
                            <Inbox className="mr-2" />
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
