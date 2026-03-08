# sistemaLeads API — Backend Node.js/Express

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
| GET | `/ads/overview` | KPIs consolidados |
| GET | `/ads/campaigns` | Listar campanhas |
| GET | `/ads/daily/:metric` | Métricas diárias |

### WhatsApp Business
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/whatsapp/test` | Testar conexão |
| POST | `/whatsapp/config` | Salvar credenciais |
| POST | `/whatsapp/send` | Enviar mensagem |
| GET | `/whatsapp/webhook` | Verificação do webhook |
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
│   ├── license.js            # Geração/validação de licenças HMAC
│   ├── routes/
│   │   ├── health.js
│   │   ├── config.js
│   │   ├── ads.js
│   │   ├── whatsapp.js
│   │   └── analytics.js
│   ├── services/
│   │   ├── metaAds.js
│   │   ├── googleAds.js
│   │   └── tiktokAds.js
│   └── cron/
│       └── syncAds.js
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
