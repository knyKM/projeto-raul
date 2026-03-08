// Feature access control based on license tier
// This is the SINGLE SOURCE OF TRUTH for what each tier can access.
// The API backend should also enforce these rules server-side.

import { LicenseTier, getConfig } from './configStore';

export type Feature =
  | 'dashboard_basic'
  | 'leads_basic'
  | 'leads_unlimited'
  | 'leads_export_mailing'
  | 'ads_central'
  | 'landing_pages_single'
  | 'landing_pages_unlimited'
  | 'geo'
  | 'whatsapp'
  | 'notifications_email'
  | 'customization'
  | 'reports_advanced'
  | 'atendentes'
  | 'api_crm'
  | 'webhooks'
  | 'white_label'
  | 'multi_users'
  | 'reports_scheduled'
  | 'audit_log'
  | 'settings';

// Which features each tier has access to
const TIER_ACCESS: Record<LicenseTier, Feature[]> = {
  free: [
    'dashboard_basic',
    'leads_basic',
    'landing_pages_single',
    'settings',
  ],
  pro: [
    'dashboard_basic',
    'leads_basic',
    'leads_unlimited',
    'leads_export_mailing',
    'ads_central',
    'landing_pages_single',
    'landing_pages_unlimited',
    'geo',
    'whatsapp',
    'notifications_email',
    'customization',
    'reports_advanced',
    'atendentes',
    'settings',
  ],
  proplus: [
    'dashboard_basic',
    'leads_basic',
    'leads_unlimited',
    'leads_export_mailing',
    'ads_central',
    'landing_pages_single',
    'landing_pages_unlimited',
    'geo',
    'whatsapp',
    'notifications_email',
    'customization',
    'reports_advanced',
    'atendentes',
    'api_crm',
    'webhooks',
    'white_label',
    'multi_users',
    'reports_scheduled',
    'audit_log',
    'settings',
  ],
};

// Human-readable feature names
export const FEATURE_LABELS: Record<Feature, string> = {
  dashboard_basic: 'Dashboard Básico',
  leads_basic: 'Gestão de Leads (50/mês)',
  leads_unlimited: 'Leads Ilimitados',
  leads_export_mailing: 'Exportar Mailing',
  ads_central: 'Central de Ads',
  landing_pages_single: '1 Landing Page',
  landing_pages_unlimited: 'Landing Pages Ilimitadas',
  geo: 'Geolocalização',
  whatsapp: 'Integração WhatsApp',
  notifications_email: 'Notificações por E-mail',
  customization: 'Personalização de Marca',
  reports_advanced: 'Relatórios Avançados',
  atendentes: 'Gestão de Atendentes',
  api_crm: 'API para CRM/ERP',
  webhooks: 'Webhooks Customizados',
  white_label: 'White-label',
  multi_users: 'Multi-usuários',
  reports_scheduled: 'Relatórios Agendados',
  audit_log: 'Auditoria de Ações',
  settings: 'Configurações',
};

// Minimum tier required for each feature
export const FEATURE_MIN_TIER: Record<Feature, LicenseTier> = {
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

const TIER_RANK: Record<LicenseTier, number> = { free: 0, pro: 1, proplus: 2 };

export function hasFeature(feature: Feature, tier?: LicenseTier): boolean {
  const currentTier = tier ?? getConfig().licenseTier;
  return TIER_ACCESS[currentTier]?.includes(feature) ?? false;
}

export function getRequiredTier(feature: Feature): LicenseTier {
  return FEATURE_MIN_TIER[feature];
}

export function getRequiredTierLabel(feature: Feature): string {
  const tier = FEATURE_MIN_TIER[feature];
  const labels: Record<LicenseTier, string> = { free: 'Free', pro: 'Pro', proplus: 'Pro+' };
  return labels[tier];
}

export function getCurrentTier(): LicenseTier {
  return getConfig().licenseTier;
}

// Landing page limit check
export function canCreateLandingPage(currentCount: number): boolean {
  const tier = getCurrentTier();
  if (tier === 'free') return currentCount < 1;
  return true; // pro and proplus = unlimited
}

// Lead limit check (per month)
export function getLeadLimit(): number | null {
  const tier = getCurrentTier();
  if (tier === 'free') return 50;
  return null; // unlimited
}
