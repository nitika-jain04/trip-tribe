// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Cookies from "js-cookie";
// import Input from "../components/ui/input";

// export default function ForgotPassword() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

//   const handleForgotPassword = async (e) => {
//     e.preventDefault();

//     setLoading(true);
//     setError("");
//     setMessage("");

//     try {
//       const res = await fetch(
//         `${BASE_URL}/api/${API_VERSION}/auth/forgot-password`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${Cookies.get("token")}`,
//           },
//           body: JSON.stringify({ email }),
//         },
//       );

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Failed to send reset email");
//       }

//       setMessage("Password reset link sent to your email.");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="w-96 bg-white p-8 rounded-xl shadow-lg">
//         <h2 className="text-xl font-semibold mb-4 text-center">
//           Forgot Password
//         </h2>

//         {message && (
//           <p className="text-green-600 text-center mb-3">{message}</p>
//         )}

//         {error && <p className="text-red-500 text-center mb-3">{error}</p>}

//         <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
//           <Input
//             type="email"
//             required
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />

//           <button
//             disabled={loading}
//             className="bg-black text-white py-2 rounded-md"
//           >
//             {loading ? "Sending..." : "Send Reset Link"}
//           </button>
//         </form>

//         <p
//           onClick={() => router.push("/login")}
//           className="text-center mt-4 text-sm cursor-pointer hover:underline"
//         >
//           Back to Login
//         </p>
//       </div>
//     </div>
//   );
// }
