/**
 * /atendentes routes — CRUD for attendants
 */
const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

// ─── GET /atendentes — list all ─────────────────────
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*,
        COUNT(l.id) FILTER (WHERE l.status = 'em_atendimento') AS leads_ativos,
        COUNT(l.id) FILTER (WHERE l.status = 'concluido') AS leads_concluidos,
        COUNT(l.id) AS leads_total
      FROM atendentes a
      LEFT JOIN leads l ON l.consultor_id = a.id
      GROUP BY a.id
      ORDER BY a.nome
    `);
    res.json(rows);
  } catch (err) { next(err); }
});

// ─── POST /atendentes — create ──────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { nome, email, telefone } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

    const { rows } = await pool.query(
      'INSERT INTO atendentes (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *',
      [nome, email || null, telefone || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// ─── PUT /atendentes/:id — update ───────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const { nome, email, telefone, ativo } = req.body;
    const { rows } = await pool.query(
      `UPDATE atendentes SET nome = COALESCE($1, nome), email = COALESCE($2, email),
       telefone = COALESCE($3, telefone), ativo = COALESCE($4, ativo)
       WHERE id = $5 RETURNING *`,
      [nome, email, telefone, ativo, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Atendente não encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ─── DELETE /atendentes/:id ─────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    // Unassign leads first
    await pool.query('UPDATE leads SET consultor_id = NULL WHERE consultor_id = $1', [req.params.id]);
    const { rowCount } = await pool.query('DELETE FROM atendentes WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Atendente não encontrado' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
});

module.exports = router;
