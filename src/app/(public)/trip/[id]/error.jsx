"use client";

import { useEffect } from "react";
import { TripPageSkeleton } from "@/app/components/website/Skeletons";
import { WifiOff, RotateCcw } from "lucide-react";
import { Button } from "@/app/components/ui/button";

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
        <TripPageSkeleton />
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
              We couldn&apos;t load this adventure. Please check your internet
              connection and we&apos;ll automatically try again.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => reset()}
              size="lg"
              className="btn-primary flex items-center gap-2 px-8"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
