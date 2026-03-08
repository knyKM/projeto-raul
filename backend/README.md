# Mogibens API — Backend Node.js/Express

## Requisitos
- Node.js 18+
- PostgreSQL 14+

## Setup

```bash
cd backend
cp .env.example .env    # Configure suas credenciais
npm install
npm run dev             # Desenvolvimento com hot-reload
npm start               # Produção
```

## Endpoints

### Health
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Status da API e banco |

### Config
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/config` | Carregar configurações |
| POST | `/config` | Salvar configurações (bulk upsert) |
| POST | `/config/test-db` | Testar conexão com banco |
| POST | `/config/validate-license` | Validar chave de licença |

### Ads (Meta, Google, TikTok)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/ads/:platform/test` | Testar conexão com plataforma |
| POST | `/ads/:platform/config` | Salvar credenciais da plataforma |
| POST | `/ads/:platform/sync` | Sincronizar campanhas e métricas |
| GET | `/ads/status` | Status de sync de todas as plataformas |
| GET | `/ads/overview` | KPIs consolidados (channels, daily, campaigns) |
| GET | `/ads/campaigns` | Listar campanhas (filtro por platform, date) |
| GET | `/ads/daily/:metric` | Métricas diárias (leads ou spend) |

### WhatsApp Business
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/whatsapp/test` | Testar conexão |
| POST | `/whatsapp/config` | Salvar credenciais |
| POST | `/whatsapp/send` | Enviar mensagem |
| GET | `/whatsapp/webhook` | Verificação do webhook Meta |
| POST | `/whatsapp/webhook` | Receber mensagens |

### Google Analytics 4
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/analytics/test` | Testar conexão |
| POST | `/analytics/config` | Salvar credenciais |
| GET | `/analytics/realtime` | Usuários em tempo real |
| GET | `/analytics/report` | Relatório por período |

## Estrutura

```
backend/
├── src/
│   ├── index.js              # Entry point + middleware
│   ├── db.js                 # PostgreSQL pool + migrations
│   ├── routes/
│   │   ├── health.js
│   │   ├── config.js
│   │   ├── ads.js            # Unified ads endpoints
│   │   ├── whatsapp.js
│   │   └── analytics.js
│   ├── services/
│   │   ├── metaAds.js        # Facebook Marketing API
│   │   ├── googleAds.js      # Google Ads API
│   │   └── tiktokAds.js      # TikTok Marketing API
│   └── cron/
│       └── syncAds.js        # Auto-sync every 6h
├── .env.example
├── package.json
└── README.md
```

## Cron (Sincronização Automática)

Para ativar a sincronização automática a cada 6 horas, adicione ao `index.js`:

```js
const { startAdsSyncCron } = require('./cron/syncAds');
startAdsSyncCron();
```
