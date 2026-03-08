const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.LICENSE_SECRET || 'default-secret-change-me';

// Simple JWT implementation (no external dependency)
function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 * 7 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === computed;
}

// Middleware to protect routes
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const payload = verifyToken(authHeader.slice(7));
  if (!payload) return res.status(401).json({ error: 'Token inválido ou expirado' });
  req.user = payload;
  next();
}

// Middleware to check role
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sem permissão para esta ação' });
    }
    next();
  };
}

// ─── POST /auth/login ─────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Email ou senha incorretos' });

    const user = result.rows[0];
    if (!user.ativo) return res.status(403).json({ error: 'Usuário desativado' });
    if (!verifyPassword(password, user.password_hash)) return res.status(401).json({ error: 'Email ou senha incorretos' });

    const token = createToken({ id: user.id, email: user.email, nome: user.nome, role: user.role });
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /auth/me ──────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email, role, ativo, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /auth/users ─────────────────────────────────
router.get('/users', authMiddleware, requireRole('administrador', 'supervisor'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email, role, ativo, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /auth/users ────────────────────────────────
router.post('/users', authMiddleware, requireRole('administrador'), async (req, res) => {
  try {
    const { nome, email, password, role } = req.body;
    if (!nome || !email || !password || !role) return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    if (!['atendente', 'supervisor', 'administrador'].includes(role)) return res.status(400).json({ error: 'Perfil inválido' });

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (exists.rows.length > 0) return res.status(409).json({ error: 'Email já cadastrado' });

    const hash = hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users (nome, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, role, ativo, created_at',
      [nome.trim(), email.toLowerCase().trim(), hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /auth/users/:id ─────────────────────────────
router.put('/users/:id', authMiddleware, requireRole('administrador'), async (req, res) => {
  try {
    const { nome, email, role, ativo, password } = req.body;
    const fields = [];
    const values = [];
    let i = 1;

    if (nome) { fields.push(`nome = $${i++}`); values.push(nome.trim()); }
    if (email) { fields.push(`email = $${i++}`); values.push(email.toLowerCase().trim()); }
    if (role && ['atendente', 'supervisor', 'administrador'].includes(role)) { fields.push(`role = $${i++}`); values.push(role); }
    if (typeof ativo === 'boolean') { fields.push(`ativo = $${i++}`); values.push(ativo); }
    if (password) { fields.push(`password_hash = $${i++}`); values.push(hashPassword(password)); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, nome, email, role, ativo, created_at`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /auth/users/:id ──────────────────────────
router.delete('/users/:id', authMiddleware, requireRole('administrador'), async (req, res) => {
  try {
    // Prevent deleting self
    if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário' });
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
module.exports.requireRole = requireRole;
module.exports.hashPassword = hashPassword;
