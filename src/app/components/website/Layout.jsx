import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout(children) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
