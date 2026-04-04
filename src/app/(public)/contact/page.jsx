"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useToast } from "@/app/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "For general inquiries",
    value: "admin@triptribe.co",
    href: "mailto:admin@triptribe.co",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon-Fri, 9am-6pm IST",
    value: "+91 88005 90295",
    href: "tel:+918800590295",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Our office",
    value: "Gurugram, India",
    href: "#",
  },
];

const faqs = [
  {
    question: "How does TripTribe work?",
    answer:
      "TripTribe aggregates community trips from verified providers. You can search, compare trips side-by-side, read verified reviews, and book directly with the provider.",
  },
  {
    question: "Does TripTribe organize trips?",
    answer:
      "No, TripTribe is an aggregator platform. We connect travelers with verified community trip providers. All trips are organized by our partner providers.",
  },
  {
    question: "How are providers verified?",
    answer:
      "All providers go through our verification process including license checks, safety audits, and review of past customer feedback before being listed on the platform.",
  },
  {
    question: "Can I compare trips from different providers?",
    answer:
      "Yes! Our comparison feature lets you select up to 3 trips and compare them side-by-side including price, duration, inclusions, and reviews.",
  },
  {
    question: "How do I become a partner provider?",
    answer:
      'Visit our "Become a Partner" page and fill out the application form. Our team will review your application and get back to you within 48 hours.',
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    inquiryType: "",
    tripId: "",
    operatorId: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trips, setTrips] = useState([]);
  const [operators, setOperators] = useState([]);

  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    // accepts +919876543210, 919876543210, 9876543210
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Enter valid phone number like 9876543210";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      scrollToFirstError();
      toast({
        title: "Error",
        description: "Please fix the errors",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: formData.name,
        email: formData.email.toLowerCase(),
        phone_number: formData.phone,
        inquiry_type: formData.inquiryType.toUpperCase(),
        subject: formData.subject,
        message: formData.message,
      };

      if (formData.inquiryType === "trip") {
        payload.trip_id = formData.tripId;
        // payload.operator_id = formData.operatorId;
      }

      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        toast({
          title: "Contact Mail",
          description: "Mail sent successfully",
          variant: "success",
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          inquiryType: "",
          tripId: "",
          operatorId: "",
          message: "",
        });
      } else {
        const message = data?.error?.message || "Application failed";

        if (data?.error?.code === "VALIDATION_ERROR") {
          const apiErrors = {};

          // Smart field detection (you can expand this)
          if (message.toLowerCase().includes("email")) {
            apiErrors.email = message;
          } else if (message.toLowerCase().includes("phone")) {
            apiErrors.phone = message;
          }

          setErrors((prev) => ({
            ...prev,
            ...apiErrors,
          }));
        }

        toast({
          title: "Error",
          description: data?.error?.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchOperators();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/trips`);
      const data = await res.json();
      if (data.success) setTrips(data?.result?.trips || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const fetchOperators = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/${API_VERSION}/operators`);
      const data = await res.json();
      if (data.success) setOperators(data?.result?.operators || []);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstError = document.querySelector(".text-admin-error");
      if (firstError) {
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary-light via-background to-background" />
        <div className="container-premium relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-body-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4" />
              Get in Touch
            </div>

            <h1 className="font-display text-display-lg md:text-display-xl text-foreground mb-6 leading-16">
              We&apos;d Love to{" "}
              <span className="text-gradient">Hear From You</span>
            </h1>

            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about trips, partnerships, or anything else? Our
              team is here to help.
            </p>

            <Button
              className="btn-primary text-body px-8 py-6 mt-3"
              onClick={() =>
                document
                  .getElementById("apply")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Contact Us
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-background">
        <div className="container-premium">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                className="card-premium p-8 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 transition-all duration-300 group-hover:bg-primary group-hover:shadow-glow">
                  <method.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-display text-heading-sm text-foreground mb-2">
                  {method.title}
                </h3>
                <p className="text-body-sm text-muted-foreground mb-3">
                  {method.description}
                </p>
                <p className="text-body font-medium text-primary">
                  {method.value}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="section bg-muted/30" id="apply">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Form */}
            <div>
              <h2 className="font-display text-4xl text-foreground mb-2">
                Send Us a Message
              </h2>
              <p className="text-body text-muted-foreground mb-8">
                Fill out the form below and we&apos;ll respond shortly.
              </p>

              {isSubmitted ? (
                <div className="card-premium p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="font-display text-heading-sm text-foreground mb-3">
                    Message Sent!
                  </h3>
                  <p className="text-body text-muted-foreground mb-6">
                    Thank you for reaching out. We&apos;ll get back to you as
                    soon as possible.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    className="btn-secondary"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, name: value });

                          if (errors.name) {
                            setErrors((prev) => {
                              const updated = { ...prev };
                              delete updated.name;
                              return updated;
                            });
                          }
                        }}
                        className={`h-12 rounded-lg ${errors.name ? "border-red-500" : ""}`}
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="text-sm text-admin-error">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, email: value });

                          if (errors.email) {
                            setErrors((prev) => {
                              const updated = { ...prev };
                              delete updated.email;
                              return updated;
                            });
                          }
                        }}
                        className={`h-12 rounded-lg ${errors.email ? "border-red-500" : ""}`}
                        placeholder="you@email.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-admin-error">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone Number</Label>

                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        +91
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const digits = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                          setFormData((prev) => ({
                            ...prev,
                            phone: digits,
                          }));

                          if (errors.phone) {
                            setErrors((prev) => {
                              const updated = { ...prev };
                              delete updated.phone;
                              return updated;
                            });
                          }
                        }}
                        className={`h-12 rounded-lg pl-12 text-sm ${errors.phone ? "border-red-500" : ""}`}
                        placeholder="9876543210"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-admin-error">{errors.phone}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="inquiryType">Inquiry Type</Label>
                    <Select
                      required
                      value={formData.inquiryType}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          inquiryType: value,
                          tripId: value === "trip" ? formData.tripId : "",
                          operatorId:
                            value === "trip" ? formData.operatorId : "",
                        });
                      }}
                    >
                      <SelectTrigger className="h-12 rounded-lg">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="trip">Trip Question</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.inquiryType === "trip" && (
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <Label>Select Trip</Label>
                        <Select
                          value={formData.tripId}
                          onValueChange={(tripId) => {
                            const trip = trips.find((t) => t.id === tripId);

                            setFormData({
                              ...formData,
                              tripId,
                              operatorId: trip?.operator_id || "",
                            });
                          }}
                        >
                          <SelectTrigger className="h-12 rounded-lg">
                            <SelectValue placeholder="Select Trip" />
                          </SelectTrigger>

                          <SelectContent>
                            {trips.map((trip) => (
                              <SelectItem key={trip.id} value={trip.id}>
                                {trip.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Operator dropdown */}
                      <div className="flex flex-col gap-2">
                        <Label>Operator</Label>

                        <Select value={formData.operatorId} disabled>
                          <SelectTrigger className="h-12 rounded-lg">
                            <SelectValue placeholder="Operator auto-selected" />
                          </SelectTrigger>

                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.id} value={op.id}>
                                {op.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, subject: value });

                        if (errors.subject) {
                          setErrors((prev) => {
                            const updated = { ...prev };
                            delete updated.subject;
                            return updated;
                          });
                        }
                      }}
                      className={`h-12 rounded-lg ${errors.subject ? "border-red-500" : ""}`}
                      placeholder="How can we help?"
                    />
                    {errors.subject && (
                      <p className="text-sm text-admin-error">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, message: value });

                        if (errors.message) {
                          setErrors((prev) => {
                            const updated = { ...prev };
                            delete updated.message;
                            return updated;
                          });
                        }
                      }}
                      className={`h-12 rounded-lg ${errors.message ? "border-red-500" : ""}`}
                      placeholder="Tell us more..."
                      rows={5}
                    />
                    {errors.message && (
                      <p className="text-sm text-admin-error">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="btn-primary w-full h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div>
              <h2 className="font-display text-4xl text-foreground mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-body text-muted-foreground mb-8">
                Quick answers to common questions.
              </p>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="card-premium p-6">
                    <h3 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                      <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {faq.question}
                    </h3>
                    <p className="text-body text-muted-foreground pl-7">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Support Hours
                    </h4>
                    <p className="text-body-sm text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM IST
                      <br />
                      Saturday: 10:00 AM - 4:00 PM IST
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 bg-muted relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-2xl text-foreground mb-2">
              TripTribe HQ
            </h3>
            <p className="text-body text-muted-foreground">
              Gurugram
              <br />
              Haryana, India
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
