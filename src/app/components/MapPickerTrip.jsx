// app/components/MapPicker.js
"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, Search } from "lucide-react";

// Fix for default markers in Leaflet with Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapPicker({
  onLocationSelect,
  initialCenter = [20.5937, 78.9629],
  initialZoom = 5,
}) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const leafletMap = L.map(mapRef.current).setView(
      initialCenter,
      initialZoom,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(leafletMap);

    // Add click handler
    leafletMap.on("click", async (e) => {
      const { lat, lng } = e.latlng;

      // Remove existing marker
      if (markerRef.current) {
        leafletMap.removeLayer(markerRef.current);
      }

      // Add new marker
      const marker = L.marker([lat, lng]).addTo(leafletMap);
      markerRef.current = marker;

      // Reverse geocode to get location details
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "TripTribe Admin App", // Required by Nominatim
            },
          },
        );

        if (!response.ok) {
          throw new Error("Reverse geocoding failed");
        }

        const data = await response.json();

        onLocationSelect({
          lat,
          lng,
          name:
            data.name ||
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.display_name?.split(",")[0] ||
            "Selected Location",
          address: data.display_name,
          region:
            data.address?.state ||
            data.address?.region ||
            data.address?.county ||
            "",
          country: data.address?.country,
          type: (data.type || "city").toUpperCase(),
        });
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
        onLocationSelect({
          lat,
          lng,
          name: "Selected Location",
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          type: "LOCATION",
        });
      }
    });

    setMap(leafletMap);

    return () => {
      leafletMap.remove();
    };
  }, [initialCenter, initialZoom, onLocationSelect]);

  // Search for locations with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    const searchTimer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "TripTribe Admin App", // Required by Nominatim
            },
          },
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setSearchResults(data);

        if (data.length === 0) {
          setSearchError("No locations found");
        }
      } catch (error) {
        console.error("Search failed:", error);
        setSearchError("Failed to search locations. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    // Center map on selected location
    map.setView([lat, lon], 12);

    // Remove existing marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Add new marker
    const marker = L.marker([lat, lon]).addTo(map);
    markerRef.current = marker;

    // Get location name from result
    const locationName =
      result.name ||
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.display_name?.split(",")[0] ||
      "Selected Location";

    onLocationSelect({
      lat,
      lng: lon,
      name: locationName,
      address: result.display_name,
      region:
        result.address?.state ||
        result.address?.region ||
        result.address?.county ||
        "",
      country: result.address?.country,
      type: (result.type || "city").toUpperCase(),
    });

    setSearchResults([]);
    setSearchQuery("");
    setSearchError("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a city or place..."
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-2.5 h-5 w-5 text-blue-500 animate-spin" />
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute left-4 right-4 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectSearchResult(result)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 z-999">
                  {result.display_name.split(",")[0]}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {result.display_name}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Search Error */}
        {searchError && (
          <div className="absolute left-4 right-4 mt-1 bg-red-50 border border-red-200 rounded-lg p-3 z-10">
            <p className="text-sm text-red-600">{searchError}</p>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="flex-1 w-full" />

      {/* Instructions */}
      <div className="p-2 text-xs text-gray-500 text-center border-t bg-gray-50">
        <p>Click on the map to select a location or search above</p>
      </div>
    </div>
  );
}
