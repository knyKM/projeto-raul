/**
 * /ads routes — unified ads endpoints for Meta, Google, TikTok
 */
const { Router } = require('express');
const { pool } = require('../db');
const metaAds = require('../services/metaAds');
const googleAds = require('../services/googleAds');
const tiktokAds = require('../services/tiktokAds');

const router = Router();

const services = { meta: metaAds, google: googleAds, tiktok: tiktokAds };

// ─── Helpers ────────────────────────────────────────
function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

// ─── POST /ads/:platform/test ───────────────────────
router.post('/:platform/test', async (req, res, next) => {
  try {
    const service = services[req.params.platform];
    if (!service) return res.status(400).json({ error: 'Platform not supported' });

    const account = await service.testConnection();
    res.json({ connected: true, account });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

// ─── POST /ads/:platform/config ─────────────────────
router.post('/:platform/config', async (req, res, next) => {
  try {
    const platform = req.params.platform;
    const config = req.body;

    // Save to config table
    await pool.query(
      `INSERT INTO config (key, value, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [`ads_${platform}`, JSON.stringify(config)]
    );

    // Update environment variables in memory for immediate use
    const envMap = {
      meta: {
        META_ACCESS_TOKEN: config.accessToken,
        META_AD_ACCOUNT_ID: config.adAccountId,
        META_PIXEL_ID: config.pixelId,
        META_PAGE_ID: config.pageId,
        META_APP_ID: config.appId,
        META_APP_SECRET: config.appSecret,
      },
      google: {
        GOOGLE_ADS_DEVELOPER_TOKEN: config.developerToken,
        GOOGLE_ADS_CLIENT_ID: config.clientId,
        GOOGLE_ADS_CLIENT_SECRET: config.clientSecret,
        GOOGLE_ADS_REFRESH_TOKEN: config.refreshToken,
        GOOGLE_ADS_CUSTOMER_ID: config.customerId,
        GOOGLE_ADS_MANAGER_ID: config.managerAccountId,
      },
      tiktok: {
        TIKTOK_ACCESS_TOKEN: config.accessToken,
        TIKTOK_ADVERTISER_ID: config.advertiserId,
        TIKTOK_APP_ID: config.appId,
        TIKTOK_APP_SECRET: config.appSecret,
        TIKTOK_PIXEL_ID: config.pixelId,
      },
    };

    if (envMap[platform]) {
      Object.entries(envMap[platform]).forEach(([key, value]) => {
        if (value) process.env[key] = value;
      });
    }

    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ─── POST /ads/:platform/sync ───────────────────────
router.post('/:platform/sync', async (req, res, next) => {
  try {
    const platform = req.params.platform;
    const service = services[platform];
    if (!service) return res.status(400).json({ error: 'Platform not supported' });

    const { startDate, endDate } = defaultDateRange();

    // Sync campaigns
    const campaigns = await service.getCampaigns(startDate, endDate);
    for (const c of campaigns) {
      await pool.query(
        `INSERT INTO ads_campaigns (id, platform, external_id, nome, status, gasto, leads, cpl, impressoes, cliques, ctr, receita, synced_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
         ON CONFLICT (id) DO UPDATE SET
           status=$5, gasto=$6, leads=$7, cpl=$8, impressoes=$9, cliques=$10, ctr=$11, receita=$12, synced_at=NOW()`,
        [c.id, c.platform, c.external_id, c.nome, c.status, c.gasto, c.leads, c.cpl, c.impressoes, c.cliques, c.ctr, c.receita]
      );
    }

    // Sync daily metrics
    const daily = await service.getDailyMetrics(startDate, endDate);
    for (const d of daily) {
      await pool.query(
        `INSERT INTO ads_daily_metrics (platform, metric_date, leads, spend, impressions, clicks)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (platform, metric_date) DO UPDATE SET
           leads=$3, spend=$4, impressions=$5, clicks=$6`,
        [d.platform, d.metric_date, d.leads, d.spend, d.impressions, d.clicks]
      );
    }

    // Log sync
    await pool.query(
      'INSERT INTO ads_sync_log (platform, status, records_count) VALUES ($1,$2,$3)',
      [platform, 'success', campaigns.length]
    );

    res.json({ synced: true, campaigns: campaigns.length, dailyRecords: daily.length });
  } catch (err) {
    // Log failed sync
    await pool.query(
      'INSERT INTO ads_sync_log (platform, status, error) VALUES ($1,$2,$3)',
      [req.params.platform, 'error', err.message]
    ).catch(() => {});
    res.json({ synced: false, error: err.message });
  }
});

// ─── GET /ads/status ────────────────────────────────
router.get('/status', async (_req, res, next) => {
  try {
    const platforms = ['meta', 'google', 'tiktok'];
    const statuses = [];

    for (const platform of platforms) {
      const { rows } = await pool.query(
        'SELECT synced_at, status, error FROM ads_sync_log WHERE platform = $1 ORDER BY synced_at DESC LIMIT 1',
        [platform]
      );
      const last = rows[0];
      statuses.push({
        platform,
        connected: last?.status === 'success',
        lastSync: last?.synced_at || null,
        error: last?.error || null,
      });
    }

    res.json(statuses);
  } catch (err) { next(err); }
});

// ─── GET /ads/overview ──────────────────────────────
router.get('/overview', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query.startDate
      ? { startDate: req.query.startDate, endDate: req.query.endDate }
      : defaultDateRange();

    // Channel summaries
    const { rows: channelRows } = await pool.query(`
      SELECT
        platform,
        SUM(leads) as leads,
        SUM(gasto) as gasto_total,
        SUM(receita) as receita,
        SUM(impressoes) as impressoes,
        SUM(cliques) as cliques
      FROM ads_campaigns
      WHERE synced_at >= $1::date AND synced_at <= ($2::date + interval '1 day')
      GROUP BY platform
    `, [startDate, endDate]);

    const platformLabels = { meta: 'Meta Ads', google: 'Google Ads', tiktok: 'TikTok Ads' };
    const platformColors = { meta: '#1877F2', google: '#EA4335', tiktok: '#000000' };

    const channels = channelRows.map(r => ({
      platform: r.platform,
      label: platformLabels[r.platform] || r.platform,
      color: platformColors[r.platform] || '#888',
      leads: parseInt(r.leads),
      gastoTotal: parseFloat(r.gasto_total),
      receita: parseFloat(r.receita),
      cpl: parseInt(r.leads) > 0 ? parseFloat(r.gasto_total) / parseInt(r.leads) : 0,
      roas: parseFloat(r.gasto_total) > 0 ? parseFloat(r.receita) / parseFloat(r.gasto_total) : 0,
      impressoes: parseInt(r.impressoes),
      cliques: parseInt(r.cliques),
      ctr: parseInt(r.impressoes) > 0 ? (parseInt(r.cliques) / parseInt(r.impressoes)) * 100 : 0,
    }));

    // Daily metrics
    const { rows: dailyRows } = await pool.query(`
      SELECT metric_date, platform, leads, spend FROM ads_daily_metrics
      WHERE metric_date BETWEEN $1 AND $2
      ORDER BY metric_date
    `, [startDate, endDate]);

    const dailyMap = {};
    dailyRows.forEach(r => {
      const date = r.metric_date.toISOString().slice(0, 10);
      if (!dailyMap[date]) dailyMap[date] = { data: date, meta: 0, google: 0, tiktok: 0 };
      dailyMap[date][r.platform] = r.leads;
    });
    const dailyLeads = Object.values(dailyMap);

    const spendMap = {};
    dailyRows.forEach(r => {
      const date = r.metric_date.toISOString().slice(0, 10);
      if (!spendMap[date]) spendMap[date] = { data: date, meta: 0, google: 0, tiktok: 0 };
      spendMap[date][r.platform] = parseFloat(r.spend);
    });
    const dailySpend = Object.values(spendMap);

    // Campaigns
    const { rows: campaigns } = await pool.query(`
      SELECT * FROM ads_campaigns ORDER BY gasto DESC LIMIT 50
    `);

    // Sync status
    const platforms = ['meta', 'google', 'tiktok'];
    const syncStatus = [];
    for (const p of platforms) {
      const { rows } = await pool.query(
        'SELECT synced_at, status, error FROM ads_sync_log WHERE platform = $1 ORDER BY synced_at DESC LIMIT 1',
        [p]
      );
      const last = rows[0];
      syncStatus.push({
        platform: p,
        connected: last?.status === 'success',
        lastSync: last?.synced_at || null,
        error: last?.error || null,
      });
    }

    res.json({ channels, dailyLeads, dailySpend, campaigns, syncStatus });
  } catch (err) { next(err); }
});

// ─── GET /ads/campaigns ─────────────────────────────
router.get('/campaigns', async (req, res, next) => {
  try {
    const { platform, startDate, endDate } = req.query;
    let query = 'SELECT * FROM ads_campaigns WHERE 1=1';
    const params = [];

    if (platform) {
      params.push(platform);
      query += ` AND platform = $${params.length}`;
    }
    if (startDate && endDate) {
      params.push(startDate, endDate);
      query += ` AND synced_at >= $${params.length - 1}::date AND synced_at <= ($${params.length}::date + interval '1 day')`;
    }
    query += ' ORDER BY gasto DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// ─── GET /ads/daily/:metric ─────────────────────────
router.get('/daily/:metric', async (req, res, next) => {
  try {
    const metric = req.params.metric; // 'leads' or 'spend'
    const { startDate, endDate } = req.query.startDate
      ? { startDate: req.query.startDate, endDate: req.query.endDate }
      : defaultDateRange();

    const column = metric === 'spend' ? 'spend' : 'leads';

    const { rows } = await pool.query(`
      SELECT metric_date, platform, ${column} as value
      FROM ads_daily_metrics
      WHERE metric_date BETWEEN $1 AND $2
      ORDER BY metric_date
    `, [startDate, endDate]);

    const dailyMap = {};
    rows.forEach(r => {
      const date = r.metric_date.toISOString().slice(0, 10);
      if (!dailyMap[date]) dailyMap[date] = { data: date, meta: 0, google: 0, tiktok: 0 };
      dailyMap[date][r.platform] = parseFloat(r.value);
    });

    res.json(Object.values(dailyMap));
  } catch (err) { next(err); }
});

module.exports = router;
