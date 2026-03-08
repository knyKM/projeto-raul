/**
 * Meta (Facebook) Ads Service
 * Uses the Marketing API v20.0
 * Docs: https://developers.facebook.com/docs/marketing-apis
 */
const bizSdk = require('facebook-nodejs-business-sdk');

class MetaAdsService {
  constructor() {
    this.api = null;
    this.adAccount = null;
  }

  init() {
    const token = process.env.META_ACCESS_TOKEN;
    const accountId = process.env.META_AD_ACCOUNT_ID;
    if (!token || !accountId) return false;

    bizSdk.FacebookAdsApi.init(token);
    this.api = bizSdk.FacebookAdsApi.getDefaultApi();
    this.adAccount = new bizSdk.AdAccount(`act_${accountId.replace('act_', '')}`);
    return true;
  }

  async testConnection() {
    if (!this.init()) throw new Error('Meta Ads credentials not configured');
    const account = await this.adAccount.read([
      bizSdk.AdAccount.Fields.name,
      bizSdk.AdAccount.Fields.account_status,
      bizSdk.AdAccount.Fields.currency,
    ]);
    return {
      platform: 'meta',
      accountId: account.id,
      accountName: account.name,
      currency: account.currency,
      status: account.account_status === 1 ? 'active' : 'inactive',
    };
  }

  async getCampaigns(startDate, endDate) {
    if (!this.init()) throw new Error('Meta Ads not configured');

    const campaigns = await this.adAccount.getCampaigns(
      [bizSdk.Campaign.Fields.id, bizSdk.Campaign.Fields.name, bizSdk.Campaign.Fields.status],
      { limit: 100 }
    );

    const results = [];

    for (const campaign of campaigns) {
      const insights = await campaign.getInsights(
        ['impressions', 'clicks', 'spend', 'actions', 'action_values', 'ctr'],
        {
          time_range: { since: startDate, until: endDate },
          time_increment: 'all_days',
        }
      );

      const data = insights[0] || {};
      const leads = (data.actions || []).find(a => a.action_type === 'lead')?.value || 0;
      const revenue = (data.action_values || []).find(a => a.action_type === 'offsite_conversion.fb_pixel_purchase')?.value || 0;
      const spend = parseFloat(data.spend || 0);

      results.push({
        id: `meta_${campaign.id}`,
        external_id: campaign.id,
        nome: campaign.name,
        platform: 'meta',
        status: campaign.status === 'ACTIVE' ? 'ativa' : campaign.status === 'PAUSED' ? 'pausada' : 'encerrada',
        gasto: spend,
        leads: parseInt(leads),
        cpl: parseInt(leads) > 0 ? spend / parseInt(leads) : 0,
        impressoes: parseInt(data.impressions || 0),
        cliques: parseInt(data.clicks || 0),
        ctr: parseFloat(data.ctr || 0),
        receita: parseFloat(revenue),
      });
    }

    return results;
  }

  async getDailyMetrics(startDate, endDate) {
    if (!this.init()) throw new Error('Meta Ads not configured');

    const insights = await this.adAccount.getInsights(
      ['impressions', 'clicks', 'spend', 'actions'],
      {
        time_range: { since: startDate, until: endDate },
        time_increment: 1, // daily
      }
    );

    return insights.map(day => {
      const leads = (day.actions || []).find(a => a.action_type === 'lead')?.value || 0;
      return {
        platform: 'meta',
        metric_date: day.date_start,
        leads: parseInt(leads),
        spend: parseFloat(day.spend || 0),
        impressions: parseInt(day.impressions || 0),
        clicks: parseInt(day.clicks || 0),
      };
    });
  }
}

module.exports = new MetaAdsService();
