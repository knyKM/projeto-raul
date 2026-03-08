/**
 * /whatsapp routes — WhatsApp Business Cloud API + Auto Follow-up
 */
const { Router } = require('express');
const axios = require('axios');
const { pool } = require('../db');

const router = Router();

const WA_API = 'https://graph.facebook.com/v20.0';

function getConfig() {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    token: process.env.WHATSAPP_ACCESS_TOKEN,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  };
}

async function sendMessage(to, message) {
  const { phoneNumberId, token } = getConfig();
  if (!phoneNumberId || !token) throw new Error('WhatsApp not configured');

  const { data } = await axios.post(
    `${WA_API}/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'text',
      text: { body: message },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return data.messages?.[0]?.id;
}

// POST /whatsapp/test
router.post('/test', async (_req, res) => {
  const { phoneNumberId, token } = getConfig();
  if (!phoneNumberId || !token) {
    return res.json({ connected: false, error: 'WhatsApp credentials not configured' });
  }
  try {
    const { data } = await axios.get(`${WA_API}/${phoneNumberId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ connected: true, phone: data.display_phone_number, name: data.verified_name });
  } catch (err) {
    res.json({ connected: false, error: err.response?.data?.error?.message || err.message });
  }
});

// POST /whatsapp/config
router.post('/config', (req, res) => {
  const { phoneNumberId, businessAccountId, accessToken, webhookVerifyToken } = req.body;
  if (phoneNumberId) process.env.WHATSAPP_PHONE_NUMBER_ID = phoneNumberId;
  if (businessAccountId) process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = businessAccountId;
  if (accessToken) process.env.WHATSAPP_ACCESS_TOKEN = accessToken;
  if (webhookVerifyToken) process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = webhookVerifyToken;
  res.json({ ok: true });
});

// POST /whatsapp/send — send a text message
router.post('/send', async (req, res) => {
  const { to, message } = req.body;
  try {
    const messageId = await sendMessage(to, message);
    res.json({ sent: true, messageId });
  } catch (err) {
    res.status(400).json({ sent: false, error: err.response?.data?.error?.message || err.message });
  }
});

// POST /whatsapp/follow-up — trigger auto follow-up for uncontacted leads
router.post('/follow-up', async (req, res) => {
  const { minutesThreshold = 15, messageTemplate } = req.body;
  const { phoneNumberId, token } = getConfig();

  if (!phoneNumberId || !token) {
    return res.status(400).json({ error: 'WhatsApp não configurado' });
  }

  try {
    // Find leads that are still "novo" and older than threshold
    const { rows: pendingLeads } = await pool.query(
      `SELECT id, nome, telefone, landing_page_slug
       FROM leads
       WHERE status = 'novo'
         AND followup_sent = false
         AND created_at < NOW() - INTERVAL '1 minute' * $1
       ORDER BY created_at ASC
       LIMIT 50`,
      [minutesThreshold]
    );

    if (pendingLeads.length === 0) {
      return res.json({ sent: 0, message: 'Nenhum lead pendente para follow-up' });
    }

    const defaultTemplate = 'Olá {nome}! 👋 Recebemos seu interesse e um consultor entrará em contato em breve. Fique à vontade para nos chamar aqui caso precise de algo!';
    const template = messageTemplate || defaultTemplate;

    let sentCount = 0;
    const errors = [];

    for (const lead of pendingLeads) {
      const msg = template
        .replace('{nome}', lead.nome)
        .replace('{veiculo}', lead.landing_page_slug || 'nosso consórcio');

      try {
        await sendMessage(lead.telefone, msg);
        await pool.query('UPDATE leads SET followup_sent = true WHERE id = $1', [lead.id]);
        sentCount++;
      } catch (err) {
        errors.push({ leadId: lead.id, error: err.message });
      }
    }

    // Create notification
    if (sentCount > 0) {
      await pool.query(
        `INSERT INTO notifications (title, message, type) VALUES ($1, $2, 'info')`,
        ['Follow-up automático', `${sentCount} mensagens de follow-up enviadas via WhatsApp`]
      );
    }

    res.json({ sent: sentCount, total: pendingLeads.length, errors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /whatsapp/follow-up/config — get follow-up settings
router.get('/follow-up/config', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT value FROM app_config WHERE key = 'followup_config'"
    );
    if (rows.length > 0) {
      res.json(JSON.parse(rows[0].value));
    } else {
      res.json({
        enabled: false,
        minutesThreshold: 15,
        messageTemplate: 'Olá {nome}! 👋 Recebemos seu interesse e um consultor entrará em contato em breve. Fique à vontade para nos chamar aqui caso precise de algo!',
      });
    }
  } catch {
    res.json({ enabled: false, minutesThreshold: 15, messageTemplate: '' });
  }
});

// POST /whatsapp/follow-up/config — save follow-up settings
router.post('/follow-up/config', async (req, res) => {
  const config = req.body;
  try {
    await pool.query(
      `INSERT INTO app_config (key, value) VALUES ('followup_config', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [JSON.stringify(config)]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /whatsapp/webhook — verification
router.get('/webhook', (req, res) => {
  const { webhookVerifyToken } = getConfig();
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === webhookVerifyToken) return res.status(200).send(challenge);
  res.sendStatus(403);
});

// POST /whatsapp/webhook — incoming messages
router.post('/webhook', (req, res) => {
  console.log('[WhatsApp Webhook]', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

module.exports = router;
