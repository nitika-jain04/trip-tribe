// Mock data for TripTribe aggregator platform

export const providers = [
  {
    id: "p1",
    name: "Himalayan Explorers",
    logo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=80",
    rating: 4.8,
    reviewCount: 342,
    verified: true,
    yearsActive: 8,
  },
  {
    id: "p2",
    name: "Northeast Wanderers",
    logo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=100&q=80",
    rating: 4.6,
    reviewCount: 189,
    verified: true,
    yearsActive: 5,
  },
  {
    id: "p3",
    name: "Coastal Tribes",
    logo: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=100&q=80",
    rating: 4.9,
    reviewCount: 456,
    verified: true,
    yearsActive: 10,
  },
  {
    id: "p4",
    name: "Desert Nomads",
    logo: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=100&q=80",
    rating: 4.7,
    reviewCount: 278,
    verified: true,
    yearsActive: 6,
  },
];

export const trips = [
  {
    id: "t1",
    name: "Spiti Valley Explorer",
    destination: "Spiti Valley",
    region: "Himachal Pradesh",
    duration: "9 Days",
    startDate: "2024-06-15",
    endDate: "2024-06-23",
    priceFrom: 28000,
    priceTo: 35000,
    provider: providers[0],
    rating: 4.9,
    reviewCount: 156,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    difficulty: "Moderate",
    groupSize: "12-15",
    type: "Trek",
    highlights: [
      "Key Monastery",
      "Chandratal Lake",
      "Kunzum Pass",
      "Dhankar Monastery",
    ],
    inclusions: ["Accommodation", "Meals", "Transport", "Guide", "Permits"],
    exclusions: ["Personal expenses", "Travel insurance", "Tips"],
    verified: true,
  },
  {
    id: "t2",
    name: "Meghalaya Living Root Bridges",
    destination: "Meghalaya",
    region: "Northeast India",
    duration: "7 Days",
    startDate: "2024-07-01",
    endDate: "2024-07-07",
    priceFrom: 24000,
    priceTo: 30000,
    provider: providers[1],
    rating: 4.7,
    reviewCount: 98,
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    difficulty: "Moderate",
    groupSize: "8-12",
    type: "Trek",
    highlights: [
      "Double Decker Root Bridge",
      "Rainbow Falls",
      "Dawki River",
      "Mawlynnong Village",
    ],
    inclusions: ["Homestay", "Breakfast & Dinner", "Local Guide", "Permits"],
    exclusions: ["Lunch", "Personal expenses", "Travel to Shillong"],
    verified: true,
  },
  {
    id: "t3",
    name: "Kerala Backwaters Retreat",
    destination: "Kerala",
    region: "South India",
    duration: "5 Days",
    startDate: "2024-06-20",
    endDate: "2024-06-24",
    priceFrom: 32000,
    priceTo: 40000,
    provider: providers[2],
    rating: 4.8,
    reviewCount: 234,
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    difficulty: "Easy",
    groupSize: "6-10",
    type: "Wellness",
    highlights: [
      "Houseboat Stay",
      "Ayurvedic Spa",
      "Kathakali Performance",
      "Spice Plantation",
    ],
    inclusions: [
      "Luxury Houseboat",
      "All Meals",
      "Spa Sessions",
      "Cultural Shows",
    ],
    exclusions: ["Flights", "Personal shopping", "Tips"],
    verified: true,
  },
  {
    id: "t4",
    name: "Rajasthan Desert Safari",
    destination: "Jaisalmer",
    region: "Rajasthan",
    duration: "6 Days",
    startDate: "2024-10-05",
    endDate: "2024-10-10",
    priceFrom: 22000,
    priceTo: 28000,
    provider: providers[3],
    rating: 4.6,
    reviewCount: 167,
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    difficulty: "Easy",
    groupSize: "10-14",
    type: "Cultural",
    highlights: [
      "Desert Camping",
      "Camel Safari",
      "Jaisalmer Fort",
      "Sam Sand Dunes",
    ],
    inclusions: [
      "Heritage Hotel",
      "Desert Camp",
      "Meals",
      "Camel Ride",
      "Guide",
    ],
    exclusions: ["Flights", "Personal expenses", "Optional activities"],
    verified: true,
  },
  {
    id: "t5",
    name: "Ladakh Bike Expedition",
    destination: "Ladakh",
    region: "Jammu & Kashmir",
    duration: "11 Days",
    startDate: "2024-07-15",
    endDate: "2024-07-25",
    priceFrom: 45000,
    priceTo: 55000,
    provider: providers[0],
    rating: 4.9,
    reviewCount: 89,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    difficulty: "Challenging",
    groupSize: "8-12",
    type: "Adventure",
    highlights: [
      "Khardung La",
      "Pangong Lake",
      "Nubra Valley",
      "Magnetic Hill",
    ],
    inclusions: [
      "Bike Rental",
      "Fuel",
      "Accommodation",
      "Support Vehicle",
      "Mechanic",
    ],
    exclusions: ["Gear", "Personal expenses", "Travel insurance"],
    verified: true,
  },
  {
    id: "t6",
    name: "Coorg Coffee Trail",
    destination: "Coorg",
    region: "Karnataka",
    duration: "4 Days",
    startDate: "2024-08-10",
    endDate: "2024-08-13",
    priceFrom: 18000,
    priceTo: 24000,
    provider: providers[2],
    rating: 4.5,
    reviewCount: 145,
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    difficulty: "Easy",
    groupSize: "6-10",
    type: "Workation",
    highlights: [
      "Coffee Plantation Tour",
      "Abbey Falls",
      "Raja Seat",
      "Namdroling Monastery",
    ],
    inclusions: ["Homestay", "Breakfast", "Plantation Tour", "Local Transport"],
    exclusions: ["Lunch & Dinner", "Personal expenses"],
    verified: true,
  },
];

