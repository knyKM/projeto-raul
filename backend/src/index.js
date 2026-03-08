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

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
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

// ─── Error handler ──────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

// ─── Start ──────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 sistemaLeads API running on port ${PORT}`);
  const dbOk = await testConnection();
  console.log(dbOk ? '✅ Database connected' : '⚠️  Database not connected');
  if (dbOk) {
    await initTables();
  }
});
