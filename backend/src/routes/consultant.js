/**
 * /consultant routes — individual consultant dashboard data
 */
const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

// ─── GET /consultant/:id/dashboard — full dashboard for a consultant ───
router.get('/:id/dashboard', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify consultant exists
    const { rows: atenRows } = await pool.query('SELECT * FROM atendentes WHERE id = $1', [id]);
    if (atenRows.length === 0) return res.status(404).json({ error: 'Consultor não encontrado' });

    const consultor = atenRows[0];

    // Get stats
    const { rows: statsRows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'novo' OR status = 'em_contato') AS pendentes,
        COUNT(*) FILTER (WHERE status = 'em_contato' OR status = 'em_atendimento') AS em_atendimento,
        COUNT(*) FILTER (WHERE status = 'negociando') AS negociando,
        COUNT(*) FILTER (WHERE status = 'fechado' OR status = 'concluido') AS fechados,
        COUNT(*) FILTER (WHERE status = 'perdido') AS perdidos,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS hoje
      FROM leads WHERE consultor_id = $1
    `, [id]);

    // Get leads assigned to this consultant
    const { rows: leads } = await pool.query(
      'SELECT * FROM leads WHERE consultor_id = $1 ORDER BY created_at DESC LIMIT 50',
      [id]
    );

    // Conversion rate (fechado / total assigned)
    const total = parseInt(statsRows[0].total) || 0;
    const fechados = parseInt(statsRows[0].fechados) || 0;
    const conversionRate = total > 0 ? Math.round((fechados / total) * 10000) / 100 : 0;

    // Average response time (time between lead creation and status change from 'novo')
    const { rows: avgTimeRows } = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) as avg_minutes
      FROM leads 
      WHERE consultor_id = $1 AND status != 'novo' AND updated_at IS NOT NULL
    `, [id]);
    const avgResponseMinutes = Math.round(parseFloat(avgTimeRows[0]?.avg_minutes || '0'));

    // Daily performance (last 7 days)
    const { rows: dailyRows } = await pool.query(`
      SELECT 
        created_at::date as day,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'fechado' OR status = 'concluido') as fechados
      FROM leads 
      WHERE consultor_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY created_at::date
      ORDER BY day
    `, [id]);

    res.json({
      consultor,
      stats: statsRows[0],
      leads,
      metrics: {
        conversionRate,
        avgResponseMinutes,
        totalAssigned: total,
        totalClosed: fechados,
      },
      dailyPerformance: dailyRows,
    });
  } catch (err) { next(err); }
});

// ─── GET /consultant/ranking — ranking of all consultants ───
router.get('/ranking/all', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        a.id, a.nome,
        COUNT(l.id) AS total_leads,
        COUNT(l.id) FILTER (WHERE l.status = 'fechado' OR l.status = 'concluido') AS fechados,
        COUNT(l.id) FILTER (WHERE l.status = 'perdido') AS perdidos,
        COUNT(l.id) FILTER (WHERE l.created_at::date = CURRENT_DATE) AS hoje,
        CASE WHEN COUNT(l.id) > 0 
          THEN ROUND((COUNT(l.id) FILTER (WHERE l.status = 'fechado' OR l.status = 'concluido')::numeric / COUNT(l.id)) * 100, 1)
          ELSE 0 
        END AS conversion_rate
      FROM atendentes a
      LEFT JOIN leads l ON l.consultor_id = a.id
      WHERE a.ativo = true
      GROUP BY a.id, a.nome
      ORDER BY fechados DESC, conversion_rate DESC
    `);

    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
