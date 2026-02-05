import React from "react";
import AdminGuard from "@/app/components/AdminGuard";

function page() {
  return (
    <AdminGuard>
      <div></div>
    </AdminGuard>
  );
}

export default page;
