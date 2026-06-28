require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const SearchConsole = require('./models/SearchConsole');

async function seed() {
  try {
    await connectDB();
    console.log('MongoDB connected for seeding Search Console data...');

    // Delete existing records
    await SearchConsole.deleteMany({});
    console.log('Cleared existing SearchConsole records.');

    // Define dates: May 1, 2026 to June 28, 2026 (59 days)
    const startDate = new Date('2026-05-01');
    const endDate = new Date('2026-06-28');
    const days = [];
    
    let current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const totalDays = days.length;
    console.log(`Generating SearchConsole stats for ${totalDays} days...`);

    // Target clicks: exactly 113
    // Target impressions: exactly 140
    // May 20, 2026 must have 0 clicks, 0 impressions, ctr: 0, position: 1.0 (to match Wednesday 20 May screenshot)

    // Pre-calculate distribution of clicks and impressions
    let clicksRemaining = 113;
    let impressionsRemaining = 140;
    
    const clickDistribution = Array(totalDays).fill(0);
    const impressionDistribution = Array(totalDays).fill(0);

    // Identify index of May 20, 2026
    let may20Index = -1;
    for (let i = 0; i < totalDays; i++) {
      const dateStr = days[i].toISOString().split('T')[0];
      if (dateStr === '2026-05-20') {
        may20Index = i;
        break;
      }
    }
    console.log(`May 20 Index: ${may20Index}`);

    // Generate patterns: some active days, some low days
    // Make sure we distribute exactly clicksRemaining and impressionsRemaining
    // Skip may20Index

    const activeIndices = [];
    for (let i = 0; i < totalDays; i++) {
      if (i !== may20Index) {
        activeIndices.push(i);
      }
    }

    // Distribute clicks
    while (clicksRemaining > 0) {
      const idx = activeIndices[Math.floor(Math.random() * activeIndices.length)];
      // Add a small spike (1-3 clicks)
      const amt = Math.min(clicksRemaining, Math.floor(Math.random() * 3) + 1);
      clickDistribution[idx] += amt;
      clicksRemaining -= amt;
    }

    // Distribute impressions (must be >= clicks on each day)
    // First, ensure impressions >= clicks for each active index
    for (let i = 0; i < totalDays; i++) {
      if (i !== may20Index) {
        impressionDistribution[i] = clickDistribution[i];
        impressionsRemaining -= clickDistribution[i];
      }
    }

    // Distribute the remaining impressions randomly
    while (impressionsRemaining > 0) {
      const idx = activeIndices[Math.floor(Math.random() * activeIndices.length)];
      impressionDistribution[idx] += 1;
      impressionsRemaining -= 1;
    }

    // Double check totals
    let actualClicks = 0;
    let actualImpressions = 0;
    for (let i = 0; i < totalDays; i++) {
      actualClicks += clickDistribution[i];
      actualImpressions += impressionDistribution[i];
    }
    console.log(`Distributed Clicks: ${actualClicks}, Impressions: ${actualImpressions}`);

    // Pre-calculated queries, pages, countries, and devices to keep exact distributions
    const queryPool = [
      { text: 'rent house in chennai', page: '/home-list', weight: 0.5 },
      { text: 'luxury apartment homyvo', page: '/', weight: 0.3 },
      { text: 'tenant rights guide tamil nadu', page: '/blog/tenant-rights-explanation', weight: 0.15 },
      { text: 'coimbatore rentals', page: '/rentals/coimbatore', weight: 0.05 }
    ];

    const countryPool = [
      { text: 'India', weight: 0.85 },
      { text: 'United States', weight: 0.10 },
      { text: 'United Kingdom', weight: 0.05 }
    ];

    const devicePool = [
      { text: 'Mobile', weight: 0.75 },
      { text: 'Desktop', weight: 0.20 },
      { text: 'Tablet', weight: 0.05 }
    ];

    // Build the SearchConsole documents list
    const docs = [];

    // Helper to get random weighted item
    function getWeightedItem(pool) {
      const r = Math.random();
      let sum = 0;
      for (const item of pool) {
        sum += item.weight;
        if (r <= sum) return item;
      }
      return pool[0];
    }

    for (let i = 0; i < totalDays; i++) {
      const date = days[i];
      const clicks = clickDistribution[i];
      const impressions = impressionDistribution[i];

      if (clicks === 0 && impressions === 0) {
        // Still seed an entry for May 20th so the DB query has the date point but with 0 values
        // Position should average to 1.2, let's use 1.0 when there are no impressions
        docs.push({
          date,
          query: 'rent house in chennai',
          pagePath: '/home-list',
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 1.0,
          country: 'India',
          device: 'Mobile'
        });
        continue;
      }

      // To make the aggregations look perfect, we can split this day's clicks/impressions amongst queries
      let clicksLeft = clicks;
      let impsLeft = impressions;

      // Distribute day's counts into sub-records by query
      while (impsLeft > 0) {
        const queryItem = getWeightedItem(queryPool);
        const countryItem = getWeightedItem(countryPool);
        const deviceItem = getWeightedItem(devicePool);

        // Assign up to 3 imps at a time
        const chunkImps = Math.min(impsLeft, Math.floor(Math.random() * 3) + 1);
        const chunkClicks = Math.min(clicksLeft, chunkImps);

        // Generate positions: mostly 1.0 to 1.5 to average exactly 1.2
        // Make positions: 1.0, 1.1, 1.2, 1.3, or 1.4
        const positions = [1.0, 1.1, 1.2, 1.3, 1.4];
        const randomPos = positions[Math.floor(Math.random() * positions.length)];

        docs.push({
          date,
          query: queryItem.text,
          pagePath: queryItem.page,
          clicks: chunkClicks,
          impressions: chunkImps,
          ctr: chunkImps > 0 ? (chunkClicks / chunkImps) * 100 : 0,
          position: randomPos,
          country: countryItem.text,
          device: deviceItem.text
        });

        clicksLeft -= chunkClicks;
        impsLeft -= chunkImps;
      }
    }

    // Insert all documents
    await SearchConsole.insertMany(docs);
    console.log(`Seeded ${docs.length} SearchConsole documents successfully.`);

    // Perform validation query
    const totalClicksSeeded = await SearchConsole.aggregate([{ $group: { _id: null, total: { $sum: '$clicks' } } }]);
    const totalImpsSeeded = await SearchConsole.aggregate([{ $group: { _id: null, total: { $sum: '$impressions' } } }]);
    
    console.log(`Validation - Clicks: ${totalClicksSeeded[0]?.total}, Impressions: ${totalImpsSeeded[0]?.total}`);

    mongoose.disconnect();
    console.log('MongoDB disconnected. Seeding complete.');
  } catch (err) {
    console.error('Error seeding Search Console data:', err);
    process.exit(1);
  }
}

seed();
