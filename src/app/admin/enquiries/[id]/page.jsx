"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  MessageSquare,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { StatusBadge } from "@/app/components/admin/StatusBadge";
import { useToast } from "@/app/hooks/use-toast";
import Cookies from "js-cookie";
import { formatPhoneNumber } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

export default function EnquiryDetail() {
  const { toast } = useToast();
  const { id } = useParams();
  const router = useRouter();

  const [enquiry, setEnquiry] = useState(null);
  const [status, setStatus] = useState("new");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEnquiry = async () => {
      const token = Cookies.get("token");

      //console.log("id", id);

      try {
        const res = await fetch(
          `${BASE_URL}/api/${API_VERSION}/enquiries/admin/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();

        //console.log("res", data);

        const fetchedEnquiry =
          data?.result?.data?.find((e) => e.id === id) || data?.result || null;

        // if (!fetchedEnquiry) throw new Error("Enquiry not found");
        if (!fetchedEnquiry) {
          toast({
            title: "Error",
            description: "Enquiry not found",
            variant: "destructive",
          });
          return;
        }

        setEnquiry(fetchedEnquiry);
        setStatus(fetchedEnquiry.status?.toLowerCase() || "new");
        setAdminNotes(fetchedEnquiry.admin_notes || "");
      } catch (err) {
        console.error("Error fetching enquiry:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiry();
  }, [id, toast]);

  const handleSave = async () => {
    const token = Cookies.get("token");
    if (!enquiry) return;

    try {
      setSaving(true);

      const res = await fetch(
        `${BASE_URL}/api/${API_VERSION}/enquiries/admin/${enquiry.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: status.toUpperCase(),
            admin_notes: adminNotes,
          }),
        },
      );

      const updatedData = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description:
            updatedData?.error?.message || "Failed to update enquiry ",
          variant: "destructive",
        });
        return;
      }

      // update local state with latest data from server
      setEnquiry(updatedData.result || updatedData);

      if (res.ok) {
        toast({
          title: "Enquiry Updated",
          description: "The enquiry updated successfully.",
          variant: "success",
        });

        router.push("/admin/enquiries");
        return;
      }

      router.refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: "Error updating enquiry",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft size={25} />
          Back to Enquiries
        </Link>
        <div className="">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">
              Loading enquiry details...
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Please wait while we fetch the data
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Enquiry not found</p>
        <Button asChild className="mt-4">
          <Link href="/admin/enquiries">Back to Enquiries</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/admin/enquiries">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Enquiries
        </Link>
      </Button>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Enquiry Details
          </h1>
          <div className="flex gap-5">
            <p className="text-muted-foreground mt-1">
              Enquiry from {enquiry.full_name}
            </p>
            <StatusBadge status={enquiry.status.toLowerCase()} />
          </div>
        </div>
      </div>

      {/* Traveller Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Traveller Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pl-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">{enquiry.full_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-3 text-sm">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>
                Enquiry Type:{" "}
                {enquiry.inquiry_type
                  ?.replace("_", " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${enquiry.email}`}
                className="text-primary hover:underline"
              >
                {enquiry.email}
              </a>
            </div>

            {enquiry.phone_number && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:+91${enquiry.phone_number.replace(/\D/g, "").slice(-10)}`}
                  className="hover:underline"
                >
                  {formatPhoneNumber(enquiry.phone_number)}
                </a>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Enquired on {new Date(enquiry.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      {enquiry.inquiry_type === "TRIP" && enquiry.trip && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏔️ Trip Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Trip Name */}
              <div>
                <p className="text-sm text-muted-foreground">Trip Name</p>

                <Link
                  href={`/admin/trips/${enquiry.trip.id}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {enquiry.trip.name}
                </Link>
              </div>

              {/* Quick Action */}
              <div>
                <Link
                  href={`/admin/trips/${enquiry.trip.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  <Button>Open Trip →</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traveller Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-warning" />
            Traveller Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pl-6">
          {/* Subject */}
          {enquiry.subject && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Subject</p>
              <p className="font-medium">{enquiry.subject}</p>
            </div>
          )}

          {/* Message */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Message</p>
            <p className="text-foreground rounded-lg">{enquiry.message}</p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pl-6">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this enquiry..."
              rows={4}
              disabled={loading}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
