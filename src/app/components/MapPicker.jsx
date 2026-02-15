"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// ✅ Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ setMarker, onSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      // ✅ update marker
      setMarker([lat, lng]);

      // ✅ send back to parent
      onSelect(lat, lng);
    },
  });

  return null;
}

export default function MapPicker({ marker, setMarker, onSelect }) {
  return (
    <MapContainer
      center={marker || [20.5937, 78.9629]}
      zoom={marker ? 12 : 5}
      style={{ height: "250px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <ClickHandler setMarker={setMarker} onSelect={onSelect} />

      {marker && <Marker position={marker} />}
    </MapContainer>
  );
}
