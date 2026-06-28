require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const IndexingStatus = require('./models/IndexingStatus');

async function seed() {
  try {
    await connectDB();
    console.log('MongoDB connected for seeding Indexing Status stats...');

    // Clear existing records
    await IndexingStatus.deleteMany({});
    console.log('Cleared existing IndexingStatus records.');

    // Date range: 30/03/2026 to 15/06/2026 (78 days)
    const startDate = new Date('2026-03-30');
    const endDate = new Date('2026-06-15');
    const days = [];

    let current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const totalDays = days.length;
    console.log(`Generating IndexingStatus logs for ${totalDays} days...`);

    const docs = [];

    // Reasons configuration with details
    const reasonTemplates = [
      { reason: 'Page with redirect', source: 'Website', validation: 'Not Started', basePages: 3, trendPattern: [1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3] },
      { reason: 'Not found (404)', source: 'Website', validation: 'Not Started', basePages: 1, trendPattern: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { reason: 'Duplicate without user-selected canonical', source: 'Website', validation: 'Not Started', basePages: 1, trendPattern: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { reason: 'Discovered – currently not indexed', source: 'Google systems', validation: 'Not Started', basePages: 2, trendPattern: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
      { reason: 'Crawled – currently not indexed', source: 'Google systems', validation: 'N/A', basePages: 0, trendPattern: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    ];

    for (let i = 0; i < totalDays; i++) {
      const date = days[i];
      const dateStr = date.toISOString().split('T')[0];

      let indexedCount = 0;
      let notIndexedCount = 0;
      let impressions = 0;

      // May 1st index is around day 32 (indices start at 0)
      const may1st = new Date('2026-05-01');
      const may25th = new Date('2026-05-25');

      if (date >= may1st) {
        indexedCount = 1;
        notIndexedCount = 5; // Base not-indexed
      }

      if (date >= may25th) {
        notIndexedCount = 7; // Rises to 7 not-indexed pages
      }

      // Impressions line (blue line in screenshot)
      // Peaks on specific date blocks, otherwise low/0
      if (date >= may1st) {
        // May 8th peak
        if (dateStr === '2026-05-08') {
          impressions = 6;
        } else if (dateStr === '2026-05-02' || dateStr === '2026-05-03') {
          impressions = 4;
        } else if (dateStr === '2026-05-09' || dateStr === '2026-05-10') {
          impressions = 3;
        } 
        // May 20th peak
        else if (dateStr === '2026-05-20') {
          impressions = 6;
        } else if (dateStr === '2026-05-18' || dateStr === '2026-05-19') {
          impressions = 2;
        }
        // General small fluctuations
        else {
          const rand = Math.random();
          impressions = rand > 0.8 ? 2 : rand > 0.4 ? 1 : 0;
        }
      }

      // Populate reasons counts dynamically corresponding to this day's progress
      const dailyReasons = reasonTemplates.map(t => {
        let currentPagesCount = 0;
        if (date >= may1st) {
          // Approximate pages count based on trend pattern
          const progressIndex = Math.min(
            t.trendPattern.length - 1,
            Math.floor(((date - may1st) / (endDate - may1st)) * t.trendPattern.length)
          );
          currentPagesCount = t.trendPattern[progressIndex];
        }
        return {
          reason: t.reason,
          source: t.source,
          validation: t.validation,
          pagesCount: currentPagesCount,
          history: t.trendPattern.slice(0, 15) // last 15 points
        };
      });

      docs.push({
        date,
        indexedCount,
        notIndexedCount,
        impressions,
        reasons: dailyReasons
      });
    }

    await IndexingStatus.insertMany(docs);
    console.log(`Seeded ${docs.length} IndexingStatus documents successfully.`);

    // Validate the last document
    const lastDoc = docs[docs.length - 1];
    console.log(`Last Seeded Doc - Date: ${lastDoc.date.toISOString().split('T')[0]}, Indexed: ${lastDoc.indexedCount}, Not Indexed: ${lastDoc.notIndexedCount}`);

    mongoose.disconnect();
    console.log('MongoDB disconnected. Seeding complete.');
  } catch (err) {
    console.error('Error seeding indexing status data:', err);
    process.exit(1);
  }
}

seed();
