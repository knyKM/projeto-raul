const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sistemaleads',
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
      landing_page_slug VARCHAR(255),
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

    CREATE TABLE IF NOT EXISTS atendentes (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      email VARCHAR(255),
      telefone VARCHAR(30),
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(20) DEFAULT 'info',
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS page_visits (
      id SERIAL PRIMARY KEY,
      landing_page_slug VARCHAR(255),
      latitude NUMERIC(10,7),
      longitude NUMERIC(10,7),
      cidade VARCHAR(100),
      estado VARCHAR(5),
      visited_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'atendente' CHECK (role IN ('atendente', 'supervisor', 'administrador')),
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS wa_conversations (
      id SERIAL PRIMARY KEY,
      lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
      lead_name TEXT,
      phone VARCHAR(30) NOT NULL,
      wa_id VARCHAR(30),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'expired')),
      agent VARCHAR(100),
      tabulation VARCHAR(100),
      interest VARCHAR(255),
      ad_id VARCHAR(100),
      unread INT DEFAULT 0,
      last_message TEXT,
      last_message_at TIMESTAMPTZ,
      window_expires TIMESTAMPTZ,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS wa_messages (
      id SERIAL PRIMARY KEY,
      conversation_id INT REFERENCES wa_conversations(id) ON DELETE CASCADE NOT NULL,
      wa_message_id VARCHAR(255),
      role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'bot', 'agent')),
      text TEXT NOT NULL,
      status VARCHAR(15) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
      buttons JSONB,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS landing_pages (
      id VARCHAR(100) PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      template VARCHAR(20) NOT NULL DEFAULT 'completa',
      vehicle_name TEXT NOT NULL,
      brand VARCHAR(100),
      model VARCHAR(100),
      year VARCHAR(10),
      credit_value NUMERIC(12,2) DEFAULT 0,
      installments INT DEFAULT 80,
      installment_value NUMERIC(10,2) DEFAULT 0,
      image_url TEXT,
      description TEXT,
      highlights JSONB DEFAULT '[]',
      whatsapp_number VARCHAR(30),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);


  // Add landing_page_slug column if it doesn't exist (migration for existing DBs)
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'landing_page_slug') THEN
        ALTER TABLE leads ADD COLUMN landing_page_slug VARCHAR(255);
      END IF;
    END $$;
  `).catch(() => {});

  // Lead behavior events table for intelligent scoring
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lead_behavior_events (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      event_type VARCHAR(50) NOT NULL,
      landing_page_slug VARCHAR(255),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_behavior_session ON lead_behavior_events(session_id);
  `).catch(() => {});

  // Add updated_at to leads if missing
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'updated_at') THEN
        ALTER TABLE leads ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
      END IF;
    END $$;
  `).catch(() => {});

  // Add extra contact fields to leads
  const extraColumns = [
    { name: 'observacoes', type: 'TEXT' },
    { name: 'renda', type: 'VARCHAR(50)' },
    { name: 'profissao', type: 'VARCHAR(100)' },
    { name: 'cpf', type: 'VARCHAR(14)' },
    { name: 'endereco', type: 'TEXT' },
    { name: 'interesse', type: 'VARCHAR(255)' },
    { name: 'tabulacao', type: 'VARCHAR(100)' },
  ];
  for (const col of extraColumns) {
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = '${col.name}') THEN
          ALTER TABLE leads ADD COLUMN ${col.name} ${col.type};
        END IF;
      END $$;
    `).catch(() => {});
  }

  console.log('✅ Database tables initialized');
}

module.exports = { pool, testConnection, initTables };
