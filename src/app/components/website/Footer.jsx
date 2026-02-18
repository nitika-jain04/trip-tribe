import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  explore: [
    { name: "Search Trips", href: "/trips" },
    { name: "Destinations", href: "/trips" },
    { name: "Compare Trips", href: "/trips" },
    { name: "Verified Reviews", href: "/trips" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    // { name: "Blog", href: "/blog" },
    { name: "Become a Partner", href: "/partners" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/termsofuse" },
    // { name: "Cookie Policy", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* CTA Section */}
      <div className="container-premium">
        <div className="py-16 md:py-20 border-b border-background/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="font-display text-heading-lg md:text-display text-background mb-3">
                Ready to find your tribe?
              </h2>
              <p className="text-background/70 text-body-lg max-w-xl">
                Discover curated group trips from verified providers. Compare,
                read reviews, and book with confidence.
              </p>
            </div>
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-body-lg transition-all duration-300 hover:bg-primary/90 hover:gap-4"
            >
              Explore Trips
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-premium py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <img
                src="/triptribe-logo.jpeg"
                alt="TripTribe"
                className="h-10 w-10 rounded-xl object-cover"
              />
              <span className="font-display text-xl font-semibold text-background">
                TripTribe
              </span>
            </Link>
            <p className="text-background/60 text-body mb-6 max-w-sm">
              Your trusted platform for curated group travel. Compare trips,
              read verified reviews, and discover your perfect adventure.
            </p>
            <div className="flex flex-col gap-3 text-body-sm">
              <a
                href="mailto:admin@triptribe.co"
                className="flex items-center gap-3 text-background/60 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                admin@triptribe.co
              </a>
              <a
                href="tel:+91 8800590295"
                className="flex items-center gap-3 text-background/60 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                +91 8800590295
              </a>
              <span className="flex items-center gap-3 text-background/60">
                <MapPin className="w-4 h-4" />
                Gurugram, India
              </span>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="font-semibold text-body text-background mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-background/60 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-body text-background mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-background/60 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-body text-background mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-background/60 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-premium py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-body-sm text-background/50">
            <p>© 2024 TripTribe. All rights reserved.</p>
            <p>Connecting travelers with curated experiences.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
