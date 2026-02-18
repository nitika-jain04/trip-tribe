import React from "react";
import PrivacyDescriptive from "@/app/components/PrivacyDescriptive";

function page() {
  const infowecollect = [
    "Name and contact information (email address, phone number)",
    "Company information (for partners)",
    "Messages and inquiries sent through our contact forms",
    "Usage data and analytics (pages visited, time spent, etc.)",
  ];
  const useinfo = [
    "Respond to your inquiries and provide customer support",
    "Facilitate connections between travelers and travel operators",
    "Send marketing communications (with your consent)",
    "Improve our website and services",
    "Comply with legal obligations",
  ];

  const infoSharing = [
    "Partner travel operators (only when you express interest in their trips)",
    "Service providers who assist in operating our website",
    "Law enforcement or regulatory authorities when required by law",
  ];

  const rights = [
    "Access, correct, or delete your personal information",
    "Opt-out of marketing communications",
    "Request information about how we use your data",
  ];

  return (
    <div className="px-5 md:px-8 lg:px-24 xl:px-28 2xl:px-36 py-24 flex flex-col gap-12">
      <div className="flex flex-col gap-4 md:gap-6">
        <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Privacy Policy
        </p>

        <p className="text-sm text-overlay-muted">Last updated: March 2024</p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8 flex flex-col gap-5">
        <p className="text-2xl sm:text-3xl font-bold">Introduction</p>
        <p className="text-sm md:text-base text-overlay-muted leading-relaxed">
          TripTribe (&quot;we,&quot; &quot;our,&quot; or &quot;us) is committed
          to protecting your privacy. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you visit
          our website or use our services.
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <PrivacyDescriptive
          heading="Information We Collect"
          description="We collect information that you provide directly to us, including:"
          bulletpoints={infowecollect}
        />
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <PrivacyDescriptive
          heading="How We Use Your Information"
          description="We use the information we collect to:"
          bulletpoints={useinfo}
        />
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <PrivacyDescriptive
          heading="Information Sharing"
          description="TripTribe is a comparison and referral platform. We do not process bookings or payments. When you click on a trip to book, you will be redirected to the partner operator's website where their own privacy policies apply. We may share your information with:"
          bulletpoints={infoSharing}
        />
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8 flex flex-col gap-5">
        <p className="text-2xl sm:text-3xl font-bold">Cookies and Tracking</p>
        <p className="text-sm md:text-base text-overlay-muted leading-relaxed">
          We use cookies and similar tracking technologies to enhance your
          experience, analyze website traffic, and understand user behavior. You
          can control cookie preferences through your browser settings.
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8 flex flex-col gap-5">
        <p className="text-2xl sm:text-3xl font-bold">Data Security</p>
        <p className="text-sm md:text-base text-overlay-muted leading-relaxed">
          We implement reasonable security measures to protect your information.
          However, no method of transmission over the internet is 100% secure,
          and we cannot guarantee absolute security.
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <PrivacyDescriptive
          heading="Your Rights"
          description="You have the right to:"
          bulletpoints={rights}
        />
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8 flex flex-col gap-5 mb-10">
        <p className="text-2xl sm:text-3xl font-bold">Contact Us</p>
        <p className="text-sm md:text-base text-overlay-muted leading-relaxed">
          If you have questions about this Privacy Policy or our data practices,
          please contact us at contact@triptribe.in
        </p>
      </div>
    </div>
  );
}

export default page;
