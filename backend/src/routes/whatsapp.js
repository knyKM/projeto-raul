/**
 * /whatsapp routes — WhatsApp Business Cloud API + Conversations + Follow-up
 */
const { Router } = require('express');
const axios = require('axios');
const { pool } = require('../db');
const { requireTier } = require('../middleware/licenseTier');

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

// Apply license tier check to all routes EXCEPT webhooks
router.use((req, res, next) => {
  if (req.path === '/webhook') return next();
  return requireTier('whatsapp')(req, res, next);
});

// GET /whatsapp/conversations
router.get('/conversations', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, lead_id, lead_name, phone, wa_id, status, agent, tabulation,
              interest, ad_id, unread, last_message, last_message_at,
              window_expires, started_at
       FROM wa_conversations
       ORDER BY last_message_at DESC NULLS LAST`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /whatsapp/conversations/:id/messages
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, conversation_id, wa_message_id, role, text, status, buttons, timestamp
       FROM wa_messages
       WHERE conversation_id = $1
       ORDER BY timestamp ASC`,
      [req.params.id]
    );
    // Mark conversation as read
    await pool.query('UPDATE wa_conversations SET unread = 0 WHERE id = $1', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /whatsapp/conversations/:id/send — send message in conversation
router.post('/conversations/:id/send', async (req, res) => {
  const { message } = req.body;
  const convId = req.params.id;

  try {
    // Get conversation
    const { rows: [conv] } = await pool.query(
      'SELECT phone, wa_id, status FROM wa_conversations WHERE id = $1', [convId]
    );
    if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

    // Try to send via WhatsApp API
    let waMessageId = null;
    try {
      waMessageId = await sendMessage(conv.phone, message);
    } catch {
      // If WA not configured, still store the message
    }

    // Store message
    const { rows: [msg] } = await pool.query(
      `INSERT INTO wa_messages (conversation_id, wa_message_id, role, text, status)
       VALUES ($1, $2, 'agent', $3, 'sent')
       RETURNING *`,
      [convId, waMessageId, message]
    );

    // Update conversation
    await pool.query(
      `UPDATE wa_conversations SET last_message = $1, last_message_at = NOW(), status = 'active' WHERE id = $2`,
      [message, convId]
    );

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /whatsapp/conversations — create a new conversation manually
router.post('/conversations', async (req, res) => {
  const { leadName, phone, waId, agent, interest, adId, leadId } = req.body;
  try {
    const { rows: [conv] } = await pool.query(
      `INSERT INTO wa_conversations (lead_id, lead_name, phone, wa_id, agent, interest, ad_id, status, started_at, last_message_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW(), NOW())
       RETURNING *`,
      [leadId || null, leadName, phone, waId || phone.replace(/\D/g, ''), agent || null, interest || null, adId || null]
    );
    res.json(conv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /whatsapp/conversations/:id — update conversation fields
router.put('/conversations/:id', async (req, res) => {
  const { status, agent, tabulation, interest } = req.body;
  try {
    const sets = [];
    const vals = [];
    let idx = 1;
    if (status) { sets.push(`status = $${idx++}`); vals.push(status); }
    if (agent !== undefined) { sets.push(`agent = $${idx++}`); vals.push(agent); }
    if (tabulation !== undefined) { sets.push(`tabulation = $${idx++}`); vals.push(tabulation); }
    if (interest !== undefined) { sets.push(`interest = $${idx++}`); vals.push(interest); }

    if (sets.length === 0) return res.json({ ok: true });

    vals.push(req.params.id);
    await pool.query(`UPDATE wa_conversations SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Original routes ────────────────────────────────

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

// POST /whatsapp/send — send a text message (standalone, not tied to conversation)
router.post('/send', async (req, res) => {
  const { to, message } = req.body;
  try {
    const messageId = await sendMessage(to, message);
    res.json({ sent: true, messageId });
  } catch (err) {
    res.status(400).json({ sent: false, error: err.response?.data?.error?.message || err.message });
  }
});

// POST /whatsapp/follow-up
router.post('/follow-up', async (req, res) => {
  const { minutesThreshold = 15, messageTemplate } = req.body;
  const { phoneNumberId, token } = getConfig();

  if (!phoneNumberId || !token) {
    return res.status(400).json({ error: 'WhatsApp não configurado' });
  }

  try {
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

// GET /whatsapp/follow-up/config
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
        messageTemplate: 'Olá {nome}! 👋 Recebemos seu interesse e um consultor entrará em contato em breve.',
      });
    }
  } catch {
    res.json({ enabled: false, minutesThreshold: 15, messageTemplate: '' });
  }
});

// POST /whatsapp/follow-up/config
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

// POST /whatsapp/webhook — incoming messages (stores in DB)
router.post('/webhook', async (req, res) => {
  console.log('[WhatsApp Webhook]', JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.messages) {
      for (const msg of value.messages) {
        const from = msg.from; // wa_id
        const text = msg.text?.body || '';
        const contactName = value.contacts?.[0]?.profile?.name || from;

        // Find or create conversation
        let { rows: [conv] } = await pool.query(
          'SELECT id FROM wa_conversations WHERE wa_id = $1 ORDER BY created_at DESC LIMIT 1', [from]
        );

        if (!conv) {
          const result = await pool.query(
            `INSERT INTO wa_conversations (lead_name, phone, wa_id, status, last_message, last_message_at, window_expires)
             VALUES ($1, $2, $3, 'active', $4, NOW(), NOW() + INTERVAL '24 hours')
             RETURNING id`,
            [contactName, from, from, text]
          );
          conv = result.rows[0];
        } else {
          await pool.query(
            `UPDATE wa_conversations
             SET last_message = $1, last_message_at = NOW(), unread = unread + 1,
                 status = 'active', window_expires = NOW() + INTERVAL '24 hours'
             WHERE id = $2`,
            [text, conv.id]
          );
        }

        // Store message
        await pool.query(
          `INSERT INTO wa_messages (conversation_id, wa_message_id, role, text, status, timestamp)
           VALUES ($1, $2, 'user', $3, 'read', NOW())`,
          [conv.id, msg.id, text]
        );
      }
    }

    // Handle status updates
    if (value?.statuses) {
      for (const statusUpdate of value.statuses) {
        const waStatus = statusUpdate.status; // sent, delivered, read
        if (['sent', 'delivered', 'read'].includes(waStatus)) {
          await pool.query(
            'UPDATE wa_messages SET status = $1 WHERE wa_message_id = $2',
            [waStatus, statusUpdate.id]
          );
        }
      }
    }
  } catch (err) {
    console.error('[Webhook Error]', err.message);
  }

  res.sendStatus(200);
});

// ─── PUBLIC: Chat Widget → WhatsApp conversation ───
// This endpoint is PUBLIC (no auth/tier) so landing page visitors can send messages.

// POST /whatsapp/chat-widget/start — Start or resume a chat widget conversation
router.post('/chat-widget/start', async (req, res) => {
  const { name, phone, slug, vehicleName } = req.body;
  if (!phone) return res.status(400).json({ error: 'Telefone obrigatório' });

  const cleanPhone = phone.replace(/\D/g, '');
  try {
    // Check for existing open conversation with this phone
    const { rows: existing } = await pool.query(
      `SELECT id FROM wa_conversations WHERE phone = $1 AND status NOT IN ('closed', 'resolved') ORDER BY started_at DESC LIMIT 1`,
      [cleanPhone]
    );

    if (existing.length > 0) {
      return res.json({ conversationId: existing[0].id, resumed: true });
    }

    // Create new conversation
    const { rows: [conv] } = await pool.query(
      `INSERT INTO wa_conversations (lead_name, phone, wa_id, interest, status, started_at, last_message_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
       RETURNING id`,
      [name || 'Visitante', cleanPhone, cleanPhone, vehicleName ? `Chat LP: ${vehicleName}` : `Chat LP: ${slug || 'direto'}`]
    );

    // Also create the lead if it doesn't exist
    const { rows: leadExists } = await pool.query(
      'SELECT id FROM leads WHERE telefone = $1 LIMIT 1', [cleanPhone]
    );
    let leadId = leadExists[0]?.id;
    if (!leadId) {
      const { rows: [newLead] } = await pool.query(
        `INSERT INTO leads (nome, telefone, origem, landing_page_slug, status, created_at)
         VALUES ($1, $2, 'chat_widget', $3, 'novo', NOW()) RETURNING id`,
        [name || 'Visitante', cleanPhone, slug || null]
      );
      leadId = newLead.id;
    }

    // Link lead to conversation
    await pool.query('UPDATE wa_conversations SET lead_id = $1 WHERE id = $2', [leadId, conv.id]);

    res.json({ conversationId: conv.id, leadId, resumed: false });
  } catch (err) {
    console.error('[ChatWidget] start error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /whatsapp/chat-widget/message — Send a message from chat widget
router.post('/chat-widget/message', async (req, res) => {
  const { conversationId, text, role = 'customer' } = req.body;
  if (!conversationId || !text) return res.status(400).json({ error: 'conversationId e text obrigatórios' });

  try {
    const { rows: [msg] } = await pool.query(
      `INSERT INTO wa_messages (conversation_id, role, text, status, timestamp)
       VALUES ($1, $2, $3, 'delivered', NOW()) RETURNING *`,
      [conversationId, role, text]
    );

    // Update conversation last_message and unread count
    await pool.query(
      `UPDATE wa_conversations SET last_message = $1, last_message_at = NOW(), unread = unread + 1, status = CASE WHEN status = 'closed' THEN 'pending' ELSE status END WHERE id = $2`,
      [text, conversationId]
    );

    res.json(msg);
  } catch (err) {
    console.error('[ChatWidget] message error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /whatsapp/chat-widget/messages/:id — Get messages for a conversation (public)
router.get('/chat-widget/messages/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, role, text, status, timestamp FROM wa_messages WHERE conversation_id = $1 ORDER BY timestamp ASC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
