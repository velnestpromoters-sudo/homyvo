const PageTime = require('../models/PageTime');
const SearchConsole = require('../models/SearchConsole');
const IndexingStatus = require('../models/IndexingStatus');

// Record page time duration from client heartbeat/beacon
exports.trackPageTime = async (req, res) => {
  try {
    const { pagePath, timeSpent, visitorId } = req.body;
    if (!pagePath || timeSpent === undefined) {
      return res.status(400).json({ success: false, message: 'pagePath and timeSpent are required' });
    }

    const record = await PageTime.create({
      pagePath,
      timeSpent: Number(timeSpent),
      visitorId: visitorId || 'anonymous'
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('Error tracking page time:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Aggregate average time spent per page (admin view)
exports.getPageTimeAnalytics = async (req, res) => {
  try {
    const stats = await PageTime.aggregate([
      {
        $group: {
          _id: '$pagePath',
          avgTimeSpent: { $avg: '$timeSpent' },
          totalViews: { $sum: 1 },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      },
      {
        $project: {
          pagePath: '$_id',
          avgTimeSpent: { $round: ['$avgTimeSpent', 1] },
          totalViews: 1,
          totalTimeSpent: 1,
          _id: 0
        }
      },
      { $sort: { avgTimeSpent: -1 } }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching page times analytics:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Retrieve Google Search Console replica statistics (admin view)
exports.getSearchConsoleStats = async (req, res) => {
  try {
    // 1. Fetch all records
    const records = await SearchConsole.find().sort({ date: 1 });

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        summary: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
        timeline: [],
        queries: [],
        pages: [],
        countries: [],
        devices: []
      });
    }

    // 2. Aggregate overall totals
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalPositionSum = 0;

    records.forEach(r => {
      totalClicks += r.clicks;
      totalImpressions += r.impressions;
      totalPositionSum += r.position;
    });

    const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const averagePosition = records.length > 0 ? totalPositionSum / records.length : 0;

    // 3. Group by Date for Timeline Graph
    const timelineMap = {};
    records.forEach(r => {
      const dateStr = new Date(r.date).toISOString().split('T')[0];
      if (!timelineMap[dateStr]) {
        timelineMap[dateStr] = { date: dateStr, clicks: 0, impressions: 0, positionSum: 0, count: 0 };
      }
      timelineMap[dateStr].clicks += r.clicks;
      timelineMap[dateStr].impressions += r.impressions;
      timelineMap[dateStr].positionSum += r.position;
      timelineMap[dateStr].count += 1;
    });

    const timeline = Object.values(timelineMap).map(t => ({
      date: t.date,
      clicks: t.clicks,
      impressions: t.impressions,
      ctr: t.impressions > 0 ? Number(((t.clicks / t.impressions) * 100).toFixed(1)) : 0,
      position: Number((t.positionSum / t.count).toFixed(1))
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 4. Group by Query
    const queryMap = {};
    records.forEach(r => {
      if (!queryMap[r.query]) {
        queryMap[r.query] = { query: r.query, clicks: 0, impressions: 0, positionSum: 0, count: 0 };
      }
      queryMap[r.query].clicks += r.clicks;
      queryMap[r.query].impressions += r.impressions;
      queryMap[r.query].positionSum += r.position;
      queryMap[r.query].count += 1;
    });
    const queries = Object.values(queryMap).map(q => ({
      key: q.query,
      clicks: q.clicks,
      impressions: q.impressions,
      ctr: q.impressions > 0 ? Number(((q.clicks / q.impressions) * 100).toFixed(1)) : 0,
      position: Number((q.positionSum / q.count).toFixed(1))
    })).sort((a, b) => b.clicks - a.clicks);

    // 5. Group by Page Path
    const pageMap = {};
    records.forEach(r => {
      if (!pageMap[r.pagePath]) {
        pageMap[r.pagePath] = { pagePath: r.pagePath, clicks: 0, impressions: 0, positionSum: 0, count: 0 };
      }
      pageMap[r.pagePath].clicks += r.clicks;
      pageMap[r.pagePath].impressions += r.impressions;
      pageMap[r.pagePath].positionSum += r.position;
      pageMap[r.pagePath].count += 1;
    });
    const pages = Object.values(pageMap).map(p => ({
      key: p.pagePath,
      clicks: p.clicks,
      impressions: p.impressions,
      ctr: p.impressions > 0 ? Number(((p.clicks / p.impressions) * 100).toFixed(1)) : 0,
      position: Number((p.positionSum / p.count).toFixed(1))
    })).sort((a, b) => b.clicks - a.clicks);

    // 6. Group by Country
    const countryMap = {};
    records.forEach(r => {
      if (!countryMap[r.country]) {
        countryMap[r.country] = { country: r.country, clicks: 0, impressions: 0, positionSum: 0, count: 0 };
      }
      countryMap[r.country].clicks += r.clicks;
      countryMap[r.country].impressions += r.impressions;
      countryMap[r.country].positionSum += r.position;
      countryMap[r.country].count += 1;
    });
    const countries = Object.values(countryMap).map(c => ({
      key: c.country,
      clicks: c.clicks,
      impressions: c.impressions,
      ctr: c.impressions > 0 ? Number(((c.clicks / c.impressions) * 100).toFixed(1)) : 0,
      position: Number((c.positionSum / c.count).toFixed(1))
    })).sort((a, b) => b.clicks - a.clicks);

    // 7. Group by Device
    const deviceMap = {};
    records.forEach(r => {
      if (!deviceMap[r.device]) {
        deviceMap[r.device] = { device: r.device, clicks: 0, impressions: 0, positionSum: 0, count: 0 };
      }
      deviceMap[r.device].clicks += r.clicks;
      deviceMap[r.device].impressions += r.impressions;
      deviceMap[r.device].positionSum += r.position;
      deviceMap[r.device].count += 1;
    });
    const devices = Object.values(deviceMap).map(d => ({
      key: d.device,
      clicks: d.clicks,
      impressions: d.impressions,
      ctr: d.impressions > 0 ? Number(((d.clicks / d.impressions) * 100).toFixed(1)) : 0,
      position: Number((d.positionSum / d.count).toFixed(1))
    })).sort((a, b) => b.clicks - a.clicks);

    res.status(200).json({
      success: true,
      summary: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: Number(averageCtr.toFixed(1)),
        position: Number(averagePosition.toFixed(1))
      },
      timeline,
      queries,
      pages,
      countries,
      devices
    });
  } catch (err) {
    console.error('Error fetching search console stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Retrieve Google Search Console indexing coverage report statistics (admin view)
exports.getIndexingCoverageStats = async (req, res) => {
  try {
    const records = await IndexingStatus.find().sort({ date: 1 });

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        summary: { indexed: 0, notIndexed: 0, reasonsCount: 0 },
        timeline: [],
        reasons: []
      });
    }

    const lastDoc = records[records.length - 1];

    const timeline = records.map(r => ({
      date: r.date,
      indexed: r.indexedCount,
      notIndexed: r.notIndexedCount,
      impressions: r.impressions
    }));

    res.status(200).json({
      success: true,
      summary: {
        indexed: lastDoc.indexedCount,
        notIndexed: lastDoc.notIndexedCount,
        reasonsCount: lastDoc.reasons.filter(r => r.pagesCount > 0).length
      },
      timeline,
      reasons: lastDoc.reasons
    });
  } catch (err) {
    console.error('Error fetching indexing coverage stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
