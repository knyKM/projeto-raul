/**
 * License key generation & validation using HMAC-SHA256
 * 
 * Key format: TIER-XXXXXXXX-HMAC
 * Example:    PRO-A3F8B2C1-7d2f9a
 *             PROPLUS-K9D4E7F2-3b8c1e
 * 
 * Usage:
 *   node license.js generate pro
 *   node license.js generate proplus
 *   node license.js validate PRO-A3F8B2C1-7d2f9a
 */

const crypto = require('crypto');

// This MUST match LICENSE_SECRET in .env
const SECRET = process.env.LICENSE_SECRET || 'sistemaleads-license-secret-change-me';

const TIERS = ['pro', 'proplus'];

function generateRandomPart() {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars
}

function computeHmac(payload) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 12);
}

/**
 * Generate a license key for a given tier
 * @param {'pro' | 'proplus'} tier
 * @returns {string} License key
 */
function generateLicenseKey(tier) {
  if (!TIERS.includes(tier)) throw new Error(`Invalid tier: ${tier}. Use: ${TIERS.join(', ')}`);

  const prefix = tier === 'proplus' ? 'PROPLUS' : 'PRO';
  const random = generateRandomPart();
  const payload = `${prefix}-${random}`;
  const hmac = computeHmac(payload);

  return `${payload}-${hmac}`;
}

/**
 * Validate a license key and return its tier
 * @param {string} key
 * @returns {{ valid: boolean, tier: string }}
 */
function validateLicenseKey(key) {
  if (!key || typeof key !== 'string') return { valid: false, tier: 'free' };

  const parts = key.split('-');
  // PRO-XXXXXXXX-hmac = 3 parts
  // PROPLUS-XXXXXXXX-hmac = 3 parts
  if (parts.length !== 3) return { valid: false, tier: 'free' };

  const [prefix, random, providedHmac] = parts;

  if (!['PRO', 'PROPLUS'].includes(prefix)) return { valid: false, tier: 'free' };
  if (random.length !== 8) return { valid: false, tier: 'free' };

  const payload = `${prefix}-${random}`;
  const expectedHmac = computeHmac(payload);

  if (providedHmac !== expectedHmac) return { valid: false, tier: 'free' };

  return {
    valid: true,
    tier: prefix === 'PROPLUS' ? 'proplus' : 'pro',
  };
}

module.exports = { generateLicenseKey, validateLicenseKey };

// ─── CLI ─────────────────────────────────────────────
if (require.main === module) {
  const [,, command, arg] = process.argv;

  if (command === 'generate') {
    if (!arg || !TIERS.includes(arg)) {
      console.log('Usage: node license.js generate <pro|proplus>');
      process.exit(1);
    }
    const key = generateLicenseKey(arg);
    console.log(`\n🔑 License key (${arg.toUpperCase()}):\n\n   ${key}\n`);
  } else if (command === 'validate') {
    if (!arg) {
      console.log('Usage: node license.js validate <KEY>');
      process.exit(1);
    }
    const result = validateLicenseKey(arg);
    console.log(`\n${result.valid ? '✅' : '❌'} Key: ${arg}`);
    console.log(`   Valid: ${result.valid}`);
    console.log(`   Tier: ${result.tier}\n`);
  } else if (command === 'batch') {
    const count = parseInt(arg) || 5;
    console.log(`\n🔑 Generating ${count} keys for each tier:\n`);
    for (const tier of TIERS) {
      console.log(`── ${tier.toUpperCase()} ──`);
      for (let i = 0; i < count; i++) {
        console.log(`   ${generateLicenseKey(tier)}`);
      }
      console.log('');
    }
  } else {
    console.log('sistemaLeads License Manager\n');
    console.log('Commands:');
    console.log('  node license.js generate <pro|proplus>   Generate a single key');
    console.log('  node license.js validate <KEY>           Validate a key');
    console.log('  node license.js batch [count]            Generate multiple keys');
  }
}
