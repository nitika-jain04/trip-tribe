// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   /* config options here */
//   reactCompiler: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "cdn.triptribe.com",
//         port: "",
//         pathname: "/**",
//       },
//       {
//         protocol: "https",
//         hostname: "trip-tribe-backend.onrender.com",
//         port: "",
//         pathname: "/**",
//       },
//     ],
//     domains: ["res.cloudinary.com"],
//   },
//   devIndicators: {
//     buildActivity: false,
//   },
//   reactStrictMode: true,
// };

// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true",
// });

// export default nextConfig;

import bundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
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

  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "recharts", "framer-motion", "react-icons"],
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
