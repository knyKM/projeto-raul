# sistemaLeads — Plataforma de Gestão de Leads e Ads

Sistema completo para gestão de leads, campanhas de anúncios (Meta, Google, TikTok), landing pages dinâmicas e geolocalização de acessos com mapa interativo.

---

## 📋 Índice

1. [Requisitos do Servidor](#-requisitos-do-servidor)
2. [Preparação do Servidor (Ubuntu)](#-preparação-do-servidor-ubuntu)
3. [Instalação do PostgreSQL](#-instalação-do-postgresql)
4. [Instalação do Backend](#-instalação-do-backend)
5. [Instalação do Frontend](#-instalação-do-frontend)
6. [Configuração do Nginx (Proxy Reverso + SPA)](#-configuração-do-nginx)
7. [SSL com Certbot (HTTPS)](#-ssl-com-certbot-https)
8. [Sistema de Licenças (HMAC)](#-sistema-de-licenças-hmac)
9. [Integrações (Meta, Google, TikTok, WhatsApp, GA4)](#-integrações)
10. [Primeiro Acesso (Setup Wizard)](#-primeiro-acesso-setup-wizard)
11. [Funcionalidades do Dashboard](#-funcionalidades-do-dashboard)
12. [Manutenção e Monitoramento](#-manutenção-e-monitoramento)
13. [Estrutura do Projeto](#-estrutura-do-projeto)
14. [Planos e Licenciamento](#-planos-e-licenciamento)

---

## 🔧 Requisitos do Servidor

| Componente | Versão mínima |
|------------|---------------|
| Ubuntu | 22.04 LTS+ |
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ |
| Nginx | 1.18+ |
| PM2 | latest |
| Certbot | latest (para HTTPS) |

**Hardware mínimo recomendado:** 1 vCPU, 1 GB RAM, 20 GB SSD

---

## 🖥️ Preparação do Servidor (Ubuntu)

### 1. Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar dependências básicas

```bash
sudo apt install -y curl git build-essential
```

### 3. Instalar Node.js 20 (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifique:

```bash
node -v   # v20.x.x
npm -v    # 10.x.x
```

### 4. Instalar PM2 (gerenciador de processos)

```bash
sudo npm install -g pm2
```

### 5. Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 🗄️ Instalação do PostgreSQL

### 1. Instalar

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2. Criar banco e usuário

```bash
sudo -u postgres psql
```

Dentro do `psql`:

```sql
CREATE DATABASE sistemaleads;
CREATE USER sistemaleads_user WITH ENCRYPTED PASSWORD 'SUA_SENHA_SEGURA_AQUI';
GRANT ALL PRIVILEGES ON DATABASE sistemaleads TO sistemaleads_user;
\q
```

### 3. Testar conexão

```bash
psql -h localhost -U sistemaleads_user -d sistemaleads
# Digite a senha quando solicitado
# Se conectou, digite \q para sair
```

> **Dica:** As tabelas são criadas automaticamente na primeira execução do backend.

### Tabelas criadas automaticamente

| Tabela | Descrição |
|--------|-----------|
| `config` | Configurações gerais (chave/valor JSONB) |
| `ads_campaigns` | Campanhas sincronizadas das plataformas |
| `ads_daily_metrics` | Métricas diárias por plataforma |
| `ads_sync_log` | Log de sincronizações |
| `leads` | Leads capturados |
| `landing_page_visits` | Acessos às landing pages (com geolocalização) |

---

## ⚙️ Instalação do Backend

### 1. Clonar o repositório

```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/sistemaleads.git
sudo chown -R $USER:$USER /var/www/sistemaleads
cd /var/www/sistemaleads
```

### 2. Configurar variáveis de ambiente

```bash
cd backend
cp .env.example .env
nano .env
```

Preencha as variáveis essenciais:

```env
# ─── Servidor ────────────────────────────────────────
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost,http://192.168.1.50

# ─── PostgreSQL ──────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistemaleads
DB_USER=sistemaleads_user
DB_PASSWORD=SUA_SENHA_SEGURA_AQUI
DB_SSL=false

# ─── Licenciamento ───────────────────────────────────
LICENSE_SECRET=GERE_UM_SECRET_FORTE_AQUI
```

> **CORS com múltiplos origins:** Separe por vírgula. O backend detecta automaticamente qual origin usar na resposta.
> Ex: `CORS_ORIGIN=http://localhost,http://192.168.1.50,https://seudominio.com`

> **Importante:** Para gerar um secret forte: `openssl rand -hex 32`

### 3. Instalar dependências e iniciar

```bash
npm install
```

### 4. Testar manualmente

```bash
node src/index.js
```

Se aparecer `🚀 sistemaLeads API running on port 3001` e `✅ Database connected`, está funcionando. Pressione `Ctrl+C` para parar.

### 5. Configurar com PM2 (produção)

```bash
pm2 start src/index.js --name sistemaleads-api
pm2 save
pm2 startup
```

> O comando `pm2 startup` vai gerar um comando `sudo ...` — **execute-o** para que o PM2 inicie automaticamente após reboot.

### 6. Verificar se está rodando

```bash
pm2 status
curl http://localhost:3001/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "timestamp": "2026-03-08T...",
  "database": "connected"
}
```

### Comandos úteis do PM2

```bash
pm2 logs sistemaleads-api     # Ver logs em tempo real
pm2 restart sistemaleads-api  # Reiniciar
pm2 stop sistemaleads-api     # Parar
pm2 delete sistemaleads-api   # Remover
pm2 monit                     # Monitor interativo
```

---

## 🖥️ Instalação do Frontend

### 1. Build de produção

```bash
cd /var/www/sistemaleads   # raiz do projeto
npm install
npm run build
```

Os arquivos estáticos serão gerados na pasta `dist/`.

### 2. Mover para o Nginx

```bash
sudo mkdir -p /var/www/html/projeto-raul
sudo cp -r dist/* /var/www/html/projeto-raul/
```

> Sempre que fizer um novo build, repita o passo 2.

---

## 🌐 Configuração do Nginx

### 1. Criar o arquivo de configuração

```bash
sudo nano /etc/nginx/sites-available/sistemaleads
```

Cole o conteúdo:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    # ─── Frontend SPA ────────────────────────────────
    location /projeto-raul/ {
        alias /var/www/html/projeto-raul/;
        try_files $uri $uri/ /projeto-raul/index.html;

        # Cache de assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # ─── Backend API (proxy reverso) ─────────────────
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # ─── Redirecionar raiz para o app ────────────────
    location = / {
        return 301 /projeto-raul/;
    }
}
```

### 2. Ativar o site

```bash
sudo ln -s /etc/nginx/sites-available/sistemaleads /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Testar

Acesse `http://seudominio.com/projeto-raul/` no navegador.

---

## 🖥️ Configuração Alternativa para WSL (Windows Subsystem for Linux)

Se você está rodando o projeto no WSL ao invés de um servidor Linux dedicado, siga estas instruções adicionais:

### 1. Configurar o arquivo hosts do Windows

1. Abra o **Bloco de Notas como Administrador**
2. Abra o arquivo `C:\Windows\System32\drivers\etc\hosts`
3. Adicione ao final:

```
127.0.0.1  sistemaleadsraul.com
127.0.0.1  www.sistemaleadsraul.com
```

### 2. Nginx no WSL — usar `localhost` como alternativa

```nginx
server {
    listen 80 default_server;
    server_name localhost _;
    # ... restante da config igual ...
}
```

Acesse via `http://localhost/projeto-raul/`.

### 3. Diferenças entre WSL e Linux dedicado

| Item | Linux dedicado | WSL |
|------|---------------|-----|
| Acesso externo | IP público + DNS | Apenas local (localhost) |
| SSL/HTTPS | Certbot funciona | Não recomendado (use HTTP) |
| Firewall (UFW) | Necessário | Não necessário |
| PM2 startup | Funciona com systemd | Pode precisar iniciar manualmente |
| Hosts file | Não necessário (DNS resolve) | Editar `C:\Windows\System32\drivers\etc\hosts` |

### 4. Script de inicialização para WSL

```bash
cat << 'EOF' > ~/start-sistemaleads.sh
#!/bin/bash
sudo service nginx start
sudo service postgresql start
cd /var/www/sistemaleads/backend && pm2 start src/index.js --name sistemaleads-api 2>/dev/null || pm2 restart sistemaleads-api
echo "✅ sistemaLeads iniciado! Acesse http://localhost/projeto-raul/"
EOF
chmod +x ~/start-sistemaleads.sh
```

---

## 🔒 SSL com Certbot (HTTPS)

### 1. Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Gerar certificado

```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### 3. Renovação automática

```bash
sudo certbot renew --dry-run
```

### 4. Atualizar CORS do backend

```env
CORS_ORIGIN=https://seudominio.com
```

```bash
pm2 restart sistemaleads-api
```

---

## 🔑 Sistema de Licenças (HMAC)

O sistema usa **HMAC-SHA256** para gerar e validar chaves de licença.

### Formato das chaves

```
TIER-XXXXXXXX-HMAC_12_CHARS

Exemplos:
  PRO-A3F8B2C1-7d2f9a1b3c4e       → Plano Pro
  PROPLUS-K9D4E7F2-3b8c1e2a4f5d   → Plano Pro+
```

### Gerar chaves

```bash
cd /var/www/sistemaleads/backend

node src/license.js generate pro
node src/license.js generate proplus
node src/license.js batch 5
```

### Validar uma chave

```bash
node src/license.js validate PRO-A3F8B2C1-7d2f9a1b3c4e
```

### Segurança

- O `LICENSE_SECRET` no `.env` assina as chaves
- **Se mudar o secret, todas as chaves anteriores ficam inválidas**
- Gere um secret forte: `openssl rand -hex 32`

---

## 🔗 Integrações

Configure em **Dashboard → Configurações → Integrações** ou no `backend/.env`.

<details>
<summary><strong>Meta Ads</strong></summary>

| Variável | Onde obter |
|----------|------------|
| `META_ACCESS_TOKEN` | [Meta Business → System Users](https://business.facebook.com/settings/system-users) |
| `META_AD_ACCOUNT_ID` | Gerenciador de Anúncios (`act_XXXXXXX`) |
| `META_APP_ID` | [Meta Developers](https://developers.facebook.com/apps) |
| `META_APP_SECRET` | Meta Developers → Configurações do App |
| `META_PIXEL_ID` | Gerenciador de Eventos |
| `META_PAGE_ID` | ID da página do Facebook |

</details>

<details>
<summary><strong>Google Ads</strong></summary>

| Variável | Onde obter |
|----------|------------|
| `GOOGLE_ADS_DEVELOPER_TOKEN` | [Google Ads API Center](https://ads.google.com/aw/apicenter) |
| `GOOGLE_ADS_CLIENT_ID` | [Google Cloud → Credenciais OAuth](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_ADS_CLIENT_SECRET` | Google Cloud → Credenciais OAuth |
| `GOOGLE_ADS_REFRESH_TOKEN` | Gerado via fluxo OAuth |
| `GOOGLE_ADS_CUSTOMER_ID` | Google Ads (`XXX-XXX-XXXX`) |
| `GOOGLE_ADS_MANAGER_ID` | Conta gerenciadora (se aplicável) |

</details>

<details>
<summary><strong>TikTok Ads</strong></summary>

| Variável | Onde obter |
|----------|------------|
| `TIKTOK_ACCESS_TOKEN` | [TikTok Marketing API](https://business-api.tiktok.com/portal/apps) |
| `TIKTOK_ADVERTISER_ID` | TikTok Ads Manager |
| `TIKTOK_APP_ID` | TikTok Marketing API |
| `TIKTOK_APP_SECRET` | TikTok Marketing API |
| `TIKTOK_PIXEL_ID` | TikTok Events Manager |

</details>

<details>
<summary><strong>WhatsApp Business</strong></summary>

| Variável | Onde obter |
|----------|------------|
| `WHATSAPP_PHONE_NUMBER_ID` | [Meta Developers → WhatsApp](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Meta Business Settings |
| `WHATSAPP_ACCESS_TOKEN` | Meta Developers → System Users |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Token customizado |

</details>

<details>
<summary><strong>Google Analytics 4</strong></summary>

| Variável | Onde obter |
|----------|------------|
| `GA_MEASUREMENT_ID` | Google Analytics → Data Streams (`G-XXXXXXX`) |
| `GA_PROPERTY_ID` | Google Analytics → Property Settings |
| `GA_SERVICE_ACCOUNT_KEY` | [Google Cloud → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) |

</details>

### Sincronização manual

```bash
curl -X POST https://seudominio.com/api/ads/meta/sync
curl -X POST https://seudominio.com/api/ads/google/sync
curl -X POST https://seudominio.com/api/ads/tiktok/sync
```

---

## 🚀 Primeiro Acesso (Setup Wizard)

Ao acessar pela primeira vez, o assistente de configuração será exibido:

1. **Empresa** — Nome e logo
2. **Licença** — Chave de licença HMAC
3. **API Backend** — URL do backend (ex: `https://seudominio.com/api`)
4. **Banco de Dados** — Credenciais do PostgreSQL
5. **Resumo** — Revisão antes de confirmar

> **Nota:** Após completar o setup, ele não será exibido novamente. A configuração é salva localmente e no backend.

---

## 📊 Funcionalidades do Dashboard

### Visão Geral (`/dashboard`)
Resumo com métricas de leads, acessos, taxa de conversão e gráficos de evolução.

### Leads (`/dashboard/leads`)
Tabela completa de leads capturados com filtros por data, origem e status. Exportação disponível.

### Geolocalização (`/dashboard/geo`)
- **Mapa interativo** (Leaflet/OpenStreetMap) com marcadores para cada acesso geolocalizado
- Cards de resumo: total de acessos, cidades identificadas, acessos sem localização
- Tabela de cidades com percentual de distribuição
- Log de acessos recentes com landing page de origem e localização

### Anúncios (`/dashboard/ads`)
Métricas de campanhas Meta Ads, Google Ads e TikTok Ads com ranking, funil de conversão e alertas de metas.

### Landing Pages (`/dashboard/landing-pages`)
Criação e gerenciamento de landing pages dinâmicas com editor visual.

### Atendentes (`/dashboard/atendentes`)
Gestão de atendentes do WhatsApp Business com distribuição automática de leads.

### Configurações (`/dashboard/settings`)
Configuração de integrações, dados da empresa, licença e preferências.

---

## 🔄 Manutenção e Monitoramento

### Atualizar o projeto

```bash
cd /var/www/sistemaleads
git pull origin main

# Backend
cd backend && npm install
pm2 restart sistemaleads-api

# Frontend
cd .. && npm install && npm run build
sudo cp -r dist/* /var/www/html/projeto-raul/
```

### Backup do banco

```bash
pg_dump -h localhost -U sistemaleads_user -d sistemaleads > backup_$(date +%Y%m%d).sql
```

### Backup automático (cron)

```bash
crontab -e
# Adicione:
0 3 * * * pg_dump -h localhost -U sistemaleads_user -d sistemaleads > /var/backups/sistemaleads/backup_$(date +\%Y\%m\%d).sql 2>&1
```

```bash
sudo mkdir -p /var/backups/sistemaleads
```

### Firewall (UFW)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

> **Não** exponha a porta 3001 externamente.

### Checklist de produção

- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` com domínio correto (HTTPS)
- [ ] `LICENSE_SECRET` forte
- [ ] PostgreSQL com senha forte
- [ ] HTTPS ativo via Certbot
- [ ] PM2 com startup automático
- [ ] Backup automático do banco
- [ ] Firewall configurado

---

## 📁 Estrutura do Projeto

```
sistemaleads/
├── src/                          # Frontend React + Vite
│   ├── components/
│   │   ├── dashboard/            # Componentes do painel admin
│   │   │   ├── ads/              # Componentes de anúncios
│   │   │   └── landing-pages/    # Componentes de landing pages
│   │   ├── landing/              # Componentes da landing page pública
│   │   └── ui/                   # shadcn/ui components
│   ├── pages/
│   │   ├── production/           # Páginas de produção (dados reais da API)
│   │   │   ├── DashboardOverview.tsx
│   │   │   ├── DashboardLeads.tsx
│   │   │   ├── DashboardGeo.tsx  # Mapa interativo + geolocalização
│   │   │   ├── DashboardAtendentes.tsx
│   │   │   └── DashboardAds.tsx
│   │   ├── Dashboard*.tsx        # Páginas de teste (dados mock)
│   │   ├── SetupWizard.tsx       # Assistente de primeira configuração
│   │   └── LandingPageView.tsx   # Visualização de landing pages
│   ├── lib/                      # Utilitários e serviços
│   │   ├── apiClient.ts          # Cliente HTTP para o backend
│   │   ├── configStore.ts        # Gerenciamento de configuração local
│   │   ├── featureAccess.ts      # Controle de acesso por plano
│   │   └── adsService.ts         # Serviço de anúncios
│   ├── data/                     # Dados mock para testes
│   └── hooks/                    # React hooks customizados
│
├── backend/                      # API Node.js/Express
│   ├── src/
│   │   ├── index.js              # Entry point
│   │   ├── db.js                 # PostgreSQL + migrations automáticas
│   │   ├── license.js            # Geração/validação de licenças HMAC
│   │   ├── routes/
│   │   │   ├── ads.js            # CRUD e sync de campanhas
│   │   │   ├── analytics.js      # Métricas e analytics
│   │   │   ├── atendentes.js     # Gestão de atendentes
│   │   │   ├── config.js         # Configurações
│   │   │   ├── health.js         # Health check
│   │   │   ├── leads.js          # Leads + geolocalização
│   │   │   ├── notifications.js  # Notificações
│   │   │   ├── overview.js       # Dashboard overview
│   │   │   └── whatsapp.js       # Integração WhatsApp
│   │   ├── services/
│   │   │   ├── googleAds.js      # API Google Ads
│   │   │   ├── metaAds.js        # API Meta/Facebook Ads
│   │   │   └── tiktokAds.js      # API TikTok Ads
│   │   └── cron/
│   │       └── syncAds.js        # Sincronização automática
│   ├── .env.example
│   └── package.json
│
├── public/
├── index.html
└── package.json
```

---

## 📜 Planos e Licenciamento

| Recurso | Free | Pro (R$ 197/mês) | Pro+ (R$ 397/mês) |
|---------|:----:|:-----------------:|:------------------:|
| Landing Pages | 1 | Ilimitadas | Ilimitadas |
| Leads/mês | 50 | Ilimitados | Ilimitados |
| Dashboard básico | ✅ | ✅ | ✅ |
| Meta/Google/TikTok Ads | ❌ | ✅ | ✅ |
| WhatsApp Business | ❌ | ✅ | ✅ |
| Google Analytics | ❌ | ✅ | ✅ |
| Geolocalização + Mapa | ❌ | ✅ | ✅ |
| API para CRM/ERP | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ✅ |
| Multi-usuários | ❌ | ❌ | ✅ |

---

## 🛠️ Tecnologias

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui**
- **Recharts** (gráficos)
- **Leaflet** + **react-leaflet** (mapa interativo)
- **Framer Motion** (animações)
- **React Router** (HashRouter para SPA)

### Backend
- **Node.js** + **Express**
- **PostgreSQL** (banco de dados)
- **PM2** (gerenciamento de processos)
- APIs: Meta Ads, Google Ads, TikTok Ads, WhatsApp Cloud API

---

## ❓ Suporte

- **E-mail**: suporte@sistemaleads.com
