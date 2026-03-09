const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// List all landing pages
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM landing_pages ORDER BY created_at DESC'
    );
    const pages = rows.map(rowToPage);
    res.json(pages);
  } catch (err) {
    console.error('[LandingPages] list error:', err.message);
    res.status(500).json({ error: 'Erro ao listar landing pages' });
  }
});

// Get by slug
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM landing_pages WHERE slug = $1 LIMIT 1',
      [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Não encontrada' });
    res.json(rowToPage(rows[0]));
  } catch (err) {
    console.error('[LandingPages] get-by-slug error:', err.message);
    res.status(500).json({ error: 'Erro ao buscar landing page' });
  }
});

// Create or update
router.post('/', async (req, res) => {
  try {
    const p = req.body;
    if (!p.id || !p.slug || !p.vehicleName) {
      return res.status(400).json({ error: 'Campos obrigatórios: id, slug, vehicleName' });
    }

    await pool.query(
      `INSERT INTO landing_pages (id, slug, template, vehicle_name, brand, model, year, credit_value, installments, installment_value, image_url, description, highlights, whatsapp_number, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
         slug=EXCLUDED.slug, template=EXCLUDED.template, vehicle_name=EXCLUDED.vehicle_name,
         brand=EXCLUDED.brand, model=EXCLUDED.model, year=EXCLUDED.year,
         credit_value=EXCLUDED.credit_value, installments=EXCLUDED.installments,
         installment_value=EXCLUDED.installment_value, image_url=EXCLUDED.image_url,
         description=EXCLUDED.description, highlights=EXCLUDED.highlights,
         whatsapp_number=EXCLUDED.whatsapp_number`,
      [
        p.id, p.slug, p.template || 'completa', p.vehicleName,
        p.brand || '', p.model || '', p.year || '',
        p.creditValue || 0, p.installments || 80, p.installmentValue || 0,
        p.imageUrl || '', p.description || '',
        JSON.stringify(p.highlights || []),
        p.whatsappNumber || '',
        p.createdAt || new Date().toISOString(),
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('[LandingPages] save error:', err.message);
    res.status(500).json({ error: 'Erro ao salvar landing page' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM landing_pages WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[LandingPages] delete error:', err.message);
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});

function rowToPage(row) {
  return {
    id: row.id,
    slug: row.slug,
    template: row.template || 'completa',
    vehicleName: row.vehicle_name,
    brand: row.brand,
    model: row.model,
    year: row.year,
    creditValue: parseFloat(row.credit_value) || 0,
    installments: row.installments || 80,
    installmentValue: parseFloat(row.installment_value) || 0,
    imageUrl: row.image_url || '',
    description: row.description || '',
    highlights: row.highlights || [],
    whatsappNumber: row.whatsapp_number || '',
    createdAt: row.created_at,
  };
}

module.exports = router;
