/**
 * /analytics routes — Google Analytics 4 Data API
 * Docs: https://developers.google.com/analytics/devguides/reporting/data/v1
 */
const { Router } = require('express');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const router = Router();

function getClient() {
  const keyJson = process.env.GA_SERVICE_ACCOUNT_KEY;
  if (!keyJson) return null;

  try {
    const credentials = JSON.parse(keyJson);
    return new BetaAnalyticsDataClient({ credentials });
  } catch {
    return null;
  }
}

// POST /analytics/test
router.post('/test', async (_req, res) => {
  const propertyId = process.env.GA_PROPERTY_ID;
  const client = getClient();

  if (!client || !propertyId) {
    return res.json({ connected: false, error: 'Google Analytics credentials not configured' });
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    });
    res.json({
      connected: true,
      activeUsers: response.rows?.[0]?.metricValues?.[0]?.value || 0,
    });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

// POST /analytics/config
router.post('/config', (req, res) => {
  const { measurementId, propertyId, serviceAccountKey } = req.body;
  if (measurementId) process.env.GA_MEASUREMENT_ID = measurementId;
  if (propertyId) process.env.GA_PROPERTY_ID = propertyId;
  if (serviceAccountKey) process.env.GA_SERVICE_ACCOUNT_KEY = serviceAccountKey;
  res.json({ ok: true });
});

// GET /analytics/realtime
router.get('/realtime', async (_req, res) => {
  const propertyId = process.env.GA_PROPERTY_ID;
  const client = getClient();
  if (!client || !propertyId) return res.json({ error: 'Not configured' });

  try {
    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'country' }],
    });
    res.json({ rows: response.rows || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/report
router.get('/report', async (req, res) => {
  const propertyId = process.env.GA_PROPERTY_ID;
  const client = getClient();
  if (!client || !propertyId) return res.json({ error: 'Not configured' });

  const { startDate = '30daysAgo', endDate = 'today' } = req.query;

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    });
    res.json({ rows: response.rows || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
