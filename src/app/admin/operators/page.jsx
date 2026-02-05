"use client";

import { Button } from "@/app/adminFunctionCalls";
import AdminGuard from "@/app/components/AdminGuard";
import Dropdownadmin from "@/app/components/Dropdown-admin";
import DropdownActionsAdmin from "@/app/components/DropdownActionsAdmin";
import React, { useCallback, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import { LiaEditSolid } from "react-icons/lia";
import { LuCircleCheckBig, LuEye } from "react-icons/lu";
import { SlOptions } from "react-icons/sl";

function Page() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalOperators, setTotalOperators] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const getAllOperators = useCallback(async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await fetch(
        `https://trip-tribe-backend.onrender.com/api/v1/admin/operators?page=${page}&limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      console.log("Operators data:", data);

      if (data.success) {
        setOperators(data.result.operators || []);
        setTotalOperators(data.result.pagination?.total || 0);
        setTotalPages(data.result.pagination?.pages || 1);
        setError(null);
      } else {
        throw new Error(data.message || "No operators found");
      }
    } catch (err) {
      setError(err.message);
      setOperators([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    getAllOperators();

    const interval = setInterval(
      () => {
        getAllOperators();
      },
      2 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [getAllOperators]);

  function handleModalClose(value) {
    setShowModal(value);
    // Optionally refresh operators list after modal closes
    if (value === false) {
      getAllOperators();
    }
  }

  return (
    <AdminGuard>
      <div className="px-5 py-10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-admin-dark text-2xl font-semibold">Operators</p>
            <p className="text-admin-haze text-base">
              Manage trip operators and partnerships
            </p>
          </div>

          <div>
            <Button label="Add Operator" fnClose={setShowModal} bool="true" />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 w-1/2 border border-gray-200 rounded-lg p-2">
            <CiSearch size={17} />
            <input
              type="text"
              placeholder="Search operators..."
              className="placeholder:text-sm focus:outline-none w-full bg-admin-backseach"
            />
          </div>

          <Dropdownadmin
            options={[
              { index: 1, label: "All Status", value: "All Status" },
              { index: 2, label: "Active", value: "active" },
              { index: 3, label: "Pending", value: "pending" },
              { index: 4, label: "Suspended", value: "suspended" },
            ]}
          />
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-[2.5fr_2fr_1fr_1fr_1fr_0.5fr] gap-5 text-admin-haze bg-gray-100 px-4 py-3 text-sm font-medium tracking-wide">
            <div>Operator</div>
            <div>Contact</div>
            <div>Trips</div>
            <div>Region</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {loading && (
            <div className="py-10 text-center text-gray-500 text-sm">
              Fetching operators...
            </div>
          )}

          {!loading && operators.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              No operators found
            </div>
          )}

          {/* Data Rows */}
          {!loading &&
            operators.map((operator, index) => (
              <div
                key={operator._id || index}
                className="grid grid-cols-[2.5fr_2fr_1fr_1fr_1fr_0.5fr] gap-5
                        items-center pl-3 py-4 hover:bg-gray-50 transition border-t border-gray-100"
              >
                {/* Operator */}
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-admin-dark text-sm">
                      {operator.name || "N/A"}
                    </p>
                    <p className="text-admin-haze text-sm">
                      {operator.email || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="text-sm text-admin-haze">
                  {operator.contact_name || "N/A"}
                </div>

                {/* Trips */}
                <div className="text-admin-dark text-sm">
                  {operator.totalTrips || operator.tripsCount || 0}
                </div>

                {/* Region */}
                <div className="text-admin-haze text-sm">
                  {operator.region || "N/A"}
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium
                            ${
                              operator.status === "active"
                                ? "bg-green-100 text-green-700"
                                : operator.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                  >
                    {operator.status || "N/A"}
                  </span>
                </div>

                {/* Actions */}
                <DropdownActionsAdmin
                  labelText={<SlOptions />}
                  options={[
                    {
                      index: 1,
                      label: "View Details",
                      value: "View Details",
                      icon: <LuEye size={18} />,
                    },
                    {
                      index: 2,
                      label: "Edit",
                      value: "Edit",
                      icon: <LiaEditSolid size={18} />,
                    },
                    {
                      index: 3,
                      label:
                        operator.status === "suspended"
                          ? "Reactivate"
                          : "Suspend",
                      value:
                        operator.status === "suspended"
                          ? "Reactivate"
                          : "Suspend",
                      icon: <LuCircleCheckBig size={18} />,
                    },
                  ]}
                />
              </div>
            ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-admin-haze text-sm">
              Showing {operators.length} of {totalOperators} operators
            </p>
          </div>

          <div className="flex gap-5 items-center">
            <button
              className={`border border-gray-100 bg-gray-50 p-2 text-sm rounded-lg cursor-pointer ${page === 1 ? "text-admin-haze" : "text-admin-dark"}`}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="border border-gray-100 bg-gray-50 p-2 text-sm rounded-lg cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && <AddOperatorModal handleModalClose={handleModalClose} />}
    </AdminGuard>
  );
}

// Updated Modal for adding operators
function AddOperatorModal({ handleModalClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    contact_name: "",
    region: "",
    description: "",
    website_url: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    // Validate phone number
    if (!/^\+?[0-9\s\-\(\)]{10,}$/.test(formData.phone_number)) {
      alert("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Validate URL
    if (formData.website_url && !/^https?:\/\/.+/.test(formData.website_url)) {
      alert(
        "Please enter a valid website URL (starting with http:// or https://)",
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "https://trip-tribe-backend.onrender.com/api/v1/admin/operators",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add operator");
      }

      handleModalClose(false); // close modal on success
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
            disabled={loading}
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
                value={formData.region}
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Website URL */}
            <div>
              <label className="text-sm text-gray-600">Website URL</label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="https://wanderlustadventures.com"
              />
            </div>

            {/* Instagram URL */}
            <div>
              <label className="text-sm text-gray-600">
                Instagram URL (Optional)
              </label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url || ""}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="https://instagram.com/wanderlust"
              />
            </div>

            {/* Description - Full Width */}
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

            {/* Modal Footer */}
            <div className="col-span-2 flex justify-end gap-3 pt-6 mt-4 border-t">
              <button
                type="button"
                onClick={() => handleModalClose(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#4ED0C3] text-white rounded-lg text-sm font-medium hover:bg-[#3db8ab] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Operator"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Page;
