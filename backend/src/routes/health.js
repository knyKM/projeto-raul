const { Router } = require('express');
const { testConnection } = require('../db');

const router = Router();

router.get('/', async (_req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

module.exports = router;
