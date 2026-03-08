# Mogibens — Plataforma de Gestão de Leads e Ads

Sistema completo para gestão de leads, campanhas de anúncios (Meta, Google, TikTok) e landing pages dinâmicas.

---

## 📋 Índice

1. [Requisitos](#-requisitos)
2. [Instalação do Frontend](#-instalação-do-frontend)
3. [Instalação do Backend](#-instalação-do-backend)
4. [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
5. [Variáveis de Ambiente](#-variáveis-de-ambiente)
6. [Primeiro Acesso (Setup Wizard)](#-primeiro-acesso-setup-wizard)
7. [Integrações](#-integrações)
8. [Deploy em Produção](#-deploy-em-produção)
9. [Estrutura do Projeto](#-estrutura-do-projeto)
10. [Licenciamento](#-licenciamento)

---

## 🔧 Requisitos

| Componente | Versão mínima |
|------------|---------------|
| Node.js | 18+ |
| npm ou bun | npm 9+ / bun 1+ |
| PostgreSQL | 14+ |
| Navegador | Chrome, Firefox, Edge (atualizado) |

---

## 🖥️ Instalação do Frontend

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/mogibens.git
cd mogibens

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### Build para produção

```bash
npm run build
```

Os arquivos estáticos serão gerados na pasta `dist/`.

---

## ⚙️ Instalação do Backend

```bash
# 1. Acesse a pasta do backend
cd backend

# 2. Copie o arquivo de configuração
cp .env.example .env

# 3. Edite o .env com suas credenciais (ver seção Variáveis de Ambiente)
nano .env

# 4. Instale as dependências
npm install

# 5. Inicie em modo desenvolvimento
npm run dev

# 6. Ou em produção
npm start
```

O backend estará disponível em `http://localhost:3001`

### Verificar se está funcionando

```bash
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

---

## 🗄️ Configuração do Banco de Dados

### 1. Criar o banco PostgreSQL

```bash
# Acesse o psql
sudo -u postgres psql

# Crie o banco e o usuário
CREATE DATABASE mogibens;
CREATE USER mogibens_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE mogibens TO mogibens_user;
\q
```

### 2. Configurar no `.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mogibens
DB_USER=mogibens_user
DB_PASSWORD=sua_senha_segura
DB_SSL=false
```

> **Nota:** As tabelas são criadas automaticamente na primeira execução do backend.

### Tabelas criadas automaticamente

| Tabela | Descrição |
|--------|-----------|
| `config` | Configurações gerais do sistema (chave/valor) |
| `ads_campaigns` | Campanhas sincronizadas das plataformas de ads |
| `ads_daily_metrics` | Métricas diárias por plataforma |
| `ads_sync_log` | Log de sincronizações |
| `leads` | Leads capturados |

---

## 🔑 Variáveis de Ambiente

Edite o arquivo `backend/.env` com as credenciais de cada serviço:

### Servidor

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `PORT` | Porta da API | `3001` |
| `NODE_ENV` | Ambiente | `production` |
| `CORS_ORIGIN` | URL do frontend | `https://seudominio.com` |

### Meta Ads

| Variável | Onde obter |
|----------|------------|
| `META_ACCESS_TOKEN` | [Meta Business Settings → System Users](https://business.facebook.com/settings/system-users) |
| `META_AD_ACCOUNT_ID` | Gerenciador de Anúncios → ID da conta (formato `act_XXXXXXX`) |
| `META_APP_ID` | [Meta Developers → Meus Apps](https://developers.facebook.com/apps) |
| `META_APP_SECRET` | Meta Developers → Configurações do App |
| `META_PIXEL_ID` | Gerenciador de Eventos → ID do Pixel |

### Google Ads

| Variável | Onde obter |
|----------|------------|
| `GOOGLE_ADS_DEVELOPER_TOKEN` | [Google Ads API Center](https://ads.google.com/aw/apicenter) |
| `GOOGLE_ADS_CLIENT_ID` | [Google Cloud Console → Credenciais OAuth](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_ADS_CLIENT_SECRET` | Google Cloud Console → Credenciais OAuth |
| `GOOGLE_ADS_REFRESH_TOKEN` | Gerado via fluxo OAuth (ver [guia](https://developers.google.com/google-ads/api/docs/oauth/overview)) |
| `GOOGLE_ADS_CUSTOMER_ID` | Google Ads → ID do cliente (formato `XXX-XXX-XXXX`) |

### TikTok Ads

| Variável | Onde obter |
|----------|------------|
| `TIKTOK_ACCESS_TOKEN` | [TikTok Marketing API → App Management](https://business-api.tiktok.com/portal/apps) |
| `TIKTOK_ADVERTISER_ID` | TikTok Ads Manager → ID do Anunciante |
| `TIKTOK_APP_ID` | TikTok Marketing API → App Management |
| `TIKTOK_APP_SECRET` | TikTok Marketing API → App Management |

### WhatsApp Business

| Variável | Onde obter |
|----------|------------|
| `WHATSAPP_PHONE_NUMBER_ID` | [Meta Developers → WhatsApp → Getting Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Meta Business Settings → WhatsApp Accounts |
| `WHATSAPP_ACCESS_TOKEN` | Meta Developers → System Users → Token permanente |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Token customizado (qualquer string segura) |

### Google Analytics 4

| Variável | Onde obter |
|----------|------------|
| `GA_MEASUREMENT_ID` | Google Analytics → Admin → Data Streams (formato `G-XXXXXXX`) |
| `GA_PROPERTY_ID` | Google Analytics → Admin → Property Settings |
| `GA_SERVICE_ACCOUNT_KEY` | [Google Cloud Console → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) (JSON completo) |

---

## 🚀 Primeiro Acesso (Setup Wizard)

Ao acessar o painel pela primeira vez, o **assistente de configuração** será exibido automaticamente:

1. **Empresa** — Nome e logo da empresa (a imagem é redimensionada automaticamente para a sidebar)
2. **Licença** — Informe a chave de licença adquirida
3. **API Backend** — URL onde o backend está rodando (ex: `http://localhost:3001`)
4. **Banco de Dados** — Credenciais do PostgreSQL (com botão de teste de conexão)
5. **Resumo** — Revisão de todas as configurações antes de confirmar

> Após o setup, todas as configurações podem ser alteradas em **Dashboard → Configurações**.

---

## 🔗 Integrações

### Configurar via Dashboard

Após o setup inicial, acesse **Configurações → Integrações** no dashboard para conectar:

- **Meta Ads** — Token, Ad Account ID, Pixel ID
- **Google Ads** — Developer Token, OAuth credentials, Customer ID
- **TikTok Ads** — Access Token, Advertiser ID
- **WhatsApp Business** — Phone Number ID, Business Account ID, Token
- **Google Analytics 4** — Measurement ID, Property ID

### Sincronização Automática

O backend sincroniza campanhas e métricas automaticamente a cada 6 horas via cron job. Para ativar, adicione ao `backend/src/index.js`:

```js
const { startAdsSyncCron } = require('./cron/syncAds');
startAdsSyncCron();
```

### Sincronização Manual

```bash
# Sincronizar Meta Ads
curl -X POST http://localhost:3001/ads/meta/sync

# Sincronizar Google Ads
curl -X POST http://localhost:3001/ads/google/sync

# Sincronizar TikTok Ads
curl -X POST http://localhost:3001/ads/tiktok/sync
```

---

## 🌐 Deploy em Produção

### Frontend (GitHub Pages)

O projeto já possui CI/CD configurado via GitHub Actions (`.github/workflows/static.yml`).

A cada push na branch principal, o build é gerado e publicado automaticamente no GitHub Pages sob o subcaminho `/projeto-raul/`.

### Backend (VPS / Cloud)

Recomendações para deploy do backend:

```bash
# Usando PM2 (recomendado)
npm install -g pm2
cd backend
pm2 start src/index.js --name mogibens-api
pm2 save
pm2 startup

# Ou usando Docker
docker build -t mogibens-api .
docker run -d -p 3001:3001 --env-file .env mogibens-api
```

### Checklist de produção

- [ ] `NODE_ENV=production` no `.env`
- [ ] `CORS_ORIGIN` apontando para o domínio do frontend
- [ ] PostgreSQL com SSL habilitado (`DB_SSL=true`)
- [ ] Tokens de API configurados para todas as plataformas
- [ ] HTTPS configurado (via Nginx/Caddy como reverse proxy)
- [ ] Backup automático do banco de dados
- [ ] Monitoramento de logs (PM2 logs ou similar)

---

## 📁 Estrutura do Projeto

```
mogibens/
├── src/                          # Frontend React + Vite
│   ├── components/
│   │   ├── dashboard/            # Componentes do painel admin
│   │   ├── landing/              # Componentes da landing page
│   │   └── ui/                   # shadcn/ui components
│   ├── pages/                    # Páginas (rotas)
│   │   ├── production/           # Páginas de produção (dados reais)
│   │   └── ...                   # Páginas de demo (dados mock)
│   ├── lib/                      # Utilitários e serviços
│   │   ├── apiClient.ts          # Cliente HTTP para API
│   │   ├── adsService.ts         # Serviço de Ads (front)
│   │   ├── configStore.ts        # Gerenciamento de configurações
│   │   └── featureAccess.ts      # Controle de acesso por licença
│   └── data/                     # Dados mock para demonstração
│
├── backend/                      # API Node.js/Express
│   ├── src/
│   │   ├── index.js              # Entry point
│   │   ├── db.js                 # PostgreSQL + migrations
│   │   ├── routes/               # Endpoints da API
│   │   │   ├── ads.js            # Meta, Google, TikTok unificados
│   │   │   ├── whatsapp.js       # WhatsApp Cloud API
│   │   │   ├── analytics.js      # Google Analytics 4
│   │   │   ├── config.js         # Configurações do sistema
│   │   │   └── health.js         # Health check
│   │   ├── services/             # Integrações com APIs externas
│   │   │   ├── metaAds.js
│   │   │   ├── googleAds.js
│   │   │   └── tiktokAds.js
│   │   └── cron/
│   │       └── syncAds.js        # Sync automático
│   ├── .env.example
│   └── package.json
│
├── public/                       # Assets estáticos
├── index.html
└── package.json
```

---

## 📜 Licenciamento

### Planos disponíveis

| Recurso | Free | Pro (R$ 197/mês) | Pro+ (R$ 397/mês) |
|---------|:----:|:-----------------:|:------------------:|
| Landing Pages | 1 | Ilimitadas | Ilimitadas |
| Leads/mês | 50 | Ilimitados | Ilimitados |
| Dashboard básico | ✅ | ✅ | ✅ |
| Meta/Google/TikTok Ads | ❌ | ✅ | ✅ |
| WhatsApp Business | ❌ | ✅ | ✅ |
| Google Analytics | ❌ | ✅ | ✅ |
| Geolocalização | ❌ | ✅ | ✅ |
| Personalização de marca | ❌ | ✅ | ✅ |
| Notificações por e-mail | ❌ | ✅ | ✅ |
| API para CRM/ERP | ❌ | ❌ | ✅ |
| Webhooks customizados | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ✅ |
| Multi-usuários | ❌ | ❌ | ✅ |
| Relatórios agendados (PDF) | ❌ | ❌ | ✅ |

---

## ❓ Suporte

- **E-mail**: suporte@mogibens.com
- **WhatsApp** (Pro+): Disponível após onboarding dedicado
