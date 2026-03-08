# Mogibens — Plataforma de Gestão de Leads e Ads

Sistema completo para gestão de leads, campanhas de anúncios (Meta, Google, TikTok) e landing pages dinâmicas.

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
11. [Manutenção e Monitoramento](#-manutenção-e-monitoramento)
12. [Estrutura do Projeto](#-estrutura-do-projeto)
13. [Planos e Licenciamento](#-planos-e-licenciamento)

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
CREATE DATABASE mogibens;
CREATE USER mogibens_user WITH ENCRYPTED PASSWORD 'SUA_SENHA_SEGURA_AQUI';
GRANT ALL PRIVILEGES ON DATABASE mogibens TO mogibens_user;
\q
```

### 3. Testar conexão

```bash
psql -h localhost -U mogibens_user -d mogibens
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

---

## ⚙️ Instalação do Backend

### 1. Clonar o repositório

```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/mogibens.git
sudo chown -R $USER:$USER /var/www/mogibens
cd /var/www/mogibens
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
CORS_ORIGIN=https://seudominio.com

# ─── PostgreSQL ──────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mogibens
DB_USER=mogibens_user
DB_PASSWORD=SUA_SENHA_SEGURA_AQUI
DB_SSL=false

# ─── Licenciamento ───────────────────────────────────
LICENSE_SECRET=GERE_UM_SECRET_FORTE_AQUI
```

> **Importante:** Para gerar um secret forte: `openssl rand -hex 32`

### 3. Instalar dependências e iniciar

```bash
npm install
```

### 4. Testar manualmente

```bash
node src/index.js
```

Se aparecer `🚀 Mogibens API running on port 3001` e `✅ Database connected`, está funcionando. Pressione `Ctrl+C` para parar.

### 5. Configurar com PM2 (produção)

```bash
pm2 start src/index.js --name mogibens-api
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
pm2 logs mogibens-api     # Ver logs em tempo real
pm2 restart mogibens-api  # Reiniciar
pm2 stop mogibens-api     # Parar
pm2 delete mogibens-api   # Remover
pm2 monit                 # Monitor interativo
```

---

## 🖥️ Instalação do Frontend

### 1. Build de produção

```bash
cd /var/www/mogibens   # raiz do projeto
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
sudo nano /etc/nginx/sites-available/mogibens
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
sudo ln -s /etc/nginx/sites-available/mogibens /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # remover site padrão
sudo nginx -t                                  # testar configuração
sudo systemctl reload nginx
```

### 3. Testar

Acesse `http://seudominio.com/projeto-raul/` no navegador.

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

Siga as instruções (informe e-mail, aceite termos, escolha redirecionar HTTP→HTTPS).

### 3. Renovação automática

O Certbot configura um timer automático. Para verificar:

```bash
sudo certbot renew --dry-run
```

### 4. Atualizar CORS do backend

Após ativar HTTPS, atualize o `backend/.env`:

```env
CORS_ORIGIN=https://seudominio.com
```

E reinicie:

```bash
pm2 restart mogibens-api
```

---

## 🔑 Sistema de Licenças (HMAC)

O sistema usa **HMAC-SHA256** para gerar e validar chaves de licença. As chaves não podem ser falsificadas sem o `LICENSE_SECRET` configurado no `.env`.

### Formato das chaves

```
TIER-XXXXXXXX-HMAC_12_CHARS

Exemplos:
  PRO-A3F8B2C1-7d2f9a1b3c4e       → Plano Pro
  PROPLUS-K9D4E7F2-3b8c1e2a4f5d   → Plano Pro+
```

### Gerar chaves

```bash
cd /var/www/mogibens/backend

# Chave individual
node src/license.js generate pro
node src/license.js generate proplus

# Lote de chaves (5 de cada tier)
node src/license.js batch 5

# Lote personalizado (10 de cada)
node src/license.js batch 10
```

### Validar uma chave

```bash
node src/license.js validate PRO-A3F8B2C1-7d2f9a1b3c4e
```

### Segurança

- O `LICENSE_SECRET` no `.env` é o segredo que assina as chaves
- **Se mudar o secret, todas as chaves anteriores ficam inválidas**
- Guarde o secret em local seguro
- Gere um secret forte: `openssl rand -hex 32`

---

## 🔗 Integrações

Após o deploy, configure as integrações em **Dashboard → Configurações → Integrações** ou diretamente no `backend/.env`.

### Variáveis de ambiente por plataforma

<details>
<summary><strong>Meta Ads</strong></summary>

| Variável | Onde obter |
|----------|------------|
| `META_ACCESS_TOKEN` | [Meta Business → System Users](https://business.facebook.com/settings/system-users) |
| `META_AD_ACCOUNT_ID` | Gerenciador de Anúncios → ID (formato `act_XXXXXXX`) |
| `META_APP_ID` | [Meta Developers → Meus Apps](https://developers.facebook.com/apps) |
| `META_APP_SECRET` | Meta Developers → Configurações do App |
| `META_PIXEL_ID` | Gerenciador de Eventos → ID do Pixel |
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
| `GOOGLE_ADS_CUSTOMER_ID` | Google Ads → ID do cliente (`XXX-XXX-XXXX`) |
| `GOOGLE_ADS_MANAGER_ID` | ID da conta gerenciadora (se aplicável) |

</details>

<details>
<summary><strong>TikTok Ads</strong></summary>

| Variável | Onde obter |
|----------|------------|
| `TIKTOK_ACCESS_TOKEN` | [TikTok Marketing API → App Management](https://business-api.tiktok.com/portal/apps) |
| `TIKTOK_ADVERTISER_ID` | TikTok Ads Manager → ID do Anunciante |
| `TIKTOK_APP_ID` | TikTok Marketing API → App Management |
| `TIKTOK_APP_SECRET` | TikTok Marketing API → App Management |
| `TIKTOK_PIXEL_ID` | TikTok Events Manager |

</details>

<details>
<summary><strong>WhatsApp Business</strong></summary>

| Variável | Onde obter |
|----------|------------|
| `WHATSAPP_PHONE_NUMBER_ID` | [Meta Developers → WhatsApp](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Meta Business Settings → WhatsApp Accounts |
| `WHATSAPP_ACCESS_TOKEN` | Meta Developers → System Users → Token permanente |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Token customizado (qualquer string segura) |

</details>

<details>
<summary><strong>Google Analytics 4</strong></summary>

| Variável | Onde obter |
|----------|------------|
| `GA_MEASUREMENT_ID` | Google Analytics → Admin → Data Streams (`G-XXXXXXX`) |
| `GA_PROPERTY_ID` | Google Analytics → Admin → Property Settings |
| `GA_SERVICE_ACCOUNT_KEY` | [Google Cloud → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) (JSON) |

</details>

### Sincronização de campanhas

**Automática (a cada 6h):** Já configurada via cron no backend.

**Manual via API:**

```bash
# Meta Ads
curl -X POST https://seudominio.com/api/ads/meta/sync

# Google Ads
curl -X POST https://seudominio.com/api/ads/google/sync

# TikTok Ads
curl -X POST https://seudominio.com/api/ads/tiktok/sync
```

---

## 🚀 Primeiro Acesso (Setup Wizard)

Ao acessar `https://seudominio.com/projeto-raul/` pela primeira vez, o assistente de configuração será exibido:

1. **Empresa** — Nome e logo
2. **Licença** — Chave de licença (gerada com `node src/license.js generate pro`)
3. **API Backend** — URL do backend (ex: `https://seudominio.com/api`)
4. **Banco de Dados** — Credenciais do PostgreSQL (com teste de conexão)
5. **Resumo** — Revisão antes de confirmar

> Após o setup, tudo pode ser alterado em **Dashboard → Configurações**.

---

## 🔄 Manutenção e Monitoramento

### Atualizar o projeto

```bash
cd /var/www/mogibens

# Puxar atualizações
git pull origin main

# Atualizar backend
cd backend
npm install
pm2 restart mogibens-api

# Atualizar frontend
cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/html/projeto-raul/
```

### Backup do banco de dados

```bash
# Backup manual
pg_dump -h localhost -U mogibens_user -d mogibens > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -h localhost -U mogibens_user -d mogibens < backup_20260308.sql
```

### Backup automático (cron)

```bash
crontab -e
```

Adicione:

```
# Backup diário às 3h da manhã
0 3 * * * pg_dump -h localhost -U mogibens_user -d mogibens > /var/backups/mogibens/backup_$(date +\%Y\%m\%d).sql 2>&1
```

```bash
sudo mkdir -p /var/backups/mogibens
```

### Monitoramento

```bash
pm2 monit                  # Monitor interativo
pm2 logs mogibens-api      # Logs em tempo real
sudo tail -f /var/log/nginx/error.log   # Logs do Nginx
```

### Checklist de produção

- [ ] `NODE_ENV=production` no `.env`
- [ ] `CORS_ORIGIN` com domínio correto (HTTPS)
- [ ] `LICENSE_SECRET` com valor forte (`openssl rand -hex 32`)
- [ ] PostgreSQL com senha forte
- [ ] HTTPS ativo via Certbot
- [ ] PM2 com startup automático configurado
- [ ] Backup automático do banco
- [ ] Firewall configurado (portas 80, 443, 22)
- [ ] Tokens de API das plataformas configurados

### Firewall (UFW)

```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
sudo ufw status
```

> **Não** exponha a porta 3001 externamente — o Nginx faz o proxy.

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
│   │   ├── adsService.ts         # Serviço de Ads
│   │   ├── configStore.ts        # Gerenciamento de configurações
│   │   └── featureAccess.ts      # Controle de acesso por licença
│   └── data/                     # Dados mock para demonstração
│
├── backend/                      # API Node.js/Express
│   ├── src/
│   │   ├── index.js              # Entry point + middleware
│   │   ├── db.js                 # PostgreSQL pool + migrations
│   │   ├── license.js            # Geração/validação de licenças HMAC
│   │   ├── routes/               # Endpoints da API
│   │   └── services/             # Integrações com APIs externas
│   ├── .env.example
│   └── package.json
│
├── public/                       # Assets estáticos
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
| Geolocalização | ❌ | ✅ | ✅ |
| Personalização de marca | ❌ | ✅ | ✅ |
| API para CRM/ERP | ❌ | ❌ | ✅ |
| Webhooks customizados | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ✅ |
| Multi-usuários | ❌ | ❌ | ✅ |
| Relatórios agendados (PDF) | ❌ | ❌ | ✅ |

---

## ❓ Suporte

- **E-mail**: suporte@mogibens.com
- **WhatsApp** (Pro+): Disponível após onboarding dedicado
