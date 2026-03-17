/**
 * /leads routes — CRUD for leads with geo tracking
 */
const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

// ─── GET /leads — list all leads ────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { status, landing_page, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (landing_page) {
      params.push(landing_page);
      query += ` AND landing_page_slug = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    params.push(parseInt(limit));
    query += ` LIMIT $${params.length}`;
    params.push(parseInt(offset));
    query += ` OFFSET $${params.length}`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// ─── GET /leads/stats — summary counts ──────────────
router.get('/stats', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'novo') AS pendentes,
        COUNT(*) FILTER (WHERE status = 'em_atendimento') AS em_atendimento,
        COUNT(*) FILTER (WHERE status = 'concluido') AS concluidos,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS hoje
      FROM leads
    `);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ─── POST /leads — create a new lead ────────────────
router.post('/', async (req, res, next) => {
  try {
    const { nome, telefone, email, origem, landing_page_slug, platform, cidade, estado, latitude, longitude } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    const { rows } = await pool.query(
      `INSERT INTO leads (nome, telefone, email, origem, landing_page_slug, platform, cidade, estado, latitude, longitude, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'novo')
       RETURNING *`,
      [nome, telefone, email || null, origem || 'landing_page', landing_page_slug || null, platform || null, cidade || null, estado || null, latitude || null, longitude || null]
    );

    // Create notification for new lead
    await pool.query(
      `INSERT INTO notifications (title, message, type) VALUES ($1, $2, 'info')`,
      ['Novo lead captado', `${nome} via ${landing_page_slug || 'formulário'}`]
    );

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// ─── GET /leads/geo — geo data for dashboard ────────
router.get('/geo', async (_req, res, next) => {
  try {
    const { rows: locations } = await pool.query(`
      SELECT cidade, estado, COUNT(*) as total
      FROM page_visits
      WHERE cidade IS NOT NULL
      GROUP BY cidade, estado
      ORDER BY total DESC
      LIMIT 50
    `);

    const { rows: totalRows } = await pool.query('SELECT COUNT(*) as total FROM page_visits');

    const { rows: recent } = await pool.query(`
      SELECT id, landing_page_slug, cidade, estado, latitude, longitude, visited_at
      FROM page_visits
      ORDER BY visited_at DESC
      LIMIT 50
    `);

    const { rows: noGeoRows } = await pool.query('SELECT COUNT(*) as total FROM page_visits WHERE cidade IS NULL');

    res.json({
      locations,
      totalVisits: parseInt(totalRows[0].total),
      recentVisits: recent,
      visitsWithoutGeo: parseInt(noGeoRows[0].total),
    });
  } catch (err) { next(err); }
});

// ─── GET /leads/:id — full lead detail ──────────────
router.get('/:id(\\d+)', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Lead não encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ─── PUT /leads/:id — update lead status/assignment/details ─
router.put('/:id(\\d+)', async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedFields = ['status', 'consultor_id', 'observacoes', 'renda', 'profissao', 'cpf', 'endereco', 'interesse', 'tabulacao', 'nome', 'telefone', 'email'];

    const fields = [];
    const params = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = $${idx++}`);
        params.push(req.body[field]);
      }
    }

    if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    fields.push(`updated_at = NOW()`);
    params.push(id);
    const { rows } = await pool.query(
      `UPDATE leads SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Lead não encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ─── DELETE /leads/:id ──────────────────────────────
router.delete('/:id(\\d+)', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Lead não encontrado' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
});
router.post('/track-visit', async (req, res, next) => {
  try {
    let { landing_page_slug, latitude, longitude, cidade, estado } = req.body;

    // Server-side geo fallback: if frontend didn't resolve, use visitor IP
    if (!cidade) {
      try {
        const visitorIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
        // Skip localhost/private IPs
        const isPrivate = !visitorIp || visitorIp === '::1' || visitorIp === '127.0.0.1' || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(visitorIp);
        if (!isPrivate) {
          const axios = require('axios');
          const geoRes = await axios.get(`http://ip-api.com/json/${visitorIp}?fields=city,regionName,lat,lon,status`, { timeout: 3000 });
          if (geoRes.data?.status === 'success') {
            cidade = geoRes.data.city || cidade;
            estado = geoRes.data.regionName?.substring(0, 2)?.toUpperCase() || estado;
            latitude = latitude || geoRes.data.lat || null;
            longitude = longitude || geoRes.data.lon || null;
            console.log('[Geo] Server-side fallback resolved:', { cidade, estado, ip: visitorIp });
          }
        }
      } catch (geoErr) {
        console.warn('[Geo] Server-side fallback failed:', geoErr.message);
      }
    }

    await pool.query(
      `INSERT INTO page_visits (landing_page_slug, latitude, longitude, cidade, estado)
       VALUES ($1, $2, $3, $4, $5)`,
      [landing_page_slug || null, latitude || null, longitude || null, cidade || null, estado || null]
    );

    console.log('[Geo] Visit tracked:', { landing_page_slug, cidade, estado, latitude, longitude });
    res.json({ tracked: true });
  } catch (err) { next(err); }
});

// ─── GET /leads/geo — geo data for dashboard ────────
router.get('/geo', async (_req, res, next) => {
  try {
    const { rows: locations } = await pool.query(`
      SELECT cidade, estado, COUNT(*) as total
      FROM page_visits
      WHERE cidade IS NOT NULL
      GROUP BY cidade, estado
      ORDER BY total DESC
      LIMIT 50
    `);

    const { rows: totalRows } = await pool.query('SELECT COUNT(*) as total FROM page_visits');

    const { rows: recent } = await pool.query(`
      SELECT id, landing_page_slug, cidade, estado, latitude, longitude, visited_at
      FROM page_visits
      ORDER BY visited_at DESC
      LIMIT 50
    `);

    const { rows: noGeoRows } = await pool.query('SELECT COUNT(*) as total FROM page_visits WHERE cidade IS NULL');

    res.json({
      locations,
      totalVisits: parseInt(totalRows[0].total),
      recentVisits: recent,
      visitsWithoutGeo: parseInt(noGeoRows[0].total),
    });
  } catch (err) { next(err); }
});

// ─── GET /leads/lp-stats — landing page performance ─
router.get('/lp-stats', async (_req, res, next) => {
  try {
    // Visits per LP — combine page_visits + lead_behavior_events (page_view)
    const { rows: visits } = await pool.query(`
      SELECT slug, SUM(visits) AS visits FROM (
        SELECT landing_page_slug AS slug, COUNT(*) AS visits
        FROM page_visits
        WHERE landing_page_slug IS NOT NULL
        GROUP BY landing_page_slug
        UNION ALL
        SELECT landing_page_slug AS slug, COUNT(*) AS visits
        FROM lead_behavior_events
        WHERE event_type = 'page_view' AND landing_page_slug IS NOT NULL
        GROUP BY landing_page_slug
      ) combined
      GROUP BY slug
    `);

    // Leads per LP
    const { rows: leads } = await pool.query(`
      SELECT landing_page_slug AS slug, COUNT(*) AS leads
      FROM leads
      WHERE landing_page_slug IS NOT NULL
      GROUP BY landing_page_slug
    `);

    // Build map
    const map = {};
    for (const v of visits) {
      map[v.slug] = { slug: v.slug, visits: parseInt(v.visits), leads: 0, conversion: 0 };
    }
    for (const l of leads) {
      if (!map[l.slug]) map[l.slug] = { slug: l.slug, visits: 0, leads: 0, conversion: 0 };
      map[l.slug].leads = parseInt(l.leads);
    }
    for (const key of Object.keys(map)) {
      const item = map[key];
      item.conversion = item.visits > 0 ? Math.round((item.leads / item.visits) * 10000) / 100 : 0;
    }

    res.json(Object.values(map));
  } catch (err) { next(err); }
});

module.exports = router;
