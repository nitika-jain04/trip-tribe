import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { IoCloseSharp } from "react-icons/io5";
import Input from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { FaMapMarkedAlt, FaPlus, FaTrash } from "react-icons/fa";
import { useToast } from "@/app/hooks/use-toast";
import { Loader2 } from "lucide-react";
import useTripTypes from "@/app/hooks/use-triptypes";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const MapPicker = dynamic(() => import("@/app/components/MapPickerTrip"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
    </div>
  ),
});

function AddTripModal({ handleModalClose }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSourceMap, setShowSourceMap] = useState(false);
  const [showDestinationMap, setShowDestinationMap] = useState(false);
  const [operators, setOperators] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [error, setError] = useState("");
  const { tripTypes, loadingTripTypes, error: tripTypesError } = useTripTypes();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    start_date: "",
    end_date: "",
    difficulty: "",
    total_seats: "",
    type_id: "",
    operator_id: "",
    source: {
      name: "",
      region: "",
      latitude: "",
      longitude: "",
      type: "CITY",
      id: "",
    },
    destination: {
      name: "",
      region: "",
      latitude: "",
      longitude: "",
      type: "CITY",
      id: "",
    },
    status: "DRAFT",
    images: [],
    inclusions: [""],
    exclusions: [""],
    itinerary: [{ day: 1, activities: [""] }],
  });

  const fetchOperators = useCallback(async () => {
    setLoadingOperators(true);
    const token = Cookies.get("token");

    try {
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/operators/admin?status=ACTIVE&application_status=APPROVED`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setOperators(data.result.operators || []);
      }
    } catch (err) {
      console.error("Failed to fetch operators:", err);
    } finally {
      setLoadingOperators(false);
    }
  }, []);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("source.") || name.startsWith("destination.")) {
      const [location, field] = name.split(".");
      setFormData((p) => ({
        ...p,
        [location]: {
          ...p[location],
          [field]: value,
        },
      }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstError = document.querySelector(".text-admin-error");
      if (firstError) {
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  const handleLocationSelect = async (type, locationData) => {
    const token = Cookies.get("token");

    const payload = {
      name: locationData.name || locationData.address || "Unknown",
      region: locationData.region || "",
      latitude: String(locationData.lat ?? locationData.latitude),
      longitude: String(locationData.lng ?? locationData.longitude),
      type: "CITY",
    };

    try {
      // Try creating location
      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/locations/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      // ✅ SUCCESS CASE
      if (res.ok && data.success) {
        setFormData((prev) => ({
          ...prev,
          [type]: data.result,
        }));
      }
      // ❗ DUPLICATE CASE
      else if (data?.error?.message?.includes("already exists")) {
        // 🔁 Fetch existing location
        const searchRes = await fetch(
          `${BASE_URL}/api/${API_VERSION}/locations/admin?search=${encodeURIComponent(payload.name)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const searchData = await searchRes.json();

        if (searchRes.ok && searchData.success) {
          const existingLocation = searchData.result.locations?.find(
            (loc) => loc.name.toLowerCase() === payload.name.toLowerCase(),
          );

          if (existingLocation) {
            setFormData((prev) => ({
              ...prev,
              [type]: existingLocation,
            }));
          } else {
            // throw new Error("Location exists but not found in search");
            toast({
              title: "Error",
              description: "Location exists but not found in search",
              variant: "destructive",
            });
          }
        } else {
          // throw new Error("Failed to fetch existing location");
          toast({
            title: "Error",
            description: "Failed to fetch existing location",
            variant: "destructive",
          });
        }
      }
      // ❌ OTHER ERRORS
      else {
        toast({
          title: "Error",
          description: "Failed to create location",
          variant: "destructive",
        });
        return;
        // throw new Error(data.message || "Failed to create location");
      }

      // Close map
      if (type === "source") {
        setShowSourceMap(false);
      } else {
        setShowDestinationMap(false);
      }
    } catch (err) {
      console.error("Location handling failed:", err);
      setError(err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    const token = Cookies.get("token");
    setUploadingImage(true);
    setError("");

    const formDataObj = new FormData();
    formDataObj.append("image", file);

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/uploads/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormData((p) => ({
          ...p,
          images: [...p.images, data.result.url],
        }));
      } else {
        // throw new Error(data.message || "Failed to upload image");
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index),
    }));
  };

  const handleListChange = (key, index, value) => {
    const arr = [...formData[key]];
    arr[index] = value;
    setFormData((p) => ({ ...p, [key]: arr }));
  };

  const addListItem = (key) =>
    setFormData((p) => ({ ...p, [key]: [...p[key], ""] }));

  const removeListItem = (key, index) => {
    if (formData[key].length === 1) return;
    const arr = formData[key].filter((_, i) => i !== index);
    setFormData((p) => ({ ...p, [key]: arr }));
  };

  const addDay = () =>
    setFormData((p) => ({
      ...p,
      itinerary: [
        ...p.itinerary,
        { day: p.itinerary.length + 1, activities: [""] },
      ],
    }));

  const removeDay = (dayIndex) => {
    if (formData.itinerary.length === 1) return;
    const updatedItinerary = formData.itinerary.filter(
      (_, i) => i !== dayIndex,
    );
    updatedItinerary.forEach((day, index) => {
      day.day = index + 1;
    });
    setFormData((p) => ({ ...p, itinerary: updatedItinerary }));
  };

  const addActivity = (dayIndex) => {
    const it = [...formData.itinerary];
    it[dayIndex].activities.push("");
    setFormData((p) => ({ ...p, itinerary: it }));
  };

  const removeActivity = (dayIndex, activityIndex) => {
    if (formData.itinerary[dayIndex].activities.length === 1) return;
    const it = [...formData.itinerary];
    it[dayIndex].activities = it[dayIndex].activities.filter(
      (_, i) => i !== activityIndex,
    );
    setFormData((p) => ({ ...p, itinerary: it }));
  };

  const handleActivity = (d, a, value) => {
    const it = [...formData.itinerary];
    it[d].activities[a] = value;
    setFormData((p) => ({ ...p, itinerary: it }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.start_date || !formData.end_date) {
      toast({
        title: "Error",
        description: "Please select both start and end date",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    if (!formData.source.id) {
      toast({
        title: "Error",
        description: "Please select source location from map",
        variant: "destructive",
      });
      return;
    }

    if (!formData.destination.id) {
      toast({
        title: "Error",
        description: "Please select destination location from map",
        variant: "destructive",
      });
      return;
    }

    if (!formData.operator_id) {
      toast({
        title: "Error",
        description: "Please select operator",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Trip name required",
        variant: "destructive",
      });
      return;
    }

    if (formData.images.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    if (!formData.difficulty) {
      toast({
        title: "Error",
        description: "Please select difficulty",
        variant: "destructive",
      });
      return;
    }

    if (!formData.type_id) {
      toast({
        title: "Error",
        description: "Please select trip type",
        variant: "destructive",
      });
      return;
    }

    const token = Cookies.get("token");
    setLoading(true);
    setError("");

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      start_date: formData.start_date,
      end_date: formData.end_date,
      difficulty: formData.difficulty,
      total_seats: Number(formData.total_seats),
      operator_id: formData.operator_id,
      type_id: formData.type_id,
      source_id: formData.source.id,
      destination_id: formData.destination.id,
      status: formData.status,
      images: formData.images.filter(Boolean),
      inclusions: formData.inclusions.filter((item) => item.trim() !== ""),
      exclusions: formData.exclusions.filter((item) => item.trim() !== ""),
      itinerary: formData.itinerary
        .map((day) => ({
          day: day.day,
          activities: day.activities.filter((act) => act.trim() !== ""),
        }))
        .filter((day) => day.activities.length > 0),
    };

    //console.log("trip body", payload);

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/trips/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          title: "Error",
          description: data?.error?.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Trip",
        description: "Trip created successfully!",
        variant: "success",
      });
      handleModalClose(false);
    } catch (err) {
      console.error("Create failed:", err);
      setError(err.message);
      scrollToFirstError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-[90vw] max-w-6xl h-[90vh] rounded-xl shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#14181F]">
            Create New Trip
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleModalClose(false)}
            disabled={loading || uploadingImage}
          >
            <IoCloseSharp size={20} />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-admin-error text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Trip Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Himalayan Base Camp Trek"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Price (₹) *
                  </label>
                  <Input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="45000"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Total Seats *
                  </label>
                  <Input
                    name="total_seats"
                    type="number"
                    value={formData.total_seats}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Difficulty *
                  </label>
                  {/* <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#4ED0C3]"
                  >
                    <option value="">Select Difficulty</option>
                    <option value="EASY">Easy</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HARD">Hard</option>
                  </select> */}
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      handleChange({ target: { name: "difficulty", value } })
                    }
                  >
                    <SelectTrigger className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#4ED0C3]">
                      <SelectValue placeholder="Select Difficulty" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MODERATE">Moderate</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Start Date *
                  </label>
                  <Input
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    End Date *
                  </label>
                  <Input
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Operator */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Operator</h3>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Operator *
                </label>

                <Select
                  value={formData.operator_id?.toString() || ""}
                  onValueChange={(value) =>
                    handleChange({ target: { name: "operator_id", value } })
                  }
                >
                  <SelectTrigger className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#4ED0C3]">
                    <SelectValue placeholder="Select Operator" />
                  </SelectTrigger>

                  <SelectContent>
                    {operators.map((o) => (
                      <SelectItem key={o.id} value={o.id.toString()}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Trip Type *
                </label>
                <Select
                  value={formData.type_id?.toString() || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      type_id: value,
                    }))
                  }
                  disabled={loadingTripTypes}
                >
                  <SelectTrigger className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#4ED0C3]">
                    <SelectValue
                      placeholder={
                        loadingTripTypes ? "Loading..." : "Select Trip Type"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {loadingTripTypes ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      tripTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Source Location */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Source Location *</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      {formData.source.name ? (
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Name:</span>{" "}
                            {formData.source.name}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Region:</span>{" "}
                            {formData.source.region || "N/A"}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Coordinates:</span>{" "}
                            {formData.source.latitude},{" "}
                            {formData.source.longitude}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No location selected
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSourceMap(true)}
                    >
                      <FaMapMarkedAlt className="h-4 w-4 mr-2" />
                      {formData.source.name
                        ? "Change Location"
                        : "Select from Map"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Destination Location */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Destination Location *</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      {formData.destination.name ? (
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Name:</span>{" "}
                            {formData.destination.name}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Region:</span>{" "}
                            {formData.destination.region || "N/A"}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Coordinates:</span>{" "}
                            {formData.destination.latitude},{" "}
                            {formData.destination.longitude}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No location selected
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDestinationMap(true)}
                    >
                      <FaMapMarkedAlt className="h-4 w-4 mr-2" />
                      {formData.destination.name
                        ? "Change Location"
                        : "Select from Map"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Map Modals */}
            {showSourceMap && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                <div className="bg-white w-[90vw] max-w-4xl h-[80vh] rounded-lg flex flex-col">
                  <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">
                      Select Source Location
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSourceMap(false)}
                    >
                      <IoCloseSharp size={20} />
                    </Button>
                  </div>
                  <div className="flex-1 p-4">
                    <MapPicker
                      onLocationSelect={(location) =>
                        handleLocationSelect("source", location)
                      }
                      initialCenter={[20.5937, 78.9629]}
                      initialZoom={5}
                    />
                  </div>
                </div>
              </div>
            )}

            {showDestinationMap && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                <div className="bg-white w-[90vw] max-w-4xl h-[80vh] rounded-lg flex flex-col">
                  <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">
                      Select Destination Location
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDestinationMap(false)}
                    >
                      <IoCloseSharp size={20} />
                    </Button>
                  </div>
                  <div className="flex-1 p-4">
                    <MapPicker
                      onLocationSelect={(location) =>
                        handleLocationSelect("destination", location)
                      }
                      initialCenter={[20.5937, 78.9629]}
                      initialZoom={5}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#4ED0C3]"
                placeholder="10-day trek to Everest Base Camp..."
              />
            </section>

            {/* Images */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Images *</h3>
                <div>
                  <Input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("imageUpload")?.click()
                    }
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaPlus className="h-4 w-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Trip ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <FaTrash size={10} />
                    </Button>
                  </div>
                ))}
                {formData.images.length === 0 && (
                  <div className="col-span-6 text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    No images uploaded yet
                  </div>
                )}
              </div>
            </section>

            {/* Inclusions */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Inclusions *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem("inclusions")}
                >
                  <FaPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.inclusions.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      required
                      onChange={(e) =>
                        handleListChange("inclusions", index, e.target.value)
                      }
                      placeholder={`Inclusion ${index + 1}`}
                    />
                    {formData.inclusions.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeListItem("inclusions", index)}
                      >
                        <FaTrash size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Exclusions */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Exclusions *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem("exclusions")}
                >
                  <FaPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.exclusions.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      required
                      onChange={(e) =>
                        handleListChange("exclusions", index, e.target.value)
                      }
                      placeholder={`Exclusion ${index + 1}`}
                    />
                    {formData.exclusions.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeListItem("exclusions", index)}
                      >
                        <FaTrash size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Itinerary</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDay}
                >
                  <FaPlus className="h-4 w-4 mr-2" />
                  Add Day
                </Button>
              </div>

              {formData.itinerary.map((day, dayIndex) => (
                <Card key={dayIndex}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Day {day.day}</h4>
                      {formData.itinerary.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeDay(dayIndex)}
                        >
                          <FaTrash size={14} className="mr-2" />
                          Remove Day
                        </Button>
                      )}
                    </div>

                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex gap-2">
                        <Input
                          value={activity}
                          required
                          onChange={(e) =>
                            handleActivity(dayIndex, actIndex, e.target.value)
                          }
                          placeholder={`Activity ${actIndex + 1}`}
                        />
                        {day.activities.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeActivity(dayIndex, actIndex)}
                          >
                            <FaTrash size={14} />
                          </Button>
                        )}
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addActivity(dayIndex)}
                    >
                      <FaPlus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t">
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
                  ? "Creating..."
                  : uploadingImage
                    ? "Uploading..."
                    : "Create Trip"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTripModal;
