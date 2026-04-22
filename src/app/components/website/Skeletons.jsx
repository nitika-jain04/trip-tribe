import {
  MapPin,
  Calendar,
  Search,
  ArrowRight,
  Shield,
  ChevronDown,
} from "lucide-react";

export function SkeletonBox({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-muted-foreground/8 ${className}`}
    />
  );
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
          className="rounded-2xl overflow-hidden bg-muted-foreground/5 animate-pulse"
        >
          <div className="aspect-14/10 bg-muted-foreground/8" />
          <div className="p-6">
            <div className="h-4 w-28 bg-muted-foreground/8 rounded mb-3" />
            <div className="h-6 w-3/4 bg-muted-foreground/8 rounded mb-3" />
            <div className="h-4 w-1/2 bg-muted-foreground/8 rounded" />
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
          className="flex items-center gap-3 px-5 py-3 rounded-full bg-muted-foreground/5 animate-pulse min-w-[180px]"
        >
          <div className="h-16 w-16 rounded-full bg-muted-foreground/8" />
          <div className="h-5 w-24 bg-muted-foreground/8 rounded" />
        </div>
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <>
      {/* Navbar Placeholder */}
      <div className="absolute top-0 left-0 right-0 h-18 container-premium flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-muted-foreground/10 animate-pulse" />
          <div className="h-6 w-28 rounded-full bg-muted-foreground/10 animate-pulse" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-16 rounded-full bg-muted-foreground/8 animate-pulse"
            />
          ))}
        </div>
        <div className="h-10 w-32 rounded-full bg-muted-foreground/10 animate-pulse" />
      </div>

      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Top Image / Hero Background Placeholder */}
        <div className="absolute inset-0 bg-muted-foreground/8">
          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/20" />
          <div className="w-full h-full animate-pulse bg-muted-foreground/3 opacity-50" />
        </div>

        <div className="container-premium relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="h-16 md:h-24 bg-muted-foreground/10 rounded-2xl w-3/4 mx-auto animate-pulse" />
              <div className="h-16 md:h-24 bg-muted-foreground/10 rounded-2xl w-1/2 mx-auto animate-pulse" />
            </div>

            <div className="h-6 bg-muted-foreground/8 rounded-lg w-2/3 mx-auto animate-pulse" />

            {/* Search Bar Skeleton */}
            <div className="h-18 md:h-20 bg-background/90 backdrop-blur-md rounded-2xl w-full max-w-3xl mx-auto shadow-2xl p-3 flex gap-2">
              <div className="flex-1 h-full bg-muted rounded-xl animate-pulse" />
              <div className="flex-1 h-full bg-muted rounded-xl animate-pulse hidden md:block" />
              <div className="w-32 h-full bg-primary/20 rounded-xl animate-pulse" />
            </div>

            {/* Badges Skeleton */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-success/20 animate-pulse" />
                  <div className="h-4 w-24 rounded-full bg-muted-foreground/10 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-muted-foreground/3">
        <div className="container-premium">
          <div className="h-10 w-48 bg-muted-foreground/8 rounded mb-12" />
          <TripsDestinationsSkeleton />
        </div>
      </section>

      <section className="section bg-background">
        <div className="container-premium">
          <div className="h-10 w-48 bg-muted-foreground/8 rounded mb-12" />
          <ProvidersSkeleton />
        </div>
      </section>
    </>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="card-premium overflow-hidden animate-pulse">
      <div className="aspect-16/10 bg-muted-foreground/8" />
      <div className="p-6">
        <div className="h-4 w-1/3 bg-muted-foreground/8 rounded mb-3" />
        <div className="h-5 w-3/4 bg-muted-foreground/8 rounded mb-3" />
        <div className="flex gap-3 mb-4">
          <div className="h-4 w-16 bg-muted-foreground/8 rounded" />
          <div className="h-4 w-16 bg-muted-foreground/8 rounded" />
          <div className="h-4 w-12 bg-muted-foreground/8 rounded" />
        </div>
        <div className="h-4 w-1/2 bg-muted-foreground/8 rounded mb-4" />
        <div className="h-6 w-24 bg-muted-foreground/8 rounded mb-4" />
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-muted-foreground/8 rounded" />
          <div className="h-10 flex-1 bg-muted-foreground/8 rounded" />
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
            <div className="h-12 w-64 bg-muted-foreground/5 rounded-xl mx-auto mb-4" />
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="h-14 bg-background rounded-xl w-full overflow-hidden border border-border/50">
              <div className="h-full w-full bg-muted-foreground/3 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container-premium">
          <div className="flex gap-8">
            <div className="hidden lg:block w-64 shrink-0">
              <div className="card-premium p-6 space-y-6">
                <div className="h-6 w-24 bg-muted-foreground/8 rounded mb-4" />
                <div className="space-y-4">
                  <div className="h-4 w-full bg-muted-foreground/5 rounded" />
                  <div className="h-4 w-full bg-muted-foreground/5 rounded" />
                  <div className="h-4 w-full bg-muted-foreground/5 rounded" />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between mb-8">
                <div className="h-10 w-32 bg-muted-foreground/8 rounded" />
                <div className="h-10 w-40 bg-muted-foreground/8 rounded" />
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

export function SimplePageSkeleton() {
  return (
    <>
      <section className="relative pt-32 pb-16 bg-muted-foreground/5 animate-pulse">
        <div className="container-premium text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-4 w-32 bg-muted-foreground/8 rounded-full mx-auto" />
            <div className="h-12 w-3/4 bg-muted-foreground/8 rounded-xl mx-auto" />
            <div className="h-5 w-1/2 bg-muted-foreground/8 rounded-lg mx-auto" />
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container-premium">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <div className="h-8 w-48 bg-muted-foreground/8 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted-foreground/5 rounded" />
                <div className="h-4 w-full bg-muted-foreground/5 rounded" />
                <div className="h-4 w-5/6 bg-muted-foreground/5 rounded" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-video bg-muted-foreground/8 rounded-2xl" />
              <div className="space-y-4 flex flex-col justify-center">
                <div className="h-6 w-32 bg-muted-foreground/8 rounded" />
                <div className="h-4 w-full bg-muted-foreground/5 rounded" />
                <div className="h-4 w-full bg-muted-foreground/5 rounded" />
                <div className="h-4 w-3/4 bg-muted-foreground/5 rounded" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-8 w-48 bg-muted-foreground/8 rounded-lg" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card-premium p-6 space-y-3">
                    <div className="h-10 w-10 bg-muted-foreground/8 rounded-xl" />
                    <div className="h-5 w-32 bg-muted-foreground/8 rounded" />
                    <div className="h-4 w-full bg-muted-foreground/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
