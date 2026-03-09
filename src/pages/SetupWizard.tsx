import { useState, useRef, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Check, ChevronRight, ChevronLeft, Database, Key, Rocket, Shield, Crown, Star, Zap,
  Server, Loader2, CheckCircle2, XCircle, Building2, Upload, ImageIcon,
} from "lucide-react";
import { saveConfig, LicenseTier, TIER_FEATURES, getConfig } from "@/lib/configStore";
import { setApiUrl, testApiConnection, testDbConnection, validateLicense } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-sistemaleads.png";

const steps = [
  { id: 1, title: "Empresa", icon: Building2 },
  { id: 2, title: "Licença", icon: Key },
  { id: 3, title: "API Backend", icon: Server },
  { id: 4, title: "Banco de Dados", icon: Database },
  { id: 5, title: "Finalizar", icon: Rocket },
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
  const alreadyCompleted = existing.setupCompleted;
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 — Company
  const [companyName, setCompanyName] = useState(existing.companyName || "");
  const [companyLogoPreview, setCompanyLogoPreview] = useState(existing.companyLogoUrl || "");

  // Step 2 — License
  const [selectedTier, setSelectedTier] = useState<LicenseTier>(existing.licenseTier || "free");
  const [licenseKey, setLicenseKey] = useState(existing.licenseKey || "");

  // Step 3 — API URL
  const [apiUrl, setApiUrlState] = useState(existing.apiUrl || "http://localhost:3001");
  const [apiStatus, setApiStatus] = useState<TestStatus>('idle');
  const [apiError, setApiError] = useState('');

  // Step 4 — Database
  const [dbHost, setDbHost] = useState(existing.dbHost || "");
  const [dbPort, setDbPort] = useState(existing.dbPort || "5432");
  const [dbName, setDbName] = useState(existing.dbName || "");
  const [dbUser, setDbUser] = useState(existing.dbUser || "");
  const [dbPassword, setDbPassword] = useState(existing.dbPassword || "");
  const [dbSsl, setDbSsl] = useState(existing.dbSslEnabled ?? true);
  const [dbStatus, setDbStatus] = useState<TestStatus>('idle');
  const [dbError, setDbError] = useState('');

  const canProceedStep1 = companyName.trim().length >= 2;
  const canProceedStep2 = selectedTier === "free" || licenseKey.trim().length >= 8;
  const canProceedStep3 = apiUrl.trim() !== "" && apiStatus === 'success';
  const canProceedStep4 = dbHost.trim() !== "" && dbName.trim() !== "" && dbUser.trim() !== "";

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 200x200 for sidebar
        const canvas = document.createElement("canvas");
        const maxSize = 200;
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/png", 0.9);
        setCompanyLogoPreview(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

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

  const [finishing, setFinishing] = useState(false);

  const handleFinish = async () => {
    setFinishing(true);

    let finalTier: LicenseTier = 'free';
    let finalActivated = false;

    // Validate license key via API if a paid tier was selected
    if (selectedTier !== 'free' && licenseKey.trim()) {
      console.log('[SetupWizard] Validando chave:', licenseKey.trim(), 'Tier selecionado:', selectedTier);
      const res = await validateLicense(licenseKey.trim());
      console.log('[SetupWizard] Resposta validação:', JSON.stringify(res));
      
      if (res.ok && res.data?.valid) {
        finalTier = (res.data.tier as LicenseTier) || 'free';
        finalActivated = true;
        console.log('[SetupWizard] Licença válida! Tier:', finalTier);
        toast({ title: "Licença ativada!", description: `Plano ${TIER_FEATURES[finalTier].name} ativado com sucesso.` });
      } else if (res.ok && !res.data?.valid) {
        // API responded but key is invalid
        console.warn('[SetupWizard] Chave inválida:', res.data);
        toast({ title: "Chave inválida", description: "A chave de licença não foi reconhecida. O sistema será ativado como Free.", variant: "destructive" });
      } else {
        // API call failed entirely
        console.error('[SetupWizard] Erro na validação:', res.error);
        toast({ 
          title: "Erro ao validar licença", 
          description: `Não foi possível validar: ${res.error}. Verifique se o backend está rodando. O sistema será ativado como Free.`, 
          variant: "destructive" 
        });
      }
    }

    console.log('[SetupWizard] Salvando config final — tier:', finalTier, 'activated:', finalActivated);

    saveConfig({
      companyName,
      companyLogoUrl: companyLogoPreview,
      apiUrl,
      licenseTier: finalTier,
      licenseKey: finalActivated ? licenseKey : '',
      licenseActivated: finalActivated,
      dbHost,
      dbPort,
      dbName,
      dbUser,
      dbPassword,
      dbSslEnabled: dbSsl,
      setupCompleted: true,
    });
    setFinishing(false);
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

  // If setup already completed, redirect to dashboard
  if (alreadyCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src={logo} alt="sistemaLeads" className="h-16 w-auto rounded-md" />
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">sistemaLeads</h1>
          <p className="text-sm text-muted-foreground font-body">Configuração Inicial</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 sm:gap-2 mb-8 flex-wrap justify-center">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 sm:gap-2">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-semibold transition-colors",
                step >= s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            <span className={cn("text-xs sm:text-sm font-body hidden sm:inline", step >= s.id ? "text-foreground" : "text-muted-foreground")}>
              {s.title}
            </span>
            {i < steps.length - 1 && <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="w-full max-w-4xl">
        {/* STEP 1 — Company */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-secondary" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Configure o nome e logo que aparecerão no painel administrativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="font-body">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Minha Empresa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label className="font-body">Logo da Empresa</Label>
                <p className="text-xs text-muted-foreground font-body">
                  Envie uma imagem (PNG, JPG). Ela será redimensionada automaticamente para a sidebar.
                </p>

                <div className="flex items-center gap-6">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50 overflow-hidden shrink-0">
                    {companyLogoPreview ? (
                      <img
                        src={companyLogoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-body gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      {companyLogoPreview ? "Trocar Logo" : "Enviar Logo"}
                    </Button>
                    {companyLogoPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-body text-xs text-muted-foreground"
                        onClick={() => setCompanyLogoPreview("")}
                      >
                        Remover
                      </Button>
                    )}
                    <p className="text-[10px] text-muted-foreground font-body">Máx. 5MB · Redimensionada para 200×200px</p>
                  </div>
                </div>
              </div>

              {/* Sidebar preview */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground font-body mb-3">📱 Preview da Sidebar</p>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border max-w-xs">
                  <div className="w-9 h-9 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {companyLogoPreview ? (
                      <img src={companyLogoPreview} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground">
                      {companyName || "Nome da Empresa"}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">Painel Administrativo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2 — License */}
        {step === 2 && (
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

        {/* STEP 3 — API Backend */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-secondary" />
                Servidor da API (Backend)
              </CardTitle>
              <CardDescription>
                Informe a URL da sua API Node.js que conecta ao banco de dados.
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
                <p>O frontend se comunica com uma API Node.js via HTTP. A API deve responder em <code className="bg-muted px-1 rounded">GET /health</code> com <code className="bg-muted px-1 rounded">{`{"status":"ok"}`}</code>.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4 — Database */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-secondary" />
                Conexão com o Banco de Dados
              </CardTitle>
              <CardDescription>Informe os dados de acesso ao seu servidor PostgreSQL.</CardDescription>
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
                  <Input id="dbName" placeholder="sistemaleads" value={dbName} onChange={(e) => { setDbName(e.target.value); setDbStatus('idle'); }} />
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
            </CardContent>
          </Card>
        )}

        {/* STEP 5 — Summary */}
        {step === 5 && (
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
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-body">Empresa</p>
                  <div className="flex items-center gap-3">
                    {companyLogoPreview && (
                      <img src={companyLogoPreview} alt="Logo" className="w-8 h-8 rounded object-contain" />
                    )}
                    <p className="font-semibold text-foreground">{companyName}</p>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-body">Plano</p>
                  <p className="font-semibold text-foreground">{TIER_FEATURES[selectedTier].name} — {TIER_FEATURES[selectedTier].price}</p>
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
                <p>Após a ativação, todas as configurações serão persistidas no banco de dados via API. Você poderá alterar tudo na seção <strong>Configurações</strong> do painel.</p>
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

          {step < 5 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3) ||
                (step === 4 && !canProceedStep4)
              }
              className="font-body"
            >
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleFinish} variant="gold" className="font-body" disabled={finishing}>
              {finishing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Rocket className="w-4 h-4 mr-1" />}
              {finishing ? 'Ativando...' : 'Ativar e Começar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
