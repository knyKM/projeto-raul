const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

// GET /config — load all config
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM config');
    const config = {};
    rows.forEach(r => { config[r.key] = r.value; });
    res.json(config);
  } catch (err) { next(err); }
});

// POST /config — save config (bulk upsert)
router.post('/', async (req, res, next) => {
  try {
    const entries = Object.entries(req.body);
    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO config (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /config/test-db — test DB connection with custom credentials
router.post('/test-db', async (req, res) => {
  const { Pool: TestPool } = require('pg');
  const { host, port, database, user, password, ssl } = req.body;
  const testPool = new TestPool({
    host, port: parseInt(port), database, user, password,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
  });
  try {
    await testPool.query('SELECT 1');
    res.json({ connected: true });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  } finally {
    await testPool.end();
  }
});

// POST /config/validate-license
router.post('/validate-license', (req, res) => {
  const { key } = req.body;
  // Simple validation — replace with real license server logic
  if (!key || key.length < 8) {
    return res.json({ valid: false, tier: 'free' });
  }
  const tierMap = { 'PRO-': 'pro', 'PROPLUS-': 'proplus' };
  const tier = Object.entries(tierMap).find(([prefix]) => key.startsWith(prefix));
  res.json({ valid: true, tier: tier ? tier[1] : 'pro' });
});

module.exports = router;
