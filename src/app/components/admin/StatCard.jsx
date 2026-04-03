"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  change,
}) {
  const iconBgVariants = {
    default: "bg-muted",
    primary: "bg-primary/10",
    success: "bg-success/10",
    warning: "bg-warning/10",
    accent: "bg-accent/10",
  };

  const iconColorVariants = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    accent: "text-accent",
  };

  const isPositive = change >= 0;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>

            {/* Value + Change */}
            <div className="flex items-center gap-2 transition-all duration-300">
              <p className="text-3xl font-bold text-foreground transition-all duration-500">
                {value}
              </p>

              {typeof change === "number" && (
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded",
                    isPositive
                      ? "text-green-600 bg-green-100"
                      : "text-red-600 bg-red-100",
                  )}
                >
                  {isPositive ? "↑" : "↓"} {Math.abs(change)}%
                </span>
              )}
            </div>

            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Icon */}
          <div
            className={cn(
              "p-3 rounded-lg transition-transform duration-300 group-hover:scale-110",
              iconBgVariants[variant] || iconBgVariants.default,
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "h-6 w-6",
                  iconColorVariants[variant] || iconColorVariants.default,
                )}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
