// "use client";

// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { LoaderCircleIcon, Save, Trash2, ArrowLeft } from "lucide-react";
// import { Button } from "@/app/components/ui/button";

// export default function OperatorEditPage() {
//   const { id } = useParams();
//   const router = useRouter();

//   const [operator, setOperator] = useState(null);
//   const [formData, setFormData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [uploadingImage, setUploadingImage] = useState(false);

//   // Fetch operator
//   useEffect(() => {
//     const fetchOperator = async () => {
//       const token = localStorage.getItem("token");

//       try {
//         const res = await fetch(
//           `https://trip-tribe-backend.onrender.com/api/v1/operators/admin/${id}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );

//         const data = await res.json();
//         if (data.success) {
//           setOperator(data.result);
//           setFormData({
//             name: data.result.name || "",
//             email: data.result.email || "",
//             phone_number: data.result.phone_number || "",
//             contact_name: data.result.contact_name || "",
//             description: data.result.description || "",
//             website: data.result.website || "",
//             logo_url: data.result.logo_url || "",
//             status: data.result.status || "",
//           });
//         }
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch operator");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) fetchOperator();
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setUploadingImage(true);
//     setError("");

//     const token = localStorage.getItem("token");
//     const fd = new FormData();
//     fd.append("image", file);

//     try {
//       const res = await fetch(
//         `https://trip-tribe-backend.onrender.com/api/v1/uploads/image`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//           body: fd,
//         },
//       );

//       const data = await res.json();
//       if (!res.ok || !data.success)
//         throw new Error(data.message || "Upload failed");

//       setFormData((prev) => ({ ...prev, logo_url: data.result.url }));
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!operator) return;

//     setSaving(true);
//     setError("");

//     const token = localStorage.getItem("token");

//     // Only changed fields
//     const requestBody = {};
//     Object.keys(formData).forEach((key) => {
//       if ((formData[key] || "") !== (operator[key] || "")) {
//         requestBody[key] = formData[key] || null;
//       }
//     });

//     if (Object.keys(requestBody).length === 0) {
//       alert("No changes detected");
//       setSaving(false);
//       return;
//     }

//     try {
//       const res = await fetch(
//         `https://trip-tribe-backend.onrender.com/api/v1/operators/admin/${id}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(requestBody),
//         },
//       );

//       const data = await res.json();
//       if (!res.ok || !data.success)
//         throw new Error(data.message || "Update failed");

//       alert("Operator updated successfully!");
//       router.push(`/admin/operators/${id}`);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     const confirmDelete = window.confirm("Delete this operator permanently?");
//     if (!confirmDelete) return;

//     setSaving(true);

//     const token = localStorage.getItem("token");

//     try {
//       const res = await fetch(
//         `https://trip-tribe-backend.onrender.com/api/v1/operators/admin/${id}`,
//         {
//           method: "DELETE",
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );

//       const data = await res.json();
//       if (!res.ok || !data.success)
//         throw new Error(data.message || "Delete failed");

//       alert("Operator deleted");
//       router.push("/admin/operators");
//     } catch (err) {
//       setError(err.message);
//       setSaving(false);
//     }
//   };

//   if (loading || !formData) {
//     return (
//       <div className="flex items-center justify-center h-[60vh]">
//         <LoaderCircleIcon className="animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen space-y-6">
//       <Link
//         href={`/admin/operators/${id}`}
//         className="inline-flex items-center gap-2 text-sm font-medium"
//       >
//         <ArrowLeft size={16} /> Back to Details
//       </Link>

//       <div className="bg-white rounded-lg border shadow-sm p-6">
//         <h1 className="text-2xl font-semibold mb-6">Edit Operator</h1>

//         {error && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSave} className="grid grid-cols-2 gap-5">
//           <div className="col-span-2">
//             <label className="text-sm">Logo</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               disabled={uploadingImage}
//               className="mt-1 w-full"
//             />
//             {formData.logo_url && (
//               <img
//                 src={formData.logo_url}
//                 className="h-16 w-16 mt-2 rounded border"
//               />
//             )}
//           </div>

//           {[
//             ["name", "Operator Name"],
//             ["contact_name", "Contact Person"],
//             ["email", "Email"],
//             ["phone_number", "Phone"],
//             ["website", "Website"],
//           ].map(([key, label]) => (
//             <div key={key}>
//               <label className="text-sm">{label}</label>
//               <input
//                 name={key}
//                 value={formData[key]}
//                 onChange={handleChange}
//                 className="w-full mt-1 border rounded px-3 py-2"
//               />
//             </div>
//           ))}

//           <div>
//             <label className="text-sm">Status</label>
//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleChange}
//               className="w-full mt-1 border rounded px-3 py-2"
//             >
//               <option value="ACTIVE">Active</option>
//               <option value="INACTIVE">Inactive</option>
//               <option value="SUSPENDED">Suspended</option>
//             </select>
//           </div>

//           <div className="col-span-2">
//             <label className="text-sm">Description</label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               rows={4}
//               className="w-full mt-1 border rounded px-3 py-2"
//             />
//           </div>

//           <div className="col-span-2 flex justify-between pt-6 border-t">
//             <Button
//               type="button"
//               variant="destructive"
//               onClick={handleDelete}
//               disabled={saving}
//             >
//               <Trash2 size={16} /> Delete
//             </Button>

//             <Button type="submit" disabled={saving || uploadingImage}>
//               <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
