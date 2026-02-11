"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// import { Layout } from "@/app/components/website/Layout";
// import { Button } from "@/app/components/ui/button";
// import Input from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";

import {
  Search,
  MapPin,
  Star,
  Shield,
  Calendar,
  Users,
  X,
  GitCompare,
  SlidersHorizontal,
} from "lucide-react";

import { trips, tripTypes, destinations } from "@/app/data/tripData";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

export default function Trips() {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("destination") || "",
  );
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const filteredTrips = useMemo(() => {
    let result = [...trips];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (trip) =>
          trip.name.toLowerCase().includes(q) ||
          trip.destination.toLowerCase().includes(q) ||
          trip.region.toLowerCase().includes(q),
      );
    }

    if (selectedType !== "All Types") {
      result = result.filter((trip) => trip.type === selectedType);
    }

    if (selectedDifficulty !== "All") {
      result = result.filter((trip) => trip.difficulty === selectedDifficulty);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.priceFrom - b.priceFrom);
        break;
      case "price-high":
        result.sort((a, b) => b.priceFrom - a.priceFrom);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "duration":
        result.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
        break;
    }

    return result;
  }, [searchQuery, selectedType, selectedDifficulty, sortBy]);

  const toggleCompare = (id) => {
    setCompareList((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev,
    );
  };

  const compareTrips = trips.filter((t) => compareList.includes(t.id));

  return (
    <>
      <section className="section bg-background">
        <div className="container-premium flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-64">
            <FiltersContent
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              setSearchQuery={setSearchQuery}
            />
          </div>

          {/* Trips */}
          <div className="flex-1 grid md:grid-cols-2 gap-6">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="card-premium p-4">
                <Link href={`/trips/${trip.id}`}>
                  <img
                    src={trip.image}
                    alt={trip.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </Link>

                <h3 className="mt-3 font-display text-heading-sm">
                  {trip.name}
                </h3>

                <p className="text-muted-foreground">
                  ₹{trip.priceFrom.toLocaleString()}
                </p>

                <div className="flex gap-2 mt-3">
                  <Checkbox
                    checked={compareList.includes(trip.id)}
                    onCheckedChange={() => toggleCompare(trip.id)}
                  />
                  <span>Compare</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compare Dialog */}
        <Dialog open={showCompare} onOpenChange={setShowCompare}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compare Trips</DialogTitle>
            </DialogHeader>

            {compareTrips.map((trip) => (
              <div key={trip.id}>
                <p>{trip.name}</p>
              </div>
            ))}
          </DialogContent>
        </Dialog>
      </section>
    </>
  );
}

/* ---------- Filters ---------- */

function FiltersContent({
  selectedType,
  setSelectedType,
  selectedDifficulty,
  setSelectedDifficulty,
  setSearchQuery,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4>Trip Type</h4>
        {tripTypes.map((type) => (
          <button key={type} onClick={() => setSelectedType(type)}>
            {type}
          </button>
        ))}
      </div>

      <div>
        <h4>Difficulty</h4>
        {["All", "Easy", "Moderate", "Challenging"].map((diff) => (
          <button key={diff} onClick={() => setSelectedDifficulty(diff)}>
            {diff}
          </button>
        ))}
      </div>

      <div>
        <h4>Destinations</h4>
        {destinations.slice(0, 6).map((d) => (
          <button key={d.name} onClick={() => setSearchQuery(d.name)}>
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}
