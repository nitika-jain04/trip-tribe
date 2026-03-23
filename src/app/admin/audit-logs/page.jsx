// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { Search, Loader2, AlertCircle } from "lucide-react";
// import { Button } from "@/app/components/ui/button";
// import Input from "@/app/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/app/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/app/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/app/components/ui/select";
// import Cookies from "js-cookie";
// import { useRouter } from "next/navigation";
// import { Skeleton } from "@/app/components/ui/skeleton";

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

// function AuditLogs() {
//   const router = useRouter();

//   const [logs, setLogs] = useState([]);

//   const [search, setSearch] = useState("");
//   const [actionFilter, setActionFilter] = useState("all");

//   const [initialLoading, setInitialLoading] = useState(true);
//   const [loading, setLoading] = useState(true);

//   const [error, setError] = useState(null);

//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);

//   const [totalPages, setTotalPages] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);

//   const [entityType, setEntityType] = useState("all");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const fetchLogs = useCallback(async () => {
//     const token = Cookies.get("token");

//     if (!token) {
//       router.push("/");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const params = new URLSearchParams();

//       if (search) params.append("search", search);

//       if (actionFilter !== "all") {
//         params.append("action", actionFilter);
//       }

//       if (entityType !== "all") {
//         params.append("entity_type", entityType);
//       }

//       if (fromDate) params.append("from_date", fromDate);
//       if (toDate) params.append("to_date", toDate);

//       params.append("page", page.toString());
//       params.append("limit", limit.toString());

//       if (search) params.append("search", search);

//       if (actionFilter !== "all") {
//         params.append("action", actionFilter);
//       }

//       params.append("page", page.toString());
//       params.append("limit", limit.toString());

//       const res = await fetch(
//         `${BASE_URL}/api/${API_VERSION}/audit?${params.toString()}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (!res.ok) throw new Error("Failed to fetch audit logs");

//       const data = await res.json();

//       if (data.success) {
//         setLogs(data.result.logs || []);

//         setTotalPages(data.result.pagination?.pages || 1);
//         setTotalItems(data.result.pagination?.total || 0);
//         setPage(data.result.pagination?.page || 1);
//         setLimit(data.result.pagination?.limit || 10);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//       setInitialLoading(false);
//     }
//   }, [search, actionFilter, entityType, fromDate, toDate, page, limit, router]);

//   useEffect(() => {
//     fetchLogs();
//   }, [fetchLogs]);

//   const actionBadge = (action) => {
//     if (!action) return null;

//     const actionType = action.toLowerCase();

//     let style = "bg-gray-100 text-gray-700";

//     if (actionType.includes("create")) style = "bg-green-100 text-green-700";

//     if (actionType.includes("update")) style = "bg-blue-100 text-blue-700";

//     if (actionType.includes("delete")) style = "bg-red-100 text-red-700";

//     if (actionType.includes("login")) style = "bg-purple-100 text-purple-700";

//     return (
//       <span className={`px-2 py-1 rounded-md text-xs font-semibold ${style}`}>
//         {action.replaceAll("_", " ")}
//       </span>
//     );
//   };

//   const entityBadge = (entity) => {
//     if (!entity) return null;

//     const entityType = entity.toLowerCase();

//     const styles = {
//       trip: "bg-orange-100 text-orange-700",
//       user: "bg-indigo-100 text-indigo-700",
//       operator: "bg-teal-100 text-teal-700",
//       location: "bg-yellow-100 text-yellow-700",
//       enquiry: "bg-pink-100 text-pink-700",
//     };

//     return (
//       <span
//         className={`px-2 py-1 rounded-md text-xs font-semibold ${
//           styles[entityType] || "bg-gray-100 text-gray-700"
//         }`}
//       >
//         {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
//       </span>
//     );
//   };

//   const PageSkeleton = () => (
//     <div className="space-y-6 p-6">
//       <Skeleton className="h-8 w-48" />

//       <div className="flex gap-2 flex-wrap">
//         <Skeleton className="h-10 w-80" />
//         <Skeleton className="h-10 w-40" />
//       </div>

//       <Card>
//         <CardHeader>
//           <Skeleton className="h-6 w-40" />
//         </CardHeader>

//         <CardContent className="space-y-4">
//           {Array.from({ length: 10 }).map((_, i) => (
//             <Skeleton key={i} className="h-6 w-full" />
//           ))}
//         </CardContent>
//       </Card>
//     </div>
//   );

//   if (initialLoading) return <PageSkeleton />;

//   if (error) {
//     return (
//       <div className="p-6 text-red-500 flex gap-2">
//         <AlertCircle />
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-6">
//       {/* Header */}

//       <div>
//         <h1 className="text-3xl font-bold">Audit Logs</h1>
//         <p className="text-muted-foreground">
//           Track system actions and changes
//         </p>
//       </div>

//       {/* Filters */}

