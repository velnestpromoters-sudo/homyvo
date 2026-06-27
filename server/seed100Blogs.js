const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('./models/Blog');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://bnest:homyvo123@bnest.b6nloav.mongodb.net/";

const AUTHORS = [
  'Senthil (Founder)',
  'Deepak (Project Manager)',
  'Mahesh (UI/UX Designer)',
  'Sudharsan (Full Stack Dev)',
  'Sathya (Digital Marketing)',
  'Sanjeevi (CFO)'
];

const CITIES = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy', 'Tiruppur', 'Erode', 'Vellore', 'Tirunelveli', 'Thanjavur'];

const LOCALITIES_CHENNAI = ['Velachery', 'Adyar', 'OMR Road', 'T-Nagar', 'Guindy', 'Thiruvanmiyur', 'Tambaram', 'Chromepet', 'Anna Nagar', 'Nungambakkam'];
const LOCALITIES_COIMBATORE = ['Saravanampatti', 'Peelamedu', 'Gandhipuram', 'RS Puram', 'Ramanathapuram', 'Singanallur', 'Saibaba Colony', 'Kovaipudur', 'Vadavalli', 'Race Course'];

const TOPIC_TEMPLATES = [
  {
    title: "How to Find Broker-Free Rent in {locality}, {city}",
    excerpt: "Looking for PG or apartments in {locality}? Learn how to find verified direct-owner listings and bypass broker commissions in {city}.",
    content: "Renting in {locality}, {city} has become increasingly popular due to local growth, college hubs, and IT corridors. However, traditional real estate brokers charge up to one to two months' rent as brokerage. By renting directly through platforms like Homyvo, you bypass these commissions entirely. When searching in {locality}, make sure to check water facilities, local transport access, and negotiate security deposits directly with the owner.",
    category: "Renting Guides"
  },
  {
    title: "Guide to Rental Agreements in {locality}, {city}",
    excerpt: "Everything you need to know about security deposits, 11-month agreements, and registration in {locality}.",
    content: "Drafting a solid rental agreement is the most critical step of renting a house or PG room in {locality}, {city}. Most local agreements default to 11 months to bypass registration fee requirements. However, under the Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act (TNRRDLA), it is now legally required to submit a written contract. We cover standard notice periods and deposit refund clauses in this article.",
    category: "Tenant Rights"
  },
  {
    title: "Real Estate SEO Tips for Property Owners in {city}",
    excerpt: "Boost your property listing visibility on Google for searchers looking in {locality} with targeted SEO keywords.",
    content: "If you own a property in {locality}, {city}, getting it discovered by tenants online is all about SEO (Search Engine Optimization). By understanding keyword intents (informational vs transactional) and posting listings with high-volume keywords like 'broker free flat in {locality}', you can rank higher on Google search results. Learn how Homyvo optimizes user listings automatically to drive organic search traffic directly to you.",
    category: "SEO & Marketing"
  },
  {
    title: "Top Localities for Students and Bachelors in {city}",
    excerpt: "Explore the budget-friendly student areas around {locality} in {city} with verified amenities.",
    content: "Finding student housing in {city} can be challenging. Neighborhoods like {locality} offer the best amenities, hostels, and proximity to major colleges. In this guide, we break down average rental costs, PG room sharing, Wi-Fi packages, food facilities, and safety guidelines for bachelors moving to {city}.",
    category: "Renting Guides"
  }
];

const GRADIENTS = [
  'from-[#801786] to-[#ec38b7]',
  'from-[#2563eb] to-[#3b82f6]',
  'from-[#059669] to-[#10b981]'
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    // Clear existing blogs
    console.log("Clearing existing blogs...");
    await Blog.deleteMany({});

    const blogsToInsert = [];

    // Let's generate 100 blogs
    for (let i = 1; i <= 100; i++) {
      const city = CITIES[i % CITIES.length];
      const locality = city === 'Chennai' 
        ? LOCALITIES_CHENNAI[i % LOCALITIES_CHENNAI.length] 
        : LOCALITIES_COIMBATORE[i % LOCALITIES_COIMBATORE.length];
      
      const template = TOPIC_TEMPLATES[i % TOPIC_TEMPLATES.length];
      const author = AUTHORS[i % AUTHORS.length];
      const gradient = GRADIENTS[i % GRADIENTS.length];

      const title = template.title.replace(/{locality}/g, locality).replace(/{city}/g, city) + ` (Part ${Math.floor(i / 10) + 1})`;
      const excerpt = template.excerpt.replace(/{locality}/g, locality).replace(/{city}/g, city);
      const content = template.content.replace(/{locality}/g, locality).replace(/{city}/g, city) + " This guide is curated by Homyvo's core advisory team to help you navigate rental structures cleanly and securely.";
      
      let baseSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Ensure slug uniqueness by appending index
      const slug = `${baseSlug}-${i}`;

      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - (100 - i)); // offset dates back in time
      const dateString = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const words = content.split(/\s+/).length;
      const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

      blogsToInsert.push({
        title,
        slug,
        excerpt,
        content,
        category: template.category,
        date: dateString,
        readTime,
        author,
        imageColor: gradient
      });
    }

    console.log(`Inserting ${blogsToInsert.length} blogs into MongoDB...`);
    await Blog.insertMany(blogsToInsert);
    console.log("Seeding complete! 100 blogs successfully published.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
