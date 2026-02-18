"use client";

import {
  Users,
  MapPin,
  MessageSquare,
  Star,
  TrendingUp,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { StatCard } from "@/app/components/admin/StatCard";
import {
  dashboardStats,
  activities,
  enquiryChartData,
  destinationChartData,
  destinations,
} from "@/app/data/mockData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import AdminGuard from "@/app/components/AdminGuard";

// Next.js App Router page component
export default function DashboardPage() {
  return (
    <AdminGuard>
      <div className="space-y-6 p-6">
        {/* Page Header */}
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
            value={dashboardStats.totalOperators}
            subtitle={`${dashboardStats.activeOperators} active`}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Live Trips"
            value={dashboardStats.liveTrips}
            subtitle={`${dashboardStats.draftTrips} drafts, ${dashboardStats.archivedTrips} archived`}
            icon={MapPin}
            variant="success"
          />
          <StatCard
            title="Enquiries This Week"
            value={dashboardStats.enquiriesThisWeek}
            subtitle={`${dashboardStats.newEnquiries} new`}
            icon={MessageSquare}
            variant="warning"
            trend={{ value: 15, isPositive: true }}
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
          {/* Enquiries Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Enquiries This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={enquiryChartData}>
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
          <Card>
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
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Destinations Table */}
          <Card>
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
          </Card>

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
