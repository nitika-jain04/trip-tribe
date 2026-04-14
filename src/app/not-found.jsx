import Link from "next/link";
import { BiTrip } from "react-icons/bi";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-10 top-10 h-50 w-50 rounded-full bg-purple-400/20 blur-2xl" />
        <div className="absolute bottom-10 left-10 h-50 w-50 rounded-full bg-blue-400/20 blur-2xl" />
      </div>

      <div className="text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 shadow-lg">
            <BiTrip className="h-10 w-10 text-primary" />
          </div>
        </div>

        {/* 404 linear text */}
        <h1 className="mb-2 text-8xl font-extrabold text-gradient">404</h1>

        {/* Title */}
        <h2 className="mb-3 text-2xl font-semibold text-foreground">
          Lost in your journey?
        </h2>

        {/* Description */}
        <p className="mb-8 max-w-md text-muted-foreground mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back to exploring amazing trips.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            Back To Home
          </Link>
        </div>
      </div>
    </div>
  );
}
