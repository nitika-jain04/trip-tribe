/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.triptribe.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "trip-tribe-backend.onrender.com",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ["res.cloudinary.com"],
  },
  devIndicators: {
    buildActivity: false,
  },
};

export default nextConfig;
