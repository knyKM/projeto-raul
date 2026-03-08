/**
 * /overview routes — dashboard stats
 */
const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

// ─── GET /overview — main dashboard stats ───────────
router.get('/', async (_req, res, next) => {
  try {
    // Today's stats
    const { rows: leadStats } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS leads_hoje,
        COUNT(*) FILTER (WHERE status = 'novo') AS pendentes,
        COUNT(*) AS total_leads
      FROM leads
    `);

    // Today's visits
    const { rows: visitStats } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE visited_at::date = CURRENT_DATE) AS acessos_hoje,
        COUNT(*) AS total_acessos
      FROM page_visits
    `);

    // Conversion rate (today)
    const acessosHoje = parseInt(visitStats[0].acessos_hoje) || 0;
    const leadsHoje = parseInt(leadStats[0].leads_hoje) || 0;
    const taxaConversao = acessosHoje > 0 ? ((leadsHoje / acessosHoje) * 100).toFixed(1) : '0';

    // Leads per landing page (last 7 days)
    const { rows: perPage } = await pool.query(`
      SELECT landing_page_slug, COUNT(*) as total
      FROM leads
      WHERE created_at >= NOW() - INTERVAL '7 days' AND landing_page_slug IS NOT NULL
      GROUP BY landing_page_slug
      ORDER BY total DESC
      LIMIT 10
    `);

    // Daily leads (last 30 days)
    const { rows: dailyLeads } = await pool.query(`
      SELECT created_at::date as data, COUNT(*) as total
      FROM leads
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY created_at::date
      ORDER BY data
    `);

    res.json({
      acessosHoje,
      leadsHoje,
      taxaConversao: `${taxaConversao}%`,
      pendentes: parseInt(leadStats[0].pendentes),
      totalLeads: parseInt(leadStats[0].total_leads),
      totalAcessos: parseInt(visitStats[0].total_acessos),
      leadsPerPage: perPage,
      dailyLeads,
    });
  } catch (err) { next(err); }
});

module.exports = router;
