"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
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
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useToast } from "@/app/hooks/use-toast";
import AdminGuard from "@/app/components/AdminGuard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function AuditLogs() {
  const router = useRouter();

  const [logs, setLogs] = useState([]);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [entityType, setEntityType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    const token = Cookies.get("token");

    if (!token) {
      router.push("/");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (search) params.append("search", search);

      if (actionFilter !== "all") {
        params.append("action", actionFilter);
      }

      if (entityType !== "all") {
        params.append("entity_type", entityType);
      }

      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/audit?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Error",
          description: data?.error?.message || "Failed to fetch audit logs",
          variant: "destructive",
        });
      }

      if (data.success) {
        setLogs(data.result.logs || []);

        setTotalPages(data.result.pagination?.pages || 1);
        setTotalItems(data.result.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [search, actionFilter, entityType, fromDate, toDate, page, limit, router]); // limit is UI-controlled state; it's safe in deps now that we no longer setLimit from the response

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const actionBadge = (action) => {
    if (!action) return null;

    const actionType = action.toLowerCase();

    let style = "bg-gray-100 text-gray-700";

    if (actionType.includes("create")) style = "bg-green-100 text-green-700";

    if (actionType.includes("update")) style = "bg-blue-100 text-blue-700";

    if (actionType.includes("delete")) style = "bg-red-100 text-red-700";

    if (actionType.includes("login")) style = "bg-purple-100 text-purple-700";

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${style}`}>
        {action.replaceAll("_", " ")}
      </span>
    );
  };

  const entityBadge = (entity) => {
    if (!entity) return null;

    const entityType = entity.toLowerCase();

    const styles = {
      trip: "bg-orange-100 text-orange-700",
      user: "bg-indigo-100 text-indigo-700",
      operator: "bg-teal-100 text-teal-700",
      location: "bg-yellow-100 text-yellow-700",
      enquiry: "bg-pink-100 text-pink-700",
    };

    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-semibold ${
          styles[entityType] || "bg-gray-100 text-gray-700"
        }`}
      >
        {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
      </span>
    );
  };

  const PageSkeleton = () => (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-48" />

      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-40" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>

        <CardContent className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );

  if (initialLoading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="p-6 text-red-500 flex gap-2">
        <AlertCircle />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track system actions and changes
        </p>
      </div>

      {/* Filters */}

      <CardContent className="pt-2">
        <div className="flex flex-col lg:flex-row gap-3 w-full">
          {/* 🔍 Search */}
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 w-full"
              placeholder="Search actor / entity"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          {/* 🎛 Filters */}
          <div
            className="
        grid grid-cols-2 gap-3 w-full
        lg:flex lg:flex-row lg:items-center lg:w-auto
      "
          >
            <Select
              value={entityType}
              onValueChange={(value) => {
                setPage(1);
                setEntityType(value);
              }}
            >
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Entity</SelectItem>
                <SelectItem value="trip">Trip</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="enquiry">Enquiry</SelectItem>
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
              className="w-full lg:w-40"
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
              className="w-full lg:w-40"
            />
          </div>
        </div>
      </CardContent>

      {/* Loading */}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading audit logs...</p>
        </div>
      ) : (
        <Card className="hidden sm:block border shadow-sm">
          <CardHeader className="px-4 sm:px-6 pb-2">
            <CardTitle>All Logs ({totalItems})</CardTitle>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pt-2">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Old Values</TableHead>
                    <TableHead>New Values</TableHead>
                    <TableHead>Actor</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  )}

                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{actionBadge(log.action)}</TableCell>
                      {/* <TableCell>{log.action}</TableCell> */}

                      <TableCell>{entityBadge(log.entity_type)}</TableCell>

                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>

                      <TableCell
                        className="text-xs text-muted-foreground truncate max-w-50 cursor-pointer"
                        title={JSON.stringify(log.old_values)}
                      >
                        {log.old_values ? JSON.stringify(log.old_values) : "-"}
                      </TableCell>

                      <TableCell
                        className="text-xs text-muted-foreground truncate max-w-50 cursor-pointer"
                        title={JSON.stringify(log.new_values)}
                      >
                        {log.new_values ? JSON.stringify(log.new_values) : "-"}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span>{log.actor?.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {log.actor?.email}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile View: Cards */}
      {!loading && !error && logs.length > 0 && (
        <div className="sm:hidden space-y-4 pt-2">
          <div className="px-1 pb-2">
            <h2 className="text-lg font-semibold">All Logs ({totalItems})</h2>
          </div>
          {logs.map((log) => (
            <Card key={log.id} className="border shadow-sm p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col items-start gap-2">
                  {actionBadge(log.action)}
                  {entityBadge(log.entity_type)}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{log.actor?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.actor?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm mt-3 border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-muted-foreground text-xs block mb-1">
                    Old Values:
                  </span>
                  <p className="text-[10px] font-mono bg-gray-50 p-2 rounded max-h-20 overflow-y-auto break-all">
                    {log.old_values ? JSON.stringify(log.old_values) : "-"}
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-muted-foreground text-xs block mb-1">
                    New Values:
                  </span>
                  <p className="text-[10px] font-mono bg-gray-50 p-2 rounded max-h-20 overflow-y-auto break-all">
                    {log.new_values ? JSON.stringify(log.new_values) : "-"}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
    </div>
  );
}

export default AuditLogs;
