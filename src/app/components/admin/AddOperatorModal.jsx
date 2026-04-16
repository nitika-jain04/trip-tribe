import { useCallback, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import Input from "../ui/input";
import PhoneInput from "../ui/PhoneInput";
import { useToast } from "@/app/hooks/use-toast";
import Cookies from "js-cookie";
import { Rating } from "../ui/rating";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function AddOperatorModal({ handleModalClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    contact_name: "",
    regions: "",
    business_description: "",
    hotel_category: 0,
    website_url: "",
    logo_url: "",
    rating: 4.5,
    status: "inactive",
    total_trips: 0,
    trips_per_year: 0,
    social_links: {
      instagram: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const handlePhoneValidation = useCallback(
    (valid) => setIsPhoneValid(valid),
    [],
  );
  const { toast } = useToast();

  function handleChange(e) {
    const { name, value } = e.target;

    if (name.startsWith("social_links.")) {
      const key = name.split(".")[1];

      setFormData((prev) => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (error) setError("");
  }

  async function handleImageUpload(e) {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/heif",
      "image/heic",
    ];

    const file = e.target.files[0];
    if (!file) return;

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPG and PNG images are allowed",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    setError("");

    const token = Cookies.get("token");

    const formDataToSend = new FormData();
    formDataToSend.append("image", file);

    //console.log"req", formDataToSend);

    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/uploads/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();

      const imageUrl = data.result?.url;

      if (!res.ok) {
        toast({
          title: "Error",
          description:
            data?.error?.message || "No Image URL returned from the server",
          variant: "destructive",
        });
        return;
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

  const validateForm = () => {
    const errors = {};

    const startsWithValidChar = /^[A-Za-z][A-Za-z\s.'-]*$/;

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = "Operator name must be at least 2 characters.";
    }

    if (!formData.contact_name || formData.contact_name.trim().length < 2) {
      errors.contact_name = "Contact person must be at least 2 characters.";
    } else if (!startsWithValidChar.test(formData.contact_name.trim())) {
      errors.contact_name =
        "Contact person cannot start with a special character.";
    }

    if (!formData.regions || formData.regions.length == 0) {
      errors.regions = "Enter the operating regions.";
    }

    if (
      !formData.business_description ||
      formData.business_description.trim().length < 2
    ) {
      errors.business_description =
        "The description must be atleast 25 characters.";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    // Phone validation
    if (!isPhoneValid) {
      errors.phone_number = "Please enter a valid phone number";
    }

    // Website validation
    if (
      formData.website_url &&
      !/^https?:\/\/(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+[/#?]?.*$/.test(
        formData.website_url,
      )
    ) {
      errors.website_url = "Enter valid website URL";
    }

    // Social links validation
    const socialPatterns = {
      instagram: /^https?:\/\/(www\.)?instagram\.com\/.+$/,
      facebook: /^https?:\/\/(www\.)?facebook\.com\/.+$/,
      twitter: /^https?:\/\/(www\.)?(twitter|x)\.com\/.+$/,
      linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+$/,
      youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    };

    Object.entries(formData.social_links).forEach(([platform, url]) => {
      if (url && !socialPatterns[platform].test(url)) {
        errors[`social_links.${platform}`] = `Enter valid ${platform} URL`;
      }
    });

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
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

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      scrollToFirstError();
      return;
    }

    setLoading(true);
    setError("");

    const token = Cookies.get("token");

    const requestBody = {
      name: formData.name,
      business_description: formData.business_description,
      contact_name: formData.contact_name,
      email: formData.email,
      phone_number: formData.phone_number,
      regions: formData.regions
        ? formData.regions
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean)
        : [],
      website_url: formData.website_url || undefined,
      hotel_category: formData.hotel_category || 0,
      logo_url: formData.logo_url || undefined,
      // rating: parseFloat(formData.rating) || 4.5,
      // status: formData.status,

      total_trips:
        formData.total_trips !== "" && formData.total_trips !== null
          ? Number(formData.total_trips)
          : 0,

      trips_per_year:
        formData.trips_per_year !== "" && formData.trips_per_year !== null
          ? Number(formData.trips_per_year)
          : 0,

      social_links: {
        instagram: formData.social_links.instagram || undefined,
        facebook: formData.social_links.facebook || undefined,
        twitter: formData.social_links.twitter || undefined,
        youtube: formData.social_links.youtube || undefined,
        linkedin: formData.social_links.linkedin || undefined,
      },
    };

    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key],
    );

    // console.log("add op req", requestBody);

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

      if (!res.ok) {
        toast({
          title: "Error",
          description: data?.error?.message || "Failed to add operator",
          variant: "destructive",
        });
        return;
      }

      handleModalClose(false, true);
    } catch (err) {
      console.error("Error adding operator:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-[80vw] md:w-[70vw] max-w-6xl h-[70vh] lg:h-[90vh] rounded-xl shadow-lg flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-[#14181F]">
            Add Operator
          </h2>
          <button
            onClick={() => handleModalClose(false)}
            className="text-gray-500 hover:text-black text-xl p-1"
            disabled={loading || uploadingImage}
          >
            <IoCloseSharp />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-admin-error text-sm">{error}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
          >
            {/* Logo Upload */}
            <div className="col-span-1 sm:col-span-2">
              <label className="text-sm text-gray-600 font-medium">
                Upload Logo
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-4 mt-1">
                <div className="flex-1 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:bg-[#4ED0C3]/10 file:text-[#4ED0C3] hover:file:bg-[#4ED0C3]/20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a logo image (JPG, PNG, SVG)
                  </p>
                </div>
                {formData.logo_url && (
                  <div className="flex flex-col items-center sm:items-start">
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
              <Input
                type="text"
                name="name"
                // required
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-1"
                placeholder="Wanderlust Adventures"
              />
              {fieldErrors.name && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Contact Person Name */}
            <div>
              <label className="text-sm text-gray-600">
                Contact Person Name *
              </label>
              <Input
                type="text"
                name="contact_name"
                // required
                value={formData.contact_name}
                onChange={handleChange}
                className="w-full mt-1"
                placeholder="Priya Sharma"
              />
              {fieldErrors.contact_name && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.contact_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email *</label>
              <Input
                type="email"
                name="email"
                // required
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value.toLowerCase(),
                  }));
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                  if (error) setError("");
                }}
                className="w-full mt-1"
                placeholder="hello@wanders.com"
              />
              {fieldErrors.email && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-sm text-gray-600">Phone Number *</label>
              <PhoneInput
                value={formData.phone_number}
                onChange={(phone) => {
                  setFormData((prev) => ({
                    ...prev,
                    phone_number: phone,
                  }));
                  setFieldErrors((prev) => ({ ...prev, phone_number: "" }));
                  if (error) setError("");
                }}
                onValidationChange={handlePhoneValidation}
                error={fieldErrors.phone_number}
                className="h-10 mt-1"
                placeholder="Enter phone number"
              />
            </div>

            {/* Region */}
            <div>
              <label className="text-sm text-gray-600">Region *</label>
              <Input
                type="text"
                name="regions"
                // required
                value={formData.regions}
                onChange={handleChange}
                className="w-full mt-1"
                placeholder="North India, Himalayas"
              />
              {fieldErrors.regions && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.regions}
                </p>
              )}
            </div>

            {/* Total Trips */}
            <div>
              <label className="text-sm text-gray-600">Total Trips</label>
              <Input
                type="number"
                name="total_trips"
                value={formData.total_trips}
                onChange={handleChange}
                min="0"
                className="w-full mt-1"
                placeholder="150"
              />
            </div>

            {/* Trips Per Year */}
            <div>
              <label className="text-sm text-gray-600">Trips Per Year</label>
              <Input
                type="number"
                name="trips_per_year"
                value={formData.trips_per_year}
                onChange={handleChange}
                min="0"
                className="w-full mt-1"
                placeholder="25"
              />
            </div>

            <div className="col-span-1">
              <label className="text-sm text-gray-600 mb-1 block">
                Hotel Category
              </label>
              <div className="flex items-center h-10 mt-1">
                <Rating
                  value={formData.hotel_category}
                  onChange={(val) =>
                    setFormData((p) => ({ ...p, hotel_category: val }))
                  }
                />
              </div>
            </div>

            {/* Status - Commented out */}
            {/* <div>
              <label className="text-sm text-gray-600">Status *</label>
              <select
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
              >
                <option value="" className="placeholder:text-gray-600">
                  Select Status
                </option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div> */}

            {/* Social Links Section */}
            <div className="col-span-1 sm:col-span-2">
              <label className="text-sm text-gray-600">
                Social Media Links
              </label>
            </div>

            {/* Website URL */}
            <div>
              <label className="text-sm text-gray-600">Website URL</label>
              <Input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                className="w-full mt-1"
                placeholder="https://wanderlustadventures.com"
              />
              {fieldErrors.website_url && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.website_url}
                </p>
              )}
            </div>

            {/* Instagram */}
            <div>
              <label className="text-sm text-gray-600">Instagram URL</label>
              <Input
                type="url"
                name="social_links.instagram"
                value={formData.social_links.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/operator"
                className="w-full mt-1"
              />
              {fieldErrors["social_links.instagram"] && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors["social_links.instagram"]}
                </p>
              )}
            </div>

            {/* Facebook */}
            <div>
              <label className="text-sm text-gray-600">Facebook URL</label>
              <Input
                type="url"
                name="social_links.facebook"
                value={formData.social_links.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/operator"
                className="w-full mt-1"
              />
              {fieldErrors["social_links.facebook"] && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors["social_links.facebook"]}
                </p>
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="text-sm text-gray-600">LinkedIn URL</label>
              <Input
                type="url"
                name="social_links.linkedin"
                value={formData.social_links.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/operator"
                className="w-full mt-1"
              />
              {fieldErrors["social_links.linkedin"] && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors["social_links.linkedin"]}
                </p>
              )}
            </div>

            {/* Twitter */}
            <div>
              <label className="text-sm text-gray-600">Twitter URL</label>
              <Input
                type="url"
                name="social_links.twitter"
                value={formData.social_links.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/operator"
                className="w-full mt-1"
              />
              {fieldErrors["social_links.twitter"] && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors["social_links.twitter"]}
                </p>
              )}
            </div>

            {/* YouTube */}
            <div>
              <label className="text-sm text-gray-600">YouTube URL</label>
              <Input
                type="url"
                name="social_links.youtube"
                value={formData.social_links.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/@operator"
                className="w-full mt-1"
              />
              {fieldErrors["social_links.youtube"] && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors["social_links.youtube"]}
                </p>
              )}
            </div>

            {/* Rating - Commented out */}
            {/* <div>
              <label className="text-sm text-gray-600">Rating (0-5)</label>
              <Input
                type="number"
                name="rating"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                className="w-full mt-1"
                placeholder="4.5"
              />
            </div> */}

            {/* Description */}
            <div className="col-span-1 sm:col-span-2">
              <label className="text-sm text-gray-600">Description *</label>
              <textarea
                name="description"
                // required
                value={formData.business_description}
                onChange={handleChange}
                rows="4"
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                placeholder="Describe the operator's services, specialties, and experience..."
              ></textarea>

              {fieldErrors.business_description && (
                <p className="text-admin-error text-xs mt-1">
                  {fieldErrors.business_description}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="col-span-1 sm:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6 mt-2 border-t">
              <button
                type="button"
                onClick={() => handleModalClose(false)}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                disabled={loading || uploadingImage}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="w-full sm:w-auto px-6 py-2 bg-[#4ED0C3] text-white rounded-lg text-sm font-medium hover:bg-[#3db8ab] disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AddOperatorModal;
