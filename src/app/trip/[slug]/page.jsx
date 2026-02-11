// import { notFound } from "next/navigation";
// import Image from "next/image";
// import { trips } from "@/app/tripData";
// import Footer from "@/app/components/Footer";
// import {
//   MdKeyboardArrowDown,
//   MdOutlineCancel,
//   MdOutlinePlace,
// } from "react-icons/md";
// import { IoMdCheckmarkCircleOutline } from "react-icons/io";
// import { BsCurrencyRupee } from "react-icons/bs";
// import Navbar from "@/app/components/Navbar";
// import { LuCalendar } from "react-icons/lu";
// import { GrGroup } from "react-icons/gr";

// const slugify = (text) =>
//   text
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/(^-|-$)/g, "");

// export default async function TripPage({ params }) {
//   const { slug } = await params;

//   const trip = trips.find((t) => slugify(t.name) === slug);

//   if (!trip) notFound();

//   return (
//     <div className="bg-background text-foreground">
//       <Navbar />

//       <div className="relative h-105 w-full">
//         <Image
//           src={trip.img}
//           alt={trip.name}
//           fill
//           priority
//           className="object-cover"
//         />
//         <div className="absolute inset-0 bg-black/50" />

//         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl text-white flex flex-col gap-3">
//           <div>
//             <p className="w-fit bg-surface-lighter rounded-xl font-medium tracking-wide text-xs px-2 hover:bg-foreground text-foreground hover:text-white">
//               {trip.partner}
//             </p>
//           </div>
//           <h1 className="text-4xl md:text-5xl font-bold">{trip.name}</h1>

//           <div className="flex items-center gap-5">
//             <p className="text-sm flex items-center gap-2">
//               <MdOutlinePlace size={16} />
//               {trip.location}
//             </p>

//             <p className="text-sm flex items-center gap-2">
//               <LuCalendar size={16} />
//               {trip.duration}
//             </p>
//             <p className="text-sm flex items-center gap-2">
//               <GrGroup size={16} />
//               {trip.groupSize}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="py-10 px-5 flex flex-col gap-10 md:px-36">
//         <div className="flex flex-col gap-4">
//           <h2 className="text-3xl font-bold">Overview</h2>
//           <p className="text-lg text-overlay-muted">
//             Experience the magic of Spiti Valley in winter with snow-covered
//             landscapes and pristine monasteries.
//           </p>
//         </div>

//         <div className="flex flex-col gap-4">
//           <h2 className="text-3xl font-bold">Highlights</h2>
//           <div className="flex flex-wrap gap-3">
//             {trip.highlights.map((item, index) => (
//               <span
//                 key={index}
//                 className="px-4 py-2 rounded-xl bg-primary-aqua text-foreground text-sm font-medium"
//               >
//                 {item}
//               </span>
//             ))}
//           </div>
//         </div>

//         <div className="flex flex-col gap-4">
//           <h2 className="text-3xl font-bold">Itinerary</h2>

//           <div className="flex flex-col">
//             {trip.itinerary.map((iti, index) => (
//               <div key={index} className="flex flex-col justify-between">
//                 <div className="flex items-center justify-between rounded-lg p-4 -ml-5">
//                   <div className="flex gap-3 items-center">
//                     <div className="px-3 py-1 rounded-full bg-primary-aqua">
//                       <p className="text-white">{iti.id}</p>
//                     </div>
//                     <p className="font-semibold cursor-pointer hover:underline">
//                       {iti.heading}
//                     </p>
//                   </div>
//                   <MdKeyboardArrowDown size={20} />
//                 </div>

//                 <div className="border-b border-gray-200" />
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="flex flex-col gap-6">
//           <h2 className="text-3xl font-bold">What&apos;s Included</h2>

