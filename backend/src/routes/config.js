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

// POST /config/validate-license — HMAC-based validation
router.post('/validate-license', (req, res) => {
  const { validateLicenseKey } = require('../license');
  const { key } = req.body;
  const result = validateLicenseKey(key);
  res.json(result);
});

// GET /config/tabulations — load tabulations
router.get('/tabulations', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT value FROM app_config WHERE key = 'tabulations'"
    );
    if (rows.length > 0) {
      res.json(JSON.parse(rows[0].value));
    } else {
      res.json([]);
    }
  } catch {
    res.json([]);
  }
});

// POST /config/tabulations — save tabulations
router.post('/tabulations', async (req, res, next) => {
  try {
    const tabulations = req.body;
    await pool.query(
      `INSERT INTO app_config (key, value) VALUES ('tabulations', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [JSON.stringify(tabulations)]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
