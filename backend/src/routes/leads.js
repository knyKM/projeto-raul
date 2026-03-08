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

// ─── PUT /leads/:id — update lead status/assignment ─
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, consultor_id } = req.body;

    const fields = [];
    const params = [];
    let idx = 1;

    if (status) { fields.push(`status = $${idx++}`); params.push(status); }
    if (consultor_id !== undefined) { fields.push(`consultor_id = $${idx++}`); params.push(consultor_id); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

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
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Lead não encontrado' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
});

// ─── POST /leads/track-visit — geo tracking ─────────
router.post('/track-visit', async (req, res, next) => {
  try {
    const { landing_page_slug, latitude, longitude, cidade, estado } = req.body;

    await pool.query(
      `INSERT INTO page_visits (landing_page_slug, latitude, longitude, cidade, estado)
       VALUES ($1, $2, $3, $4, $5)`,
      [landing_page_slug || null, latitude || null, longitude || null, cidade || null, estado || null]
    );

    res.json({ tracked: true });
  } catch (err) { next(err); }
});

// ─── GET /leads/geo — geo data for dashboard ────────
router.get('/geo', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT cidade, estado, COUNT(*) as total
      FROM page_visits
      WHERE cidade IS NOT NULL
      GROUP BY cidade, estado
      ORDER BY total DESC
      LIMIT 50
    `);

    const { rows: totalRows } = await pool.query('SELECT COUNT(*) as total FROM page_visits');

    res.json({ locations: rows, totalVisits: parseInt(totalRows[0].total) });
  } catch (err) { next(err); }
});

module.exports = router;
