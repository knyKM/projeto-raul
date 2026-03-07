import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, ChevronLeft, Database, Key, Rocket, Shield, Crown, Star, Zap, Server, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { saveConfig, LicenseTier, TIER_FEATURES, getConfig } from "@/lib/configStore";
import { setApiUrl, testApiConnection, testDbConnection } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-mogibens.png";

const steps = [
  { id: 1, title: "Licença", icon: Key },
  { id: 2, title: "API Backend", icon: Server },
  { id: 3, title: "Banco de Dados", icon: Database },
  { id: 4, title: "Finalizar", icon: Rocket },
];

const tierIcons: Record<LicenseTier, typeof Star> = {
  free: Star,
  pro: Crown,
  proplus: Zap,
};

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

const SetupWizard = () => {
  const navigate = useNavigate();
  const existing = getConfig();
  const [step, setStep] = useState(1);

  // Step 1 — License
  const [selectedTier, setSelectedTier] = useState<LicenseTier>(existing.licenseTier || "free");
  const [licenseKey, setLicenseKey] = useState(existing.licenseKey || "");

  // Step 2 — API URL
  const [apiUrl, setApiUrlState] = useState(existing.apiUrl || "http://localhost:3001");
  const [apiStatus, setApiStatus] = useState<TestStatus>('idle');
  const [apiError, setApiError] = useState('');

  // Step 3 — Database
  const [dbHost, setDbHost] = useState(existing.dbHost || "");
  const [dbPort, setDbPort] = useState(existing.dbPort || "5432");
  const [dbName, setDbName] = useState(existing.dbName || "");
  const [dbUser, setDbUser] = useState(existing.dbUser || "");
  const [dbPassword, setDbPassword] = useState(existing.dbPassword || "");
  const [dbSsl, setDbSsl] = useState(existing.dbSslEnabled ?? true);
  const [dbStatus, setDbStatus] = useState<TestStatus>('idle');
  const [dbError, setDbError] = useState('');

  const canProceedStep1 = selectedTier === "free" || licenseKey.trim().length >= 8;
  const canProceedStep2 = apiUrl.trim() !== "" && apiStatus === 'success';
  const canProceedStep3 = dbHost.trim() !== "" && dbName.trim() !== "" && dbUser.trim() !== "";

  const handleTestApi = async () => {
    setApiStatus('testing');
    setApiError('');
    setApiUrl(apiUrl);
    const res = await testApiConnection();
    if (res.ok) {
      setApiStatus('success');
    } else {
      setApiStatus('error');
      setApiError(res.error || 'Não foi possível conectar');
    }
  };

  const handleTestDb = async () => {
    setDbStatus('testing');
    setDbError('');
    const res = await testDbConnection({
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
      password: dbPassword,
      ssl: dbSsl,
    });
    if (res.ok) {
      setDbStatus('success');
    } else {
      setDbStatus('error');
      setDbError(res.error || 'Falha na conexão com o banco');
    }
  };

  const handleFinish = () => {
    saveConfig({
      apiUrl,
      licenseTier: selectedTier,
      licenseKey,
      licenseActivated: true,
      dbHost,
      dbPort,
      dbName,
      dbUser,
      dbPassword,
      dbSslEnabled: dbSsl,
      setupCompleted: true,
    });
    navigate("/dashboard");
  };

  const StatusIcon = ({ status, error }: { status: TestStatus; error: string }) => (
    <div className="flex items-center gap-2 mt-2">
      {status === 'testing' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      {status === 'testing' && <span className="text-xs text-muted-foreground font-body">Testando conexão...</span>}
      {status === 'success' && <CheckCircle2 className="w-4 h-4 text-secondary" />}
      {status === 'success' && <span className="text-xs text-secondary font-body">Conectado com sucesso!</span>}
      {status === 'error' && <XCircle className="w-4 h-4 text-destructive" />}
      {status === 'error' && <span className="text-xs text-destructive font-body">{error}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <img src={logo} alt="Mogibens" className="h-10 w-auto rounded-md" />
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Mogibens</h1>
          <p className="text-xs text-muted-foreground font-body">Configuração Inicial</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-colors",
                step >= s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            <span className={cn("text-sm font-body hidden sm:inline", step >= s.id ? "text-foreground" : "text-muted-foreground")}>
              {s.title}
            </span>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="w-full max-w-4xl">
        {/* STEP 1 — License */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground">Escolha seu plano</h2>
              <p className="text-muted-foreground font-body mt-1">Selecione o pacote ideal para o seu negócio</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.entries(TIER_FEATURES) as [LicenseTier, typeof TIER_FEATURES.free][]).map(([tier, info]) => {
                const TierIcon = tierIcons[tier];
                const isSelected = selectedTier === tier;
                return (
                  <Card
                    key={tier}
                    className={cn(
                      "cursor-pointer transition-all duration-200 relative",
                      isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md",
                      info.highlight && "border-secondary"
                    )}
                    onClick={() => setSelectedTier(tier)}
                  >
                    {info.highlight && (
                      <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs">
                        Mais popular
                      </Badge>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TierIcon className="w-5 h-5 text-secondary" />
                          <CardTitle className="text-lg">{info.name}</CardTitle>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                        )}>
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-foreground font-display">{info.price}</p>
                      <CardDescription className="text-xs">{info.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {info.features.map((f) => (
                        <div key={f} className="flex items-start gap-2 text-xs font-body">
                          <Check className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
                          <span className="text-foreground">{f}</span>
                        </div>
                      ))}
                      {info.limitations.map((l) => (
                        <div key={l} className="flex items-start gap-2 text-xs font-body">
                          <Shield className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{l}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {selectedTier !== "free" && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <Label htmlFor="licenseKey" className="font-body">Chave de Licença</Label>
                  <p className="text-xs text-muted-foreground mb-2 font-body">
                    Informe a chave recebida após a compra do plano {TIER_FEATURES[selectedTier].name}.
                  </p>
                  <Input
                    id="licenseKey"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    className="font-mono"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* STEP 2 — API Backend */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-secondary" />
                Servidor da API (Backend)
              </CardTitle>
              <CardDescription>
                Informe a URL da sua API Node.js que conecta ao banco de dados. Todas as configurações serão persistidas através dela.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="apiUrl" className="font-body">URL da API</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiUrl"
                    placeholder="http://localhost:3001"
                    value={apiUrl}
                    onChange={(e) => {
                      setApiUrlState(e.target.value);
                      setApiStatus('idle');
                    }}
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    onClick={handleTestApi}
                    disabled={apiStatus === 'testing' || !apiUrl.trim()}
                    className="font-body shrink-0"
                  >
                    {apiStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Testar'}
                  </Button>
                </div>
                <StatusIcon status={apiStatus} error={apiError} />
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-body space-y-2">
                <p className="font-medium text-foreground">💡 Como funciona</p>
                <p>O frontend (este painel) se comunica com uma API Node.js via HTTP. A API é responsável por:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Conectar e persistir dados no PostgreSQL</li>
                  <li>Gerenciar configurações, leads, métricas de ads</li>
                  <li>Integrar com Meta Ads, Google Ads, TikTok Ads, WhatsApp</li>
                </ul>
                <p className="mt-2">A API deve responder em <code className="bg-muted px-1 rounded">GET /health</code> com <code className="bg-muted px-1 rounded">{`{"status":"ok"}`}</code>.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3 — Database */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-secondary" />
                Conexão com o Banco de Dados
              </CardTitle>
              <CardDescription>Informe os dados de acesso ao seu servidor PostgreSQL. A API usará essas credenciais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dbHost" className="font-body">Host / IP</Label>
                  <Input id="dbHost" placeholder="localhost" value={dbHost} onChange={(e) => { setDbHost(e.target.value); setDbStatus('idle'); }} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dbPort" className="font-body">Porta</Label>
                  <Input id="dbPort" placeholder="5432" value={dbPort} onChange={(e) => { setDbPort(e.target.value); setDbStatus('idle'); }} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dbName" className="font-body">Nome do Banco</Label>
                  <Input id="dbName" placeholder="mogibens_db" value={dbName} onChange={(e) => { setDbName(e.target.value); setDbStatus('idle'); }} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dbUser" className="font-body">Usuário</Label>
                  <Input id="dbUser" placeholder="postgres" value={dbUser} onChange={(e) => { setDbUser(e.target.value); setDbStatus('idle'); }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dbPassword" className="font-body">Senha</Label>
                <Input id="dbPassword" type="password" placeholder="••••••••" value={dbPassword} onChange={(e) => { setDbPassword(e.target.value); setDbStatus('idle'); }} />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="dbSsl" checked={dbSsl} onCheckedChange={(v) => { setDbSsl(v); setDbStatus('idle'); }} />
                <Label htmlFor="dbSsl" className="font-body text-sm">Usar conexão SSL</Label>
              </div>

              <Button
                variant="outline"
                onClick={handleTestDb}
                disabled={dbStatus === 'testing' || !dbHost.trim() || !dbName.trim() || !dbUser.trim()}
                className="font-body"
              >
                {dbStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Database className="w-4 h-4 mr-1" />}
                Testar Conexão
              </Button>
              <StatusIcon status={dbStatus} error={dbError} />

              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-body">
                <p className="font-medium text-foreground mb-1">💡 Dica</p>
                <p>Certifique-se de que o PostgreSQL aceita conexões do host onde a API está rodando e que o usuário tenha permissões adequadas.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4 — Summary */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-secondary" />
                Tudo pronto!
              </CardTitle>
              <CardDescription>Revise suas configurações antes de começar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-body">Plano</p>
                  <p className="font-semibold text-foreground">{TIER_FEATURES[selectedTier].name} — {TIER_FEATURES[selectedTier].price}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-body">Licença</p>
                  <p className="font-semibold text-foreground font-mono text-sm">
                    {selectedTier === "free" ? "Não necessária" : licenseKey || "—"}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-body">API Backend</p>
                  <p className="font-semibold text-foreground font-mono text-sm">{apiUrl}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-body">Banco de Dados</p>
                  <p className="font-semibold text-foreground text-sm">{dbUser}@{dbHost}:{dbPort}/{dbName}</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground font-body">
                <p>Após a ativação, todas as configurações serão persistidas no banco de dados via API. Você poderá gerenciar integrações, tokens e parâmetros na seção <strong>Configurações</strong> do painel.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="font-body"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3)
              }
              className="font-body"
            >
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleFinish} variant="gold" className="font-body">
              <Rocket className="w-4 h-4 mr-1" /> Ativar e Começar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