//           <div className="grid md:grid-cols-2 gap-8">
//             <div>
//               <p className="flex items-center gap-2 text-success mb-3">
//                 <IoMdCheckmarkCircleOutline size={22} /> Inclusions
//               </p>
//               <ul className="flex flex-col gap-2">
//                 {trip.inclusions.map((i, index) => (
//                   <li
//                     key={index}
//                     className="flex items-center gap-3 text-overlay-muted"
//                   >
//                     <IoMdCheckmarkCircleOutline
//                       size={18}
//                       className="text-success"
//                     />
//                     {i}
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             <div>
//               <p className="flex items-center gap-2 text-error mb-3">
//                 <MdOutlineCancel size={22} /> Exclusions
//               </p>
//               <ul className="flex flex-col gap-2">
//                 {trip.exclusions.map((ex, index) => (
//                   <li
//                     key={index}
//                     className="flex items-center gap-3 text-overlay-muted"
//                   >
//                     <MdOutlineCancel size={18} className="text-error" />
//                     {ex}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-col gap-5 mb-10">
//           <div className="flex flex-col gap-1">
//             <p className="text-base text-[#6c7c93]">Starting from</p>
//             <p className="flex items-center text-4xl font-bold">
//               <BsCurrencyRupee />
//               {trip.price}
//             </p>
//             <p className="text-base text-overlay-muted">per person</p>
//           </div>

//           <div className="border-b border-gray-300" />

//           <div className="flex flex-col gap-3">
//             <Info label="Duration" value={trip.duration} />
//             <Info label="Group Size" value={trip.groupSize} />
//             <Info label="Difficulty" value={trip.difficulty} />
//             <Info label="Start City" value={trip.startCity} />
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }

// function Info({ label, value }) {
//   return (
//     <div className="flex items-center justify-between">
//       <p className="text-overlay-muted">{label}</p>
//       <p>{value}</p>
//     </div>
//   );
// }

// function Section({ title, children }) {
//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">{title}</h2>
//       {children}
//     </div>
//   );
// }

// export async function generateMetadata({ params }) {
//   const { slug } = await params;

//   const trip = trips.find((t) => slugify(t.name) === slug);

//   if (!trip) {
//     return {
//       title: "Trip Not Found | TripTribe",
//       description: "The requested trip does not exist.",
//     };
//   }

//   return {
//     title: `${trip.name}`,
//     description: trip.description,
//     alternates: {
//       canonical: `https://triptribe.in/trip/${slug}`,
//     },

//     openGraph: {
//       title: trip.name,
//       description: trip.description,
//       images: [
//         {
//           url: trip.img,
//           width: 1200,
//           height: 630,
//           alt: trip.name,
//         },
//       ],
//       type: "website",
//     },

//     twitter: {
//       card: "summary_large_image",
//       title: trip.name,
//       description: trip.description,
//       images: [trip.img],
//     },
//   };
// }

// "use client";

// import { Suspense } from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { Button } from "@/app/components/ui/button";
// import {
//   MapPin,
//   Star,
//   Shield,
//   Calendar,
//   Users,
//   Clock,
//   ChevronLeft,
//   Check,
//   X,
//   ThumbsUp,
//   Share2,
//   Heart,
// } from "lucide-react";
// import { trips, reviews } from "@/app/data/tripData";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/app/components/ui/tabs";

// function TripDetailContent() {
//   const params = useParams();
//   const id = params?.id;

//   const trip = trips.find((t) => t.id === id);
//   const tripReviews = reviews.filter((r) => r.tripId === id);

//   if (!trip) {
//     return (
//       <>
//         <div className="container-premium py-32 text-center">
//           <h1 className="font-display text-display text-foreground mb-4">
//             Trip Not Found
//           </h1>
//           <Link href="/explore">
//             <Button className="btn-primary">Browse Trips</Button>
//           </Link>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <section className="relative pt-24">
//         <div className="container-premium">
//           <Link
//             href="/trips"
//             className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground mb-4"
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Back to Trips
//           </Link>