export const reviews = [
  {
    id: "r1",
    tripId: "t1",
    userName: "Priya Sharma",
    userImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    rating: 5,
    date: "2024-05-20",
    title: "Life-changing experience!",
    content:
      "The Spiti Valley trip was absolutely incredible. The views were breathtaking and our guide was extremely knowledgeable. Highly recommend Himalayan Explorers!",
    verified: true,
    helpful: 45,
  },
  {
    id: "r2",
    tripId: "t1",
    userName: "Rahul Menon",
    userImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    rating: 5,
    date: "2024-05-18",
    title: "Perfect organization",
    content:
      "Everything was so well organized. From pickup to drop, every detail was taken care of. The group was amazing too!",
    verified: true,
    helpful: 32,
  },
  {
    id: "r3",
    tripId: "t2",
    userName: "Ananya Patel",
    userImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    rating: 4,
    date: "2024-04-15",
    title: "Beautiful but challenging",
    content:
      "The living root bridges are a must-see! Be prepared for lots of steps. The local homestays were authentic and welcoming.",
    verified: true,
    helpful: 28,
  },
];

export const blogPosts = [
  {
    id: "b1",
    title: "My Solo Journey Through Spiti Valley",
    excerpt:
      "A transformative 10-day adventure through one of India's most remote and beautiful regions.",
    content: "Full blog content here...",
    author: "Meera Krishnan",
    authorImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    date: "2024-05-15",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    type: "blog",
    tags: ["Spiti", "Solo Travel", "Adventure"],
    approved: true,
  },
  {
    id: "b2",
    title: "Living Root Bridges: Nature's Engineering Marvel",
    excerpt:
      "Exploring the incredible living root bridges of Meghalaya with a community of travelers.",
    content: "Full blog content here...",
    author: "Arjun Mehta",
    authorImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    date: "2024-04-28",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    type: "vlog",
    videoUrl: "https://www.youtube.com/watch?v=example",
    tags: ["Meghalaya", "Nature", "Trek"],
    approved: true,
  },
  {
    id: "b3",
    title: "Kerala Backwaters: A Photo Journey",
    excerpt:
      "Capturing the serene beauty of Kerala's backwaters through my lens.",
    content: "Full blog content here...",
    author: "Sneha Gupta",
    authorImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    date: "2024-04-10",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    type: "photo-story",
    tags: ["Kerala", "Photography", "Wellness"],
    approved: true,
  },
];

export const destinations = [
  {
    name: "Ladakh",
    trips: 24,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    name: "Spiti Valley",
    trips: 18,
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  },
  {
    name: "Kerala",
    trips: 32,
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80",
  },
  {
    name: "Meghalaya",
    trips: 15,
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  },
  {
    name: "Rajasthan",
    trips: 28,
    image:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80",
  },
  {
    name: "Goa",
    trips: 22,
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80",
  },
];

export const tripTypes = [
  "All Types",
  "Trek",
  "Backpack",
  "Wellness",
  "Cultural",
  "Adventure",
  "Workation",
  "Weekend",
];
