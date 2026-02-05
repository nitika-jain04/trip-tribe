"use client";

import AdminGuard from "@/app/components/AdminGuard";
import React, { useCallback, useEffect, useState } from "react";
import { SlLocationPin } from "react-icons/sl";
import { LuTag } from "react-icons/lu";
import { RiDeleteBin6Line, RiDeleteBinLine } from "react-icons/ri";
import { LiaEditSolid } from "react-icons/lia";
import { Button } from "@/app/adminFunctionCalls";
import { MdOutlineDeleteOutline } from "react-icons/md";
import Image from "next/image";

function Page() {
  const [activeTab, setActiveTab] = useState("destinations");

  return (
    <AdminGuard>
      <div className="px-5 py-10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#14181F] text-2xl font-semibold">Settings</p>
            <p className="text-[#65758b] text-base">
              Manage platform configurations and content
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center bg-gray-100 w-fit p-2 rounded-lg">
          <button
            className={`flex items-center gap-1 text-sm text-black/80 px-3 py-2 rounded-lg ${activeTab === "destinations" ? "bg-white" : ""}`}
            onClick={() => setActiveTab("destinations")}
          >
            <SlLocationPin size={18} />
            <p>Destinations</p>
          </button>
          <button
            className={`flex items-center gap-1 text-sm text-black/80 px-3 py-2 rounded-lg ${activeTab === "categories" ? "bg-white" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            <LuTag size={18} />
            <p>Categories</p>
          </button>
        </div>

        <div>
          {activeTab === "destinations" ? <Destinations /> : <Categories />}
        </div>
      </div>
    </AdminGuard>
  );
}
function Destinations() {
  const [trips, setTrips] = useState([]);

  const getAllTrips = useCallback(async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://trip-tribe-backend.onrender.com/api/v1/admin/trips`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      console.log("data", data);

      if (res.ok) {
        setTrips(data.result.trips);
      }
    } catch (err) {
      console.error(err.message);
    }
  }, []); // Add page as dependency

  useEffect(() => {
    getAllTrips();

    const interval = setInterval(
      () => {
        getAllTrips();
      },
      2 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [getAllTrips]); // Depends on getAllTrips which depends on page

  function handleClose() {}
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-[#65758b] text-base">
          Manage travel destinations displayed on the platform
        </p>

        <Button label="Add Destination" fnClose={handleClose} />
      </div>

      <div className="flex items-center gap-5 flex-wrap w-fit rounded-lg bg-white">
        {trips.map((trip) => {
          return (
            <div
              key={trip.id}
              className="p-4 flex gap-20 items-start hover:shadow-xl hover:-translate-y-0.5 border border-gray-200 hover:transform hover:duration-300 hover:ease-out hover:transform-3d rounded-lg"
            >
              <div className="flex items-center gap-5">
                <div>
                  <Image
                    src="/ladakh.jpg"
                    alt="destination"
                    height={150}
                    width={55}
                    className="rounded-sm"
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <p className="text-admin-dark text-base">
                    {trip.destination}
                  </p>
                  <p className="text-admin-haze text-sm">{trip.region}</p>
                  <p className="text-sm text-admin-aqua">32 trips</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <LiaEditSolid
                  size={20}
                  className="cursor-pointer hover:text-admin-success hover:bg-admin-background"
                />
                <RiDeleteBinLine
                  size={20}
                  className="text-admin-error cursor-pointer hover:text-admin-success hover:bg-admin-background"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Categories() {
  const categories = [
    { id: 1, category: "Treks", trips: 32, color: "green" },
    { id: 2, category: "Backpacking", trips: 20, color: "pink" },
    { id: 3, category: "Workstations", trips: 8, color: "blue" },
    { id: 4, category: "Weekend Trips", trips: 12, color: "teal" },
    { id: 5, category: "Wellness", trips: 3, color: "yellow" },
  ];

  const colorMap = {
    green: "bg-green-100 text-green-600",
    pink: "bg-pink-100 text-pink-600",
    blue: "bg-blue-100 text-blue-600",
    teal: "bg-teal-100 text-teal-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[#65758b] text-base">
          Manage trip categories and tags
        </p>

        <button className="bg-[#4ED0C3] text-base px-4 py-2 rounded-xl">
          + Add Category
        </button>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden mt-5">
        {/* Header Row */}
        <div className="grid grid-cols-[2.5fr_2fr_1fr] gap-2 text-[#65758b] bg-gray-100 px-3 py-4 text-sm font-medium tracking-wide">
          <div>Category</div>
          <div>Trips</div>
          <div>Actions</div>
        </div>

        {categories.map((category, index) => (
          <div
            key={index}
            className="grid grid-cols-[2.5fr_2fr_1fr] gap-5
                        items-center px-3 py-4 hover:bg-gray-50 transition"
          >
            {/* Category */}
            <div
              className={`text-sm tracking-wide w-fit px-2 py-0.5 rounded-lg ${
                colorMap[category.color]
              }`}
            >
              {category.category}
            </div>

            {/* Trips */}
            <div>{category.trips}</div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <LiaEditSolid
                size={20}
                className="cursor-pointer hover:text-admin-success hover:bg-admin-background"
              />
              <RiDeleteBinLine
                size={20}
                className="text-admin-error cursor-pointer hover:text-admin-success hover:bg-admin-background"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Page;
