import { Navbar } from "../components/website/Navbar";
import { Footer } from "../components/website/Footer";
import { OfflineStatus } from "../components/website/OfflineStatus";

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <OfflineStatus />
    </>
  );
}
