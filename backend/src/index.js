require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { pool, testConnection, initTables } = require('./db');

// Routes
const healthRouter = require('./routes/health');
const configRouter = require('./routes/config');
const adsRouter = require('./routes/ads');
const whatsappRouter = require('./routes/whatsapp');
const analyticsRouter = require('./routes/analytics');
const leadsRouter = require('./routes/leads');
const atendentesRouter = require('./routes/atendentes');
const notificationsRouter = require('./routes/notifications');
const overviewRouter = require('./routes/overview');
const authRouter = require('./routes/auth');
const mailingRouter = require('./routes/mailing');
const reportsRouter = require('./routes/reports');
const leadTrackingRouter = require('./routes/leadTracking');
const consultantRouter = require('./routes/consultant');
const landingPagesRouter = require('./routes/landingPages');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────
app.use(helmet());
// Support multiple CORS origins (comma-separated in .env)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : [];
const allowedOriginSet = new Set(allowedOrigins);

// Auto-allow localhost and private network IPs (LAN/WSL) on any port
function isPrivateOrigin(origin) {
  try {
    const url = new URL(origin);
    const h = url.hostname;
    return (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      /^192\.168\.\d+\.\d+$/.test(h) ||
      /^10\.\d+\.\d+\.\d+$/.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(h)
    );
  } catch {
    return false;
  }
}

function resolveCorsOrigin(origin) {
  if (!origin) return true;
  if (allowedOriginSet.has('*') || allowedOriginSet.has(origin) || isPrivateOrigin(origin)) {
    return origin;
  }
  return false;
}

// Handle browser preflight explicitly so LAN/WSL origins never fall back to localhost
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const corsOrigin = resolveCorsOrigin(origin);

  if (corsOrigin) {
    if (corsOrigin !== true) res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }

  if (req.method === 'OPTIONS') {
    return corsOrigin
      ? res.sendStatus(204)
      : res.status(403).json({ error: `CORS: origem não permitida (${origin || 'sem origem'})` });
  }

  return next();
});

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server, same-origin)
    const corsOrigin = resolveCorsOrigin(origin);
    if (corsOrigin) return callback(null, corsOrigin);
    // Reject properly (don't lie with a wrong origin header)
    return callback(new Error(`CORS: origem não permitida (${origin})`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('short'));
app.use(express.json({ limit: '5mb' }));

// ─── Routes ─────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/config', configRouter);
app.use('/ads', adsRouter);
app.use('/whatsapp', whatsappRouter);
app.use('/analytics', analyticsRouter);
app.use('/leads', leadsRouter);
app.use('/atendentes', atendentesRouter);
app.use('/notifications', notificationsRouter);
app.use('/overview', overviewRouter);
app.use('/auth', authRouter);
app.use('/mailing', mailingRouter);
app.use('/reports', reportsRouter);
app.use('/lead-tracking', leadTrackingRouter);
app.use('/consultant', consultantRouter);
app.use('/landing-pages', landingPagesRouter);

// ─── Error handler ──────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

// ─── Restore saved configs from DB into process.env ─
async function restoreConfigsFromDB() {
  try {
    const { rows } = await pool.query(
      "SELECT key, value FROM config WHERE key IN ('ads_meta', 'ads_google', 'ads_tiktok', 'ads_whatsapp', 'ads_analytics')"
    );

    const envMaps = {
      ads_meta: {
        accessToken: 'META_ACCESS_TOKEN',
        adAccountId: 'META_AD_ACCOUNT_ID',
        pixelId: 'META_PIXEL_ID',
        pageId: 'META_PAGE_ID',
        appId: 'META_APP_ID',
        appSecret: 'META_APP_SECRET',
      },
      ads_google: {
        developerToken: 'GOOGLE_ADS_DEVELOPER_TOKEN',
        clientId: 'GOOGLE_ADS_CLIENT_ID',
        clientSecret: 'GOOGLE_ADS_CLIENT_SECRET',
        refreshToken: 'GOOGLE_ADS_REFRESH_TOKEN',
        customerId: 'GOOGLE_ADS_CUSTOMER_ID',
        managerAccountId: 'GOOGLE_ADS_MANAGER_ID',
      },
      ads_tiktok: {
        accessToken: 'TIKTOK_ACCESS_TOKEN',
        advertiserId: 'TIKTOK_ADVERTISER_ID',
        appId: 'TIKTOK_APP_ID',
        appSecret: 'TIKTOK_APP_SECRET',
        pixelId: 'TIKTOK_PIXEL_ID',
      },
      ads_whatsapp: {
        phoneNumberId: 'WHATSAPP_PHONE_NUMBER_ID',
        businessAccountId: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        accessToken: 'WHATSAPP_ACCESS_TOKEN',
        webhookVerifyToken: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
      },
      ads_analytics: {
        measurementId: 'GA_MEASUREMENT_ID',
        propertyId: 'GA_PROPERTY_ID',
        serviceAccountKey: 'GA_SERVICE_ACCOUNT_KEY',
      },
    };

    for (const row of rows) {
      const map = envMaps[row.key];
      if (!map) continue;
      let config;
      try { config = typeof row.value === 'string' ? JSON.parse(row.value) : row.value; } catch { continue; }
      for (const [configKey, envKey] of Object.entries(map)) {
        if (config[configKey] && !process.env[envKey]) {
          process.env[envKey] = config[configKey];
        }
      }
    }
    console.log('🔑 Saved configs restored from DB');
  } catch (err) {
    console.error('[Config Restore] Error:', err.message);
  }
}

// ─── Start ──────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 sistemaLeads API running on port ${PORT}`);
  const dbOk = await testConnection();
  console.log(dbOk ? '✅ Database connected' : '⚠️  Database not connected');
  if (dbOk) {
    await initTables();

    // Restore configs saved via dashboard into process.env
    await restoreConfigsFromDB();

    // Create default admin if no users exist
    const { pool } = require('./db');
    const { hashPassword } = require('./routes/auth');
    const existing = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(existing.rows[0].count) === 0) {
      const hash = hashPassword('admin123');
      await pool.query(
        "INSERT INTO users (nome, email, password_hash, role) VALUES ('Administrador', 'admin@sistemaleads.com', $1, 'administrador')",
        [hash]
      );
      console.log('👤 Default admin created: admin@sistemaleads.com / admin123');
    }

    // Activate ads sync cron (every 6 hours)
    const { startAdsSyncCron } = require('./cron/syncAds');
    startAdsSyncCron();
  }
});