//           <div className="grid lg:grid-cols-2 gap-8">
//             <div className="space-y-4">
//               <div className="aspect-[4/3] rounded-2xl overflow-hidden">
//                 <img
//                   src={trip.image}
//                   alt={trip.name}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div className="grid grid-cols-4 gap-2">
//                 {[1, 2, 3, 4].map((i) => (
//                   <div
//                     key={i}
//                     className="aspect-square rounded-lg overflow-hidden bg-muted"
//                   >
//                     <img
//                       src={trip.image}
//                       alt={`${trip.name} ${i}`}
//                       className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <div className="flex items-center gap-3 mb-4">
//                 {trip.verified && (
//                   <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-body-sm font-medium">
//                     <Shield className="w-4 h-4" />
//                     Verified Trip
//                   </span>
//                 )}
//                 <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-body-sm font-medium">
//                   {trip.type}
//                 </span>
//               </div>

//               <h1 className="font-display text-display text-foreground mb-2">
//                 {trip.name}
//               </h1>

//               <div className="flex items-center gap-2 text-body text-muted-foreground mb-4">
//                 <MapPin className="w-5 h-5" />
//                 {trip.destination}, {trip.region}
//               </div>

//               <div className="flex items-center gap-4 mb-6">
//                 <div className="flex items-center gap-1">
//                   <Star className="w-5 h-5 fill-accent text-accent" />
//                   <span className="font-semibold text-foreground">
//                     {trip.rating}
//                   </span>
//                   <span className="text-muted-foreground">
//                     ({trip.reviewCount} reviews)
//                   </span>
//                 </div>
//               </div>

//               <div className="card-premium p-4 mb-6">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
//                     <Shield className="w-6 h-6 text-primary" />
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-body-sm text-muted-foreground">
//                       Organized by
//                     </p>
//                     <p className="font-semibold text-foreground">
//                       {trip.provider.name}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <div className="flex items-center gap-1">
//                       <Star className="w-4 h-4 fill-accent text-accent" />
//                       <span className="font-medium">
//                         {trip.provider.rating}
//                       </span>
//                     </div>
//                     <p className="text-body-sm text-muted-foreground">
//                       {trip.provider.reviewCount} reviews
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <div className="card-premium p-4">
//                   <Calendar className="w-5 h-5 text-primary mb-2" />
//                   <p className="text-body-sm text-muted-foreground">Duration</p>
//                   <p className="font-semibold text-foreground">
//                     {trip.duration}
//                   </p>
//                 </div>
//                 <div className="card-premium p-4">
//                   <Users className="w-5 h-5 text-primary mb-2" />
//                   <p className="text-body-sm text-muted-foreground">
//                     Group Size
//                   </p>
//                   <p className="font-semibold text-foreground">
//                     {trip.groupSize} people
//                   </p>
//                 </div>
//                 <div className="card-premium p-4">
//                   <Clock className="w-5 h-5 text-primary mb-2" />
//                   <p className="text-body-sm text-muted-foreground">
//                     Next Batch
//                   </p>
//                   <p className="font-semibold text-foreground">
//                     {new Date(trip.startDate).toLocaleDateString("en-IN", {
//                       month: "short",
//                       day: "numeric",
//                     })}
//                   </p>
//                 </div>
//                 <div className="card-premium p-4">
//                   <MapPin className="w-5 h-5 text-primary mb-2" />
//                   <p className="text-body-sm text-muted-foreground">
//                     Difficulty
//                   </p>
//                   <p className="font-semibold text-foreground">
//                     {trip.difficulty}
//                   </p>
//                 </div>
//               </div>

