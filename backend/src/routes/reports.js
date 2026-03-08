/**
 * /reports routes — aggregated analytics from internal data
 */
const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

// GET /reports — full aggregated report data
router.get('/', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      params.push(startDate, endDate);
      dateFilter = ` AND created_at >= $1::date AND created_at <= ($2::date + interval '1 day')`;
    }

    let visitDateFilter = '';
    const visitParams = [];
    if (startDate && endDate) {
      visitParams.push(startDate, endDate);
      visitDateFilter = ` AND visited_at >= $1::date AND visited_at <= ($2::date + interval '1 day')`;
    }

    // ── KPI Summary ──
    const { rows: [summary] } = await pool.query(`
      SELECT
        COUNT(*) AS total_leads,
        COUNT(DISTINCT estado) AS estados,
        COUNT(DISTINCT cidade) AS cidades,
        COUNT(*) FILTER (WHERE status IN ('fechado', 'concluido')) AS convertidos
      FROM leads
      WHERE 1=1 ${dateFilter}
    `, params);

    const { rows: [visitSummary] } = await pool.query(`
      SELECT COUNT(*) AS total_visits
      FROM page_visits
      WHERE 1=1 ${visitDateFilter}
    `, visitParams);

    const totalLeads = parseInt(summary.total_leads);
    const totalVisits = parseInt(visitSummary.total_visits);
    const conversionRate = totalVisits > 0 ? ((totalLeads / totalVisits) * 100).toFixed(1) : '0';

    // ── Peak Hour ──
    const { rows: hourRows } = await pool.query(`
      SELECT EXTRACT(HOUR FROM created_at) AS hora, COUNT(*) AS total
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY hora ORDER BY total DESC LIMIT 1
    `, params);
    const peakHour = hourRows.length > 0 ? `${Math.floor(hourRows[0].hora)}h` : '-';

    // ── Best Day ──
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const { rows: dayRows } = await pool.query(`
      SELECT EXTRACT(DOW FROM created_at) AS dia, COUNT(*) AS total
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY dia ORDER BY total DESC LIMIT 1
    `, params);
    const bestDay = dayRows.length > 0 ? dayNames[Math.floor(dayRows[0].dia)] : '-';

    // ── Leads by State ──
    const { rows: byState } = await pool.query(`
      SELECT estado AS name, COUNT(*) AS value
      FROM leads WHERE estado IS NOT NULL ${dateFilter}
      GROUP BY estado ORDER BY value DESC LIMIT 10
    `, params);

    // ── Leads by City ──
    const { rows: byCity } = await pool.query(`
      SELECT cidade AS name, COUNT(*) AS value
      FROM leads WHERE cidade IS NOT NULL ${dateFilter}
      GROUP BY cidade ORDER BY value DESC LIMIT 10
    `, params);

    // ── Traffic Sources (utm_source) ──
    const { rows: bySources } = await pool.query(`
      SELECT COALESCE(utm_source, origem, 'direto') AS name, COUNT(*) AS value
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY name ORDER BY value DESC LIMIT 10
    `, params);

    // ── Platform (utm_medium) ──
    const { rows: byMedium } = await pool.query(`
      SELECT COALESCE(utm_medium, 'orgânico') AS name, COUNT(*) AS value
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY name ORDER BY value DESC LIMIT 10
    `, params);

    // ── Device Types ──
    const { rows: byDevice } = await pool.query(`
      SELECT COALESCE(device_type, 'desconhecido') AS name, COUNT(*) AS value
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY name ORDER BY value DESC
    `, params);

    // ── OS ──
    const { rows: byOS } = await pool.query(`
      SELECT COALESCE(os, 'desconhecido') AS name, COUNT(*) AS value
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY name ORDER BY value DESC LIMIT 6
    `, params);

    // ── Browser ──
    const { rows: byBrowser } = await pool.query(`
      SELECT COALESCE(browser, 'desconhecido') AS name, COUNT(*) AS value
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY name ORDER BY value DESC LIMIT 6
    `, params);

    // ── Daily Trend ──
    const { rows: dailyTrend } = await pool.query(`
      SELECT created_at::date AS date, COUNT(*) AS leads
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY date ORDER BY date ASC
    `, params);

    // ── Heatmap: hour × day of week ──
    const { rows: heatmapRows } = await pool.query(`
      SELECT EXTRACT(DOW FROM created_at) AS dow,
             EXTRACT(HOUR FROM created_at) AS hour,
             COUNT(*) AS value
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY dow, hour ORDER BY dow, hour
    `, params);

    // ── Hourly Distribution ──
    const { rows: hourlyDist } = await pool.query(`
      SELECT EXTRACT(HOUR FROM created_at) AS hour, COUNT(*) AS value
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY hour ORDER BY hour
    `, params);

    // ── Top Landing Pages ──
    const { rows: byLP } = await pool.query(`
      SELECT COALESCE(landing_page_slug, 'direto') AS name, COUNT(*) AS value
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY name ORDER BY value DESC LIMIT 10
    `, params);

    // ── Leads by Status ──
    const { rows: byStatus } = await pool.query(`
      SELECT status AS name, COUNT(*) AS value
      FROM leads WHERE 1=1 ${dateFilter}
      GROUP BY status ORDER BY value DESC
    `, params);

    res.json({
      kpi: {
        totalLeads,
        totalVisits,
        estados: parseInt(summary.estados),
        cidades: parseInt(summary.cidades),
        conversionRate,
        peakHour,
        bestDay,
        convertidos: parseInt(summary.convertidos),
      },
      byState: byState.map(r => ({ name: r.name, value: parseInt(r.value) })),
      byCity: byCity.map(r => ({ name: r.name, value: parseInt(r.value) })),
      bySources: bySources.map(r => ({ name: r.name, value: parseInt(r.value) })),
      byMedium: byMedium.map(r => ({ name: r.name, value: parseInt(r.value) })),
      byDevice: byDevice.map(r => ({ name: r.name, value: parseInt(r.value) })),
      byOS: byOS.map(r => ({ name: r.name, value: parseInt(r.value) })),
      byBrowser: byBrowser.map(r => ({ name: r.name, value: parseInt(r.value) })),
      dailyTrend: dailyTrend.map(r => ({ date: r.date, leads: parseInt(r.leads) })),
      heatmap: heatmapRows.map(r => ({ dow: parseInt(r.dow), hour: parseInt(r.hour), value: parseInt(r.value) })),
      hourlyDist: hourlyDist.map(r => ({ hour: parseInt(r.hour), value: parseInt(r.value) })),
      byLP: byLP.map(r => ({ name: r.name, value: parseInt(r.value) })),
      byStatus: byStatus.map(r => ({ name: r.name, value: parseInt(r.value) })),
    });
  } catch (err) { next(err); }
});

module.exports = router;
