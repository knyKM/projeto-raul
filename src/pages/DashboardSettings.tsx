import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Key, Globe, Building2, Bell, Save, Shield, Crown, Star, Zap, Lock } from "lucide-react";
import { getConfig, saveConfig, AppConfig, TIER_FEATURES, LicenseTier } from "@/lib/configStore";
import { useToast } from "@/hooks/use-toast";

const tierIcons: Record<LicenseTier, typeof Star> = { free: Star, pro: Crown, proplus: Zap };

const DashboardSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AppConfig>(getConfig());
  const isPro = config.licenseTier !== "free";

  const update = (partial: Partial<AppConfig>) => setConfig((c) => ({ ...c, ...partial }));

  const handleSave = () => {
    saveConfig(config);
    toast({ title: "Configurações salvas", description: "Suas alterações foram aplicadas com sucesso." });
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
          <Button onClick={handleSave} variant="gold" className="font-body">
            <Save className="w-4 h-4 mr-1" /> Salvar Alterações
          </Button>
        </div>

        <Tabs defaultValue="license" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="license" className="font-body text-xs"><Key className="w-3.5 h-3.5 mr-1" />Licença</TabsTrigger>
            <TabsTrigger value="database" className="font-body text-xs"><Database className="w-3.5 h-3.5 mr-1" />Banco de Dados</TabsTrigger>
            <TabsTrigger value="integrations" className="font-body text-xs"><Globe className="w-3.5 h-3.5 mr-1" />Integrações</TabsTrigger>
            <TabsTrigger value="company" className="font-body text-xs"><Building2 className="w-3.5 h-3.5 mr-1" />Empresa</TabsTrigger>
            <TabsTrigger value="notifications" className="font-body text-xs"><Bell className="w-3.5 h-3.5 mr-1" />Notificações</TabsTrigger>
          </TabsList>

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
                  <p className="text-xs text-muted-foreground font-body">Para alterar o plano, insira uma nova chave válida.</p>
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
                    <Input value={config.dbHost} onChange={(e) => update({ dbHost: e.target.value })} placeholder="db.exemplo.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-body">Porta</Label>
                    <Input value={config.dbPort} onChange={(e) => update({ dbPort: e.target.value })} placeholder="5432" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-body">Nome do Banco</Label>
                    <Input value={config.dbName} onChange={(e) => update({ dbName: e.target.value })} placeholder="mogibens_db" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-body">Usuário</Label>
                    <Input value={config.dbUser} onChange={(e) => update({ dbUser: e.target.value })} placeholder="admin" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body">Senha</Label>
                  <Input type="password" value={config.dbPassword} onChange={(e) => update({ dbPassword: e.target.value })} placeholder="••••••••" />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={config.dbSslEnabled} onCheckedChange={(v) => update({ dbSslEnabled: v })} />
                  <Label className="font-body text-sm">Conexão SSL</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INTEGRATIONS */}
          <TabsContent value="integrations">
            <div className="space-y-4">
              <LockedOverlay>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Meta Ads (Facebook / Instagram)</CardTitle>
                    <CardDescription>Token de acesso da API do Meta Business.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input value={config.metaAdsToken} onChange={(e) => update({ metaAdsToken: e.target.value })} placeholder="EAAxxxxxxx..." className="font-mono text-sm" />
                  </CardContent>
                </Card>
              </LockedOverlay>

              <LockedOverlay>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Google Ads</CardTitle>
                    <CardDescription>Token ou chave de API do Google Ads.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input value={config.googleAdsToken} onChange={(e) => update({ googleAdsToken: e.target.value })} placeholder="AIzaSyxxxxxxx..." className="font-mono text-sm" />
                  </CardContent>
                </Card>
              </LockedOverlay>

              <LockedOverlay>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">TikTok Ads</CardTitle>
                    <CardDescription>Token de acesso da API do TikTok Business.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input value={config.tiktokAdsToken} onChange={(e) => update({ tiktokAdsToken: e.target.value })} placeholder="Insira o token..." className="font-mono text-sm" />
                  </CardContent>
                </Card>
              </LockedOverlay>

              <LockedOverlay>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Google Analytics</CardTitle>
                    <CardDescription>ID de medição do GA4.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input value={config.googleAnalyticsId} onChange={(e) => update({ googleAnalyticsId: e.target.value })} placeholder="G-XXXXXXXXXX" className="font-mono text-sm" />
                  </CardContent>
                </Card>
              </LockedOverlay>

              <LockedOverlay>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">WhatsApp Business</CardTitle>
                    <CardDescription>Número e token para envio automático.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="font-body text-sm">Número do WhatsApp</Label>
                      <Input value={config.whatsappNumber} onChange={(e) => update({ whatsappNumber: e.target.value })} placeholder="+5511999999999" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-body text-sm">Token da API</Label>
                      <Input value={config.whatsappApiToken} onChange={(e) => update({ whatsappApiToken: e.target.value })} placeholder="Insira o token..." className="font-mono text-sm" />
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
