/**
 * License tier validation middleware
 * 
 * Reads the license key from the `config` table, validates it via HMAC,
 * and compares the resulting tier against the minimum required tier.
 * 
 * This ensures the backend NEVER relies on the frontend for access control.
 */

const { pool } = require('../db');
const { validateLicenseKey } = require('../license');

const TIER_RANK = { free: 0, pro: 1, proplus: 2 };

// Feature → minimum tier (mirrors frontend featureAccess.ts)
const FEATURE_MIN_TIER = {
  dashboard_basic: 'free',
  leads_basic: 'free',
  leads_unlimited: 'pro',
  leads_export_mailing: 'pro',
  ads_central: 'pro',
  landing_pages_single: 'free',
  landing_pages_unlimited: 'pro',
  geo: 'pro',
  whatsapp: 'pro',
  notifications_email: 'pro',
  customization: 'pro',
  reports_advanced: 'pro',
  atendentes: 'pro',
  api_crm: 'proplus',
  webhooks: 'proplus',
  white_label: 'proplus',
  multi_users: 'proplus',
  reports_scheduled: 'proplus',
  audit_log: 'proplus',
  settings: 'free',
};

// Cache to avoid querying the DB on every single request
let cachedTier = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

async function resolveCurrentTier() {
  const now = Date.now();
  if (cachedTier && now - cachedAt < CACHE_TTL_MS) return cachedTier;

  try {
    const { rows } = await pool.query("SELECT value FROM config WHERE key = 'licenseKey'");
    if (rows.length === 0) { cachedTier = 'free'; cachedAt = now; return 'free'; }

    const raw = rows[0].value;
    // The value is stored JSON-encoded (e.g. "\"PRO-XXXX-hmac\"")
    const key = typeof raw === 'string' ? raw.replace(/^"|"$/g, '') : raw;
    const result = validateLicenseKey(key);

    cachedTier = result.valid ? result.tier : 'free';
    cachedAt = now;
    return cachedTier;
  } catch (err) {
    console.error('[LicenseTier] Error resolving tier:', err.message);
    return cachedTier || 'free';
  }
}

/**
 * Express middleware factory.
 * 
 * @param {string} feature - Feature key (must exist in FEATURE_MIN_TIER)
 * @returns {Function} Express middleware
 * 
 * Usage:
 *   router.get('/', requireTier('ads_central'), handler);
 */
function requireTier(feature) {
  const minTier = FEATURE_MIN_TIER[feature];
  if (!minTier) {
    console.warn(`[LicenseTier] Unknown feature "${feature}", defaulting to free`);
  }

  return async (req, res, next) => {
    try {
      const currentTier = await resolveCurrentTier();
      const requiredRank = TIER_RANK[minTier || 'free'] || 0;
      const currentRank = TIER_RANK[currentTier] || 0;

      if (currentRank >= requiredRank) {
        req.licenseTier = currentTier;
        return next();
      }

      const tierLabels = { free: 'Free', pro: 'Pro', proplus: 'Pro+' };
      return res.status(403).json({
        error: `Recurso bloqueado. Plano necessário: ${tierLabels[minTier] || minTier}`,
        requiredTier: minTier,
        currentTier,
      });
    } catch (err) {
      console.error('[LicenseTier] Middleware error:', err.message);
      return res.status(500).json({ error: 'Erro ao verificar licença' });
    }
  };
}

/**
 * Invalidate the cached tier (call after license key changes)
 */
function invalidateTierCache() {
  cachedTier = null;
  cachedAt = 0;
}

module.exports = { requireTier, resolveCurrentTier, invalidateTierCache, FEATURE_MIN_TIER };
