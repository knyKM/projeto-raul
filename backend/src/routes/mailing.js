const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST /mailing/3cplus — Build CSV from leads and send to 3CPlus API
router.post('/3cplus', async (req, res) => {
  try {
    const { apiToken, campaignId, listName, leadIds } = req.body;

    if (!apiToken || !campaignId || !listName) {
      return res.status(400).json({ error: 'apiToken, campaignId e listName são obrigatórios.' });
    }

    // Fetch leads (all or specific IDs)
    let query = 'SELECT id, nome, telefone FROM leads';
    let params = [];
    if (leadIds && leadIds.length > 0) {
      query += ' WHERE id = ANY($1)';
      params = [leadIds];
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    const leads = result.rows;

    if (leads.length === 0) {
      return res.status(400).json({ error: 'Nenhum lead encontrado para exportar.' });
    }

    // Build CSV content
    // Columns: identifier, Nome, (empty), areacodephone, (empty), areacode, (empty), phone, (empty), areacodephone
    const csvLines = [];
    csvLines.push('"identifier","Nome","","areacodephone","","areacode","","phone","","areacodephone"');

    for (const lead of leads) {
      const phone = (lead.telefone || '').replace(/\D/g, ''); // digits only
      const areaCode = phone.length >= 10 ? phone.substring(0, 2) : '';
      const phoneNumber = phone.length >= 10 ? phone.substring(2) : phone;

      csvLines.push([
        `"${lead.id}"`,
        `"${(lead.nome || '').replace(/"/g, '""')}"`,
        '""',
        `"${phone}"`,
        '""',
        `"${areaCode}"`,
        '""',
        `"${phoneNumber}"`,
        '""',
        `"${phone}"`,
      ].join(','));
    }

    const csvContent = csvLines.join('\n');

    // Send to 3CPlus API using multipart/form-data
    const FormData = require('form-data');
    const form = new FormData();
    form.append('name', listName);
    form.append('header[0]', 'identifier');
    form.append('header[1]', 'Nome');
    form.append('header[2]', '');
    form.append('header[3]', 'areacodephone');
    form.append('header[4]', '');
    form.append('header[5]', 'areacode');
    form.append('header[6]', '');
    form.append('header[7]', 'phone');
    form.append('header[8]', '');
    form.append('header[9]', 'areacodephone');
    form.append('mailing', Buffer.from(csvContent, 'utf-8'), {
      filename: 'mailing.csv',
      contentType: 'text/csv',
    });
    form.append('delimiter', 'quotes');
    form.append('separator', ',');
    form.append('has_header', '1');

    const apiUrl = `http://app.3c.fluxoti.com.br/api/v1/campaigns/${campaignId}/lists?api_token=${apiToken}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: responseData.message || `Erro ${response.status} ao enviar para 3CPlus`,
        details: responseData,
      });
    }

    res.json({
      success: true,
      leadsExported: leads.length,
      response: responseData,
    });
  } catch (err) {
    console.error('[MAILING] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
