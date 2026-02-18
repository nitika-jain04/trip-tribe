import { Navbar } from "../components/website/Navbar";
import { Footer } from "../components/website/Footer";

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