//               <div className="card-premium p-6 bg-primary/5 border-primary/20">
//                 <div className="flex items-end justify-between mb-4">
//                   <div>
//                     <p className="text-body-sm text-muted-foreground">
//                       Starting from
//                     </p>
//                     <p className="font-display text-display text-primary">
//                       ₹{trip.priceFrom.toLocaleString()}
//                     </p>
//                     <p className="text-body-sm text-muted-foreground">
//                       per person
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Button variant="outline" size="icon">
//                       <Heart className="w-5 h-5" />
//                     </Button>
//                     <Button variant="outline" size="icon">
//                       <Share2 className="w-5 h-5" />
//                     </Button>
//                   </div>
//                 </div>
//                 <Button className="btn-primary w-full text-body py-6">
//                   Book This Trip
//                 </Button>
//                 <p className="text-body-sm text-muted-foreground text-center mt-3">
//                   Free cancellation up to 7 days before
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="section bg-background">
//         <div className="container-premium">
//           <Tabs defaultValue="overview" className="w-full">
//             <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent mb-8">
//               <TabsTrigger
//                 value="overview"
//                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
//               >
//                 Overview
//               </TabsTrigger>
//               <TabsTrigger
//                 value="itinerary"
//                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
//               >
//                 Itinerary
//               </TabsTrigger>
//               <TabsTrigger
//                 value="inclusions"
//                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
//               >
//                 Inclusions
//               </TabsTrigger>
//               <TabsTrigger
//                 value="reviews"
//                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
//               >
//                 Reviews ({trip.reviewCount})
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="overview" className="mt-0">
//               <div className="grid lg:grid-cols-3 gap-8">
//                 <div className="lg:col-span-2 space-y-8">
//                   <div>
//                     <h3 className="font-display text-heading-lg text-foreground mb-4">
//                       Highlights
//                     </h3>
//                     <ul className="grid sm:grid-cols-2 gap-3">
//                       {trip.highlights.map((highlight, i) => (
//                         <li
//                           key={i}
//                           className="flex items-center gap-3 text-body"
//                         >
//                           <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
//                             <Check className="w-4 h-4 text-primary" />
//                           </span>
//                           {highlight}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>

