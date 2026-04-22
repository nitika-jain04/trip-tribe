"use client";

import Link from "next/link";
import React from "react";

const sections = [
  {
    id: "service-provision",
    title: "A. SERVICE PROVISION",
    content: (
      <div className="space-y-4">
        <p>
          Triptribe provides the www.triptribe.co Web site as a service to the
          user and Web site owners.
        </p>
      </div>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "B. LIMITATION OF LIABILITY",
    content: (
      <div className="space-y-4">
        <p>
          Triptribe is not responsible for, and expressly disclaims all
          liability for, damages of any kind arising out of use, reference to,
          or reliance on any information contained within the site. While the
          information contained within the site is periodically updated, no
          guarantee is given that the information provided in this Website is
          correct, complete, and up-to-date.
        </p>
      </div>
    ),
  },
  {
    id: "third-party-links",
    title: "C. THIRD-PARTY LINKS",
    content: (
      <div className="space-y-4">
        <p>
          Although the Triptribe Website may include links providing direct
          access to other Internet resources, including Web sites, Triptribe is
          not responsible for the accuracy or content of information contained
          in these sites.
        </p>
      </div>
    ),
  },
  {
    id: "no-endorsement",
    title: "D. NO ENDORSEMENT",
    content: (
      <div className="space-y-4">
        <p>
          Links from Triptribe.co to third-party sites do not constitute an
          endorsement by Triptribe of the parties or their products and
          services. The appearance on the Web site of advertisements and product
          or service information does not constitute an endorsement by
          Triptribe.
        </p>
      </div>
    ),
  },
];

const DisclaimerPage = () => {
  return (
    <div className="min-h-dvh bg-background font-sans text-foreground/80">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary/5 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,var(--color-primary-light),var(--color-background))] opacity-20" />
        <div className="px-5 md:px-28">
          <div className="flex flex-col gap-6 animate-fade-up">
            <div className="w-fit inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              Last updated: April, 2026
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
              Disclaimer
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 md:px-28 mt-5 py-10">
        <main className="w-full space-y-10">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-32 animate-fade-up"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "both",
              }}
            >
              {/* <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 pb-4 border-b border-border">
                {section.title}
              </h2> */}
              <div className="text-overlay-muted leading-relaxed text-base space-y-4">
                {section.content}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default DisclaimerPage;
