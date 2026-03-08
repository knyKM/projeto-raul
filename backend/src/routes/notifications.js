/**
 * /notifications routes — real-time notifications
 */
const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

// ─── GET /notifications — list recent ───────────────
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { rows } = await pool.query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ─── PUT /notifications/read-all — mark all as read ─
router.put('/read-all', async (_req, res, next) => {
  try {
    await pool.query('UPDATE notifications SET read = true WHERE read = false');
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ─── PUT /notifications/:id/read ────────────────────
router.put('/:id/read', async (req, res, next) => {
  try {
    await pool.query('UPDATE notifications SET read = true WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ─── GET /notifications/unread-count ────────────────
router.get('/unread-count', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM notifications WHERE read = false');
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) { next(err); }
});

module.exports = router;
