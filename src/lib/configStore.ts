// Configuration store — uses localStorage as local cache + syncs with API when available
import { getApiUrl, saveConfigToApi, loadConfigFromApi } from './apiClient';

export type LicenseTier = 'free' | 'pro' | 'proplus';

export interface AppConfig {
  // API
  apiUrl: string;

  // License
  licenseKey: string;
  licenseTier: LicenseTier;
  licenseActivated: boolean;

  // Database
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbSslEnabled: boolean;

  // Meta Ads
  metaAdsToken: string;
  metaAdAccountId: string;
  metaPixelId: string;
  metaPageId: string;
  metaAppId: string;
  metaAppSecret: string;

  // Google Ads
  googleAdsDevToken: string;
  googleAdsClientId: string;
  googleAdsClientSecret: string;
  googleAdsRefreshToken: string;
  googleAdsCustomerId: string;
  googleAdsManagerId: string;

  // TikTok Ads
  tiktokAdsToken: string;
  tiktokAdvertiserId: string;
  tiktokAppId: string;
  tiktokAppSecret: string;
  tiktokPixelId: string;

  // Google Analytics
  googleAnalyticsMeasurementId: string;
  googleAnalyticsPropertyId: string;

  // WhatsApp Business
  whatsappPhoneNumberId: string;
  whatsappBusinessAccountId: string;
  whatsappAccessToken: string;
  whatsappWebhookVerifyToken: string;

  // Company
  companyName: string;
  companyLogoUrl: string;
  companyPrimaryColor: string;

  // Notifications
  notificationEmail: string;
  notifyNewLeads: boolean;
  notifyDailyReport: boolean;

  // Setup
  setupCompleted: boolean;
}

const DEFAULT_CONFIG: AppConfig = {
  apiUrl: '',
  licenseKey: '',
  licenseTier: 'free',
  licenseActivated: false,
  dbHost: '',
  dbPort: '5432',
  dbName: '',
  dbUser: '',
  dbPassword: '',
  dbSslEnabled: true,
  metaAdsToken: '',
  metaAdAccountId: '',
  metaPixelId: '',
  metaPageId: '',
  metaAppId: '',
  metaAppSecret: '',
  googleAdsDevToken: '',
  googleAdsClientId: '',
  googleAdsClientSecret: '',
  googleAdsRefreshToken: '',
  googleAdsCustomerId: '',
  googleAdsManagerId: '',
  tiktokAdsToken: '',
  tiktokAdvertiserId: '',
  tiktokAppId: '',
  tiktokAppSecret: '',
  tiktokPixelId: '',
  googleAnalyticsMeasurementId: '',
  googleAnalyticsPropertyId: '',
  whatsappPhoneNumberId: '',
  whatsappBusinessAccountId: '',
  whatsappAccessToken: '',
  whatsappWebhookVerifyToken: '',
  companyName: '',
  companyLogoUrl: '',
  companyPrimaryColor: '#C4A44A',
  notificationEmail: '',
  notifyNewLeads: true,
  notifyDailyReport: false,
  setupCompleted: false,
};

const STORAGE_KEY = 'mogibens_config';

// Local read (always available, instant)
export function getConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

// Save locally + sync to API if connected
export function saveConfig(config: Partial<AppConfig>): AppConfig {
  const current = getConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Fire-and-forget sync to API
  if (getApiUrl()) {
    saveConfigToApi(updated).catch(() => {
      // silently fail — localStorage is the fallback
    });
  }

  return updated;
}

// Load from API and merge into localStorage (local values take priority for critical fields)
export async function syncConfigFromApi(): Promise<AppConfig> {
  const apiUrl = getApiUrl();
  if (!apiUrl) return getConfig();

  const local = getConfig();
  const res = await loadConfigFromApi();
  if (res.ok && res.data) {
    // Merge: API data fills gaps, but local critical fields are preserved
    const apiData = res.data as Record<string, unknown>;
    const apiTier = apiData.licenseTier as LicenseTier;
    const TIER_RANK: Record<LicenseTier, number> = { free: 0, pro: 1, proplus: 2 };
    
    // Use the higher tier between local and API
    const localRank = TIER_RANK[local.licenseTier] || 0;
    const apiRank = TIER_RANK[apiTier] || 0;
    const bestTier = apiRank > localRank ? apiTier : local.licenseTier;
    
    const merged = {
      ...DEFAULT_CONFIG,
      ...res.data,
      // Always preserve local setup/license state to avoid reset loops
      setupCompleted: local.setupCompleted || apiData.setupCompleted === true,
      licenseActivated: local.licenseActivated || apiData.licenseActivated === true,
      licenseTier: bestTier,
      licenseKey: local.licenseKey || (apiData.licenseKey as string) || '',
    } as AppConfig;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }
  return local;
}

export function resetConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export const TIER_FEATURES: Record<LicenseTier, {
  name: string;
  price: string;
  description: string;
  features: string[];
  limitations: string[];
  highlight?: boolean;
}> = {
  free: {
    name: 'Free',
    price: 'Grátis',
    description: 'Ideal para testar a plataforma com funcionalidades básicas.',
    features: [
      '1 Landing Page ativa',
      'Dashboard básico com métricas',
      'Até 50 leads/mês',
      'Relatórios simplificados',
    ],
    limitations: [
      'Sem integração WhatsApp',
      'Sem integração Meta/Google/TikTok Ads',
      'Sem notificações por e-mail',
      'Sem personalização de marca',
      'Sem geolocalização',
    ],
  },
  pro: {
    name: 'Pro',
    price: 'R$ 197/mês',
    description: 'Tudo que você precisa para escalar suas vendas.',
    highlight: true,
    features: [
      'Landing Pages ilimitadas',
      'Dashboard completo com todas as métricas',
      'Leads ilimitados',
      'Integração WhatsApp (envio automático)',
      'Integração Meta Ads, Google Ads, TikTok Ads',
      'Google Analytics integrado',
      'Notificações por e-mail',
      'Personalização de marca (logo, cores)',
      'Geolocalização de leads',
      'Relatórios avançados com exportação',
      'Suporte prioritário por e-mail',
    ],
    limitations: [],
  },
  proplus: {
    name: 'Pro+',
    price: 'R$ 397/mês',
    description: 'Para operações avançadas que exigem máximo desempenho.',
    features: [
      'Tudo do plano Pro',
      'API própria para integração com CRM/ERP',
      'Webhooks customizados para automações',
      'White-label completo (sem marca Mogibens)',
      'Multi-usuários com controle de permissões',
      'Dashboard personalizado por perfil',
      'Relatórios automatizados agendados (PDF)',
      'Auditoria de ações (log de atividades)',
      'Onboarding dedicado + suporte via WhatsApp',
      'SLA de uptime 99.9%',
      'Prioridade em novas features',
    ],
    limitations: [],
  },
};
