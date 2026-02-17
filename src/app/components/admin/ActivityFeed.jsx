"use client";

import { Users, MapPin, MessageSquare, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeIcons = {
  operator: Users,
  trip: MapPin,
  enquiry: MessageSquare,
  review: Star,
};

const typeColors = {
  operator: 'bg-primary/10 text-primary',
  trip: 'bg-success/10 text-success',
  enquiry: 'bg-warning/10 text-warning',
  review: 'bg-accent/10 text-accent',
};

// Next.js JSX component
export function ActivityFeed({ activities }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-4">
      {activities?.map((activity) => {
        const Icon = typeIcons[activity.type] || Users;
        return (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', typeColors[activity.type])}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {activity.action}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(activity.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
