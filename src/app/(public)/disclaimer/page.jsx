"use client";

import React from "react";

const disclaimerSections = [
  {
    title: "Service Provision",
    content:
      "Triptribe provides the www.triptribe.co Web site as a service to the user and Web site owners.",
  },
  {
    title: "Limitation of Liability",
    content:
      "Triptribe is not responsible for, and expressly disclaims all liability for, damages of any kind arising out of use, reference to, or reliance on any information contained within the site. While the information contained within the site is periodically updated, no guarantee is given that the information provided in this Website is correct, complete, and up-to-date.",
  },
  {
    title: "Third-Party Links",
    content:
      "Although the Triptribe Website may include links providing direct access to other Internet resources, including Web sites, Triptribe is not responsible for the accuracy or content of information contained in these sites.",
  },
  {
    title: "No Endorsement",
    content:
      "Links from Triptribe.co to third-party sites do not constitute an endorsement by Triptribe of the parties or their products and services. The appearance on the Web site of advertisements and product or service information does not constitute an endorsement by Triptribe.",
  },
];

const DisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground/80">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary/5 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.light),theme(colors.background))] opacity-20" />
        <div className="px-5 md:px-28">
          <div className="flex flex-col gap-6 animate-fade-up">
            <div className="w-fit inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              Last updated: April 14, 2026
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
              Disclaimer
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-overlay-muted">
              Please read our general disclaimer regarding the information
              provided on our website and our responsibility towards third-party
              services.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 md:px-28 mt-12 pb-24">
        <div className="max-w-4xl space-y-12">
          {disclaimerSections.map((section, index) => (
            <div
              key={index}
              className="animate-fade-up scroll-mt-32"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="bg-card p-8 md:p-10 rounded-3xl shadow-sm border border-border group hover:border-primary/20 transition-all duration-300">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-sans">
                    0{index + 1}
                  </span>
                  {section.title}
                </h2>
                <p className="text-overlay-muted leading-relaxed text-base md:text-lg">
                  {section.content}
                </p>
              </div>
            </div>
          ))}

          {/* Footer Note */}
          <div className="pt-12 border-t border-border mt-20 animate-fade-up delay-500">
            <p className="text-sm text-overlay-muted italic">
              Thank you for choosing Triptribe. For further legal information,
              please refer to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
