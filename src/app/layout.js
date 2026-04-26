import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "./components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata = {
  title: "TripTribe",
  description:
    "Discover curated group trips, adventures, and travel communities across India. Compare itineraries, prices, and partners on TripTribe.",
  alternates: {
    canonical: "https://triptribe.co/",
  },
  openGraph: {
    title: "TripTribe – India's First Community Trip Aggregator",
    description:
      "Compare and explore group trips, adventures, and trusted travel communities across India.",
    url: "https://triptribe.co/",
    siteName: "TripTribe",
    images: [
      {
        url: "https://triptribe.in/triptribe-logo-final.png",
        width: 1200,
        height: 630,
        alt: "TripTribe Home",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "TripTribe – India's First Community Trip Aggregator",
    description:
      "Explore curated group trips, adventures & travel communities across India.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
