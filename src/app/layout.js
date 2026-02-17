import "./globals.css";
import AuthCheck from "./components/AuthCheck";
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
        <AuthCheck />
        {children}
        <Toaster/>
      </body>
    </html>
  );
}