//       <CardContent className="pt-2 flex gap-2 flex-wrap w-full">
//         <div className="relative w-80">
//           <Search className="absolute left-3 top-3 h-4 w-4" />
//           <Input
//             className="pl-10"
//             placeholder="Search actor / entity"
//             value={search}
//             onChange={(e) => {
//               setPage(1);
//               setSearch(e.target.value);
//             }}
//           />
//         </div>

//         {/* <Select
//           value={actionFilter}
//           onValueChange={(value) => {
//             setPage(1);
//             setActionFilter(value);
//           }}
//         >
//           <SelectTrigger className="w-40">
//             <SelectValue placeholder="Action" />
//           </SelectTrigger>

//           <SelectContent>
//             <SelectItem value="all">Action</SelectItem>
//             <SelectItem value="CREATE">Create</SelectItem>
//             <SelectItem value="UPDATE">Update</SelectItem>
//             <SelectItem value="LOCATION_DELETE">Delete</SelectItem>
//             <SelectItem value="USER_LOGIN">Login</SelectItem>
//           </SelectContent>
//         </Select> */}

//         <Select
//           value={entityType}
//           onValueChange={(value) => {
//             setPage(1);
//             setEntityType(value);
//           }}
//         >
//           <SelectTrigger className="w-40">
//             <SelectValue placeholder="Entity" />
//           </SelectTrigger>

//           <SelectContent>
//             <SelectItem value="all">Entity</SelectItem>
//             <SelectItem value="trip">Trip</SelectItem>
//             <SelectItem value="user">User</SelectItem>
//             <SelectItem value="operator">Operator</SelectItem>
//             <SelectItem value="location">Location</SelectItem>
//             <SelectItem value="enquiry">Enquiry</SelectItem>
//           </SelectContent>
//         </Select>

//         {/* <Input
//           type="date"
//           className="w-44"
//           value={fromDate}
//           onChange={(e) => {
//             setPage(1);
//             setFromDate(e.target.value);
//           }}
//         /> */}
//         <Input
//           type={fromDate ? "date" : "text"}
//           placeholder="Start Date"
//           value={fromDate}
//           onFocus={(e) => (e.target.type = "date")}
//           onBlur={(e) => {
//             if (!e.target.value) e.target.type = "text";
//           }}
//           onChange={(e) => {
//             setPage(1);
//             setFromDate(e.target.value);
//           }}
//           className="w-44 focus:outline-none focus:border-none placeholder:text-black"
//         />

//         {/* <Input
//           type="date"
//           className="w-44"
//           value={toDate}
//           onChange={(e) => {
//             setPage(1);
//             setToDate(e.target.value);
//           }}
//         /> */}

//         <Input
//           type={toDate ? "date" : "text"}
//           placeholder="End Date"
//           value={toDate}
//           onFocus={(e) => (e.target.type = "date")}
//           onBlur={(e) => {
//             if (!e.target.value) e.target.type = "text";
//           }}
//           onChange={(e) => {
//             setPage(1);
//             setFromDate(e.target.value);
//           }}
//           className="w-44 focus:outline-none focus:border-none placeholder:text-black"
//         />
//       </CardContent>

//       {/* Loading */}

//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
//           <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
//           <p className="text-gray-600 font-medium">Loading audit logs...</p>
//         </div>
//       ) : (
//         <Card>
//           <CardHeader>
//             <CardTitle>All Logs ({totalItems})</CardTitle>
//           </CardHeader>

//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Action</TableHead>
//                   <TableHead>Entity</TableHead>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Old Values</TableHead>
//                   <TableHead>New Values</TableHead>
//                   <TableHead>Actor</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {logs.length === 0 && (
//                   <TableRow>
//                     <TableCell
//                       colSpan={5}
//                       className="text-center py-10 text-muted-foreground"
//                     >
//                       No audit logs found
//                     </TableCell>
//                   </TableRow>
//                 )}

//                 {logs.map((log) => (
//                   <TableRow key={log.id}>
//                     <TableCell>{actionBadge(log.action)}</TableCell>
//                     {/* <TableCell>{log.action}</TableCell> */}

//                     <TableCell>{entityBadge(log.entity_type)}</TableCell>

//                     <TableCell>
//                       {new Date(log.createdAt).toLocaleString()}
//                     </TableCell>

//                     <TableCell
//                       className="text-xs text-muted-foreground truncate max-w-50 cursor-pointer"
//                       title={JSON.stringify(log.old_values)}
//                     >
//                       {log.old_values ? JSON.stringify(log.old_values) : "-"}
//                     </TableCell>

//                     <TableCell
//                       className="text-xs text-muted-foreground truncate max-w-50 cursor-pointer"
//                       title={JSON.stringify(log.new_values)}
//                     >
//                       {log.new_values ? JSON.stringify(log.new_values) : "-"}
//                     </TableCell>

//                     <TableCell>
//                       <div className="flex flex-col">
//                         <span>{log.actor?.name}</span>
//                         <span className="text-sm text-muted-foreground">
//                           {log.actor?.email}
//                         </span>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       )}

