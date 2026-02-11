"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import Input from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import {
  Users,
  TrendingUp,
  Shield,
  Star,
  CheckCircle2,
  ArrowRight,
  Globe,
  BarChart3,
  Headphones,
} from "lucide-react";
import { toast } from "@/app/components/ui/sonner";

const benefits = [
  {
    icon: Users,
    title: "Reach More Travelers",
    description:
      "Get discovered by thousands of travelers actively searching for community trips.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description:
      "Fill more seats with qualified leads. Our platform drives high-intent bookings.",
  },
  {
    icon: Shield,
    title: "Build Trust",
    description:
      "Verified badge and authentic reviews help build credibility with new travelers.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track views, enquiries, and bookings. Understand what travelers want.",
  },
  {
    icon: Globe,
    title: "Market Presence",
    description:
      "Be part of India's fastest-growing community travel aggregator.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description:
      "Our partner success team helps you optimize listings and grow bookings.",
  },
];

const steps = [
  {
    number: "01",
    title: "Apply to Join",
    description:
      "Fill out our partner application form with your business details and trip portfolio.",
  },
  {
    number: "02",
    title: "Verification",
    description:
      "Our team verifies your credentials, safety standards, and customer reviews.",
  },
  {
    number: "03",
    title: "Onboarding",
    description:
      "Get a dedicated account manager to help set up your profile and list trips.",
  },
  {
    number: "04",
    title: "Go Live",
    description:
      "Your trips appear in search results. Start receiving enquiries and bookings.",
  },
];

const stats = [
  { value: "50+", label: "Partner Providers" },
  { value: "25K+", label: "Monthly Visitors" },
  { value: "40%", label: "Avg. Booking Increase" },
  { value: "4.8", label: "Partner Satisfaction" },
];

export default function Partner() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    tripCount: "",
    regions: "",
    about: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Application submitted! We'll be in touch within 48 hours.");
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-linear-to-br from-primary-light via-background to-background overflow-hidden">
        <div className="absolute top-1/4 right-0 w-150 h-150 bg-primary/5 rounded-full blur-3xl" />

        <div className="container-premium relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-body-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Partner with TripTribe
            </div>

            <h1 className="font-display text-display-lg text-foreground mb-6">
              Grow Your Trip <span className="text-gradient">Business</span>
            </h1>

            <p className="text-body-lg text-muted-foreground mb-8">
              Join India&apos;s leading community trip aggregator. Reach
              thousands of travelers looking for authentic group experiences.
            </p>

            <Button
              className="btn-primary text-body px-8 py-6"
              onClick={() =>
                document
                  .getElementById("apply")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Apply to Join
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-foreground text-background">
        <div className="container-premium">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-display text-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-body-sm text-background/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-background">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-body-sm font-medium text-primary uppercase tracking-wider mb-4">
              Why Partner With Us
            </p>
            <h2 className="font-display text-display text-foreground mb-6">
              Benefits for <span className="text-gradient">Providers</span>
            </h2>
            <p className="text-body-lg text-muted-foreground">
              We help community trip organizers reach more travelers and grow
              their business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="card-premium p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-heading text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-body text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-muted/30">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-body-sm font-medium text-primary uppercase tracking-wider mb-4">
              Getting Started
            </p>
            <h2 className="font-display text-display text-foreground mb-6">
              How to <span className="text-gradient">Join</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-primary to-primary/30" />
                )}
                <div className="card-premium p-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-display text-heading-sm mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-display text-heading text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-body-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="section bg-background">
        <div className="container-premium">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-body-sm font-medium text-primary uppercase tracking-wider mb-4">
                Apply Now
              </p>
              <h2 className="font-display text-display text-foreground mb-4">
                Partner Application
              </h2>
              <p className="text-body text-muted-foreground">
                Fill out the form below and our team will get back to you within
                48 hours.
              </p>
            </div>

            {isSubmitted ? (
              <div className="card-premium p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <h3 className="font-display text-heading-lg text-foreground mb-3">
                  Application Received!
                </h3>
                <p className="text-body text-muted-foreground mb-6">
                  Thank you for your interest in partnering with TripTribe. Our
                  team will review your application and reach out within 48
                  hours.
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  className="btn-secondary"
                >
                  Submit Another Application
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="card-premium p-8 space-y-6"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="companyName">Company / Brand Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                      placeholder="Your travel company name"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contactName">Contact Person *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactName: e.target.value,
                        })
                      }
                      placeholder="Full name"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="business@email.com"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="website">Website / Social Media</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://yourwebsite.com or Instagram handle"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="tripCount">
                      Number of Trips Organized (per year)
                    </Label>
                    <Input
                      id="tripCount"
                      value={formData.tripCount}
                      onChange={(e) =>
                        setFormData({ ...formData, tripCount: e.target.value })
                      }
                      placeholder="e.g., 20-30"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="regions">Regions You Operate In</Label>
                    <Input
                      id="regions"
                      value={formData.regions}
                      onChange={(e) =>
                        setFormData({ ...formData, regions: e.target.value })
                      }
                      placeholder="e.g., Himalayas, Northeast, South India"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="about">Tell Us About Your Business *</Label>
                  <Textarea
                    id="about"
                    value={formData.about}
                    onChange={(e) =>
                      setFormData({ ...formData, about: e.target.value })
                    }
                    placeholder="What kind of trips do you organize? What makes your experiences unique?"
                    rows={4}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="btn-primary w-full py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>

                <p className="text-body-sm text-muted-foreground text-center">
                  By submitting, you agree to our terms of service and partner
                  agreement.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section bg-primary text-primary-foreground">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 fill-accent text-accent" />
              ))}
            </div>
            <blockquote className="font-display text-heading-lg md:text-display mb-8">
              &quot;Since joining TripTribe, our bookings have increased by 45%.
              The platform brings us qualified travelers who are genuinely
              interested in community trips.&quot;
            </blockquote>
            <div>
              <p className="font-semibold">Vikram Singh</p>
              <p className="text-primary-foreground/70">
                Founder, Himalayan Explorers
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
