import { MapPin, Calendar, Search, ArrowRight, Shield, ChevronDown } from "lucide-react";

export function SkeletonBox({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export function TripPageSkeleton() {
  return (
    <>
      <section className="relative pt-24 min-h-[100dvh]">
        <div className="container-premium">
          <div className="mb-4">
            <SkeletonBox className="h-5 w-28" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <SkeletonBox className="aspect-4/3 w-full rounded-2xl" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBox
                    key={i}
                    className="aspect-square w-full rounded-lg"
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <SkeletonBox className="h-8 w-28 rounded-full" />
                <SkeletonBox className="h-8 w-24 rounded-full" />
              </div>

              <SkeletonBox className="h-10 w-2/3 mb-3" />
              <SkeletonBox className="h-5 w-1/2 mb-6" />

              <div className="card-premium p-4 mb-6">
                <div className="flex items-center gap-4">
                  <SkeletonBox className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="h-5 w-40" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card-premium p-4 space-y-3">
                    <SkeletonBox className="h-5 w-5 rounded-md" />
                    <SkeletonBox className="h-4 w-20" />
                    <SkeletonBox className="h-5 w-24" />
                  </div>
                ))}
              </div>

              <div className="card-premium p-6 bg-primary/5 border-primary/20">
                <div className="mb-4 space-y-2">
                  <SkeletonBox className="h-4 w-24" />
                  <SkeletonBox className="h-10 w-32" />
                  <SkeletonBox className="h-4 w-20" />
                </div>
                <SkeletonBox className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container-premium">
          <div className="flex gap-4 border-b border-border mb-8 pb-2">
            <SkeletonBox className="h-10 w-24" />
            <SkeletonBox className="h-10 w-24" />
            <SkeletonBox className="h-10 w-28" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <SkeletonBox className="h-8 w-40" />
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-5/6" />
              <SkeletonBox className="h-4 w-4/6" />
            </div>

            <div className="card-premium p-6 space-y-4">
              <SkeletonBox className="h-6 w-28" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <SkeletonBox className="h-4 w-20" />
                  <SkeletonBox className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function TripsDestinationsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl overflow-hidden bg-muted/40 animate-pulse"
        >
          <div className="aspect-16/10 bg-muted" />
          <div className="p-6">
            <div className="h-4 w-28 bg-muted-foreground/20 rounded mb-3" />
            <div className="h-6 w-3/4 bg-muted-foreground/20 rounded mb-3" />
            <div className="h-4 w-1/2 bg-muted-foreground/20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProvidersSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 px-5 py-3 rounded-full bg-muted/50 animate-pulse min-w-[180px]"
        >
          <div className="h-16 w-16 rounded-full bg-muted" />
          <div className="h-5 w-24 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <>
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-muted animate-pulse" />
        <div className="container-premium relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-20 bg-muted/20 rounded-xl w-3/4 mx-auto" />
            <div className="h-6 bg-muted/20 rounded-lg w-1/2 mx-auto" />
            <div className="h-16 bg-background rounded-2xl w-full max-w-3xl mx-auto" />
          </div>
        </div>
      </section>

      <section className="section bg-muted/30">
        <div className="container-premium">
          <div className="h-10 w-48 bg-muted rounded mb-12" />
          <TripsDestinationsSkeleton />
        </div>
      </section>

      <section className="section bg-background">
        <div className="container-premium">
          <div className="h-10 w-48 bg-muted rounded mb-12" />
          <ProvidersSkeleton />
        </div>
      </section>
    </>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="card-premium overflow-hidden animate-pulse">
      <div className="aspect-16/10 bg-muted" />
      <div className="p-6">
        <div className="h-4 w-1/3 bg-muted rounded mb-3" />
        <div className="h-5 w-3/4 bg-muted rounded mb-3" />
        <div className="flex gap-3 mb-4">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
        </div>
        <div className="h-4 w-1/2 bg-muted rounded mb-4" />
        <div className="h-6 w-24 bg-muted rounded mb-4" />
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-muted rounded" />
          <div className="h-10 flex-1 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function TripsPageSkeleton() {
  return (
    <>
      <section className="relative pt-28 pb-12 bg-linear-to-br from-primary-light via-background to-background">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="h-12 w-64 bg-muted/20 rounded-xl mx-auto mb-4" />
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="h-14 bg-background rounded-xl w-full" />
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container-premium">
          <div className="flex gap-8">
            <div className="hidden lg:block w-64 shrink-0">
              <div className="card-premium p-6 space-y-6">
                <div className="h-6 w-24 bg-muted rounded mb-4" />
                <div className="space-y-4">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between mb-8">
                <div className="h-10 w-32 bg-muted rounded" />
                <div className="h-10 w-40 bg-muted rounded" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TripCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
