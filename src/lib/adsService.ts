// Ads integration service — communicates with the Node.js backend
// The backend proxies calls to Meta, Google, and TikTok APIs using stored tokens.

import { api } from './apiClient';
import type { AdsPlatform, AdsCanalResumo, AdsDiario, CampanhaAds } from '@/data/mockAds';

// ─── Types ───────────────────────────────────────────────────────

export interface AdsAccountInfo {
  platform: AdsPlatform;
  accountId: string;
  accountName: string;
  currency: string;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
}

export interface AdsSyncStatus {
  platform: AdsPlatform;
  connected: boolean;
  lastSync: string | null;
  error: string | null;
}

export interface AdsDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;
}

export interface AdsOverviewResponse {
  channels: AdsCanalResumo[];
  dailyLeads: AdsDiario[];
  dailySpend: AdsDiario[];
  campaigns: CampanhaAds[];
  syncStatus: AdsSyncStatus[];
}

// ─── Meta Ads Config ─────────────────────────────────────────────

export interface MetaAdsConfig {
  accessToken: string;
  adAccountId: string;    // act_XXXXXXXXX
  pixelId?: string;
  pageId?: string;
  appId?: string;
  appSecret?: string;
}

// ─── Google Ads Config ───────────────────────────────────────────

export interface GoogleAdsConfig {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;      // XXX-XXX-XXXX (without dashes in API)
  managerAccountId?: string;
  conversionActionId?: string;
}

// ─── TikTok Ads Config ──────────────────────────────────────────

export interface TikTokAdsConfig {
  accessToken: string;
  advertiserId: string;
  appId?: string;
  appSecret?: string;
  pixelId?: string;
}

// ─── WhatsApp Config ─────────────────────────────────────────────

export interface WhatsAppConfig {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken?: string;
}

// ─── Google Analytics Config ─────────────────────────────────────

export interface GoogleAnalyticsConfig {
  measurementId: string;     // G-XXXXXXXXXX
  propertyId?: string;
  serviceAccountKey?: string; // JSON string for server-side
}

// ─── API Endpoints ───────────────────────────────────────────────

// Test connection for a specific platform
export async function testAdsConnection(platform: AdsPlatform) {
  return api.post<{ connected: boolean; account?: AdsAccountInfo }>(
    `/ads/${platform}/test`
  );
}

// Save platform-specific credentials
export async function saveAdsConfig(platform: AdsPlatform, config: Record<string, string>) {
  return api.post(`/ads/${platform}/config`, config);
}

// Get sync status for all platforms
export async function getAdsSyncStatus() {
  return api.get<AdsSyncStatus[]>('/ads/status');
}

// Trigger manual sync for a platform
export async function triggerAdsSync(platform: AdsPlatform) {
  return api.post<{ synced: boolean }>(`/ads/${platform}/sync`);
}

// Get ads overview data (all platforms combined)
export async function getAdsOverview(dateRange?: AdsDateRange) {
  const params = dateRange
    ? `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
    : '';
  return api.get<AdsOverviewResponse>(`/ads/overview${params}`);
}

// Get campaigns for a specific platform
export async function getCampaigns(platform?: AdsPlatform, dateRange?: AdsDateRange) {
  const params = new URLSearchParams();
  if (platform) params.set('platform', platform);
  if (dateRange) {
    params.set('startDate', dateRange.startDate);
    params.set('endDate', dateRange.endDate);
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return api.get<CampanhaAds[]>(`/ads/campaigns${query}`);
}

// Get daily metrics
export async function getDailyMetrics(metric: 'leads' | 'spend', dateRange?: AdsDateRange) {
  const params = dateRange
    ? `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
    : '';
  return api.get<AdsDiario[]>(`/ads/daily/${metric}${params}`);
}

// ─── WhatsApp ────────────────────────────────────────────────────

export async function testWhatsAppConnection() {
  return api.post<{ connected: boolean }>('/whatsapp/test');
}

export async function saveWhatsAppConfig(config: WhatsAppConfig) {
  return api.post('/whatsapp/config', config);
}

export async function sendWhatsAppMessage(to: string, message: string) {
  return api.post<{ sent: boolean; messageId: string }>('/whatsapp/send', { to, message });
}

// ─── Google Analytics ────────────────────────────────────────────

export async function testGAConnection() {
  return api.post<{ connected: boolean }>('/analytics/test');
}

export async function saveGAConfig(config: GoogleAnalyticsConfig) {
  return api.post('/analytics/config', config);
}
