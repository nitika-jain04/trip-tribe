import "./globals.css";
import { Toaster } from "./components/ui/toaster";

export const metadata = {
  title: {
    default: "TripTribe",
    template: "%s | TripTribe",
  },
  description: "India's first community trip aggregator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
