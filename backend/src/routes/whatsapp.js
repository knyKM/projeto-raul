/**
 * /whatsapp routes — WhatsApp Business Cloud API
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
const { Router } = require('express');
const axios = require('axios');

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
    res.json({
      connected: true,
      phone: data.display_phone_number,
      name: data.verified_name,
    });
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
  const { phoneNumberId, token } = getConfig();

  if (!phoneNumberId || !token) {
    return res.status(400).json({ sent: false, error: 'WhatsApp not configured' });
  }

  try {
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

    res.json({ sent: true, messageId: data.messages?.[0]?.id });
  } catch (err) {
    res.status(400).json({ sent: false, error: err.response?.data?.error?.message || err.message });
  }
});

// GET /whatsapp/webhook — verification (Meta webhook setup)
router.get('/webhook', (req, res) => {
  const { webhookVerifyToken } = getConfig();
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === webhookVerifyToken) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// POST /whatsapp/webhook — incoming messages
router.post('/webhook', (req, res) => {
  const body = req.body;
  console.log('[WhatsApp Webhook]', JSON.stringify(body, null, 2));

  // Process incoming messages here
  // body.entry[0].changes[0].value.messages

  res.sendStatus(200);
});

module.exports = router;
