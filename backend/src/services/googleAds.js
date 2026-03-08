/**
 * Google Ads Service
 * Uses the Google Ads API v16
 * Docs: https://developers.google.com/google-ads/api/docs/start
 */
const { GoogleAdsApi } = require('google-ads-api');

class GoogleAdsService {
  constructor() {
    this.client = null;
    this.customer = null;
  }

  init() {
    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;

    if (!devToken || !clientId || !clientSecret || !refreshToken || !customerId) return false;

    this.client = new GoogleAdsApi({
      client_id: clientId,
      client_secret: clientSecret,
      developer_token: devToken,
    });

    this.customer = this.client.Customer({
      customer_id: customerId.replace(/-/g, ''),
      refresh_token: refreshToken,
      login_customer_id: process.env.GOOGLE_ADS_MANAGER_ID?.replace(/-/g, ''),
    });

    return true;
  }

  async testConnection() {
    if (!this.init()) throw new Error('Google Ads credentials not configured');

    const [account] = await this.customer.query(`
      SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.status
      FROM customer
      LIMIT 1
    `);

    return {
      platform: 'google',
      accountId: account.customer.id,
      accountName: account.customer.descriptive_name,
      currency: account.customer.currency_code,
      status: account.customer.status === 2 ? 'active' : 'inactive', // ENABLED = 2
    };
  }

  async getCampaigns(startDate, endDate) {
    if (!this.init()) throw new Error('Google Ads not configured');

    const campaigns = await this.customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.ctr,
        metrics.conversions,
        metrics.conversions_value
      FROM campaign
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND campaign.status != 'REMOVED'
      ORDER BY metrics.cost_micros DESC
    `);

    return campaigns.map(row => {
      const spend = (row.metrics.cost_micros || 0) / 1_000_000;
      const leads = Math.round(row.metrics.conversions || 0);
      return {
        id: `google_${row.campaign.id}`,
        external_id: String(row.campaign.id),
        nome: row.campaign.name,
        platform: 'google',
        status: row.campaign.status === 2 ? 'ativa' : row.campaign.status === 3 ? 'pausada' : 'encerrada',
        gasto: spend,
        leads,
        cpl: leads > 0 ? spend / leads : 0,
        impressoes: row.metrics.impressions || 0,
        cliques: row.metrics.clicks || 0,
        ctr: (row.metrics.ctr || 0) * 100,
        receita: row.metrics.conversions_value || 0,
      };
    });
  }

  async getDailyMetrics(startDate, endDate) {
    if (!this.init()) throw new Error('Google Ads not configured');

    const rows = await this.customer.query(`
      SELECT
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM customer
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    `);

    return rows.map(row => ({
      platform: 'google',
      metric_date: row.segments.date,
      leads: Math.round(row.metrics.conversions || 0),
      spend: (row.metrics.cost_micros || 0) / 1_000_000,
      impressions: row.metrics.impressions || 0,
      clicks: row.metrics.clicks || 0,
    }));
  }
}

module.exports = new GoogleAdsService();
