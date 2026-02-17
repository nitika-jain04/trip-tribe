"use client";

import { Card, CardContent } from '@/app/components/ui/card';
import { cn } from '@/lib/utils';

// Next.js JSX component
export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}) {
  const iconBgVariants = {
    default: 'bg-muted',
    primary: 'bg-primary/10',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    accent: 'bg-accent/10',
  };

  const iconColorVariants = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    accent: 'text-accent',
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {value}
            </p>

            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}

            {trend && (
              <p
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
              </p>
            )}
          </div>

          <div
            className={cn(
              'p-3 rounded-lg',
              iconBgVariants[variant] || iconBgVariants.default
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  'h-6 w-6',
                  iconColorVariants[variant] || iconColorVariants.default
                )}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