//                   <div>
//                     <h3 className="font-display text-heading-lg text-foreground mb-4">
//                       About This Trip
//                     </h3>
//                     <p className="text-body text-muted-foreground leading-relaxed">
//                       Experience the breathtaking beauty of {trip.destination}{" "}
//                       with {trip.provider.name}. This{" "}
//                       {trip.duration.toLowerCase()} adventure takes you through
//                       some of the most stunning landscapes in {trip.region}.
//                       Perfect for travelers seeking {trip.type.toLowerCase()}{" "}
//                       experiences with a group of {trip.groupSize} like-minded
//                       adventurers.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-6">
//                   <div className="card-premium p-6">
//                     <h4 className="font-semibold text-foreground mb-4">
//                       Trip Details
//                     </h4>
//                     <dl className="space-y-3 text-body-sm">
//                       <div className="flex justify-between">
//                         <dt className="text-muted-foreground">Destination</dt>
//                         <dd className="font-medium">{trip.destination}</dd>
//                       </div>
//                       <div className="flex justify-between">
//                         <dt className="text-muted-foreground">Region</dt>
//                         <dd className="font-medium">{trip.region}</dd>
//                       </div>
//                       <div className="flex justify-between">
//                         <dt className="text-muted-foreground">Duration</dt>
//                         <dd className="font-medium">{trip.duration}</dd>
//                       </div>
//                       <div className="flex justify-between">
//                         <dt className="text-muted-foreground">Difficulty</dt>
//                         <dd className="font-medium">{trip.difficulty}</dd>
//                       </div>
//                       <div className="flex justify-between">
//                         <dt className="text-muted-foreground">Group Size</dt>
//                         <dd className="font-medium">{trip.groupSize}</dd>
//                       </div>
//                     </dl>
//                   </div>
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="itinerary" className="mt-0">
//               <div className="max-w-3xl">
//                 <h3 className="font-display text-heading-lg text-foreground mb-6">
//                   Day-by-Day Itinerary
//                 </h3>
//                 <div className="space-y-6">
//                   {Array.from({ length: parseInt(trip.duration) }, (_, i) => (
//                     <div key={i} className="flex gap-4">
//                       <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-display text-heading-sm flex-shrink-0">
//                         {i + 1}
//                       </div>
//                       <div className="flex-1 card-premium p-6">
//                         <h4 className="font-semibold text-foreground mb-2">
//                           Day {i + 1}
//                         </h4>
//                         <p className="text-body text-muted-foreground">
//                           {i === 0
//                             ? `Arrival and welcome at ${trip.destination}. Meet your group and trip leader.`
//                             : i === parseInt(trip.duration) - 1
//                               ? "Departure day. Farewell breakfast and transfer."
//                               : `Explore ${
//                                   trip.highlights[i % trip.highlights.length] ||
//                                   "local attractions"
//                                 }. Activities based on weather and group preferences.`}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="inclusions" className="mt-0">
//               <div className="grid md:grid-cols-2 gap-8">
//                 <div>
//                   <h3 className="font-display text-heading-lg text-foreground mb-6 flex items-center gap-2">
//                     <Check className="w-6 h-6 text-success" />
//                     What&apos;s Included
//                   </h3>
//                   <ul className="space-y-3">
//                     {trip.inclusions.map((item, i) => (
//                       <li key={i} className="flex items-center gap-3 text-body">
//                         <Check className="w-5 h-5 text-success shrink-0" />
//                         {item}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div>
//                   <h3 className="font-display text-heading-lg text-foreground mb-6 flex items-center gap-2">
//                     <X className="w-6 h-6 text-destructive" />
//                     What&apos;s Not Included
//                   </h3>
//                   <ul className="space-y-3">
//                     {trip.exclusions.map((item, i) => (
//                       <li
//                         key={i}
//                         className="flex items-center gap-3 text-body text-muted-foreground"
//                       >
//                         <X className="w-5 h-5 text-destructive shrink-0" />
//                         {item}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="reviews" className="mt-0">
//               <div className="max-w-3xl">
//                 <div className="flex items-center gap-6 mb-8">
//                   <div className="text-center">
//                     <p className="font-display text-display-lg text-primary">
//                       {trip.rating}
//                     </p>
//                     <div className="flex items-center gap-1 justify-center mb-1">
//                       {Array.from({ length: 5 }).map((_, i) => (
//                         <Star
//                           key={i}
//                           className={`w-5 h-5 ${
//                             i < Math.floor(trip.rating)
//                               ? "fill-accent text-accent"
//                               : "text-muted"
//                           }`}
//                         />
//                       ))}
//                     </div>
//                     <p className="text-body-sm text-muted-foreground">
//                       {trip.reviewCount} reviews
//                     </p>
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 text-body-sm mb-1">
//                       <span className="w-8">5★</span>
//                       <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-accent rounded-full"
//                           style={{ width: "70%" }}
//                         />
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2 text-body-sm mb-1">
//                       <span className="w-8">4★</span>
//                       <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-accent rounded-full"
//                           style={{ width: "20%" }}
//                         />
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2 text-body-sm">
//                       <span className="w-8">3★</span>
//                       <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-accent rounded-full"
//                           style={{ width: "10%" }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-6">
//                   {tripReviews.length > 0 ? (
//                     tripReviews.map((review) => (
//                       <div key={review.id} className="card-premium p-6">
//                         <div className="flex items-start gap-4 mb-4">
//                           <img
//                             src={review.userImage}
//                             alt={review.userName}
//                             className="w-12 h-12 rounded-full object-cover"
//                           />
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-1">
//                               <h4 className="font-semibold text-foreground">
//                                 {review.userName}
//                               </h4>
//                               {review.verified && (
//                                 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs">
//                                   <Shield className="w-3 h-3" />
//                                   Verified
//                                 </span>
//                               )}
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <div className="flex items-center gap-0.5">
//                                 {Array.from({ length: review.rating }).map(
//                                   (_, i) => (
//                                     <Star
//                                       key={i}
//                                       className="w-4 h-4 fill-accent text-accent"
//                                     />
//                                   ),
//                                 )}
//                               </div>
//                               <span className="text-body-sm text-muted-foreground">
//                                 {new Date(review.date).toLocaleDateString(
//                                   "en-IN",
//                                   { month: "short", year: "numeric" },
//                                 )}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                         <h5 className="font-medium text-foreground mb-2">
//                           {review.title}
//                         </h5>
//                         <p className="text-body text-muted-foreground mb-4">
//                           {review.content}
//                         </p>
//                         <button className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground">
//                           <ThumbsUp className="w-4 h-4" />
//                           Helpful ({review.helpful})
//                         </button>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-center py-8">
//                       <p className="text-muted-foreground">
//                         No reviews yet for this trip.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </section>
//     </>
//   );
// }

