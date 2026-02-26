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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default function DashboardPage() {
  const [stats, setStats] = useState({
    operators: {
      total: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
    },
    trips: {
      total: 0,
      live: 0,
      draft: 0,
      archived: 0,
    },
    enquiries: {
      total: 0,
      new: 0,
      in_progress: 0,
      closed: 0,
    },
  });

  const [enquiryChart, setEnquiryChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = Cookies.get("token");

        const [operatorsRes, tripsRes, enquiriesStatsRes, enquiriesRes] =
          await Promise.all([
            fetch(`${BASE_URL}/api/${API_VERSION}/operators/admin`, {
              headers: { Authorization: `Bearer ${token}` },
            }),

            fetch(`${BASE_URL}/api/${API_VERSION}/trips/admin`, {
              headers: { Authorization: `Bearer ${token}` },
            }),

            fetch(`${BASE_URL}/api/${API_VERSION}/enquiries/admin/stats`, {
              headers: { Authorization: `Bearer ${token}` },
            }),

            fetch(`${BASE_URL}/api/${API_VERSION}/enquiries/admin`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        const operatorsData = await operatorsRes.json();
        const tripsData = await tripsRes.json();
        const enquiriesStatsData = await enquiriesStatsRes.json();
        const enquiriesData = await enquiriesRes.json();

        // -------- Operators --------
        // -------- Operators --------
        const operators = operatorsData?.result?.operators || [];

        const activeOperators = operators.filter(
          (op) => op.status === "ACTIVE",
        ).length;

        const inactiveOperators = operators.filter(
          (op) => op.status === "INACTIVE",
        ).length;

        const suspendedOperators = operators.filter(
          (op) => op.status === "SUSPENDED",
        ).length;

        // -------- Trips --------
        const trips = tripsData?.result?.trips || [];

        const liveTrips = trips.filter((t) => t.status === "PUBLISHED").length;

        const draftTrips = trips.filter((t) => t.status === "DRAFT").length;

        const archivedTrips = trips.filter(
          (t) => t.status === "ARCHIVED",
        ).length;

        // -------- Enquiries stats --------
        const enquiryStats = enquiriesStatsData?.result;

        // -------- Enquiry graph --------
        const enquiries = enquiriesData?.result?.data || [];

        // const last7Days = {};
        // const today = new Date();

        // for (let i = 6; i >= 0; i--) {
        //   const d = new Date();
        //   d.setDate(today.getDate() - i);
        //   const key = d.toLocaleDateString("en-US", { weekday: "short" });

        //   last7Days[key] = 0;
        // }

        // enquiries.forEach((enq) => {
        //   const date = new Date(enq.createdAt);
        //   const key = date.toLocaleDateString("en-US", {
        //     weekday: "short",
        //   });

        //   if (last7Days[key] !== undefined) {
        //     last7Days[key]++;
        //   }
        // });

        // const chartData = Object.entries(last7Days).map(
        //   ([name, enquiries]) => ({
        //     name,
        //     enquiries,
        //   }),
        // );

        const last7Days = {};
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);

          const dateKey = d.toISOString().split("T")[0]; // unique key
          const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

          last7Days[dateKey] = {
            name: dayLabel,
            enquiries: 0,
          };
        }

        enquiries.forEach((enq) => {
          const dateKey = new Date(enq.createdAt).toISOString().split("T")[0];

          if (last7Days[dateKey]) {
            last7Days[dateKey].enquiries++;
          }
        });

        const chartData = Object.values(last7Days);
        setEnquiryChart(chartData);

        setStats({
          operators: {
            total: operators.length,
            active: activeOperators,
            inactive: inactiveOperators,
            suspended: suspendedOperators,
          },
          trips: {
            total: trips.length,
            live: liveTrips,
            draft: draftTrips,
            archived: archivedTrips,
          },
          enquiries: {
            total: enquiryStats.total,
            new: enquiryStats.byStatus.new,
            in_progress: enquiryStats.byStatus.in_progress,
            resolved: enquiryStats.byStatus.resolved,
            closed: enquiryStats.byStatus.closed,
          },
        });
      } catch (err) {
        console.error(err);
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
            subtitle={`${stats.operators.active} active, ${stats.operators.inactive} inactive, ${stats.operators.suspended} suspended`}
            icon={Users}
            variant="primary"
          />

          <StatCard
            title="Total Trips"
            value={stats.trips.total}
            subtitle={`${stats.trips.live} live, ${stats.trips.draft} draft, ${stats.trips.archived} archived`}
            icon={MapPin}
            variant="success"
          />

          <StatCard
            title="Total Enquiries"
            value={stats.enquiries.total}
            subtitle={`${stats.enquiries.new} new, ${stats.enquiries.in_progress} in-progress, ${stats.enquiries.closed} closed`}
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
                Enquiries This Week
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
          {/* <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities} />
            </CardContent>
          </Card> */}
        </div>
      </div>
    </AdminGuard>
  );
}
