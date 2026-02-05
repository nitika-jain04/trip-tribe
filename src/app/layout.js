import { Inter } from "next/font/google";
import "./globals.css";
import AuthCheck from "./components/AuthCheck";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "TripTribe",
    template: "%s | TripTribe",
  },
  description: "India's first community trip aggregator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-inter">
        <AuthCheck />
        {children}
      </body>
    </html>
  );
}