// export default function TripDetailPage() {
//   return (
//     <Suspense fallback={<div className="p-8">Loading trip...</div>}>
//       <TripDetailContent />
//     </Suspense>
//   );
// }

// async function generateMetadata({ params }) {
//   const { slug } = await params;

//   const trip = trips.find((t) => slugify(t.name) === slug);

//   if (!trip) {
//     return {
//       title: "Trip Not Found | TripTribe",
//       description: "The requested trip does not exist.",
//     };
//   }

//   return {
//     title: `${trip.name}`,
//     description: trip.description,
//     alternates: {
//       canonical: `https://triptribe.in/trip/${slug}`,
//     },

//     openGraph: {
//       title: trip.name,
//       description: trip.description,
//       images: [
//         {
//           url: trip.img,
//           width: 1200,
//           height: 630,
//           alt: trip.name,
//         },
//       ],
//       type: "website",
//     },

//     twitter: {
//       card: "summary_large_image",
//       title: trip.name,
//       description: trip.description,
//       images: [trip.img],
//     },
//   };
// }

// app/trip/[id]/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import TripDetailContent from "./trip-content";
import { trips } from "@/app/data/tripData";

// Helper function for slug generation
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default async function TripPage({ params }) {
  const { name } = await params;

  console.log("Requested slug:", name);

  // Debug: See what slugs are being generated
  const tripSlugs = trips.map((t) => ({
    name: t.name,
    slug: slugify(t.name),
    id: t.id,
  }));
  console.log("Available slugs:", tripSlugs);

  // Find trip by slug (id parameter contains the slug)
  const trip = trips.find((t) => slugify(t.name) === name);

  console.log("Found trip:", trip ? trip.name : "NOT FOUND");

  if (!trip) notFound();

  return (
    <Suspense fallback={<div className="p-8">Loading trip...</div>}>
      <TripDetailContent trip={trip} />
    </Suspense>
  );
}

// Generate metadata based on the trip
export async function generateMetadata({ params }) {
  const { id } = await params;
  const trip = trips.find((t) => slugify(t.name) === id);

  if (!trip) {
    return {
      title: "Trip Not Found | TripTribe",
      description: "The requested trip does not exist.",
    };
  }

  return {
    title: `${trip.name} | TripTribe`,
    description: `Experience ${trip.name} in ${trip.destination}. ${trip.duration} adventure with verified provider ${trip.provider?.name || "our partner"}. Book now!`,
    alternates: {
      canonical: `https://triptribe.in/trip/${name}`,
    },
    openGraph: {
      title: trip.name,
      description: `Experience ${trip.name} in ${trip.destination}. Starting at ₹${trip.priceFrom?.toLocaleString() || "contact us"}`,
      images: [
        {
          url: trip.image || trip.img,
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
      description: `Experience ${trip.name} in ${trip.destination}`,
      images: [trip.image || trip.img],
    },
  };
}

// Generate static paths at build time
export async function generateStaticParams() {
  const params = trips.map((trip) => ({
    id: slugify(trip.name),
  }));

  console.log("Generated static params:", params);

  return params;
}
