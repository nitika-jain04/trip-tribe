import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import {
  ArrowRight,
  Compass,
  Heart,
  Users,
  Globe,
  Target,
  Shield,
  Search,
  GitCompare,
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "Every provider is verified. Every review is authentic. We believe trust is the foundation of great travel experiences.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We champion community-led travel. Group trips create connections, shared experiences, and lifelong friendships.",
  },
  {
    icon: Search,
    title: "Discovery Made Easy",
    description:
      "Finding the right trip shouldn't be hard. We aggregate options so you can compare and choose with confidence.",
  },
  {
    icon: Heart,
    title: "Traveler Empowerment",
    description:
      "Informed travelers make better choices. We provide the tools, reviews, and comparisons you need.",
  },
];

const team = [
  {
    name: "Depane Rao",
    role: "Co-founder & CEO",
    image: "/about_ceo.jpg",
    bio: "Adventure enthusiast with a background in technology, passionate about making travel accessible to everyone.",
  },
  {
    name: "Akash Kashyap",
    role: "CFO",
    image: "/about_cfo.jpg",
    bio: "Consultant with 6 years of experience and a travel veteran, building TripTribe to help travelers discover and confidently choose authentic, community-led group experiences.",
  },
];

const milestones = [
  {
    year: "2025",
    title: "Founded",
    description:
      "TripTribe was born to solve the fragmented community travel discovery problem.",
  },
  {
    year: "2026",
    title: "First 10 Partners",
    description: "Onboarded our first 10 verified community trip providers.",
  },
  // {
  //   year: "2023",
  //   title: "10,000 Users",
  //   description:
  //     "Crossed the milestone of 10,000 travelers using our platform.",
  // },
  // {
  //   year: "2024",
  //   title: "Comparison Launch",
  //   description: "Launched our side-by-side trip comparison feature.",
  // },
];

export default function About() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary-light via-background to-background" />

        <div className="container-premium relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-body-sm font-medium mb-6">
              <Compass className="w-4 h-4" />
              About TripTribe
            </div>

            <h1 className="font-display text-display-lg md:text-display-xl text-foreground mb-6 leading-16">
              Making Community Travel{" "}
              <span className="text-gradient">Discoverable</span>
            </h1>

            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              We aggregate community-led trips from verified providers so
              travelers can search, compare, and book with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="section bg-background">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-body-sm font-medium text-primary uppercase tracking-wider mb-4">
                The Problem We Solve
              </p>
              <h2 className="font-display text-display text-foreground mb-6">
                Community Travel Was Fragmented
              </h2>
              <div className="space-y-4 text-body-lg text-muted-foreground">
                <p>
                  Finding great community trips in India was frustrating. Dozens
                  of providers, scattered across Instagram pages, WhatsApp
                  groups, and random websites. No way to compare prices, read
                  verified reviews, or know who to trust.
                </p>
                <p>
                  We built TripTribe to solve this. One platform where you can
                  discover trips from 50+ verified providers, compare them
                  side-by-side, and book with confidence.
                </p>
                <p>
                  <strong className="text-foreground">
                    TripTribe doesn&apos;t run trips.
                  </strong>{" "}
                  We aggregate them from trusted community organizers, giving
                  you the power to choose what&apos;s best for you.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-premium-lg">
                <img
                  src="https://images.unsplash.com/photo-1522199710521-72d69614c702?w=800&q=80"
                  alt="Group travel"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-6 shadow-premium-md max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <GitCompare className="w-6 h-6 text-primary" />
                  <span className="font-semibold text-foreground">
                    Compare & Choose
                  </span>
                </div>
                <p className="text-body-sm text-muted-foreground">
                  See prices, reviews, and inclusions side-by-side.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-muted/30">
        <div className="container-premium">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-premium p-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-heading-lg text-foreground mb-4">
                Our Mission
              </h3>
              <p className="text-body-lg text-muted-foreground">
                To be India&apos;s most trusted aggregator for community travel.
                We help travelers discover, compare, and book group trips from
                verified providers with complete transparency.
              </p>
            </div>
            <div className="card-premium p-10">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display text-heading-lg text-foreground mb-4">
                Our Vision
              </h3>
              <p className="text-body-lg text-muted-foreground">
                A world where finding your perfect community trip is as easy as
                searching for a flight. Where every traveler has access to
                authentic group experiences from trusted organizers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-background">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-body-sm font-medium text-primary uppercase tracking-wider mb-4">
              Our Values
            </p>
            <h2 className="font-display text-display text-foreground mb-6">
              What We Stand For
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-heading-lg text-foreground mb-4">
                  {value.title}
                </h3>
                <p className="text-body text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section bg-foreground text-background">
        <div className="container-premium">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-body-sm font-medium text-primary uppercase tracking-wider mb-4">
              Our Journey
            </p>
            <h2 className="font-display text-display text-background mb-6">
              Milestones
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-display text-heading-sm">
                      {milestone.year.slice(2)}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 flex-1 bg-background/20 mt-4" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="font-display text-heading-sm text-background mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-body text-background/70">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section bg-background">
        <div className="container-premium flex flex-col">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-body-sm font-medium text-primary uppercase tracking-wider mb-4">
              The Team
            </p>
            <h2 className="font-display text-display text-foreground mb-6">
              Meet the Tribe
            </h2>
            <p className="text-body-lg text-muted-foreground">
              A team of travelers, technologists, and travel industry veterans
              building the future of community trip discovery.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 px-10 lg:max-w-4/6 gap-20 text-center">
            {team.map((member) => (
              <div
                key={member.name}
                className="card-premium overflow-hidden group"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-heading-lg text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-body-sm text-primary font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-linear-to-br from-primary-light via-background to-background">
        <div className="container-premium text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-display text-foreground mb-6">
              Ready to Find Your Tribe?
            </h2>
            <p className="text-body-lg text-muted-foreground mb-8">
              Explore community trips from verified providers. Search, compare,
              and book your next adventure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/trips">
                <Button className="btn-primary text-body px-8 py-6">
                  Explore Trips
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/partners">
                <Button className="btn-secondary text-body px-8 py-6">
                  Become a Partner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
