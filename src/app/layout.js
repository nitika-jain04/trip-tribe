import "./globals.css";
import AuthCheck from "./components/AuthCheck";
import { Footer } from "./components/website/Footer";
import { Navbar } from "./components/website/Navbar";

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
      <body>
        <AuthCheck />
        <Navbar />

        {children}
        <Footer />
      </body>
    </html>
  );
}
