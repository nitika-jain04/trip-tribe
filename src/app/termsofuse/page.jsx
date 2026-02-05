import React from "react";
import PrivacyDescriptive from "../components/PrivacyDescriptive";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function page() {
  const natureofService = [
    "Process bookings or payments",
    "Operate as a travel agency or tour operator",
    "Provide travel services directly",
    "Act as an agent for any travel operator",
  ];

  const thirdPartyServices = [
    "The quality, safety, or legality of trips offered by partner operators",
    "The accuracy of information provided by partner operators",
    "Disputes between users and partner operators",
    "Cancellations, delays, or changes made by partner operators",
  ];

  const userConduct = [
    "Use our services for any illegal or unauthorized purpose",
    "Interfere with or disrupt our website or servers",
    "Submit false or misleading information",
    "Violate any applicable laws or regulations",
  ];

  return (
    <div>
      <Navbar />

      <div className="px-5 md:px-20 flex flex-col gap-10 mt-5">
        <div className="flex flex-col gap-8">
          <p className="text-4xl md:text-5xl font-bold tracking-tight">
            Terms of Use
          </p>

          <p className="text-sm text-overlay-muted">Last updated: March 2024</p>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          <p className="text-3xl font-bold">Acceptance of Terms</p>
          <p className="text-base text-overlay-muted">
            By accessing and using TripTribe&apos;s website and services, you
            accept and agree to be bound by these Terms of Use. If you do not
            agree to these terms, please do not use our services.
          </p>
        </div>

        <PrivacyDescriptive
          heading="Nature of Service"
          description="TripTribe is a comparison and referral platform for community travel experiences. We aggregate information about group trips from various travel operators and provide tools to help users compare options. TripTribe does not:"
          bulletpoints={natureofService}
        />

        <PrivacyDescriptive
          heading="Third-Party Services"
          description="When you click through to book a trip, you will be directed to a partner operator's website. All bookings, payments, and travel arrangements are made directly with that operator. Their terms and conditions, cancellation policies, and privacy policies apply to your booking. TripTribe is not responsible for:"
          bulletpoints={thirdPartyServices}
        />

        <div className="flex flex-col gap-5">
          <p className="text-3xl font-bold">Information Accuracy</p>
          <p className="text-base text-overlay-muted">
            We strive to provide accurate and up-to-date information about trips
            and operators. However, prices, availability, and trip details may
            change without notice. Always verify information directly with the
            operator before booking.
          </p>
        </div>

        <PrivacyDescriptive
          heading="User Conduct"
          description="You agree not to:"
          bulletpoints={userConduct}
        />

        <div className="flex flex-col gap-5">
          <p className="text-3xl font-bold">Intellectual Property</p>
          <p className="text-base text-overlay-muted">
            All content on TripTribe, including text, graphics, logos, and
            software, is owned by TripTribe or its licensors and is protected by
            copyright and other intellectual property laws. You may not
            reproduce, distribute, or create derivative works without our
            written permission.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-3xl font-bold">Disclaimer of Warranties</p>
          <p className="text-base text-overlay-muted">
            TripTribe&apos;s services are provided &quot;as is&quot; and
            &quot;as available&quot; without warranties of any kind, either
            express or implied. We do not warrant that our services will be
            uninterrupted, secure, or error-free.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-3xl font-bold">Limitation of Liability</p>
          <p className="text-base text-overlay-muted">
            To the maximum extent permitted by law, TripTribe shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits or revenues, whether
            incurred directly or indirectly.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-3xl font-bold">Changes to Terms</p>
          <p className="text-base text-overlay-muted">
            We reserve the right to modify these Terms of Use at any time.
            Changes will be effective immediately upon posting. Your continued
            use of our services after changes are posted constitutes acceptance
            of the modified terms.
          </p>
        </div>

        <div className="flex flex-col gap-5 mb-20">
          <p className="text-3xl font-bold">Contact Information</p>
          <p className="text-base text-overlay-muted">
            For questions about these Terms of Use, please contact us at
            <span className="text-[#6dd5ce]">
              <a href="mailto:contact@triptribe.in?subject=TripTribe%20Support%20Inquiry&body=Hi%20TripTribe%20Team,%0A%0AI'm%20reaching%20out%20regarding%20...%0A%0AThanks,">
                {" "}
                contact@triptribe.in
              </a>
            </span>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default page;
