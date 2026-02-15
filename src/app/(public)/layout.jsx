import { Navbar } from "../components/website/Navbar";
import { Footer } from "../components/website/Footer";

export const metadata = {
  title: "Explore Group Trips Across India",
  description:
    "Discover curated group trips, adventures, and travel communities across India. Compare itineraries, prices, and partners on TripTribe.",
  alternates: {
    canonical: "https://triptribe.in",
  },
  openGraph: {
    title: "TripTribe – India's First Community Trip Aggregator",
    description:
      "Compare and explore group trips, adventures, and trusted travel communities across India.",
    url: "https://triptribe.in",
    siteName: "TripTribe",
    images: [
      {
        url: "https://triptribe.in/about_us.jpg",
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

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
