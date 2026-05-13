"use client";

import React, { useState, useEffect } from "react";

const sections = [
  {
    id: "introduction",
    title: "A. INTRODUCTION",
    content: (
      <div className="space-y-4">
        <p>
          Triptribe recognizes the importance of privacy of its users and also
          of maintaining confidentiality of the information provided by its
          users as a responsible data controller and data processor.
        </p>
        <p>
          This Privacy Policy provides for the practices for handling and
          securing user&apos;s Personal Information (defined hereunder) by
          Triptribe and its subsidiaries and affiliates.
        </p>
        <p>
          Triptribe is a technology platform that enables users to discover,
          compare and book travel packages offered by third-party service
          providers. Triptribe facilitates booking and payment on behalf of such
          third-party providers but does not itself provide or operate the
          travel services.
        </p>
        <p>
          This Privacy Policy is applicable to any person (&lsquo;User&rsquo;)
          who purchases, intends to purchase, or inquire about any product(s) or
          service(s) made available by Triptribe through any of Triptribe&apos;s
          customer interface channels including its website and offline channels
          including call centers and offices (collectively referred herein as
          &quot;Sales Channels&quot;) and to any person who uses this website
          for any other purpose whatsoever.
        </p>
        <p>
          For the purpose of this Privacy Policy, wherever the context so
          requires &quot;you&quot; or &quot;your&quot; shall mean User and the
          term &quot;we&quot;, &quot;us&quot;, &quot;our&quot; shall mean
          Triptribe.
        </p>
        <p>
          By using or accessing the Website or other Sales Channels, the User
          hereby agrees with the terms of this Privacy Policy and the contents
          herein. If you disagree with this Privacy Policy please do not use or
          access our Website or other Sales Channels.
        </p>
        <p>
          This Privacy Policy does not apply to any website(s) of third parties,
          even if their websites/products are linked to our Website. User should
          take note that information and privacy practices of third-party
          service providers or partners may be materially different from this
          Privacy Policy.
        </p>
      </div>
    ),
  },
  {
    id: "outside-india",
    title: "B. USERS OUTSIDE THE GEOGRAPHICAL LIMITS OF INDIA",
    content: (
      <div className="space-y-4">
        <p>
          Please note that the data shared with Triptribe shall be primarily
          processed in India and such other jurisdictions where a third party
          engaged by Triptribe may process the data on its behalf.
        </p>
        <p>
          By agreeing to this policy, you are providing Triptribe with your
          explicit consent to process your personal information for the
          purpose(s) defined in this policy.
        </p>
        <p>
          The data protection regulations in India or such other jurisdictions
          mentioned above may differ from those of your country of residence.
        </p>
        <p>
          If you have any concerns in the processing your data and wish to
          withdraw your consent, you may do so by writing to the following email
          id:{" "}
          <a
            href="mailto:admin@triptribe.co"
            className="text-primary font-medium hover:underline"
          >
            admin@triptribe.co
          </a>
          .
        </p>
        <p>
          However, if such processing of data is essential for us to be able to
          provide a service(s) to you, then we may not be able to serve you
          after your withdrawal of consent.
        </p>
        <p>
          A withdrawal of consent by you for us to process your information may:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>severely inhibit our ability to serve you properly</li>
          <li>unreasonably restrict us to service you</li>
        </ul>
      </div>
    ),
  },
  {
    id: "info-collect",
    title: "C. TYPE OF INFORMATION WE COLLECT AND ITS LEGAL BASIS",
    content: (
      <div className="space-y-4">
        <p>
          The information as detailed below is collected for us to be able to
          provide the services chosen by you and also to fulfill our legal
          obligations as well as our obligations towards third parties as per
          our User Agreement.
        </p>
        <p>
          &quot;Personal Information&quot; of User shall include the information
          shared by the User and collected by us for the following purposes:
        </p>
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
          <p className="font-bold text-foreground mb-2">
            Registration on the Website:
          </p>
          <p>
            Information which you provide while subscribing to or registering on
            the Website, including but not limited to information about your
            personal identity such as name, gender, marital status, religion,
            age, profile picture, your contact details such as your email
            address, postal addresses, telephone (mobile or otherwise) and/or
            fax numbers.
          </p>
          <p className="mt-2">
            The information may also include information such as your banking
            details (including credit/debit card) and any other information
            relating to your income and/or lifestyle; billing information
            payment history etc. (as shared by you).
          </p>
        </div>
        <div className="bg-accent/5 p-6 rounded-xl border border-accent/10">
          <p className="font-bold text-foreground mb-2">Other information:</p>
          <p>
            We may also collect some other information and documents including
            but not limited to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>
              Transactional history (other than banking details) about your
              e-commerce activities, buying behavior.
            </li>
            <li>
              Your usernames, passwords, email addresses and other
              security-related information used by you in relation to our
              Services.
            </li>
            <li>
              Data either created by you or by a third party and which you wish
              to store on our servers such as image files, documents etc.
            </li>
            <li>
              Data available in public domain or received from any third party
              including social media channels.
            </li>
          </ul>
        </div>
        <p className="text-sm italic">
          Such information shall be strictly used for the aforesaid specified
          &amp; lawful purpose only.
        </p>
      </div>
    ),
  },
  {
    id: "how-we-use",
    title: "D. HOW WE USE YOUR PERSONAL INFORMATION",
    content: (
      <div className="space-y-4">
        <p>
          The Personal Information collected maybe used in the following manner:
        </p>
        <div className="space-y-3">
          <p className="font-bold text-foreground">While making a booking:</p>
          <p>
            While making a booking, we may use Personal Information including,
            payment details which include cardholder name, credit/debit card
            number (in encrypted form) with expiration date, banking details,
            wallet details etc. as shared and allowed to be stored by you. We
            may also use the information of travelers list as available in or
            linked with your account. This information is presented to the User
            at the time of making a booking to enable you to complete your
            bookings expeditiously.
          </p>
        </div>
        <div className="space-y-3">
          <p className="font-bold text-foreground">
            We may also use your Personal Information for several reasons
            including but not limited to:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-none">
            {[
              "Confirm your reservations with respective service providers",
              "Keep you informed of the transaction status",
              "Send booking confirmations via SMS or WhatsApp",
              "Send updates or changes to your booking(s)",
              "Allow customer service to contact you",
              "Customize website or mobile site content",
              "Request for reviews of products or services",
              "Send verification message(s) or email(s)",
              "Validate/authenticate your account",
              "Contact you for special birthday/anniversary offers",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <p className="font-bold text-foreground mb-2 text-lg">SURVEYS:</p>
          <p>
            We value opinions and comments from our Users and frequently conduct
            surveys, both online and offline. Participation in these surveys is
            entirely optional. Typically, the information received is
            aggregated, and used to make improvements to Website, other Sales
            Channels, services and to develop appealing content, features and
            promotions for members based on the results of the surveys. Identity
            of the survey participants is anonymous unless otherwise stated in
            the survey.
          </p>
        </div>
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <p className="font-bold text-foreground mb-2 text-lg">
            MARKETING PROMOTIONS, RESEARCH AND PROGRAMS:
          </p>
          <p>
            Marketing promotions, research and programs help us to identify your
            preferences, develop programs and improve user experience. Triptribe
            frequently sponsors promotions to give its Users the opportunity to
            win great travel and travel related prizes. Personal Information
            collected by us for such activities may include contact information
            and survey questions. We use such Personal Information to notify
            contest winners and survey information to develop promotions and
            product improvements. As a registered User, you will also
            occasionally receive updates from us about special offers, new
            services, other noteworthy items and marketing programs.
          </p>
          <p className="mt-3">
            In addition, you may look forward to receiving periodic marketing
            emails, newsletters and exclusive promotions offering special deals.
          </p>
        </div>
        <p>
          From time to time we may add or enhance services available on the
          Website. To the extent these services are provided, and used by you,
          we will use the Personal Information you provide to facilitate the
          service(s) requested. For example, if you email us with a question, we
          will use your email address, name, nature of the question, etc. to
          respond to your question. We may also store such Personal Information
          to assist us in making the Website better and easier to use for our
          Users.
        </p>
      </div>
    ),
  },
  {
    id: "retention",
    title: "E. HOW LONG DO WE KEEP YOUR PERSONAL INFORMATION?",
    content: (
      <div className="space-y-4">
        <p>
          Triptribe will retain your Personal Information on its servers for as
          long as is reasonably necessary for the purposes listed in this
          policy. In some circumstances we may retain your Personal Information
          for longer periods of time, for instance where we are required to do
          so in accordance with any legal, regulatory, tax or accounting
          requirements.
        </p>
        <p>
          Where your personal data is no longer required we will ensure it is
          either securely deleted or stored in a way which means it will no
          longer be used by the business.
        </p>
        <p className="bg-primary/5 p-4 rounded-lg flex items-center justify-between">
          <span>
            In case user wishes to delete their account, they can do so by
            writing to:
          </span>
          <a
            href="mailto:admin@triptribe.co"
            className="text-primary font-bold hover:underline"
          >
            admin@triptribe.co
          </a>
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    title: "F. COOKIES AND SESSION DATA",
    content: (
      <div className="space-y-4">
        <p className="font-bold text-foreground text-lg">Cookies</p>
        <p>
          Triptribe uses cookies to personalize your experience on the Website
          and the advertisements that maybe displayed. Triptribe’s use of
          cookies is similar to that of any other reputable online companies.
        </p>
        <p>
          Cookies are small pieces of information that are stored by your
          browser on your device&apos;s hard drive. Cookies allow us to serve
          you better and more efficiently. Cookies also allow ease of access, by
          logging you in without having to type your login name each time (only
          your password is needed).
        </p>
        <p>
          A cookie may also be placed by our advertising servers, or third party
          advertising companies. Such cookies are used for purposes of tracking
          the effectiveness of advertising served by us on any website, and also
          to use aggregated statistics about your visits to the Website in order
          to provide advertisements in the Website or any other website about
          services that may be of potential interest to you. All such
          information is anonymous. This anonymous information is collected
          through the use of a pixel tag, which is an industry standard
          technology and is used by all major websites.
        </p>
        <p>
          Most web browsers automatically accept cookies. Of course, by changing
          the options on your web browser or using certain software programs,
          you can control how and whether cookies will be accepted by your
          browser. Triptribe supports your right to block any unwanted internet
          activity, especially that of unscrupulous websites. However, blocking
          Triptribe cookies may disable certain features on the Website, and may
          hinder an otherwise seamless experience to purchase or use certain
          services available on the Website.
        </p>
        <p className="font-bold text-foreground text-lg mt-6">
          Automatic Logging of Session Data:
        </p>
        <p>
          Each time you access the Website your session data gets logged.
          Session data may consist of various aspects like the IP address,
          operating system and type of browser software being used and the
          activities conducted by the User while on the Website. We collect
          session data because it helps us analyze User’s choices, browsing
          pattern including the frequency of visits and duration for which a
          User is logged on. It also helps us diagnose problems with our servers
          and lets us better administer our systems. The aforesaid information
          cannot identify any User personally. However, it may be possible to
          determine a User&apos;s Internet Service Provider (ISP), and the
          approximate geographic location of User&apos;s point of connectivity
          through the above session data.
        </p>
      </div>
    ),
  },
  {
    id: "purpose-use",
    title: "G. Purpose and Use of Data",
    content: (
      <div className="space-y-4">
        <p>
          Your personal data is primarily used to facilitate and manage your
          travel bookings including travel packages offered by third-party
          service providers. It also enables us to communicate with you
          regarding your booking, provide assistance and ensure coordination
          with the relevant service provider.
        </p>
        <p>
          We further use your data for customer service, after-sales support,
          resolving disputes, handling grievances, complying with legal
          obligations (such as tax reporting, TCS declarations and remittance
          under RBI&apos;s Liberalized Remittance Scheme) and for internal
          analytics to improve our offerings.
        </p>
        <div className="space-y-3 mt-4">
          <p className="font-bold text-foreground">
            The lawful bases on which we process your data include:
          </p>
          <ul className="list-decimal pl-5 space-y-2">
            <li>your consent</li>
            <li>necessity for the performance of a contract with you</li>
            <li>compliance with legal obligations</li>
            <li>
              legitimate interests such as fraud prevention, service enhancement
              and security of our systems
            </li>
          </ul>
        </div>
        <p>
          With your consent, we may also use your data to send newsletters,
          promotional content, personalised trip recommendations and marketing
          communications via email, WhatsApp or SMS. You may opt out of such
          marketing at any time.
        </p>
        <p>
          We may aggregate and anonymise personal data to analyse trends,
          conduct surveys and develop new services. Such anonymised data shall
          not identify you individually.
        </p>
      </div>
    ),
  },
  {
    id: "sharing",
    title: "H. Sharing and Disclosure of data",
    content: (
      <div className="space-y-4">
        <p>
          To provide end-to-end travel services, your personal data may be
          shared with third-party vendors including but not limited to: hotels,
          transport operators, insurance providers, visa consultants, local
          guides and destination management companies. These vendors may be
          located both within India and internationally depending on the
          destination of your trip.
        </p>
        <p>
          We ensure that such third parties are bound by confidentiality
          obligations and process your data only to the extent required to
          deliver their services. However, Triptribe shall not be responsible
          for the misuse or breach of data directly attributable to third-party
          vendors.
        </p>
        <p>
          Where personal data is transferred across borders, Triptribe ensures
          that appropriate safeguards are in place including contractual
          undertakings and compliance with GDPR principles where applicable to
          protect your data in line with international standards.
        </p>
        <p>
          We do not sell or rent your data to advertisers or marketing agencies.
          Retargeting and campaign analytics are undertaken only via aggregated
          and anonymised tracking through Google Ads, Facebook Pixel and other
          ad platforms without directly disclosing identifiable customer data.
        </p>
        <p>
          We may disclose your personal information where required by law
          pursuant to valid legal process to comply with regulatory authorities
          or to protect the safety and integrity of our operations.
        </p>
      </div>
    ),
  },
  {
    id: "security",
    title: "I. Storage, Retention and Security",
    content: (
      <div className="space-y-4">
        <p>
          Your data is stored securely in cloud-based servers and CRM systems
          managed by our technical team. Access to such data is strictly limited
          to authorised personnel from the marketing, technology and operations
          teams each of whom is bound by internal confidentiality undertakings.
        </p>
        <p>
          We implement technical and organisational safeguards such as
          password-protected systems, role-based access controls, encryption
          protocols, session tracking, intrusion monitoring and secure API
          logging.
        </p>
        <p>
          We retain personal data for as long as is necessary to fulfil the
          purposes for which it was collected or longer if required under
          applicable laws. Typically, data may be retained from the date of
          booking until the conclusion of the client relationship and in some
          cases for statutory record-keeping or audit purposes.
        </p>
        <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r-lg">
          <p className="text-sm">
            While we take all reasonable precautions to secure your data, no
            system is entirely immune from cyber threats. In the event of a data
            breach, Triptribe shall promptly investigate, mitigate and notify
            affected individuals and regulatory authorities in accordance with
            applicable laws including the Digital Personal Data Protection Act,
            2023 and GDPR where applicable.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "withdrawal",
    title: "J. WITHDRAWAL OF CONSENT AND PERMISSION",
    content: (
      <div className="space-y-4">
        <p>
          You may withdraw your consent to submit any or all Personal
          Information or decline to provide any permissions on its Website as
          covered above at any time. In case, you choose to do so then your
          access to the Website may be limited, or we might not be able to
          provide the services to you. You may withdraw your consent by sending
          an email to:{" "}
          <a
            href="mailto:admin@triptribe.co"
            className="text-primary font-bold hover:underline"
          >
            admin@triptribe.co
          </a>
        </p>
      </div>
    ),
  },
  {
    id: "protection",
    title: "K. HOW WE PROTECT YOUR PERSONAL INFORMATION?",
    content: (
      <div className="space-y-4">
        <p>
          All payments on the Website are secured. This means all Personal
          Information you provide is transmitted using TLS (Transport Layer
          Security) encryption. TSL is a proven coding system that lets your
          browser automatically encrypt, or scramble, data before you send it to
          us.
        </p>
        <p>
          Website has stringent security measures in place to protect the loss,
          misuse, and alteration of the information under our control. Whenever
          you change or access your account information, we offer the use of a
          secure server. Once your information is in our possession we adhere to
          strict security guidelines, protecting it against unauthorized access.
        </p>
      </div>
    ),
  },
  {
    id: "media",
    title: "L. Use of Images, Testimonials and Media",
    content: (
      <div className="space-y-4">
        <p>
          During our trips, photographs or videos may be captured by
          Triptribe&apos;s team or authorised representatives for operational or
          promotional purposes. By participating in our trips, you consent to
          the reasonable use of such media by Triptribe for marketing, website
          display or social media purposes.
        </p>
        <p>
          Should you wish to opt out of having your identifiable images used,
          you may notify us in writing prior to the commencement of travel.
        </p>
      </div>
    ),
  },
  {
    id: "compliance",
    title: "M. Compliance with law",
    content: (
      <div className="space-y-4">
        <p>
          Triptribe complies with applicable data protection and privacy laws in
          India including but not limited to the Digital Personal Data
          Protection Act, 2023 and the Information Technology Act, 2000 along
          with the rules made thereunder.
        </p>
        <p>
          By engaging our services, you consent to your data being processed in
          accordance with these legal frameworks and this Privacy Policy. For
          overseas users, Triptribe also complies with GDPR to the extent
          applicable.
        </p>
      </div>
    ),
  },
  {
    id: "changes",
    title: "N. Changes to this Policy",
    content: (
      <div className="space-y-4">
        <p>
          We may update or amend this Policy from time to time to reflect
          changes in technology, business operations or legal requirements. All
          updates will be published on our website with the &quot;Last
          Updated&quot; date revised accordingly. We encourage you to review
          this Policy periodically.
        </p>
      </div>
    ),
  },
];

const PrivacyClient = () => {
  const [activeTab, setActiveTab] = useState("introduction");

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) =>
        document.getElementById(s.id),
      );
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTab(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background font-sans text-foreground/80">
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
              Privacy Policy
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 md:px-28 mt-5 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Table of Contents - Sticky Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-28 space-y-4">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                Contents
              </p>
              <nav className="flex flex-col gap-1 border-l border-border pl-4">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`text-left text-sm py-2 px-3 rounded-lg transition-all ${
                      activeTab === section.id
                        ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary -ml-[17px]"
                        : "text-overlay-muted hover:text-foreground hover:bg-card/50"
                    }`}
                  >
                    {section.title.split(". ")[1] || section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Policy Sections */}
          <main className="flex-1 max-w-4xl space-y-24">
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
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 pb-4 border-b border-border">
                  {section.title}
                </h2>
                <div className="text-overlay-muted leading-relaxed text-base space-y-4">
                  {section.content}
                </div>
              </section>
            ))}

            {/* Footer Note */}
            <div className="pt-12 border-t border-border mt-20">
              <p className="text-sm text-overlay-muted italic" id="footer-note">
                Thank you for choosing Triptribe. If you have any questions
                regarding this policy, please reach out to us.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivacyClient;