//       {/* Pagination */}

//       <div className="flex justify-between items-center mt-4">
//         <span className="text-sm text-muted-foreground">
//           Showing {(page - 1) * limit + 1} to{" "}
//           {Math.min(page * limit, totalItems)} of {totalItems}
//         </span>

//         <span className="px-3 py-1 text-center text-sm">
//           Page {page} of {totalPages}
//         </span>

//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             disabled={page === 1}
//             onClick={() => setPage(page - 1)}
//           >
//             Previous
//           </Button>

//           <Button
//             variant="outline"
//             disabled={page === totalPages}
//             onClick={() => setPage(page + 1)}
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AuditLogs;

// Further enhanced responsiveness & UX polish
// - Better filter wrapping + spacing
// - Sticky header & pagination (mobile-friendly)
// - Improved card density & readability
// - Better truncation + expandable JSON
// - Limit selector added
// - Subtle hover + touch improvements

"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, AlertCircle, ChevronDown } from "lucide-react";
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function AuditLogs() {
  const router = useRouter();

  const [logs, setLogs] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) return router.push("/");

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (entityType !== "all") params.append("entity_type", entityType);
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/audit?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!res.ok) throw new Error("Failed to fetch audit logs");

      const data = await res.json();

      if (data.success) {
        setLogs(data.result.logs || []);
        setTotalPages(data.result.pagination?.pages || 1);
        setTotalItems(data.result.pagination?.total || 0);
        setPage(data.result.pagination?.page || 1);
        setLimit(data.result.pagination?.limit || 10);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [debouncedSearch, entityType, fromDate, toDate, page, limit, router]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const badge = (text, type) => {
    const map = {
      create: "bg-green-100 text-green-700",
      update: "bg-blue-100 text-blue-700",
      delete: "bg-red-100 text-red-700",
      login: "bg-purple-100 text-purple-700",
    };

    const style = Object.keys(map).find((k) => text?.toLowerCase().includes(k));

    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-semibold ${map[style] || "bg-gray-100"}`}
      >
        {text?.replaceAll("_", " ")}
      </span>
    );
  };

  if (initialLoading) return <div className="p-4">Loading...</div>;

  if (error)
    return (
      <div className="p-4 text-red-500 flex gap-2">
        <AlertCircle /> {error}
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 md:px-6 py-3 space-y-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold">Audit Logs</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Track system actions and changes
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-3 h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <Select
            value={entityType}
            onValueChange={(v) => {
              setPage(1);
              setEntityType(v);
            }}
          >
            <SelectTrigger className="w-full sm:w-36">
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
            type="date"
            value={fromDate}
            onChange={(e) => {
              setPage(1);
              setFromDate(e.target.value);
            }}
            className="w-full sm:w-40"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => {
              setPage(1);
              setToDate(e.target.value);
            }}
            className="w-full sm:w-40"
          />

          <Select
            value={String(limit)}
            onValueChange={(v) => {
              setPage(1);
              setLimit(Number(v));
            }}
          >
            <SelectTrigger className="w-full sm:w-28">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block md:hidden space-y-3">
              {logs.map((log) => (
                <Card key={log.id} className="p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    {badge(log.action)}
                    {badge(log.entity_type)}
                  </div>

                  <div className="text-xs text-muted-foreground mb-2">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>

                  <div className="text-xs">
                    <button
                      onClick={() =>
                        setExpanded(expanded === log.id ? null : log.id)
                      }
                      className="flex items-center gap-1"
                    >
                      Details <ChevronDown size={14} />
                    </button>

                    {expanded === log.id && (
                      <div className="mt-2 space-y-1 break-words">
                        <div>
                          <b>Old:</b> {JSON.stringify(log.old_values)}
                        </div>
                        <div>
                          <b>New:</b> {JSON.stringify(log.new_values)}
                        </div>
                        <div className="pt-1">
                          <b>{log.actor?.name}</b>
                          <div className="text-muted-foreground">
                            {log.actor?.email}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Old</TableHead>
                    <TableHead>New</TableHead>
                    <TableHead>Actor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell>{badge(log.action)}</TableCell>
                      <TableCell>{badge(log.entity_type)}</TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="truncate max-w-[120px] text-xs">
                        {JSON.stringify(log.old_values)}
                      </TableCell>
                      <TableCell className="truncate max-w-[120px] text-xs">
                        {JSON.stringify(log.new_values)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {log.actor?.name}
                          <div className="text-xs text-muted-foreground">
                            {log.actor?.email}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* Sticky Pagination */}
      <div className="sticky bottom-0 bg-white border-t px-4 md:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-2">
        <span className="text-xs md:text-sm">
          {(page - 1) * limit + 1} - {Math.min(page * limit, totalItems)} of{" "}
          {totalItems}
        </span>

        <div className="flex gap-2">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <Button
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
