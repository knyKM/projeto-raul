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

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────
app.use(helmet());
// Support multiple CORS origins (comma-separated in .env)
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['*'];
app.use(cors({
  origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
  credentials: true,
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
  }
});
