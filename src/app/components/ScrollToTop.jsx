"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset scroll position to top whenever the pathname changes,
    // ensuring pages don't open at a random scroll position.
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
