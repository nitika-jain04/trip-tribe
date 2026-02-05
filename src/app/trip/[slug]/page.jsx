// app/trip/[slug]/page.jsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { trips } from "@/app/tripData";
import Footer from "@/app/components/Footer";
import { MdKeyboardArrowDown, MdOutlineCancel } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { BsCurrencyRupee } from "react-icons/bs";

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default async function TripPage({ params }) {
  const { slug } = await params;

  const trip = trips.find((t) => slugify(t.name) === slug);

  if (!trip) notFound();

  return (
    <div className="bg-background text-foreground">
      <div className="relative h-105 w-full">
        <Image
          src={trip.img}
          alt={trip.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl text-white">
          <p className="text-sm mb-2">{trip.location}</p>
          <h1 className="text-4xl md:text-5xl font-bold">{trip.name}</h1>
          <p className="mt-3 max-w-2xl text-white/90">{trip.description}</p>
        </div>
      </div>

      <div className="py-10 px-5 flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold">Overview</h2>
          <p className="text-lg text-overlay-muted">
            Experience the magic of Spiti Valley in winter with snow-covered
            landscapes and pristine monasteries.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold">Highlights</h2>
          <div className="flex flex-wrap gap-3">
            {trip.highlights.map((item, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-xl bg-primary-aqua text-foreground text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold">Itinerary</h2>

          <div className="flex flex-col">
            {trip.itinerary.map((iti, index) => (
              <div key={index} className="flex flex-col justify-between">
                <div className="flex items-center justify-between rounded-lg p-4 -ml-5">
                  <div className="flex gap-3 items-center">
                    <div className="px-3 py-1 rounded-full bg-primary-aqua">
                      <p className="text-white">{iti.id}</p>
                    </div>
                    <p className="font-semibold cursor-pointer hover:underline">
                      {iti.heading}
                    </p>
                  </div>
                  <MdKeyboardArrowDown size={20} />
                </div>

                <div className="border-b border-gray-200" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-bold">What&apos;s Included</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="flex items-center gap-2 text-success mb-3">
                <IoMdCheckmarkCircleOutline size={22} /> Inclusions
              </p>
              <ul className="flex flex-col gap-2">
                {trip.inclusions.map((i, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-overlay-muted"
                  >
                    <IoMdCheckmarkCircleOutline
                      size={18}
                      className="text-success"
                    />
                    {i}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="flex items-center gap-2 text-error mb-3">
                <MdOutlineCancel size={22} /> Exclusions
              </p>
              <ul className="flex flex-col gap-2">
                {trip.exclusions.map((ex, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-overlay-muted"
                  >
                    <MdOutlineCancel size={18} className="text-error" />
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 mb-10">
          <div className="flex flex-col gap-1">
            <p className="text-base text-[#6c7c93]">Starting from</p>
            <p className="flex items-center text-4xl font-bold">
              <BsCurrencyRupee />
              {trip.price}
            </p>
            <p className="text-base text-overlay-muted">per person</p>
          </div>

          <div className="border-b border-gray-300" />

          <div className="flex flex-col gap-3">
            <Info label="Duration" value={trip.duration} />
            <Info label="Group Size" value={trip.groupSize} />
            <Info label="Difficulty" value={trip.difficulty} />
            <Info label="Start City" value={trip.startCity} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-overlay-muted">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const trip = trips.find((t) => slugify(t.name) === slug);

  if (!trip) {
    return {
      title: "Trip Not Found | TripTribe",
      description: "The requested trip does not exist.",
    };
  }

  return {
    title: `${trip.name}`,
    description: trip.description,
    alternates: {
      canonical: `https://triptribe.in/trip/${slug}`,
    },

    openGraph: {
      title: trip.name,
      description: trip.description,
      images: [
        {
          url: trip.img,
          width: 1200,
          height: 630,
          alt: trip.name,
        },
      ],
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: trip.name,
      description: trip.description,
      images: [trip.img],
    },
  };
}
