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
  const [fieldErrors, setFieldErrors] = useState({});
  const { tripTypes, loadingTripTypes } = useTripTypes();
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
        [location]: { ...p[location], [field]: value },
      }));
      setFieldErrors((p) => ({ ...p, [location]: "" }));
      if (error) setError("");
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
      setFieldErrors((p) => ({ ...p, [name]: "" }));
      if (error) setError("");
    }
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

      if (res.ok && data.success) {
        setFormData((prev) => ({ ...prev, [type]: data.result }));
        setFieldErrors((p) => ({ ...p, [type]: "" }));
      } else if (data?.error?.message?.includes("already exists")) {
        const searchRes = await fetch(
          `${BASE_URL}/api/${API_VERSION}/locations/admin?search=${encodeURIComponent(payload.name)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const searchData = await searchRes.json();
        const existing = searchData.result.locations?.find(
          (loc) => loc.name.toLowerCase() === payload.name.toLowerCase(),
        );
        if (existing) {
          setFormData((prev) => ({ ...prev, [type]: existing }));
          setFieldErrors((p) => ({ ...p, [type]: "" }));
        }
      }

      if (type === "source") setShowSourceMap(false);
      else setShowDestinationMap(false);
    } catch (err) {
      console.error("Location error:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const token = Cookies.get("token");
    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormData((p) => ({ ...p, images: [...p.images, data.result.url] }));
        setFieldErrors((p) => ({ ...p, images: "" }));
      } else {
        toast({
          title: "Upload Failed",
          description: data?.error?.message || "Image upload failed.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);

      toast({
        title: "Upload Failed",
        description: err.message || "Network error while uploading image.",
        variant: "destructive",
      });
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
    setFieldErrors((p) => ({ ...p, [key]: "" }));
    if (error) setError("");
  };

  const addListItem = (key) =>
    setFormData((p) => ({ ...p, [key]: [...p[key], ""] }));

  const removeListItem = (key, index) => {
    if (formData[key].length === 1) return;
    setFormData((p) => ({
      ...p,
      [key]: formData[key].filter((_, i) => i !== index),
    }));
  };

  const addDay = () =>
    setFormData((p) => ({
      ...p,
      itinerary: [
        ...p.itinerary,
        { day: p.itinerary.length + 1, activities: [""] },
      ],
    }));

  const removeDay = (index) => {
    if (formData.itinerary.length === 1) return;
    const filtered = formData.itinerary.filter((_, i) => i !== index);
    const updated = filtered.map((d, i) => ({ ...d, day: i + 1 }));
    setFormData((p) => ({ ...p, itinerary: updated }));
  };

  const addActivity = (dIdx) => {
    const it = [...formData.itinerary];
    it[dIdx].activities.push("");
    setFormData((p) => ({ ...p, itinerary: it }));
  };

  const removeActivity = (dIdx, aIdx) => {
    if (formData.itinerary[dIdx].activities.length === 1) return;
    const it = [...formData.itinerary];
    it[dIdx].activities = it[dIdx].activities.filter((_, i) => i !== aIdx);
    setFormData((p) => ({ ...p, itinerary: it }));
  };

  const handleActivity = (dIdx, aIdx, val) => {
    const it = [...formData.itinerary];
    it[dIdx].activities[aIdx] = val;
    setFormData((p) => ({ ...p, itinerary: it }));
    setFieldErrors((p) => ({ ...p, itinerary: "" }));
    if (error) setError("");
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstError = document.querySelector(".text-admin-error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim() || formData.name.trim().length < 3) {
      errors.name = "Trip name must be at least 3 characters.";
    }

    if (
      !formData.description?.trim() ||
      formData.description.trim().length < 10
    ) {
      errors.description = "Description must be at least 10 characters.";
    }

    if (!formData.price || Number(formData.price) <= 0) {
      errors.price = "Enter a valid price greater than 0.";
    }

    if (!formData.total_seats || Number(formData.total_seats) <= 0) {
      errors.total_seats = "Total seats must be at least 1.";
    }

    if (!formData.difficulty) {
      errors.difficulty = "Please select difficulty.";
    }

    if (!formData.type_id) {
      errors.type_id = "Please select a trip type.";
    }

    if (!formData.operator_id) {
      errors.operator_id = "Please select an operator.";
    }

    if (!formData.start_date) {
      errors.start_date = "Start date is required.";
    }

    if (!formData.end_date) {
      errors.end_date = "End date is required.";
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        errors.end_date = "End date cannot be before start date.";
      }
    }

    if (!formData.source.id) {
      errors.source = "Please select a source location.";
    }

    if (!formData.destination.id) {
      errors.destination = "Please select a destination location.";
    }

    if (!formData.images || formData.images.length === 0) {
      errors.images = "At least one trip image is required.";
    }

    if (!formData.inclusions || formData.inclusions.some((i) => !i.trim())) {
      errors.inclusions =
        "Please fill all inclusion fields or remove empty ones.";
    }

    if (!formData.exclusions || formData.exclusions.some((i) => !i.trim())) {
      errors.exclusions =
        "Please fill all exclusion fields or remove empty ones.";
    }

    const hasIncompleteItinerary = formData.itinerary.some(
      (day) => !day.activities || day.activities.some((a) => !a.trim()),
    );
    if (hasIncompleteItinerary) {
      errors.itinerary =
        "Please complete all itinerary days or remove empty activities.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      scrollToFirstError();
      return;
    }

    const token = Cookies.get("token");
    setLoading(true);

    const payload = {
      ...formData,
      price: Number(formData.price),
      total_seats: Number(formData.total_seats),
      source_id: formData.source.id,
      destination_id: formData.destination.id,
    };

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
      console.log("req", data);

      if (res.ok && data.success) {
        toast({
          title: "Success",
          description: "Trip created!",
          variant: "success",
        });
        handleModalClose(false);
      } else {
        toast({
          title: "Error",
          description: data?.error?.message || "Failed to create trip.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);

      toast({
        title: "Error",
        description: err.message || "Network error while creating trip.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-[80vw] md:w-[70vw] max-w-6xl h-[70vh] lg:h-[90vh] rounded-xl shadow-lg flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-[#14181F]">
            Create New Trip
          </h2>
          <button
            onClick={() => handleModalClose(false)}
            className="text-gray-500 hover:text-black text-xl p-1"
          >
            <IoCloseSharp size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          >
            {/* Sections */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Basic Information
              </h3>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="text-sm text-gray-600 mb-1 block">
                Trip Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                // required
                placeholder="E.g., Himalayan Base Camp"
              />
              {fieldErrors.name && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm text-gray-600 mb-1 block">
                Price (₹) *
              </label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                // required
              />
              {fieldErrors.price && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.price}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm text-gray-600 mb-1 block">
                Total Seats *
              </label>
              <Input
                name="total_seats"
                type="number"
                value={formData.total_seats}
                onChange={handleChange}
                // required
              />
              {fieldErrors.total_seats && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.total_seats}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm text-gray-600 mb-1 block">
                Difficulty *
              </label>
              <Select
                value={formData.difficulty}
                onValueChange={(v) =>
                  handleChange({ target: { name: "difficulty", value: v } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MODERATE">Moderate</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.difficulty && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.difficulty}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm text-gray-600 mb-1 block">
                Trip Type *
              </label>
              <Select
                value={formData.type_id}
                onValueChange={(v) => {
                  setFormData((p) => ({ ...p, type_id: v }));
                  setFieldErrors((p) => ({ ...p, type_id: "" }));
                  if (error) setError("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trip Type" />
                </SelectTrigger>
                <SelectContent>
                  {tripTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.type_id && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.type_id}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm text-gray-600 mb-1 block">
                Start Date *
              </label>
              <Input
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                // required
              />
              {fieldErrors.start_date && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.start_date}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm text-gray-600 mb-1 block">
                End Date *
              </label>
              <Input
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                // required
              />
              {fieldErrors.end_date && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.end_date}
                </p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 pt-2 border-t mt-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Operator & Locations
              </h3>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="text-sm text-gray-600 mb-1 block">
                Operator *
              </label>
              <Select
                value={formData.operator_id}
                onValueChange={(v) =>
                  handleChange({ target: { name: "operator_id", value: v } })
                }
              >
                <SelectTrigger>
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
              {fieldErrors.operator_id && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.operator_id}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm text-gray-600 mb-1 block">
                Source Location *
              </label>
              <Card className="border shadow-none">
                <CardContent className="p-3 flex justify-between items-center">
                  <span className="text-sm truncate mr-2">
                    {formData.source.name || "None selected"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSourceMap(true)}
                  >
                    Map
                  </Button>
                </CardContent>
              </Card>
              {fieldErrors.source && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.source}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="text-sm text-gray-600 mb-1 block">
                Destination Location *
              </label>
              <Card className="border shadow-none">
                <CardContent className="p-3 flex justify-between items-center">
                  <span className="text-sm truncate mr-2">
                    {formData.destination.name || "None selected"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDestinationMap(true)}
                  >
                    Map
                  </Button>
                </CardContent>
              </Card>
              {fieldErrors.destination && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.destination}
                </p>
              )}
            </div>

            {/* Content & Details */}
            <div className="col-span-1 md:col-span-2 pt-2 border-t mt-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Experience Details
              </h3>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="text-sm text-gray-600 mb-1 block">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                // required
              />
              {fieldErrors.description && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-600 font-medium">
                  Images *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("imgUpload").click()}
                >
                  <FaPlus className="mr-2 h-3 w-3" /> Upload
                </Button>
                <input
                  type="file"
                  id="imgUpload"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {formData.images.map((url, i) => (
                  <div key={i} className="relative aspect-square">
                    <img
                      src={url}
                      className="w-full h-full object-cover rounded-lg border"
                      alt="trip"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <IoCloseSharp size={10} />
                    </button>
                  </div>
                ))}
              </div>
              {fieldErrors.images && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.images}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm text-gray-600 font-medium">
                  Inclusions *
                </label>
                <button
                  type="button"
                  onClick={() => addListItem("inclusions")}
                  className="text-xs text-teal-600"
                >
                  + Add
                </button>
              </div>
              {formData.inclusions.map((item, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleListChange("inclusions", i, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem("inclusions", i)}
                    className="text-red-400"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
              {fieldErrors.inclusions && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.inclusions}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm text-gray-600 font-medium">
                  Exclusions
                </label>
                <button
                  type="button"
                  onClick={() => addListItem("exclusions")}
                  className="text-xs text-teal-600"
                >
                  + Add
                </button>
              </div>
              {formData.exclusions.map((item, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleListChange("exclusions", i, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem("exclusions", i)}
                    className="text-red-400"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
              {fieldErrors.exclusions && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.exclusions}
                </p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 pt-2 border-t mt-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Itinerary
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDay}
                >
                  <FaPlus className="mr-2 h-3 w-3" /> New Day
                </Button>
              </div>
              <div className="space-y-4">
                {formData.itinerary.map((day, dIdx) => (
                  <Card key={dIdx} className="bg-gray-50/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">
                          Day {day.day}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDay(dIdx)}
                          className="text-red-500 text-xs"
                        >
                          <FaTrash size={10} className="inline mr-1" /> Delete
                          Day
                        </button>
                      </div>
                      <div className="space-y-2 border-l-2 border-teal-500 pl-3">
                        {day.activities.map((act, aIdx) => (
                          <div key={aIdx} className="flex gap-2">
                            <Input
                              value={act}
                              onChange={(e) =>
                                handleActivity(dIdx, aIdx, e.target.value)
                              }
                              className="bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => removeActivity(dIdx, aIdx)}
                              className="text-gray-400"
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addActivity(dIdx)}
                          className="text-xs text-teal-600 hover:underline"
                        >
                          + Add Activity
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {fieldErrors.itinerary && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.itinerary}
                </p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="col-span-1 md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-4 border-t">
              <button
                type="button"
                onClick={() => handleModalClose(false)}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="w-full sm:w-auto px-8 py-2 bg-[#4ED0C3] text-white rounded-lg text-sm font-semibold hover:bg-[#3db8ab] shadow-sm"
              >
                {loading ? "Creating..." : "Create Trip"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Popups outside main layout flow */}
      {showSourceMap && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <span className="font-semibold text-gray-800">
                Select Source Location
              </span>
              <button onClick={() => setShowSourceMap(false)}>
                <IoCloseSharp size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-white">
              <MapPicker
                onLocationSelect={(loc) => handleLocationSelect("source", loc)}
                initialCenter={[20.5937, 78.9629]}
                initialZoom={5}
              />
            </div>
          </div>
        </div>
      )}

      {showDestinationMap && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <span className="font-semibold text-gray-800">
                Select Destination Location
              </span>
              <button onClick={() => setShowDestinationMap(false)}>
                <IoCloseSharp size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-white">
              <MapPicker
                onLocationSelect={(loc) =>
                  handleLocationSelect("destination", loc)
                }
                initialCenter={[20.5937, 78.9629]}
                initialZoom={5}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddTripModal;
