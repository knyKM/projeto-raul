/**
 * TikTok Ads Service
 * Uses TikTok Marketing API v1.3
 * Docs: https://business-api.tiktok.com/portal/docs
 */
const axios = require('axios');

const BASE_URL = 'https://business-api.tiktok.com/open_api/v1.3';

class TikTokAdsService {
  constructor() {
    this.token = null;
    this.advertiserId = null;
  }

  init() {
    this.token = process.env.TIKTOK_ACCESS_TOKEN;
    this.advertiserId = process.env.TIKTOK_ADVERTISER_ID;
    return !!(this.token && this.advertiserId);
  }

  _headers() {
    return {
      'Access-Token': this.token,
      'Content-Type': 'application/json',
    };
  }

  async _get(endpoint, params = {}) {
    const { data } = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: this._headers(),
      params: { advertiser_id: this.advertiserId, ...params },
    });
    if (data.code !== 0) throw new Error(data.message || 'TikTok API error');
    return data.data;
  }

  async _post(endpoint, body = {}) {
    const { data } = await axios.post(`${BASE_URL}${endpoint}`, {
      advertiser_id: this.advertiserId,
      ...body,
    }, { headers: this._headers() });
    if (data.code !== 0) throw new Error(data.message || 'TikTok API error');
    return data.data;
  }

  async testConnection() {
    if (!this.init()) throw new Error('TikTok Ads credentials not configured');

    const result = await this._get('/advertiser/info/', {
      advertiser_ids: JSON.stringify([this.advertiserId]),
      fields: JSON.stringify(['name', 'status', 'currency']),
    });

    const info = result.list?.[0] || {};
    return {
      platform: 'tiktok',
      accountId: this.advertiserId,
      accountName: info.name || 'TikTok Account',
      currency: info.currency || 'BRL',
      status: info.status === 'STATUS_ENABLE' ? 'active' : 'inactive',
    };
  }

  async getCampaigns(startDate, endDate) {
    if (!this.init()) throw new Error('TikTok Ads not configured');

    // 1. List campaigns
    const campaignData = await this._get('/campaign/get/', {
      page_size: 100,
      fields: JSON.stringify(['campaign_id', 'campaign_name', 'status']),
    });
    const campaigns = campaignData.list || [];

    // 2. Get metrics via reporting
    const reportData = await this._post('/report/integrated/get/', {
      report_type: 'BASIC',
      dimensions: JSON.stringify(['campaign_id']),
      metrics: JSON.stringify(['spend', 'impressions', 'clicks', 'ctr', 'conversion', 'complete_payment']),
      data_level: 'AUCTION_CAMPAIGN',
      start_date: startDate,
      end_date: endDate,
      page_size: 100,
    });
    const metrics = reportData.list || [];

    const metricsMap = {};
    metrics.forEach(m => {
      metricsMap[m.dimensions.campaign_id] = m.metrics;
    });

    return campaigns.map(c => {
      const m = metricsMap[c.campaign_id] || {};
      const spend = parseFloat(m.spend || 0);
      const leads = parseInt(m.conversion || 0);
      return {
        id: `tiktok_${c.campaign_id}`,
        external_id: c.campaign_id,
        nome: c.campaign_name,
        platform: 'tiktok',
        status: c.status === 'CAMPAIGN_STATUS_ENABLE' ? 'ativa'
              : c.status === 'CAMPAIGN_STATUS_DISABLE' ? 'pausada'
              : 'encerrada',
        gasto: spend,
        leads,
        cpl: leads > 0 ? spend / leads : 0,
        impressoes: parseInt(m.impressions || 0),
        cliques: parseInt(m.clicks || 0),
        ctr: parseFloat(m.ctr || 0) * 100,
        receita: parseFloat(m.complete_payment || 0),
      };
    });
  }

  async getDailyMetrics(startDate, endDate) {
    if (!this.init()) throw new Error('TikTok Ads not configured');

    const reportData = await this._post('/report/integrated/get/', {
      report_type: 'BASIC',
      dimensions: JSON.stringify(['stat_time_day']),
      metrics: JSON.stringify(['spend', 'impressions', 'clicks', 'conversion']),
      data_level: 'AUCTION_ADVERTISER',
      start_date: startDate,
      end_date: endDate,
      page_size: 100,
    });

    return (reportData.list || []).map(row => ({
      platform: 'tiktok',
      metric_date: row.dimensions.stat_time_day,
      leads: parseInt(row.metrics.conversion || 0),
      spend: parseFloat(row.metrics.spend || 0),
      impressions: parseInt(row.metrics.impressions || 0),
      clicks: parseInt(row.metrics.clicks || 0),
    }));
  }
}

module.exports = new TikTokAdsService();
