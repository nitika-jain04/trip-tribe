"use client";

import { Users, MapPin, MessageSquare, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { StatCard } from "@/app/components/admin/StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AdminGuard from "@/app/components/AdminGuard";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ActivityFeed } from "@/app/components/admin/ActivityFeed";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default function DashboardPage() {
  const [stats, setStats] = useState({
    operators: {
      total: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
      pending_approval: 0,
      change_percent: 0,
    },
    trips: {
      total: 0,
      live: 0,
      draft: 0,
      archived: 0,
      cancelled: 0,
      change_percent: 0,
    },
    enquiries: {
      total: 0,
      this_week: 0,
      this_month: 0,
      change_percent: 0,
    },
    reviews_pending: 0,
  });

  const [enquiryChart, setEnquiryChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  const mapActivityType = (type) => {
    switch (type) {
      case "TRIP_ADDED":
        return "trip";
      case "NEW_ENQUIRY":
        return "enquiry";
      case "OPERATOR_REGISTERED":
        return "operator";
      case "REVIEW_SUBMITTED":
        return "review";
      default:
        return "operator";
    }
  };

  const formatAction = (type) => {
    switch (type) {
      case "TRIP_ADDED":
        return "Trip added";
      case "NEW_ENQUIRY":
        return "New enquiry received";
      case "OPERATOR_REGISTERED":
        return "New operator registered";
      case "REVIEW_SUBMITTED":
        return "Review submitted";
      default:
        return "Activity";
    }
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = Cookies.get("token");

        const res = await fetch(`${BASE_URL}/api/${API_VERSION}/dashboard`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const result = data?.result;

        if (!result) return;

        /* ---------- Stats Mapping ---------- */

        setStats({
          operators: {
            total: result.stats.operators.total,
            active: result.stats.operators.status_counts?.ACTIVE || 0,
            inactive: result.stats.operators.status_counts?.INACTIVE || 0,
            suspended: result.stats.operators.status_counts?.SUSPENDED || 0,
            pending_approval: result.stats.operators.pending_approval || 0,
            change_percent: result.stats.operators.change_percent || 0,
          },

          trips: {
            total: result.stats.trips.total,
            live: result.stats.trips.status_counts?.PUBLISHED || 0,
            draft: result.stats.trips.status_counts?.DRAFT || 0,
            archived: result.stats.trips.status_counts?.ARCHIVED || 0,
            cancelled: result.stats.trips.status_counts?.CANCELLED || 0,
            change_percent: result.stats.trips.change_percent || 0,
          },

          enquiries: {
            total: result.stats.enquiries.total,
            this_week: result.stats.enquiries.this_week,
            this_month: result.stats.enquiries.this_month,
            change_percent: result.stats.enquiries.change_percent,
          },

          reviews_pending: result.stats.reviews_pending || 0,
        });

        /* ---------- Activity Mapping ---------- */

        const formattedActivities = result.recent_activity.map(
          (item, index) => ({
            id: index,
            type: mapActivityType(item.type),
            action: formatAction(item.type),
            description: item.message,
            timestamp: item.created_at,
          }),
        );

        setActivities(formattedActivities);

        /* ---------- Chart Mapping ---------- */

        const formattedChart = result.charts.enquiry_trends.data.map(
          (item) => ({
            name: item.month,
            enquiries: item.count,
          }),
        );

        setEnquiryChart(formattedChart);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <AdminGuard>
        <div className="space-y-6 p-6">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-75 w-full" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your TripTribe platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Operators"
            value={stats.operators.total}
            subtitle={`${stats.operators.active} active • ${stats.operators.inactive} inactive • ${stats.operators.suspended} suspended • ${stats.operators.pending_approval} pending`}
            icon={Users}
            variant="primary"
          />

          <StatCard
            title="Total Trips"
            value={stats.trips.total}
            subtitle={`${stats.trips.live} live, ${stats.trips.draft} draft, ${stats.trips.archived} archived, ${stats.trips.cancelled} cancelled`}
            icon={MapPin}
            variant="success"
          />
          <StatCard
            title="Total Enquiries"
            value={stats.enquiries.total}
            subtitle={`${stats.enquiries.this_week} this week, ${stats.enquiries.this_month} this month`}
            icon={MessageSquare}
            variant="warning"
          />

          {/* <StatCard
          title="Pending Reviews"
          value={dashboardStats.pendingReviews}
          subtitle={`${dashboardStats.approvedReviews} approved`}
          icon={Star}
          variant="accent"
        /> */}
        </div>
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Enquiry Trends (Last 6 Months)
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={enquiryChart}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="enquiries"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Popular Destinations Chart */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-success" />
                Popular Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={destinationChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="views"
                    fill="hsl(var(--success))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}
        </div>
        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Destinations Table */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Top 5 Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destination</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-right">Trips</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {destinations.slice(0, 5).map((dest) => (
                    <TableRow key={dest.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={dest.imageUrl}
                            alt={dest.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                          {dest.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {dest.region}
                      </TableCell>
                      <TableCell className="text-right">
                        {dest.tripCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card> */}

          {/* Recent Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {(!activities || activities.length === 0) && (
                <div className="text-sm text-muted-foreground text-center py-6">
                  No recent activity
                </div>
              )}
              <ActivityFeed activities={activities} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
