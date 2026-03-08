/**
 * /lead-tracking routes — behavioral tracking for lead scoring
 * Tracks: time on LP, pages visited, chat interactions
 */
const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

// ─── POST /lead-tracking/event — track a behavioral event ───
router.post('/event', async (req, res, next) => {
  try {
    const { session_id, event_type, landing_page_slug, metadata } = req.body;
    if (!session_id || !event_type) {
      return res.status(400).json({ error: 'session_id e event_type são obrigatórios' });
    }

    await pool.query(
      `INSERT INTO lead_behavior_events (session_id, event_type, landing_page_slug, metadata)
       VALUES ($1, $2, $3, $4)`,
      [session_id, event_type, landing_page_slug || null, JSON.stringify(metadata || {})]
    );

    res.json({ tracked: true });
  } catch (err) { next(err); }
});

// ─── GET /lead-tracking/score/:leadId — get behavior score for a lead ───
router.get('/score/:leadId', async (req, res, next) => {
  try {
    const { leadId } = req.params;

    // Get lead info
    const { rows: leadRows } = await pool.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (leadRows.length === 0) return res.status(404).json({ error: 'Lead não encontrado' });

    const lead = leadRows[0];

    // Get behavior events linked by session_id or phone
    const { rows: events } = await pool.query(`
      SELECT event_type, COUNT(*) as count, 
             MAX(metadata->>'duration_seconds') as max_duration
      FROM lead_behavior_events 
      WHERE session_id = $1 OR session_id = $2
      GROUP BY event_type
    `, [lead.telefone, `lead_${lead.id}`]);

    const behavior = {
      page_views: 0,
      time_on_page_seconds: 0,
      chat_interactions: 0,
      form_started: false,
      scroll_depth: 0,
    };

    for (const evt of events) {
      switch (evt.event_type) {
        case 'page_view': behavior.page_views = parseInt(evt.count); break;
        case 'time_on_page': behavior.time_on_page_seconds = parseInt(evt.max_duration || '0'); break;
        case 'chat_message': behavior.chat_interactions = parseInt(evt.count); break;
        case 'form_start': behavior.form_started = true; break;
        case 'scroll': behavior.scroll_depth = parseInt(evt.max_duration || '0'); break;
      }
    }

    res.json({ lead_id: parseInt(leadId), behavior });
  } catch (err) { next(err); }
});

// ─── GET /lead-tracking/scores — batch behavior scores for all leads ───
router.get('/scores', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        l.id as lead_id,
        COALESCE(SUM(CASE WHEN e.event_type = 'page_view' THEN 1 ELSE 0 END), 0) as page_views,
        COALESCE(MAX(CASE WHEN e.event_type = 'time_on_page' THEN (e.metadata->>'duration_seconds')::int ELSE 0 END), 0) as time_on_page_seconds,
        COALESCE(SUM(CASE WHEN e.event_type = 'chat_message' THEN 1 ELSE 0 END), 0) as chat_interactions,
        COALESCE(MAX(CASE WHEN e.event_type = 'scroll' THEN (e.metadata->>'depth')::int ELSE 0 END), 0) as scroll_depth,
        BOOL_OR(e.event_type = 'form_start') as form_started
      FROM leads l
      LEFT JOIN lead_behavior_events e ON (e.session_id = l.telefone OR e.session_id = 'lead_' || l.id)
      GROUP BY l.id
    `);

    const scores = {};
    for (const row of rows) {
      scores[row.lead_id] = {
        page_views: parseInt(row.page_views),
        time_on_page_seconds: parseInt(row.time_on_page_seconds),
        chat_interactions: parseInt(row.chat_interactions),
        scroll_depth: parseInt(row.scroll_depth),
        form_started: row.form_started || false,
      };
    }

    res.json(scores);
  } catch (err) { next(err); }
});

module.exports = router;
