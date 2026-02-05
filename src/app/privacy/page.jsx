import React from "react";
import Footer from "../components/Footer";
import PrivacyDescriptive from "../components/PrivacyDescriptive";
import Navbar from "../components/Navbar";

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
    <div>
      <Navbar />

      <div className="px-5 md:px-20 flex flex-col gap-10 mt-5">
        <div className="flex flex-col gap-8">
          <p className="text-2xl sm:text-3xl font-bold">Privacy Policy</p>

          <p className="text-sm text-overlay-muted">Last updated: March 2024</p>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          <p className="text-2xl sm:text-3xl font-bold">Introduction</p>
          <p className="text-sm md:text-base text-overlay-muted">
            TripTribe (&quot;we,&quot; &quot;our,&quot; or &quot;us) is
            committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when
            you visit our website or use our services.
          </p>
        </div>

        <PrivacyDescriptive
          heading="Information We Collect"
          description="We collect information that you provide directly to us, including:"
          bulletpoints={infowecollect}
        />

        <PrivacyDescriptive
          heading="How We Use Your Information"
          description="We use the information we collect to:"
          bulletpoints={useinfo}
        />

        <PrivacyDescriptive
          heading="Information Sharing"
          description="TripTribe is a comparison and referral platform. We do not process
            bookings or payments. When you click on a trip to book, you will be
            redirected to the partner operator's website where their own
            privacy policies apply. We may share your information with:"
          bulletpoints={infoSharing}
        />

        <div className="flex flex-col gap-5">
          <p className="text-2xl sm:text-3xl font-bold">Cookies and Tracking</p>
          <p className="text-sm md:text-base text-overlay-muted">
            We use cookies and similar tracking technologies to enhance your
            experience, analyze website traffic, and understand user behavior.
            You can control cookie preferences through your browser settings.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-2xl sm:text-3xl font-bold">Data Security</p>
          <p className="text-sm md:text-base text-overlay-muted">
            We implement reasonable security measures to protect your
            information. However, no method of transmission over the internet is
            100% secure, and we cannot guarantee absolute security.
          </p>
        </div>

        <PrivacyDescriptive
          heading="Your Rights"
          description="You have the right to:"
          bulletpoints={rights}
        />

        <div className="flex flex-col gap-5 mb-20">
          <p className="text-2xl sm:text-3xl font-bold">Contact Us</p>
          <p className="text-sm md:text-base text-overlay-muted">
            If you have questions about this Privacy Policy or our data
            practices, please contact us at contact@triptribe.in
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default page;
