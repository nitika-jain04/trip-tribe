import "./globals.css";
import AuthCheck from "./components/AuthCheck";

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
      </body>
    </html>
  );
}
