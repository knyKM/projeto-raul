const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mogibens',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    return false;
  }
}

async function initTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS config (
      key VARCHAR(255) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ads_sync_log (
      id SERIAL PRIMARY KEY,
      platform VARCHAR(20) NOT NULL,
      synced_at TIMESTAMPTZ DEFAULT NOW(),
      status VARCHAR(20) NOT NULL,
      records_count INT DEFAULT 0,
      error TEXT
    );

    CREATE TABLE IF NOT EXISTS ads_campaigns (
      id VARCHAR(100) PRIMARY KEY,
      platform VARCHAR(20) NOT NULL,
      external_id VARCHAR(255),
      nome TEXT NOT NULL,
      status VARCHAR(20) NOT NULL,
      gasto NUMERIC(12,2) DEFAULT 0,
      leads INT DEFAULT 0,
      cpl NUMERIC(10,2) DEFAULT 0,
      impressoes INT DEFAULT 0,
      cliques INT DEFAULT 0,
      ctr NUMERIC(6,3) DEFAULT 0,
      receita NUMERIC(12,2) DEFAULT 0,
      date_start DATE,
      date_end DATE,
      synced_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ads_daily_metrics (
      id SERIAL PRIMARY KEY,
      platform VARCHAR(20) NOT NULL,
      metric_date DATE NOT NULL,
      leads INT DEFAULT 0,
      spend NUMERIC(12,2) DEFAULT 0,
      impressions INT DEFAULT 0,
      clicks INT DEFAULT 0,
      revenue NUMERIC(12,2) DEFAULT 0,
      UNIQUE(platform, metric_date)
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      nome TEXT,
      telefone VARCHAR(30),
      email VARCHAR(255),
      origem VARCHAR(50),
      campaign_id VARCHAR(100),
      platform VARCHAR(20),
      cidade VARCHAR(100),
      estado VARCHAR(5),
      latitude NUMERIC(10,7),
      longitude NUMERIC(10,7),
      status VARCHAR(30) DEFAULT 'novo',
      consultor_id INT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ Database tables initialized');
}

module.exports = { pool, testConnection, initTables };
