"use client";

import { useEffect } from "react";
import { HomePageSkeleton } from "@/app/components/website/Skeletons";
import { WifiOff, RotateCcw, HomeIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
    const handleOnline = () => reset();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [error, reset]);

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50 grayscale">
        <HomePageSkeleton />
      </div>

      {/* Offline Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10 p-6 bg-background/20 backdrop-blur-[2px]">
        <div className="max-w-md w-full bg-background/95 backdrop-blur-md rounded-3xl p-8 text-center shadow-2xl border border-border space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-red-600" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-heading-md text-foreground">
              You are currently offline
            </h2>
            <p className="text-body-sm text-muted-foreground leading-relaxed">
              We couldn&apos;t connect to our trip database. Please check your
              internet and we&apos;ll automatically try again.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Button
              onClick={() => reset()}
              size="lg"
              className="btn-primary flex items-center gap-2 px-8 w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-8 w-full"
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
