// Configuration store using localStorage
export type LicenseTier = 'free' | 'pro' | 'proplus';

export interface AppConfig {
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

  // Integrations
  metaAdsToken: string;
  googleAdsToken: string;
  tiktokAdsToken: string;
  googleAnalyticsId: string;

  // WhatsApp
  whatsappNumber: string;
  whatsappApiToken: string;

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
  googleAdsToken: '',
  tiktokAdsToken: '',
  googleAnalyticsId: '',
  whatsappNumber: '',
  whatsappApiToken: '',
  companyName: '',
  companyLogoUrl: '',
  companyPrimaryColor: '#C4A44A',
  notificationEmail: '',
  notifyNewLeads: true,
  notifyDailyReport: false,
  setupCompleted: false,
};

const STORAGE_KEY = 'mogibens_config';

export function getConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: Partial<AppConfig>): AppConfig {
  const current = getConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
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
