"use client";

import React, { useState, useEffect } from "react";

const sections = [
  {
    id: "applicability",
    title: "1. Applicability",
    content: (
      <div className="space-y-4">
        <p>
          This User Agreement along with Terms of Service (collectively, the
          &quot;User Agreement&quot;) forms the terms and conditions for the use
          of services and products of Triptribe, having its registered office at
          Gurgaon.
        </p>
        <p>
          Any person (&quot;User&quot;) who enquires about or purchases any
          products or services of Triptribe through its websites, salespersons,
          offices, call centers, branch offices, franchisees, agents etc. (all
          the aforesaid platforms collectively referred to as &quot;Sales
          Channels&quot;) agree to be governed by this User Agreement. The
          websites and the mobile applications of Triptribe are collectively
          referred to as &quot;Website&quot;.
        </p>
        <p>
          Both User and Triptribe are individually referred to as
          &lsquo;Party&rsquo; and collectively referred to as
          &lsquo;Parties&rsquo; to the User Agreement.
        </p>
        <p>
          &quot;Terms of Service&quot; available on Triptribe&rsquo;s website
          details out terms &amp; conditions applicable on various services or
          products facilitated by Triptribe. The User should refer to the
          relevant Terms of Service applicable for the given product or service
          as booked by the User. Such Terms of Service are binding on the User.
        </p>
      </div>
    ),
  },
  {
    id: "eligibility",
    title: "2. Eligibility to Use",
    content: (
      <div className="space-y-4">
        <p>
          The User must be at least 18 years of age and must possess the legal
          authority to enter into an agreement so as become a User and use the
          services of Triptribe. If you are a minor or are below the age of 18
          years, you shall not register as a User of the Website and shall not
          transact on or use the Website.
        </p>
        <p>
          As a minor if you wish to use or transact on the Website, such use or
          transaction shall only be made by a person of legal contracting age
          (legal guardian or parents). We reserve the right to terminate your
          membership and/or block access to the Website if it is discovered that
          you are a minor or incompetent to contract according to the law or any
          information pertaining to your age entered at the time of creation of
          account is false.
        </p>
        <p>
          Before using the Website, approaching any Sales Channels or procuring
          the services of Triptribe, the Users shall compulsorily read and
          understand this User Agreement, and shall be deemed to have accepted
          this User Agreement as a binding document that governs User&rsquo;s
          dealings and transactions with Triptribe. If the User does not agree
          with any part of this Agreement, then the User must not avail
          Triptribe&apos;s services and must not access or approach the Sales
          Channels of Triptribe.
        </p>
        <p>
          All rights and liabilities of the User and Triptribe with respect to
          any services or product facilitated by Triptribe shall be restricted
          to the scope of this User Agreement.
        </p>
      </div>
    ),
  },
  {
    id: "content",
    title: "3. Content",
    content: (
      <div className="space-y-4">
        <p>
          All content provided through various Sales Channels, including but not
          limited to audio, images, software, text, icons and such similar
          content (&quot;Content&quot;), are registered by Triptribe and
          protected under applicable intellectual property laws. User cannot use
          this Content for any other purpose, except as specified herein.
        </p>
        <p>
          User agrees to follow all instructions provided by Triptribe which
          will prescribe the way such User may use the Content.
        </p>
        <p>
          There are a number of proprietary logos, service marks and trademarks
          displayed on the Website and through other Sales Channels of
          Triptribe, as may be applicable. Triptribe does not grant the User a
          license, right or authority to utilize such proprietary logos, service
          marks, or trademarks in any manner. Any unauthorized use of the
          Content will be in violation of the applicable law.
        </p>
        <p>
          Triptribe respects the intellectual property rights of others. If you
          notice any act of infringement on the Website, you are requested to
          send us a written notice/ intimation which must include the following
          information:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            clear identification of such copyrighted work that you claim has
            been infringed
          </li>
          <li>
            location of the material on the Website, including but not limited
            to the link of the infringing material
          </li>
          <li>The proof that the alleged copyrighted work is owned by you</li>
          <li>Contact information.</li>
        </ul>
        <p>
          The aforesaid notices can be sent to Triptribe by email at{" "}
          <a
            href="mailto:admin@triptribe.co"
            className="text-primary hover:underline"
          >
            admin@triptribe.co
          </a>
          .
        </p>
      </div>
    ),
  },
  {
    id: "website",
    title: "4. Website",
    content: (
      <div className="space-y-4">
        <p>
          The Website is meant to be used by bonafide User(s) for a lawful use.
        </p>
        <p>
          User shall not distribute exchange, modify, sell or transmit anything
          from the Website, including but not limited to any text, images, audio
          and video, for any business, commercial or public purpose.
        </p>
        <p>
          The User Agreement grants a limited, non-exclusive, non-transferable
          right to use this Website as expressly permitted in this User
          Agreement. The User agrees not to interrupt or attempt to interrupt
          the operation of the Website in any manner whatsoever.
        </p>
        <p>
          Access to certain features of the Website may only be available to
          registered User(s). The process of registration may require the User
          to answer certain questions or provide certain information that may or
          may not be personal in nature. Some such fields may be mandatory or
          optional. User represents and warrants that all information supplied
          to Triptribe is true and accurate.
        </p>
        <p>
          Triptribe reserves the right, in its sole discretion, to terminate the
          access to the Website and the services offered on the same or any
          portion thereof at any time, without notice, for general maintenance
          or any other reason whatsoever.
        </p>
        <p>
          Triptribe will always make it&rsquo;s best endeavors to ensure that
          the content on its websites or other sales channels are free of any
          virus or such other malwares. However, any data or information
          downloaded or otherwise obtained using the Website or any other Sales
          Channel is done entirely at the User&rsquo;s own discretion and risk
          and they will be solely responsible for any damage to their computer
          systems or loss of data that may result from the download of such data
          or information.
        </p>
        <p>
          Triptribe reserves the right to periodically make improvements or
          changes in it&rsquo;s Website at any time without any prior notice to
          the User. User(s) are requested to report any content on the Website,
          which is deemed to be unlawful, objectionable, libelous, defamatory,
          obscene, harassing, invasive to privacy, abusive, fraudulent, against
          any religious beliefs, spam, or is violative of any applicable law to{" "}
          <a
            href="mailto:admin@triptribe.co"
            className="text-primary hover:underline"
          >
            admin@triptribe.co
          </a>
          . On receiving such report, Triptribe reserves the right to
          investigate and/or take such action as the Company may deem
          appropriate.
        </p>
      </div>
    ),
  },
  {
    id: "bookings-agents",
    title: "5. Bookings by Travel Agents",
    content: (
      <div className="space-y-4">
        <p>
          Except with the prior registration with Triptribe as B2B agents,
          priority partner or a franchisee, and explicit permission of Triptribe
          to use the Website, all travel agents, tour operators, consolidators
          or aggregators (&quot;Travel Agents&quot;) are barred from using this
          Website for any commercial or resale purpose. If any such bookings are
          detected, Triptribe reserves the right, including without limitation,
          to cancel all such bookings immediately without any notice to such
          travel agents and also to withhold payments or any refunds thereto.
          Triptribe shall not be held liable for any incidental loss or damage
          that may arise from the bookings made by any person through such
          Travel Agents. The liability in case of such cancellations shall be
          solely borne by such Travel Agents.
        </p>
        <p>
          All discounts and offers mentioned on the Website are applicable only
          to the User(s) of Triptribe for legitimate bookings.
        </p>
      </div>
    ),
  },
  {
    id: "liability",
    title: "6. Limited Liability of Triptribe",
    content: (
      <div className="space-y-4">
        <p>
          Triptribe always acts as a facilitator by connecting the User with the
          respective service providers who organize the listed trips
          (collectively referred to as &quot;Service Providers&quot;).
          Triptribe&rsquo;s liability is limited to providing the User with a
          confirmed booking as selected by the User.
        </p>
        <p>
          Any issues or concerns faced by the User at the time of availing any
          such services shall be the sole responsibility of the Service
          Provider. Triptribe will have no liability with respect to the acts,
          omissions, errors, representations, warranties, breaches or negligence
          on part of any Service Provider.
        </p>
        <p>As a part of any product or service:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Triptribe assumes no liability for the standard of services as
            provided by the respective Service Providers.
          </li>
          <li>
            Triptribe provides no guarantee with regard to their quality or
            fitness as represented.
          </li>
          <li>
            Triptribe doesn’t guarantee the availability of any services as
            listed by a Service Provider.
          </li>
        </ul>
        <p>
          By making a booking, User understands Triptribe merely provides a
          technology platform for booking of services and products and the
          ultimate liability rests on the respective Service Provider and not
          Triptribe. Thus the ultimate contract of service is between User and
          Service Provider.
        </p>
        <p>
          User further understands that the information displayed on the Website
          with respect to any service is displayed as furnished by the Service
          Provider. Triptribe, therefore cannot be held liable in case if the
          information provided by the Service Provider is found to be
          inaccurate, inadequate or obsolete or in contravention of any laws,
          rules, regulations or directions in force.
        </p>
        <p>
          Triptribe shall not be liable under any circumstances, whether in
          contract, tort, negligence or otherwise and shall not be obligated to
          issue refunds from its own funds under any circumstances.
        </p>
      </div>
    ),
  },
  {
    id: "user-responsibility",
    title: "7. User's Responsibility",
    content: (
      <div className="space-y-4">
        <p>
          Users are advised to check the description of the services and
          products carefully before making a booking. User(s) agree to be bound
          by all the conditions as contained in booking confirmation or as laid
          out in the confirmed booking voucher. These conditions are also to be
          read in consonance with the User Agreement.
        </p>
        <p>
          If a User intends to make a booking on behalf of another person, it
          shall be the responsibility of the User to inform such person about
          the terms of this Agreement, including all rules and restrictions
          applicable thereto.
        </p>
        <p>
          The User undertakes to abide by all procedures and guidelines, as
          modified from time to time, in connection with the use of the services
          available through Triptribe. The User further undertakes to comply
          with all applicable laws, regulations, orders, directions etc. issued
          by either the Central Government, State Government, District
          Authorities or any other statutory body empowered to do so w.r.t use
          of services for each transaction.
        </p>
        <p>
          The services are provided on an &quot;as is&quot; and &quot;as
          available&quot; basis. Triptribe may change the features or
          functionality of the services being provided at any time, in its sole
          discretion, without any prior notice. Triptribe expressly disclaims
          all warranties of any kind, whether express or implied, including, but
          not limited to the implied warranties of merchantability, reasonably
          fit for all purposes. No advice or information, whether oral or
          written, which the User obtains from Triptribe or through the services
          opted shall create any warranty not expressly made herein or in the
          terms and conditions of the services.
        </p>
        <p>
          User also authorizes Triptribe&rsquo;s representative to contact such
          user over phone, message and email. This consent shall supersede any
          preferences set by such User through national customer preference
          register (NCPR) or any other similar preferences.
        </p>
      </div>
    ),
  },
  {
    id: "security",
    title: "8. Security and Account Related Information",
    content: (
      <div className="space-y-4">
        <p>
          While registering on the Website, the User will have to choose a
          password to access that User&rsquo;s account and the User shall be
          solely responsible for maintaining the confidentiality of both the
          password and the account as well as for all activities carried out
          under such account, whether authorized or not. It is the duty of the
          User to notify Triptribe immediately in writing of any unauthorized
          use of their password or account or any other breach of security.
          Triptribe shall not be liable for any loss, damage, or consequences
          that may be incurred by the User as a result of unauthorized use of
          the password or account, either with or without the User’s knowledge.
          The User shall not use anyone else&apos;s account at any time and
          shall ensure that all account credentials are kept secure at all
          times.
        </p>
        <p>
          For logging-in or sign-up on the Website and/or mobile and web
          applications, the User may have the option to voluntarily sign-up or
          login through a phone number verification tool or any other
          authentication mechanism integrated with a third-party partner of
          Triptribe. For the avoidance of doubt, login or sign-up of the User
          via such verification process shall at all times be subject to the
          User giving its explicit consent to Triptribe for engaging such
          third-party partner. Under this login or sign-up option, Triptribe may
          facilitate authentication through such third-party systems, however,
          Triptribe shall not be liable for any breach, misuse, or unauthorized
          access arising from such third-party integrations.
        </p>
        <p>
          The User understands and acknowledges that any information that is
          provided to the Website or transmitted through the use of the Website
          may be read, intercepted, or misused by unauthorized third parties due
          to any breach of security at the User&rsquo;s end, including but not
          limited to inadequate safeguards, unsecured networks, or compromised
          devices, and Triptribe shall not be responsible for any such
          interception or misuse.
        </p>
        <p>
          Triptribe keeps all the data in relation to credit card, debit card,
          bank information and other financial details secured and in encrypted
          form in accordance with applicable laws and industry standards.
          However, in cases of fraud detection, risk assessment, compliance
          requirements, or offering bookings on credit or similar financial
          arrangements, Triptribe may, at its sole discretion, verify certain
          information of its Users including but not limited to identity
          details, transaction history, and creditworthiness, as and when
          required.
        </p>
        <p>
          Additionally, Triptribe may share the User&rsquo;s Personal
          Information in an anonymized and/or aggregated form with third parties
          that Triptribe may engage to perform certain tasks on its behalf or to
          facilitate bookings, including but not limited to payment processing,
          data hosting, data processing, analytics, fraud prevention, credit
          score verification, and assessing credit worthiness for offering
          bookings on credit, in accordance with applicable laws.
        </p>
        <p>
          Additionally, Triptribe may also share the User&rsquo;s Personal
          Information, to the extent necessary, with third-party Service
          Providers for the purpose of fulfilling bookings, enabling service
          delivery, and ensuring proper execution of the services availed by the
          User, and the User expressly consents to such sharing of information.
        </p>
        <p>
          Triptribe adopts commercially reasonable and industry standard
          security measures to safeguard the information provided by the User.
          However, Triptribe does not warrant or guarantee that its systems,
          servers, or databases will be free from unauthorized access, hacking,
          data loss, or security breaches, and the User acknowledges that any
          transmission of information is at the User&rsquo;s own risk.
        </p>
        <p>
          The data of the User as available with Triptribe may be shared with
          concerned law enforcement agencies, regulatory authorities, or
          government bodies for any lawful purpose, investigation, verification,
          or compliance requirement, without requiring prior consent of the
          User.
        </p>
      </div>
    ),
  },
  {
    id: "booking-process",
    title: "9. Booking Process & Contract Formation",
    content: (
      <div className="space-y-4">
        <p className="font-bold underline">
          Booking Initiation &amp; Confirmation
        </p>
        <p>
          To initiate a booking through the Triptribe platform, the User shall
          be required to provide accurate travel preferences, select the desired
          trip or experience, and review and confirm the itinerary, inclusions,
          pricing and other relevant details as made available on the Website or
          through official communication channels of Triptribe, including but
          not limited to email, platform notifications, or other authorized
          communication mediums. The User acknowledges that all such
          itineraries, packages and related details are provided by independent
          third-party Service Providers and Triptribe shall not be responsible
          for the accuracy, completeness or suitability of the same.
        </p>
        <p>
          The User further understands and agrees that submission of a booking
          request or payment through the Website does not automatically result
          in confirmation of the booking, and that such booking shall remain
          subject to availability, acceptance and confirmation by the respective
          Service Provider. Triptribe acts solely as a facilitator in
          transmitting booking requests and payments to the relevant Service
          Provider and shall not be deemed to have accepted or confirmed any
          booking on its own behalf.
        </p>
        <p>
          A booking shall be deemed to be confirmed only upon the occurrence of
          all of the following conditions:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            the User has reviewed and accepted the proposed itinerary, package
            details, terms and conditions, and all applicable policies;
          </li>
          <li>
            the required booking amount or deposit, as specified at the time of
            booking, has been successfully received through the authorized
            payment channels of Triptribe; and
          </li>
          <li>
            a formal booking confirmation has been issued to the User, either by
            the Service Provider directly or through Triptribe acting in a
            facilitative capacity.
          </li>
        </ul>
        <p>
          The User expressly acknowledges that the final confirmation of the
          booking and the obligation to provide the booked services rests solely
          with the respective Service Provider, and Triptribe shall not be
          liable for any failure, delay, rejection or modification of booking by
          the Service Provider for any reason whatsoever. Any contractual
          relationship in respect of the actual travel services shall be between
          the User and the Service Provider, and Triptribe shall not be a party
          to such contract, notwithstanding its role in facilitating the booking
          and payment process.
        </p>
      </div>
    ),
  },
  {
    id: "fees",
    title: "10. Fees and Payment",
    content: (
      <div className="space-y-4">
        <p>
          In addition to the cost of booking as charged by the Service
          Providers, Triptribe reserves the right to levy certain fees in the
          nature of convenience fees, platform fees or service fees. Triptribe
          further reserves the right to modify, revise or alter any and all such
          fees from time to time at its sole discretion. Any such additional
          fees, including charges towards any modifications thereof, shall be
          clearly displayed to the User prior to confirming the booking or
          collecting the payment from such User.
        </p>
        <p>
          In cases of short charging of the booking amount, taxes, statutory
          fees, convenience fees or any other applicable charges, whether
          arising due to technical errors, system discrepancies or any other
          reason whatsoever, Triptribe shall reserve the right to recover,
          charge or claim the balance amount from the User, and the User shall
          remain liable to pay such differential amount to Triptribe. In
          instances where such short charge is identified prior to the
          utilization of the booking, Triptribe shall be at liberty to cancel
          such bookings without any further liability if the balance amount is
          not paid within the stipulated time.
        </p>
        <p>
          Any increase in the price charged by Triptribe on account of change in
          tax rates, introduction of new taxes, levies, duties or any other
          governmental impositions shall be borne entirely by the User. Such
          imposition of taxes or levies may be without prior notice and may also
          be retrospective in nature, but shall always be in accordance with
          applicable law.
        </p>
        <p>
          In the rare circumstance where a booking does not get confirmed for
          any reason whatsoever, Triptribe shall process the refund of the
          booking amount received from the User and shall intimate the User
          accordingly. Triptribe shall not be under any obligation to provide an
          alternate booking, replacement service, or any compensation in lieu of
          such unconfirmed booking, and any subsequent booking shall be treated
          as a fresh transaction. Any refunds arising from cancellations
          (including user-initiated cancellations, Service Provider initiated
          cancellations or cancellations due to force majeure events) shall be
          processed in accordance with the policies of the respective Service
          Provider and subject to receipt of funds from such Service Provider.
          Service Providers shall have absolute discretion over their respective
          refund policies, and shall be solely responsible for determining the
          amount of refund, if any, to be provided. Triptribe shall make
          reasonable efforts to process refunds within a reasonable timeframe
          upon receipt of funds from the Service Provider; however, Triptribe
          shall not be liable for any delay attributable to the Service
          Provider. The User may reach out to the grievance officer at{" "}
          <a
            href="mailto:admin@triptribe.co"
            className="text-primary hover:underline"
          >
            admin@triptribe.co
          </a>{" "}
          in case of any concerns regarding refund processing.
        </p>
        <p>
          The User shall be solely and completely responsible for all charges,
          fees, duties, taxes, and assessments arising out of the use of the
          services, in accordance with applicable laws, and Triptribe shall not
          be liable for any such statutory or financial obligations imposed on
          the User.
        </p>
        <p>
          The User agrees and understands that all payments shall be made only
          to bank accounts or payment instruments officially designated by
          Triptribe. Triptribe or its agents, representatives, or employees
          shall never request the User to transfer funds to any personal account
          or to any account not held in the name of Triptribe. The User
          acknowledges that in the event any payment is made to an unauthorized
          account or to any third party not designated by Triptribe, Triptribe
          shall not be held liable for the same, and the User shall have no
          claim whatsoever against Triptribe in respect of such payments.
        </p>
        <p>
          The User shall not share any sensitive personal information including
          but not limited to credit/debit card details, CVV, OTP, expiry date,
          login credentials, passwords or similar information with any person,
          including employees or representatives of Triptribe. In the event such
          information is requested by any individual claiming to represent
          Triptribe, the User shall immediately inform Triptribe. Triptribe
          shall not be liable for any loss or damage suffered by the User due to
          sharing of such confidential information.
        </p>
        <p>
          Refunds, if any, on cancelled bookings shall be processed to the same
          account or payment instrument (including but not limited to credit
          card, debit card, wallet or bank account) from which the original
          payment was made, subject to applicable policies and timelines.
        </p>
        <p>
          All bookings made by the User through Triptribe shall be subject to
          the applicable cancellation policy as specified on the booking page or
          as otherwise communicated to the User in writing at the time of
          booking.
        </p>
        <p>
          Triptribe provides multiple modes of payment on the Website for
          completing transactions, including but not limited to UPI,
          credit/debit cards of various banks, net banking facilities, digital
          wallets, gift cards, EMI options and other payment mechanisms as may
          be made available from time to time.
        </p>
      </div>
    ),
  },
  {
    id: "communication",
    title: "11. Usage Of The Mobile Number And Communication Details",
    content: (
      <div className="space-y-4">
        <p>
          Triptribe shall send booking confirmations, itinerary details,
          cancellation updates, payment confirmations, refund status, schedule
          changes or any other information relevant to the transaction or
          booking made by the User, through SMS, internet-based messaging
          applications such as WhatsApp, voice calls, e-mail or any other
          communication details provided by the User at the time of booking or
          registration on the Website.
        </p>
        <p>
          Triptribe may also contact the User through the aforementioned modes
          for any pending, incomplete or failed bookings, for the purpose of
          understanding the User&rsquo;s preferences in completing the booking,
          as well as for providing assistance in relation to such transactions
          or services availed by the User.
        </p>
        <p>
          The User hereby expressly and unconditionally consents that such
          communications via SMS, internet-based messaging applications such as
          WhatsApp, voice calls, email or any other mode by Triptribe are:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>upon the request and authorization of the User;</li>
          <li>
            of a &lsquo;transactional&rsquo; nature and not to be construed as
            &lsquo;unsolicited commercial communication&rsquo; in accordance
            with the guidelines of the Telecom Regulatory Authority of India
            (TRAI); and
          </li>
          <li>
            in compliance with all applicable regulations, guidelines and
            directions issued by TRAI or any other competent authority in India
            or abroad.
          </li>
        </ul>
        <p>
          The User agrees to indemnify and hold harmless Triptribe against any
          and all losses, damages, claims or liabilities incurred by Triptribe
          arising out of or in connection with any action initiated by TRAI,
          Access Providers (as defined under applicable TRAI regulations) or any
          other authority, including but not limited to cases where such action
          results from any erroneous complaint made by the User with respect to
          the communications referred to above, or due to incorrect or invalid
          contact details (including phone number or email address) provided by
          the User for any reason whatsoever.
        </p>
      </div>
    ),
  },
  {
    id: "force-majeure",
    title: "12. Force Majeure",
    content: (
      <div className="space-y-4">
        <p>
          There may arise exceptional circumstances,whether foreseeable or
          unforeseeable, where Triptribe and/or the Service Providers may be
          unable to honor confirmed bookings due to reasons including but not
          limited to acts of God, natural disasters, labor unrest, insolvency,
          business exigencies, governmental actions or decisions, terrorist
          activities, pandemics, operational or technical issues, disruptions in
          travel routes, cancellations or any other reasons beyond the
          reasonable control of Triptribe. In the event Triptribe has prior
          knowledge of any such circumstances where fulfillment of bookings may
          be impacted, Triptribe shall make reasonable efforts to provide a
          similar alternative to the User or facilitate refund of the booking
          amount after deduction of applicable service charges, if such refund
          is supported and processed by the respective Service Providers. The
          User expressly agrees that Triptribe, being merely a facilitator of
          the services and products booked, shall not be held responsible or
          liable for any such Force Majeure circumstances. The User shall
          directly coordinate with the respective Service Provider for any
          further resolution, claims or refunds arising out of such situations.
        </p>
        <p>
          The User further agrees that in the event of non-confirmation of a
          booking due to technical reasons including but not limited to network
          downtime, system failures, disconnection with third-party platforms
          such as payment gateways, banking systems or any other similar
          failures, Triptribe&rsquo;s obligation shall be strictly limited to
          refunding the booking amount, if any, actually received from the User.
          Such refund shall constitute full and final settlement and shall
          completely discharge Triptribe from all liabilities in relation to
          such transaction, and any additional liabilities, claims or losses
          shall be solely borne by the User.
        </p>
        <p>
          In no event shall Triptribe be liable for any direct, indirect,
          punitive, incidental, special or consequential damages, including but
          not limited to damages for loss of use, loss of data, loss of profits,
          loss of opportunity or any other financial or non-financial losses,
          arising out of or in any manner connected with the use, inability to
          use, or performance of the Website or any other Sales Channel.
        </p>
      </div>
    ),
  },
  {
    id: "advertisers",
    title: "13. Advertisers On Triptribe And Linked Websites",
    content: (
      <div className="space-y-4">
        <p>
          The Website may contain links to third-party websites or platforms.
          Triptribe does not control, operate, or monitor such websites and
          shall not be responsible for the content, accuracy, or availability of
          the same. If a User chooses to access any such third-party website,
          the access shall be entirely at the User&rsquo;s own risk and
          Triptribe shall not assume any liability whatsoever in relation
          thereto.
        </p>
        <p>
          Triptribe shall not be responsible for any errors, omissions,
          inaccuracies or representations made on any of its pages, links, or
          any linked website pages, to the extent such information is provided,
          updated, or furnished directly by the respective Service Providers or
          advertisers.
        </p>
        <p>
          Triptribe does not endorse, recommend, or promote any advertisers,
          Service Providers, or third-party websites appearing on the Website or
          any linked platforms in any manner whatsoever. Users are strongly
          advised to independently verify the authenticity, accuracy, and
          reliability of all information provided on such third-party web pages
          prior to relying upon the same.
        </p>
        <p>
          The linked websites are not under the control or supervision of
          Triptribe and accordingly Triptribe shall not be responsible for the
          contents of any such linked site(s), or any additional links contained
          therein, or any changes, updates, or modifications made to such
          websites from time to time. Such links are provided solely for the
          convenience of the Users and do not imply any association,
          endorsement, or responsibility on the part of Triptribe.
        </p>
      </div>
    ),
  },
  {
    id: "right-refuse",
    title: "14. Right To Refuse",
    content: (
      <div className="space-y-4">
        <p>
          Triptribe, at its sole and absolute discretion, reserves the right to
          refuse or not accept any booking request without assigning any reason
          whatsoever.
        </p>
        <p>
          Triptribe shall not be obligated to provide any service or share
          confirmed booking details until such time that the complete
          consideration, including all applicable charges and fees, has been
          received from the User in full.
        </p>
        <p>
          In addition to any other remedies and recourse available to Triptribe
          under this User Agreement or under applicable law, Triptribe may, at
          its sole discretion, restrict or limit the User&rsquo;s activity,
          issue warnings to other users regarding such User&rsquo;s conduct,
          immediately suspend or terminate the User&rsquo;s registration, or
          refuse to provide the User with access to the Website, if:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>the User is found to be in breach of this User Agreement; or</li>
          <li>
            Triptribe is unable to verify, validate, or authenticate any
            information provided by the User; or
          </li>
          <li>
            Triptribe has reasonable grounds to believe that the User&rsquo;s
            actions may infringe upon any third-party rights, violate any
            applicable law, or otherwise expose the User, other users, or
            Triptribe to any form of liability.
          </li>
        </ul>
        <p>
          Once a User has been suspended or terminated, such User shall not
          register or attempt to register again with Triptribe using different
          credentials, or access or use the Website in any manner whatsoever
          unless expressly reinstated by Triptribe. Triptribe reserves the
          right, at any time and at its sole discretion, to reinstate or
          permanently block such Users.
        </p>
        <p>
          In the event a User breaches this User Agreement, Triptribe shall have
          the right to recover any amounts due and payable by the User and to
          initiate appropriate legal proceedings or enforcement actions as it
          may deem necessary under applicable law.
        </p>
        <p>
          The User shall not post, upload, transmit, or communicate with
          Triptribe using any content or language which is:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            abusive, threatening, offensive, defamatory, coercive, obscene,
            belligerent, vulgar, sexually explicit, pornographic, or otherwise
            objectionable;
          </li>
          <li>in violation of any applicable law;</li>
          <li>
            infringing upon any intellectual property or proprietary rights of
            third parties;
          </li>
          <li>unsolicited or constituting spam; or</li>
          <li>in breach of any provision of this User Agreement.</li>
        </ul>
        <p>
          In the event of violation of any of the aforesaid conditions,
          Triptribe shall be entitled to take such legal or remedial action as
          it may deem appropriate, including but not limited to suspension of
          access, cancellation of bookings, and initiation of legal proceedings.
        </p>
      </div>
    ),
  },
  {
    id: "right-cancel",
    title: "15. Right To Cancel",
    content: (
      <div className="space-y-4">
        <p>
          The User expressly undertakes and agrees to provide Triptribe with
          true, accurate, current and complete information while accessing or
          using the Website under this User Agreement and shall not make any
          misrepresentation, concealment, or falsification of any facts. Any
          default, misrepresentation or inaccuracy on the part of the User shall
          disentitle the User from availing the services offered through
          Triptribe and may result in cancellation of bookings and suspension of
          access.
        </p>
        <p>
          In the event Triptribe discovers, or has reasonable grounds to believe
          at any time during or after receiving a request for services from the
          User, that such request is unauthorized, or that the information
          provided by the User or any of the travelers is incorrect, incomplete,
          misleading, or that any material fact has been misrepresented or
          concealed, Triptribe shall be entitled to take appropriate legal
          action against the User, including but not limited to cancellation of
          bookings, without any prior notice or intimation to the User. In such
          circumstances, Triptribe shall not be responsible or liable for any
          loss, damage, expense, or inconvenience that may be caused to the User
          or any other person included in the booking as a consequence of such
          cancellation.
        </p>
        <p>
          If any judicial authority, quasi-judicial body, investigative agency,
          law enforcement authority, or governmental body directs or requires
          Triptribe to cancel any booking, Triptribe shall be entitled to cancel
          such booking without prior consultation with or notice to the
          concerned User, and such cancellation shall be binding on the User.
        </p>
        <p>
          The User agrees and undertakes not to hold Triptribe liable for any
          loss, damage, or consequences arising out of any action taken by
          Triptribe in good faith for safeguarding its own interests, the
          interests of other Users, or for compliance with applicable laws and
          regulations. This shall include, without limitation, denial or
          cancellation of bookings on account of suspected fraudulent
          transactions, misuse of the Website, or breach of this User Agreement.
        </p>
      </div>
    ),
  },
  {
    id: "indemnification",
    title: "16. Indemnification",
    content: (
      <div className="space-y-4">
        <p>
          The User agrees to indemnify, defend and hold harmless Triptribe, its
          affiliates, and their respective officers, directors, employees,
          agents, lawful successors and permitted assigns from and against any
          and all losses, liabilities, claims, damages, costs and expenses
          (including, without limitation, legal fees, litigation expenses,
          disbursements and interest chargeable thereon) asserted against or
          incurred by such indemnified parties, arising out of, resulting from,
          or which may be payable by virtue of any breach of any representation,
          warranty, undertaking or obligation provided by the User under this
          User Agreement, or due to non-performance or improper performance of
          any covenant by the User, including but not limited to misuse of the
          Website, violation of applicable laws, or disputes with Service
          Providers.
        </p>
        <p>
          The User shall be solely and exclusively liable for any breach of any
          applicable local, national or international laws, rules, regulations,
          or any general code of conduct, including those specific to any
          destination, travel activity or jurisdiction, and Triptribe shall not
          be held responsible or liable in any manner whatsoever for the same,
          whether directly or indirectly.
        </p>
      </div>
    ),
  },
  {
    id: "upi",
    title: "17. UPI Related Terms & Conditions",
    content: (
      <div className="space-y-4">
        <p>
          Triptribe acts as a Third Party Application Provider (TPAP) under the
          Unified Payments Interface (UPI) framework and facilitates payment
          transactions through authorized Payment Service Provider (PSP) banks
          in accordance with applicable regulations prescribed by the National
          Payments Corporation of India (NPCI) and the Reserve Bank of India
          (RBI).
        </p>
      </div>
    ),
  },
  {
    id: "review-guidelines",
    title: "18. User Review And Content Moderation Guidelines",
    content: (
      <div className="space-y-4">
        <p>
          Triptribe accepts user reviews only from Users who have booked and
          completed a travel experience, including but not limited to trips,
          treks, tours or similar services through the Website; however, in
          certain cases, Triptribe may also obtain and display reviews sourced
          from third-party Service Providers. Such reviews may include ratings,
          written content, images or a combination thereof. All reviews
          submitted by Users are initially subject to an automated moderation
          process, and reviews that do not pass such automated checks for
          reasons including but not limited to suspected fraudulent activity,
          irrelevant content, abusive or inappropriate language, or policy
          violations may be subjected to manual moderation.
        </p>
        <p>
          During manual moderation, Triptribe makes reasonable efforts to ensure
          that the original intent, meaning and substance of the review remains
          unaltered, and accordingly does not edit reviews for grammar,
          spelling, sentence construction, abbreviations or clarity, except to
          the limited extent required to remove prohibited or objectionable
          content. Triptribe acknowledges that Users are not professional
          content creators and that any modification to the substance of a
          review may affect its authenticity. Notwithstanding the foregoing,
          Triptribe reserves the right, at its sole discretion, to reject,
          remove, edit, or investigate any review that it reasonably believes to
          be false, misleading, fabricated, defamatory, irrelevant, or otherwise
          in violation of applicable laws or this User Agreement, and may also
          discontinue displaying reviews for any trip or Service Provider where
          deemed appropriate.
        </p>
        <p>
          Triptribe makes no representation, warranty or guarantee regarding the
          accuracy, genuineness, reliability or completeness of any review
          displayed on the Website, and any reliance placed by a User on such
          reviews shall be strictly at the User&rsquo;s own risk. Reviews may be
          accepted in their original form, including both positive and negative
          feedback, provided they appear to be genuine and relevant to the
          travel experience. Reviews consisting solely of ratings may also be
          accepted. However, any content within reviews containing abusive or
          offensive language, defamatory statements, inappropriate remarks,
          comparisons with competing platforms, pricing disputes, or content
          that is insensitive or violative of public sentiment may be removed or
          modified to the extent necessary, while retaining the permissible
          portion of the review.
        </p>
        <p>
          Triptribe makes reasonable efforts to accept reviews in multiple
          regional languages and may, where feasible, provide an English
          translation using automated tools for ease of understanding.
          Notwithstanding the above, Triptribe reserves the right to reject
          reviews in cases including but not limited to duplicate submissions
          beyond a reasonable limit, reviews submitted without a confirmed or
          completed booking, reviews arising from denial of service due to
          violation of Service Provider policies, reviews submitted through
          unauthorized or third-party accounts, reviews unrelated to the actual
          travel experience, or reviews that, in the reasonable opinion of
          Triptribe, appear suspicious, fabricated or intended to mislead other
          Users.
        </p>
        <p>
          All images submitted as part of user reviews are also subject to
          automated and manual moderation. Images that are relevant to the
          actual travel experience, including but not limited to accommodation,
          campsite, terrain, facilities, or other aspects of the trip, may be
          accepted. However, images that are unrelated, inappropriate,
          offensive, duplicated, of low quality, incorrectly tagged, altered,
          rotated improperly, watermarked, or otherwise not representative of
          the travel experience may be rejected or removed at Triptribe&rsquo;s
          discretion.
        </p>
      </div>
    ),
  },
  {
    id: "provider-responses",
    title: "19. Service Provider Response Moderation Guidelines",
    content: (
      <div className="space-y-4">
        <p>
          Triptribe may, at its discretion, allow Service Providers listed on
          the Website to respond to reviews or feedback submitted by Users in
          relation to travel experiences including but not limited to trips,
          treks, tours or similar services. Replies submitted by Service
          Providers may be subject to moderation in order to ensure relevance,
          appropriateness, and compliance with applicable guidelines and this
          User Agreement.
        </p>
        <p>
          Replies from Service Providers shall be accepted provided they are
          relevant to the User&rsquo;s review and are expressed in a reasonable,
          appropriate and non-offensive manner. Both positive and negative
          responses are permitted, and Service Providers may provide
          justifications or clarifications in relation to negative reviews,
          provided such responses are communicated in a professional and
          respectful tone without the use of inappropriate or objectionable
          language.
        </p>
        <p>
          Triptribe reserves the right to reject, remove, or modify any reply
          submitted by a Service Provider in cases including but not limited to
          replies that are irrelevant to the User&rsquo;s review, contain
          abusive, offensive, defamatory or inappropriate language, include
          controversial or inflammatory statements directed at the User, or
          otherwise violate applicable laws or this User Agreement. Replies that
          are blank, incomplete, or lacking substantive content may also be
          rejected.
        </p>
        <p>
          Additionally, any replies containing personal contact details such as
          phone numbers, email addresses, or any attempt to solicit Users to
          contact the Service Provider directly for offers, discounts, pricing
          discussions, or off-platform transactions may be edited or removed at
          Triptribe&rsquo;s discretion. Triptribe reserves the right to ensure
          that all communication between Users and Service Providers remains
          within the platform to maintain transparency, integrity, and
          compliance.
        </p>
      </div>
    ),
  },
  {
    id: "adventure-risk",
    title: "20. Adventure Activities, Health Requirements & Risk Waiver",
    content: (
      <div className="space-y-4">
        <p className="font-bold underline">
          Participation in Adventure Activities
        </p>
        <p>
          Certain travel experiences listed on the Website may include optional
          or ancillary adventure activities such as trekking, hiking, biking,
          rafting, paragliding, snow-based activities, water-based excursions or
          other similar activities, which are offered, organized and conducted
          solely by independent third-party Service Providers. Participation in
          any such activities is entirely voluntary and undertaken at the sole
          risk, responsibility and discretion of the User.
        </p>
        <p>
          Triptribe does not organize, operate, supervise, monitor or control
          any such activities and shall, under no circumstances whatsoever, be
          held liable or responsible for any injury, illness, accident, loss,
          damage or death arising out of or in connection with participation in
          such activities, whether caused due to natural conditions,
          environmental factors, personal negligence, acts or omissions of
          Service Providers, or any other reason whatsoever. By choosing to
          participate in such activities, the User expressly acknowledges and
          agrees that Triptribe bears no responsibility, liability or obligation
          of any kind in relation thereto and that all risks are assumed
          entirely by the User.
        </p>
        <p>
          The User further represents and confirms that they are physically and
          medically fit to undertake such activities and have independently
          assessed all associated risks prior to participation, and Triptribe
          shall not be required to verify or validate the User&rsquo;s fitness,
          capability or preparedness in any manner whatsoever.
        </p>
        <p className="font-bold underline">
          Compliance with Safety Instructions
        </p>
        <p>
          The User acknowledges that all safety guidelines, instructions,
          advisories or directions in relation to any trip, activity or service
          are provided solely by the respective Service Providers, their staff,
          local guides, or third-party operators, and not by Triptribe.
          Triptribe does not issue, monitor or enforce any such safety
          instructions and shall not be responsible for the adequacy, accuracy
          or implementation of the same.
        </p>
        <p>
          The User agrees that compliance with such instructions is entirely
          their own responsibility and any failure, refusal or inability to
          comply with such guidelines, whether resulting in injury, removal from
          the activity, or any other consequence, shall be solely attributable
          to the User and/or the respective Service Provider. Triptribe shall
          not be liable for any removal, restriction, denial of participation,
          or any other action taken by the Service Provider due to
          non-compliance, and no refund or compensation shall be payable by
          Triptribe in such cases.
        </p>
        <p className="font-bold underline">Destination Health Requirements</p>
        <p>
          The User shall be solely responsible for ensuring compliance with all
          health, medical, entry, and travel requirements applicable to the
          destination, including but not limited to vaccinations, medical
          certifications, COVID-related documentation, or any other regulatory
          requirements imposed by governmental or local authorities or Service
          Providers.
        </p>
        <p>
          Triptribe shall not be responsible or liable for any denial of entry,
          restriction, delay, missed activity, cancellation, or any other
          consequence arising out of the User&rsquo;s failure to comply with
          such requirements, nor shall Triptribe have any obligation to verify
          or inform the User of such requirements. All such obligations rest
          entirely with the User and/or the relevant Service Provider.
        </p>
      </div>
    ),
  },
  {
    id: "provider-changes",
    title: "21. Modifications By Service Providers/Trip Changes",
    content: (
      <div className="space-y-4">
        <p>
          In certain circumstances, the respective Service Providers may be
          required to make changes to confirmed itineraries, inclusions,
          schedules, accommodations, or travel dates. Such changes may arise due
          to factors including but not limited to operational constraints of
          third-party vendors, political unrest, natural disasters, weather
          conditions, logistical challenges, government regulations, health
          advisories, or any other events beyond the control of the Service
          Providers or Triptribe.
        </p>
        <p>
          The User expressly acknowledges and agrees that Triptribe does not
          control, manage, or influence any such modifications and shall not be
          responsible for any changes made by the Service Providers. In the
          event of such changes, the Service Provider may, at its sole
          discretion, communicate such changes directly or through the platform,
          and Triptribe may, as a facilitation measure only, attempt to notify
          the User; however, Triptribe shall not be under any obligation to
          ensure such communication or its timeliness.
        </p>
        <p>
          Any alternatives, substitutions, adjustments, credit notes, or
          refunds, if offered, shall be entirely at the discretion of the
          respective Service Provider and subject to their internal policies.
          Triptribe shall not be liable to provide any alternatives,
          compensation, credit, or refund independently of the Service Provider,
          nor shall it guarantee equivalence in terms of value, quality, or
          experience.
        </p>
        <p>
          Triptribe shall not be liable for any indirect, incidental,
          consequential or financial losses suffered by the User arising out of
          such modifications, including but not limited to losses relating to
          independently booked flights, visas, accommodations, transportation,
          or any other arrangements made by the User outside the platform, and
          all such risks shall be borne solely by the User.
        </p>
      </div>
    ),
  },
  {
    id: "unauthorised-payments",
    title: "22. Unauthorised Payments & Information Security",
    content: (
      <div className="space-y-4">
        <p>
          All payments towards bookings made through Triptribe and related
          services must be made only to official bank accounts, payment gateways
          or authorized payment instruments of Triptribe as duly communicated
          through the Website or official communication channels. Triptribe does
          not authorize any employee, agent, representative or third party to
          collect or accept payments in any personal or unofficial accounts
          under any circumstances whatsoever. The User expressly understands and
          agrees that Triptribe shall not be held liable for any loss, damage,
          or claim arising from payments made to any account other than those
          officially designated by Triptribe.
        </p>
        <p>
          Without prejudice to the foregoing, the User acknowledges and agrees
          that Triptribe shall not be responsible or liable in the event any
          payment is made by the User to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            any account not legally held in the name of Triptribe or its
            officially designated payment partners;
          </li>
          <li>
            any individual&rsquo;s personal account, even if such request is
            made by any person claiming to represent Triptribe; or
          </li>
          <li>
            any unauthorized or fraudulent payment link, channel or mechanism
            not expressly approved by Triptribe.
          </li>
        </ul>
        <p>
          Triptribe shall not assume any responsibility for unauthorized
          transactions, and the User hereby irrevocably waives any and all
          rights to claim refund, recovery, chargeback or compensation from
          Triptribe in respect of such payments or transfers made outside the
          authorized channels.
        </p>
        <p>
          The User is further advised and agrees not to share any sensitive
          personal or financial information including but not limited to
          credit/debit card details, CVV, OTPs, PINs, passwords, login
          credentials or banking information with any person, including
          employees or representatives of Triptribe. In the event any such
          request is received, the User shall immediately notify Triptribe
          through its official communication channels, including email at{" "}
          <a
            href="mailto:admin@triptribe.co"
            className="text-primary hover:underline"
          >
            admin@triptribe.co
          </a>
          . Triptribe shall not be liable for any financial loss, unauthorized
          access, data breach, fraud or misuse arising out of the User sharing
          such confidential information with any third party.
        </p>
        <p>
          Further, any unauthorized deposits or transfers made directly into
          Triptribe&rsquo;s bank accounts without prior written confirmation,
          acknowledgment, or booking reference shall be treated as invalid and
          unrecognized. Triptribe shall not be under any obligation to trace,
          verify, reconcile or apply such deposits to any booking or service,
          and reserves the right to forfeit or disregard such funds without any
          notice. No refund, adjustment, credit or claim shall be entertained in
          respect of such unauthorized or unidentified payments under any
          circumstances whatsoever.
        </p>
      </div>
    ),
  },
  {
    id: "miscellaneous",
    title: "23. Miscellaneous",
    content: (
      <div className="space-y-6">
        <div>
          <p className="font-bold underline">SEVERABILITY</p>
          <p>
            If any provision of this User Agreement is determined to be invalid,
            unlawful or unenforceable, in whole or in part, such invalidity or
            unenforceability shall attach only to such provision or the relevant
            part thereof, and the remaining part of such provision and all other
            provisions of this User Agreement shall continue to remain in full
            force and effect as if such invalid or unenforceable provision had
            never been included herein.
          </p>
        </div>
        <div>
          <p className="font-bold underline">JURISDICTION</p>
          <p>
            This User Agreement shall be governed by and construed in accordance
            with the laws of India, and the parties agree that any disputes
            which are not resolved amicably shall be subject to the exclusive
            jurisdiction of the competent courts at Gurgaon, Haryana, India.
          </p>
        </div>
        <div>
          <p className="font-bold underline">AMENDMENT TO THE USER AGREEMENT</p>
          <p>
            Triptribe reserves the right to modify, update, amend or replace
            this User Agreement from time to time at its sole discretion. The
            User is responsible for periodically reviewing the User Agreement to
            remain informed of any changes, and continued use of the Website
            shall constitute acceptance of such revised terms.
          </p>
        </div>
        <div>
          <p className="font-bold underline">CONFIDENTIALITY</p>
          <p>
            Any information which is specifically designated by Triptribe as
            confidential shall be maintained in strict confidence by the User
            and shall not be disclosed to any third party unless required by
            applicable law or for the purpose of fulfilling obligations under
            this User Agreement. The User agrees to take all reasonable measures
            to protect such confidential information from unauthorized access or
            disclosure.
          </p>
        </div>
        <div>
          <p className="font-bold underline">FEEDBACK FROM USER</p>
          <p>
            Triptribe may seek feedback from Users for the purpose of improving
            its platform, services and overall user experience. The User hereby
            authorizes Triptribe to contact the User via email, telephone, SMS
            or any other communication medium for collecting such feedback from
            time to time. In the event the User does not wish to be contacted
            for such purposes, the User may notify Triptribe by writing to{" "}
            <a
              href="mailto:admin@triptribe.co"
              className="text-primary hover:underline"
            >
              admin@triptribe.co
            </a>{" "}
            for specific exclusion.
          </p>
        </div>
        <div>
          <p className="font-bold underline">PRIVACY POLICY</p>
          <p>
            The User shall also refer to Triptribe&rsquo;s Privacy Policy
            available on the Website, which governs the collection, use and
            processing of personal information. By accessing or using the
            Website, the User agrees to the terms of the Privacy Policy and
            consents to the use of such information by Triptribe and its
            affiliates in accordance with the same.
          </p>
        </div>
        <div>
          <p className="font-bold underline">GRIEVANCE REDRESSAL</p>
          <p>
            Triptribe is committed to addressing and resolving concerns raised
            by Users in a timely and effective manner. In the event a User
            believes that their concern has not been resolved satisfactorily,
            the User may escalate the matter to the Grievance Officer, who shall
            endeavor to resolve the issue within 30 (thirty) working days from
            the date of escalation. Users are advised to escalate matters only
            after raising an initial complaint through the appropriate channels
            and upon non-resolution within a reasonable timeframe. For any
            escalation, the User may be required to provide relevant details
            including booking reference number and prior communication records.
          </p>
          <p className="mt-4">
            In compliance with the provisions of the Information Technology Act,
            2000 and rules made thereunder, and in accordance with the Consumer
            Protection (E-Commerce) Rules, 2020, the contact details of the
            Grievance Officer are as under:
          </p>
          <p className="mt-2 font-semibold">
            Email:{" "}
            <a
              href="mailto:admin@triptribe.co"
              className="text-primary hover:underline"
            >
              admin@triptribe.co
            </a>
          </p>
        </div>
      </div>
    ),
  },
];

const TermsOfUseClient = () => {
  const [activeTab, setActiveTab] = useState("applicability");

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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.light),theme(colors.background))] opacity-20" />
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
              Terms of Use
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 md:px-28 mt-5 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-14">
          {/* Table of Contents - Sticky Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-28 space-y-4">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                Contents
              </p>
              <nav className="flex flex-col gap-1 border-l border-border pl-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`text-left text-sm py-2 px-3 rounded-lg transition-all ${
                      activeTab === section.id
                        ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary -ml-4.25"
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
                  animationDelay: `${index * 30}ms`,
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
              <p className="text-sm text-overlay-muted italic">
                Thank you for choosing Triptribe. If you have any questions
                regarding these terms, please reach out to our grievance
                officer.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUseClient;
