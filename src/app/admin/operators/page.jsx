"use client";

import AdminGuard from "@/app/components/AdminGuard";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Search,
  Loader2,
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

// Modal for adding operators

function OperatorsPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  const [operators, setOperators] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
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
  const [sourceFilter, setSourceFilter] = useState("APPLICATION");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [searchQuery, setSearchQuery] = useState("");

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

      // ✅ ALWAYS send pagination
      params.append("page", String(page));
      params.append("limit", String(limit));

      // ✅ ONLY send when filtered
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter.toUpperCase());
      }

      if (sourceFilter && sourceFilter !== "all") {
        params.append("source", sourceFilter);
      }

      if (sortBy) {
        params.append("sortBy", sortBy);
      }

      if (sortOrder) {
        params.append("sortOrder", sortOrder);
      }

      if (searchQuery && searchQuery.trim() !== "") {
        params.append("search", searchQuery.trim());
      }

      const url = `${BASE_URL}/api/${API_VERSION}/operators/admin?${params.toString()}`;

      console.log("Final URL:", url);

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
      setFilteredOperators(operatorsArray);

      // ✅ pagination from backend
      setTotalOperators(pagination.total || 0);
      setTotalPages(pagination.pages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setOperators([]);
      setFilteredOperators([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, sourceFilter, sortBy, sortOrder, searchQuery]);

  useEffect(() => {
    getOperators();
    const interval = setInterval(() => getOperators(), 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getOperators]);

  const handleAddModalClose = (value) => {
    setShowAddModal(value);
    if (!value) getOperators();
  };

  const handleViewDetails = (operator) =>
    router.push(`/admin/operators/${operator.id}`);
  const handleEditOperator = (operator) =>
    router.push(`/admin/operators/edit/${operator.id}`);

  return (
    <AdminGuard>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Operators</h1>
            <p className="text-muted-foreground mt-1">
              Manage trip operators on the platform
            </p>
          </div>
          <Button
            // label="Add Operator"
            onClick={() => setShowAddModal(true)}
          >
            Add Operator
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search operators..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
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

              <Select value={regionFilter} onValueChange={setRegionFilter}>
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
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Operators Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Operators ({filteredOperators.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-6 p-6">
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">
                      Loading enquiries...
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Please wait while we fetch your data
                    </p>
                  </div>
                </CardContent>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center py-16 text-red-500">
                <p>{error}</p>
                <Button onClick={getOperators}>Retry</Button>
              </div>
            ) : filteredOperators.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-500">
                <p>No operators found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operator</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-center">Trips</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperators.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden">
                            <Image
                              src={op.logo_url || "/vercel.svg"}
                              alt={op.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div>
                            <p className="font-medium">{op.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {op.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <p className="text-sm">{op.contact_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {op.phone_number}
                        </p>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {op.regions}
                      </TableCell>

                      <TableCell className="text-center">
                        {op.total_trips || 0}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={op.status?.toLowerCase()} />
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
                              <Button
                                variant="ghost"
                                onClick={() => handleViewDetails(op)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Button
                                variant="ghost"
                                onClick={() => handleEditOperator(op)}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>

        {/* Add Operator Modal */}
        {showAddModal && (
          <AddOperatorModal handleModalClose={handleAddModalClose} />
        )}
      </div>
    </AdminGuard>
  );
}

// AddOperatorModal component (keep your existing AddOperatorModal code here)
function AddOperatorModal({ handleModalClose }) {
  // ... (your existing AddOperatorModal code)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    contact_name: "",
    regions: "",
    description: "",
    website: "",
    logo_url: "",
    rating: 4.5,
    status: "inactive",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = Cookies.get("token");

    // Validate phone number - accept Indian format
    if (!/^(\+91|91)?[6-9]\d{9}$/.test(formData.phone_number)) {
      alert(
        "Please enter a valid Indian phone number (e.g., 919876543210 or +919876543210)",
      );
      setLoading(false);
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Validate website URL if provided
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      alert(
        "Please enter a valid website URL (starting with http:// or https://)",
      );
      setLoading(false);
      return;
    }

    const requestBody = {
      name: formData.name,
      description: formData.description,
      contact_name: formData.contact_name,
      email: formData.email,
      phone_number: formData.phone_number,
      regions: formData.regions,
      website: formData.website || undefined,
      logo_url: formData.logo_url || undefined,
      rating: parseFloat(formData.rating) || 4.5,
      status: formData.status,
    };

    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key],
    );

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

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
      alert("Operator added successfully!");
    } catch (err) {
      console.error("Error adding operator:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-[70vw] h-[85vh] rounded-xl shadow-lg flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#14181F]">Add Operator</h2>
          <button
            onClick={() => handleModalClose(false)}
            className="text-gray-500 hover:text-black text-xl"
            disabled={loading || uploadingImage}
          >
            <IoCloseSharp />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
            {/* Logo Upload */}
            <div className="col-span-2">
              <label className="text-sm text-gray-600 font-medium">
                Upload Logo
              </label>
              <div className="flex items-start gap-4 mt-1">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-[#4ED0C3]/10 file:text-[#4ED0C3] hover:file:bg-[#4ED0C3]/20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a logo image (JPG, PNG, SVG)
                  </p>
                </div>
                {formData.logo_url && (
                  <div className="flex flex-col items-center">
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
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Wanderlust Adventures"
              />
            </div>

            {/* Contact Person Name */}
            <div>
              <label className="text-sm text-gray-600">
                Contact Person Name *
              </label>
              <input
                type="text"
                name="contact_name"
                required
                value={formData.contact_name}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Priya Sharma"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="hello@wanderlust.com"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-sm text-gray-600">Phone Number *</label>
              <input
                type="tel"
                name="phone_number"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="+917007755306"
              />
            </div>

            {/* Region */}
            <div>
              <label className="text-sm text-gray-600">Region *</label>
              <input
                type="text"
                name="region"
                required
                value={formData.regions}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="North India"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm text-gray-600">Status *</label>
              <select
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Website URL */}
            <div>
              <label className="text-sm text-gray-600">Website URL</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="https://wanderlustadventures.com"
              />
            </div>

            {/* Rating */}
            {/* <div>
              <label className="text-sm text-gray-600">Rating (0-5)</label>
              <input
                type="number"
                name="rating"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="4.5"
              />
            </div> */}

            {/* Description */}
            <div className="col-span-2">
              <label className="text-sm text-gray-600">Description *</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Describe the operator's services, specialties, and experience..."
              ></textarea>
            </div>

            <div className="col-span-2 flex justify-end gap-3 pt-6 mt-4 border-t">
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
