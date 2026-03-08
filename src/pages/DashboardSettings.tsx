import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Key, Globe, Building2, Bell, Save, Crown, Star, Zap, Lock, Server, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { getConfig, saveConfig, syncConfigFromApi, AppConfig, TIER_FEATURES, LicenseTier } from "@/lib/configStore";
import { getApiUrl, setApiUrl, testApiConnection, testDbConnection } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

const tierIcons: Record<LicenseTier, typeof Star> = { free: Star, pro: Crown, proplus: Zap };

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

const StatusIcon = ({ status, error }: { status: TestStatus; error: string }) => {
  if (status === 'idle') return null;
  return (
    <div className="flex items-center gap-2 mt-2">
      {status === 'testing' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      {status === 'testing' && <span className="text-xs text-muted-foreground font-body">Testando...</span>}
      {status === 'success' && <CheckCircle2 className="w-4 h-4 text-secondary" />}
      {status === 'success' && <span className="text-xs text-secondary font-body">Conectado!</span>}
      {status === 'error' && <XCircle className="w-4 h-4 text-destructive" />}
      {status === 'error' && <span className="text-xs text-destructive font-body">{error}</span>}
    </div>
  );
};

const DashboardSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AppConfig>(getConfig());
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<TestStatus>('idle');
  const [apiError, setApiError] = useState('');
  const [dbStatus, setDbStatus] = useState<TestStatus>('idle');
  const [dbError, setDbError] = useState('');
  const isPro = config.licenseTier !== "free";

  // Try to sync from API on mount
  useEffect(() => {
    syncConfigFromApi().then((synced) => setConfig(synced)).catch(() => {});
  }, []);

  const update = (partial: Partial<AppConfig>) => setConfig((c) => ({ ...c, ...partial }));

  const handleSave = async () => {
    setLoading(true);
    // Update apiUrl in the client
    if (config.apiUrl) {
      setApiUrl(config.apiUrl);
    }
    saveConfig(config);
    setLoading(false);
    toast({ title: "Configurações salvas", description: "Salvo localmente e sincronizado com a API (se disponível)." });
  };

  const handleTestApi = async () => {
    setApiStatus('testing');
    setApiError('');
    if (config.apiUrl) setApiUrl(config.apiUrl);
    const res = await testApiConnection();
    if (res.ok) {
      setApiStatus('success');
    } else {
      setApiStatus('error');
      setApiError(res.error || 'Falha na conexão');
    }
  };

  const handleTestDb = async () => {
    setDbStatus('testing');
    setDbError('');
    const res = await testDbConnection({
      host: config.dbHost,
      port: config.dbPort,
      database: config.dbName,
      user: config.dbUser,
      password: config.dbPassword,
      ssl: config.dbSslEnabled,
    });
    if (res.ok) {
      setDbStatus('success');
    } else {
      setDbStatus('error');
      setDbError(res.error || 'Falha na conexão');
    }
  };

  const LockedOverlay = ({ children }: { children: React.ReactNode }) =>
    !isPro ? (
      <div className="relative">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm font-body text-muted-foreground">
            <Lock className="w-4 h-4" />
            Disponível nos planos Pro e Pro+
          </div>
        </div>
        <div className="opacity-50 pointer-events-none">{children}</div>
      </div>
    ) : (
      <>{children}</>
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Configurações</h1>
            <p className="text-sm text-muted-foreground font-body">Gerencie conexões, integrações e parâmetros do sistema.</p>
          </div>
          <Button onClick={handleSave} variant="gold" className="font-body" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Salvar Alterações
          </Button>
        </div>

        <Tabs defaultValue="api" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="api" className="font-body text-xs"><Server className="w-3.5 h-3.5 mr-1" />API Backend</TabsTrigger>
            <TabsTrigger value="license" className="font-body text-xs"><Key className="w-3.5 h-3.5 mr-1" />Licença</TabsTrigger>
            <TabsTrigger value="database" className="font-body text-xs"><Database className="w-3.5 h-3.5 mr-1" />Banco de Dados</TabsTrigger>
            <TabsTrigger value="integrations" className="font-body text-xs"><Globe className="w-3.5 h-3.5 mr-1" />Integrações</TabsTrigger>
            <TabsTrigger value="company" className="font-body text-xs"><Building2 className="w-3.5 h-3.5 mr-1" />Empresa</TabsTrigger>
            <TabsTrigger value="notifications" className="font-body text-xs"><Bell className="w-3.5 h-3.5 mr-1" />Notificações</TabsTrigger>
          </TabsList>

          {/* API BACKEND */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-secondary" /> API Backend (Node.js)
                </CardTitle>
                <CardDescription>URL do servidor que conecta ao banco de dados e persiste as configurações.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="font-body">URL da API</Label>
                  <div className="flex gap-2">
                    <Input
                      value={config.apiUrl}
                      onChange={(e) => { update({ apiUrl: e.target.value }); setApiStatus('idle'); }}
                      placeholder="http://localhost:3001"
                      className="font-mono"
                    />
                    <Button variant="outline" onClick={handleTestApi} disabled={apiStatus === 'testing'} className="font-body shrink-0">
                      {apiStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Testar'}
                    </Button>
                  </div>
                  <StatusIcon status={apiStatus} error={apiError} />
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-body">
                  <p>A API deve expor <code className="bg-muted px-1 rounded">GET /health</code>, <code className="bg-muted px-1 rounded">GET /config</code> e <code className="bg-muted px-1 rounded">POST /config</code> para persistir as configurações no banco.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LICENSE */}
          <TabsContent value="license">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-secondary" /> Licença
                </CardTitle>
                <CardDescription>Gerencie o plano e a chave de ativação.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm font-body">
                    {(() => { const I = tierIcons[config.licenseTier]; return <I className="w-3.5 h-3.5 mr-1" />; })()}
                    {TIER_FEATURES[config.licenseTier].name}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-body">{TIER_FEATURES[config.licenseTier].price}</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body">Chave de Licença</Label>
                  <Input
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={config.licenseKey}
                    onChange={(e) => update({ licenseKey: e.target.value })}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground font-body">Para alterar o plano, insira uma nova chave válida e salve.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DATABASE */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-secondary" /> Banco de Dados PostgreSQL
                </CardTitle>
                <CardDescription>Configure a conexão com seu servidor de banco de dados.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-body">Host / IP</Label>
                    <Input value={config.dbHost} onChange={(e) => { update({ dbHost: e.target.value }); setDbStatus('idle'); }} placeholder="localhost" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-body">Porta</Label>
                    <Input value={config.dbPort} onChange={(e) => { update({ dbPort: e.target.value }); setDbStatus('idle'); }} placeholder="5432" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-body">Nome do Banco</Label>
                    <Input value={config.dbName} onChange={(e) => { update({ dbName: e.target.value }); setDbStatus('idle'); }} placeholder="mogibens_db" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-body">Usuário</Label>
                    <Input value={config.dbUser} onChange={(e) => { update({ dbUser: e.target.value }); setDbStatus('idle'); }} placeholder="postgres" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body">Senha</Label>
                  <Input type="password" value={config.dbPassword} onChange={(e) => { update({ dbPassword: e.target.value }); setDbStatus('idle'); }} placeholder="••••••••" />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={config.dbSslEnabled} onCheckedChange={(v) => { update({ dbSslEnabled: v }); setDbStatus('idle'); }} />
                  <Label className="font-body text-sm">Conexão SSL</Label>
                </div>
                <Button variant="outline" onClick={handleTestDb} disabled={dbStatus === 'testing'} className="font-body">
                  {dbStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Database className="w-4 h-4 mr-1" />}
                  Testar Conexão com o Banco
                </Button>
                <StatusIcon status={dbStatus} error={dbError} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* INTEGRATIONS */}
          <TabsContent value="integrations">
            <div className="space-y-4">
              <LockedOverlay>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">📘 Meta Ads (Facebook / Instagram)</CardTitle>
                    <CardDescription>Configure as credenciais da API do Meta Business para importar campanhas, leads e métricas.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Access Token</Label>
                        <Input value={config.metaAdsToken} onChange={(e) => update({ metaAdsToken: e.target.value })} placeholder="EAAxxxxxxx..." className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Ad Account ID</Label>
                        <Input value={config.metaAdAccountId} onChange={(e) => update({ metaAdAccountId: e.target.value })} placeholder="act_XXXXXXXXX" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Pixel ID <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input value={config.metaPixelId} onChange={(e) => update({ metaPixelId: e.target.value })} placeholder="XXXXXXXXXXXXXXXXX" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Page ID <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input value={config.metaPageId} onChange={(e) => update({ metaPageId: e.target.value })} placeholder="XXXXXXXXXXXXXXXXX" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">App ID <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input value={config.metaAppId} onChange={(e) => update({ metaAppId: e.target.value })} placeholder="XXXXXXXXXXXXXXXXX" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">App Secret <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input type="password" value={config.metaAppSecret} onChange={(e) => update({ metaAppSecret: e.target.value })} placeholder="••••••••" className="font-mono text-sm" />
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-body">
                      <p>Obtenha o Access Token e Ad Account ID no <a href="https://business.facebook.com/settings" target="_blank" rel="noopener noreferrer" className="underline text-primary">Meta Business Suite</a>. O token deve ter permissões: <code className="bg-muted px-1 rounded">ads_read</code>, <code className="bg-muted px-1 rounded">ads_management</code>, <code className="bg-muted px-1 rounded">leads_retrieval</code>.</p>
                    </div>
                  </CardContent>
                </Card>
              </LockedOverlay>

              <LockedOverlay>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">🔍 Google Ads</CardTitle>
                    <CardDescription>Credenciais OAuth2 e Developer Token para a API do Google Ads.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Developer Token</Label>
                        <Input value={config.googleAdsDevToken} onChange={(e) => update({ googleAdsDevToken: e.target.value })} placeholder="xxxxxxxxxxxxxxxx" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Customer ID</Label>
                        <Input value={config.googleAdsCustomerId} onChange={(e) => update({ googleAdsCustomerId: e.target.value })} placeholder="XXX-XXX-XXXX" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">OAuth Client ID</Label>
                        <Input value={config.googleAdsClientId} onChange={(e) => update({ googleAdsClientId: e.target.value })} placeholder="XXXXX.apps.googleusercontent.com" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">OAuth Client Secret</Label>
                        <Input type="password" value={config.googleAdsClientSecret} onChange={(e) => update({ googleAdsClientSecret: e.target.value })} placeholder="••••••••" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Refresh Token</Label>
                        <Input type="password" value={config.googleAdsRefreshToken} onChange={(e) => update({ googleAdsRefreshToken: e.target.value })} placeholder="••••••••" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Manager Account ID <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input value={config.googleAdsManagerId} onChange={(e) => update({ googleAdsManagerId: e.target.value })} placeholder="XXX-XXX-XXXX" className="font-mono text-sm" />
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-body">
                      <p>Crie as credenciais no <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline text-primary">Google Cloud Console</a> e obtenha o Developer Token no <a href="https://ads.google.com/aw/apicenter" target="_blank" rel="noopener noreferrer" className="underline text-primary">Google Ads API Center</a>.</p>
                    </div>
                  </CardContent>
                </Card>
              </LockedOverlay>

              <LockedOverlay>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">🎵 TikTok Ads</CardTitle>
                    <CardDescription>Credenciais da API do TikTok for Business.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Access Token</Label>
                        <Input value={config.tiktokAdsToken} onChange={(e) => update({ tiktokAdsToken: e.target.value })} placeholder="Insira o token..." className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Advertiser ID</Label>
                        <Input value={config.tiktokAdvertiserId} onChange={(e) => update({ tiktokAdvertiserId: e.target.value })} placeholder="XXXXXXXXXXXXXXXXX" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">App ID <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input value={config.tiktokAppId} onChange={(e) => update({ tiktokAppId: e.target.value })} placeholder="XXXXXXXXXXXXXXXXX" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">App Secret <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input type="password" value={config.tiktokAppSecret} onChange={(e) => update({ tiktokAppSecret: e.target.value })} placeholder="••••••••" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="font-body text-sm">Pixel ID <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input value={config.tiktokPixelId} onChange={(e) => update({ tiktokPixelId: e.target.value })} placeholder="XXXXXXXXXXXXXXXXX" className="font-mono text-sm" />
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-body">
                      <p>Obtenha as credenciais no <a href="https://business-api.tiktok.com/portal/docs" target="_blank" rel="noopener noreferrer" className="underline text-primary">TikTok Marketing API Portal</a>.</p>
                    </div>
                  </CardContent>
                </Card>
              </LockedOverlay>

              <LockedOverlay>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">📊 Google Analytics 4</CardTitle>
                    <CardDescription>Conecte o GA4 para rastrear acessos e conversões das landing pages.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Measurement ID</Label>
                        <Input value={config.googleAnalyticsMeasurementId} onChange={(e) => update({ googleAnalyticsMeasurementId: e.target.value })} placeholder="G-XXXXXXXXXX" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Property ID <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input value={config.googleAnalyticsPropertyId} onChange={(e) => update({ googleAnalyticsPropertyId: e.target.value })} placeholder="XXXXXXXXX" className="font-mono text-sm" />
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-body">
                      <p>Encontre o Measurement ID em <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline text-primary">Google Analytics</a> → Admin → Data Streams.</p>
                    </div>
                  </CardContent>
                </Card>
              </LockedOverlay>

              <LockedOverlay>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">💬 WhatsApp Business API</CardTitle>
                    <CardDescription>Configure o envio automático de mensagens via WhatsApp Cloud API.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Phone Number ID</Label>
                        <Input value={config.whatsappPhoneNumberId} onChange={(e) => update({ whatsappPhoneNumberId: e.target.value })} placeholder="XXXXXXXXXXXXXXXXX" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Business Account ID</Label>
                        <Input value={config.whatsappBusinessAccountId} onChange={(e) => update({ whatsappBusinessAccountId: e.target.value })} placeholder="XXXXXXXXXXXXXXXXX" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Access Token</Label>
                        <Input type="password" value={config.whatsappAccessToken} onChange={(e) => update({ whatsappAccessToken: e.target.value })} placeholder="••••••••" className="font-mono text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-body text-sm">Webhook Verify Token <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input value={config.whatsappWebhookVerifyToken} onChange={(e) => update({ whatsappWebhookVerifyToken: e.target.value })} placeholder="seu_token_verificacao" className="font-mono text-sm" />
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-body">
                      <p>Configure no <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="underline text-primary">Meta for Developers</a> → seu App → WhatsApp → API Setup.</p>
                    </div>
                  </CardContent>
                </Card>
              </LockedOverlay>
            </div>
          </TabsContent>

          {/* COMPANY */}
          <TabsContent value="company">
            <LockedOverlay>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-secondary" /> Dados da Empresa
                  </CardTitle>
                  <CardDescription>Personalize a identidade da sua marca no painel e landing pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="font-body">Nome da Empresa</Label>
                    <Input value={config.companyName} onChange={(e) => update({ companyName: e.target.value })} placeholder="Mogibens Multimarcas" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-body">URL do Logotipo</Label>
                    <Input value={config.companyLogoUrl} onChange={(e) => update({ companyLogoUrl: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-body">Cor Primária da Marca</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.companyPrimaryColor}
                        onChange={(e) => update({ companyPrimaryColor: e.target.value })}
                        className="w-10 h-10 rounded-md border border-input cursor-pointer"
                      />
                      <Input value={config.companyPrimaryColor} onChange={(e) => update({ companyPrimaryColor: e.target.value })} className="font-mono w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </LockedOverlay>
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications">
            <LockedOverlay>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-secondary" /> Notificações por E-mail
                  </CardTitle>
                  <CardDescription>Configure alertas automáticos para eventos importantes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="font-body">E-mail de Notificação</Label>
                    <Input type="email" value={config.notificationEmail} onChange={(e) => update({ notificationEmail: e.target.value })} placeholder="admin@mogibens.com.br" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground font-body">Novos Leads</p>
                      <p className="text-xs text-muted-foreground font-body">Receber e-mail a cada novo lead captado.</p>
                    </div>
                    <Switch checked={config.notifyNewLeads} onCheckedChange={(v) => update({ notifyNewLeads: v })} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground font-body">Relatório Diário</p>
                      <p className="text-xs text-muted-foreground font-body">Resumo diário com métricas enviado às 8h.</p>
                    </div>
                    <Switch checked={config.notifyDailyReport} onCheckedChange={(v) => update({ notifyDailyReport: v })} />
                  </div>
                </CardContent>
              </Card>
            </LockedOverlay>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
