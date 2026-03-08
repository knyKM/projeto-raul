/**
 * Cron job — syncs ads data from all platforms every 6 hours
 * Usage: require this file from index.js to activate
 */
const cron = require('node-cron');
const axios = require('axios');

const API_BASE = `http://localhost:${process.env.PORT || 3001}`;

function startAdsSyncCron() {
  // Run every 6 hours: 0 */6 * * *
  cron.schedule('0 */6 * * *', async () => {
    console.log('[CRON] Starting ads sync...');
    const platforms = ['meta', 'google', 'tiktok'];

    for (const platform of platforms) {
      try {
        const { data } = await axios.post(`${API_BASE}/ads/${platform}/sync`);
        console.log(`[CRON] ${platform}: ${data.synced ? '✅' : '❌'} ${data.campaigns || 0} campaigns`);
      } catch (err) {
        console.error(`[CRON] ${platform} sync failed:`, err.message);
      }
    }
  });

  console.log('⏰ Ads sync cron scheduled (every 6 hours)');
}

module.exports = { startAdsSyncCron };
