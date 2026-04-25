import React from "react";
import { GitCompare, X, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/app/components/ui/dialog";

export default function ComparePortal({
  compareList,
  triggerCompare,
  showCompare,
  setShowCompare,
  compareTrips,
  setCompareList,
  showInterstitial,
  setShowInterstitial,
  interstitialChoiceMade,
  setInterstitialChoiceMade,
  showLandscapeAlert,
}) {
  return (
    <>
      <AnimatePresence>
        {showLandscapeAlert && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-background rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-border"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <RotateCcw className="w-8 h-8 text-primary animate-spin-slow" />
              </div>
              <h3 className="font-display text-heading-md mb-2">
                Rotate your device
              </h3>
              <p className="text-body-sm text-muted-foreground">
                For the best comparison experience, please rotate your device to
                landscape mode.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {compareList.length > 1 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <Button
            onClick={triggerCompare}
            className="btn-secondary shadow-2xl px-8 py-6 rounded-full border-2 border-primary/20 bg-background/80 backdrop-blur-md hover:bg-background transition-all active:scale-95 flex items-center gap-3"
          >
            <GitCompare className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">
              Compare {compareList.length} Trips
            </span>
          </Button>
        </div>
      )}

      <Dialog
        open={showCompare}
        onOpenChange={(open) => {
          setShowCompare(open);
          if (!open) setCompareList([]);
        }}
      >
        <DialogContent className="max-w-6xl w-[calc(95%-2rem)] max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-lg">
          <div className="sticky top-0 z-20 bg-background border-b border-border p-6 flex items-center justify-between">
            <DialogHeader className="p-0">
              <DialogTitle className="font-display text-heading-lg">
                Compare Trips
              </DialogTitle>
            </DialogHeader>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 hover:bg-primary transition-colors"
                id="close-compare-modal"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>

          <div className="p-4 sm:p-8">
            <div
              className={`grid gap-8  ${
                compareTrips.length === 3
                  ? "sm:grid-cols-3"
                  : compareTrips.length === 2
                    ? "sm:grid-cols-2"
                    : "grid-cols-1"
              }`}
            >
              {compareTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-background rounded-2xl shadow-sm border border-border/50 overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="aspect-16/9 relative overflow-hidden">
                    <img
                      src={trip.image || trip.images?.[0]}
                      alt={trip.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col space-y-6">
                    {/* Title & Provider */}
                    <div>
                      <h4 className="font-display text-heading-sm mb-1 line-clamp-2">
                        {trip.name}
                      </h4>
                      <p className="text-body-sm text-muted-foreground uppercase tracking-wider">
                        {trip.provider}
                      </p>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-body-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-bold text-success text-base">
                          ₹{Number(trip.priceFrom || trip.price).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-body-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium text-foreground">
                          {trip.duration}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-body-sm">
                        <span className="text-muted-foreground">
                          Group Size
                        </span>
                        <span className="font-medium text-foreground">
                          {trip.groupSize}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-body-sm">
                        <span className="text-muted-foreground">
                          Difficulty
                        </span>
                        <span className="font-medium text-foreground">
                          {trip.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Location & Dates (Minimal) */}
                    <div className="pt-4 border-t border-border/50 space-y-3">
                      <div className="flex justify-between text-body-xs">
                        <span className="text-muted-foreground">From</span>
                        <span className="font-medium text-right">
                          {trip.source_full}
                        </span>
                      </div>
                      <div className="flex justify-between text-body-xs">
                        <span className="text-muted-foreground">To</span>
                        <span className="font-medium text-right">
                          {trip.destination_full}
                        </span>
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div className="space-y-2 border-t border-border/50 pt-4">
                      <p className="font-bold text-body-sm text-foreground font-display">
                        Inclusions:
                      </p>
                      <ul className="space-y-1.5">
                        {trip.inclusions?.map((item, i) => (
                          <li
                            key={i}
                            className="text-base leading-relaxed text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-success mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {trip.exclusions?.length > 0 && (
                      <div className="space-y-2 border-t border-border/50 pt-4">
                        <p className="font-bold text-body-sm text-foreground font-display">
                          Exclusions:
                        </p>
                        <ul className="space-y-1.5">
                          {trip.exclusions.map((item, i) => (
                            <li
                              key={i}
                              className="text-base leading-relaxed text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-success mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Detailed Itinerary */}
                    <div className="space-y-3 border-t border-border/50 pt-4">
                      <p className="font-bold text-body-sm text-foreground font-display">
                        Detailed Itinerary
                      </p>
                      <div className="space-y-3">
                        {trip.itinerary?.map((dayItem, i) => (
                          <details
                            key={i}
                            className="bg-muted/30 rounded-xl px-4 py-2 border border-border/30"
                          >
                            <summary className="text-base font-bold text-primary tracking-wider cursor-pointer">
                              Day {dayItem.day || i + 1}
                            </summary>
                            <ul className="space-y-1.5">
                              {dayItem.activities?.map((activity, j) => (
                                <li
                                  key={j}
                                  className="text-base leading-relaxed text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ))}
                      </div>
                    </div>

                    {/* Cancellation Policy */}
                    {trip.cancellation_policy && (
                      <div className="space-y-2">
                        <p className="font-bold text-body-sm text-foreground font-display">
                          Cancellation Policy:
                        </p>
                        <div className="bg-muted/10 rounded-xl p-4 overflow-hidden border border-border/50">
                          <pre className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans">
                            {trip.cancellation_policy}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-4 sticky bottom-0 bg-background pb-2 mt-auto">
                      <Link
                        href={`/trip/${trip.id}`}
                        prefetch={false}
                        className="block"
                      >
                        <Button className="btn-primary w-full h-11 text-sm font-semibold shadow-md active:scale-[0.98] transition-all">
                          View Trip
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showInterstitial}
        onOpenChange={(open) => {
          setShowInterstitial(open);
          if (!open && !interstitialChoiceMade) setCompareList([]);
        }}
      >
        <DialogContent className="max-w-sm w-[calc(90%-2rem)] p-6 rounded-2xl">
          <DialogHeader>
            <GitCompare className="w-12 h-12 text-primary mb-4" />
            <DialogTitle className="font-display text-heading-md">
              Add to Compare
            </DialogTitle>
            <p className="text-body-sm text-muted-foreground mt-2">
              You can compare up to 3 trips side-by-side.
            </p>
          </DialogHeader>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="outline"
              className="h-12"
              onClick={() => {
                setInterstitialChoiceMade?.(true);
                setShowInterstitial(false);
              }}
            >
              <p>
                Add 3<sup>rd</sup> trip
              </p>
            </Button>
            <Button
              className="btn-primary h-12"
              onClick={() => {
                setInterstitialChoiceMade?.(true);
                setShowInterstitial(false);
                triggerCompare();
              }}
            >
              Compare
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
