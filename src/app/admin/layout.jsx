import AdminLayoutClient from "./AdminLayoutClient";

export default function AdminLayout({ children }) {
  return (
    // <Suspense fallback={<AdminLoading />}>
    <AdminLayoutClient>{children}</AdminLayoutClient>
    // </Suspense>
  );
}
