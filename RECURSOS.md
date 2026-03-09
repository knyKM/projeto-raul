# 📋 Recursos da Plataforma sistemaLeads

Documentação dos recursos disponíveis na plataforma, focada em **atendimento, conversão e gestão de leads**.

---

## 🎯 Captação de Leads

### Landing Pages Dinâmicas
- **Três modelos disponíveis:**
  - **Completa** — Hero com CTA, simulador de parcelas, seção de benefícios, formulário de captura, chat widget e pop-up de saída
  - **Simples** — Página direta com imagem do veículo, valor e formulário (ideal para tráfego pago)
  - **Destaque** — Layout split-screen (imagem + formulário lado a lado), lista de features, chat widget integrado
- Geração automática de rotas via `/lp/:slug`
- Configuração de marca, modelo, valores de crédito e parcelas
- WhatsApp integrado como CTA secundário
- **Indicadores por LP:** visitas, leads captados e taxa de conversão (%) para comparar efetividade entre modelos

### Chat Widget
- Widget flutuante em todas as landing pages
- Respostas automáticas para perguntas frequentes (consórcio, parcelas, contemplação, FGTS)
- Quick replies pré-configuradas
- Captura de lead inline após 3 interações
- Leads salvos com origem `chat_widget` para análise de canal

### Pop-up de Saída (Exit Intent)
- Detecta intenção de saída do visitante (mouse leave no desktop, timeout no mobile)
- Formulário simplificado com CTA de "condição especial"
- Leads salvos com origem `exit_popup`
- Exibe apenas 1x por sessão

### Rastreamento de Visitas
- Geolocalização automática (IP + GPS do navegador)
- Registro de cidade, estado, latitude e longitude
- Mapa de calor de acessos no dashboard de Geolocalização

---

## 🔥 Lead Scoring Automático

Sistema de pontuação automática para priorização de leads:

| Critério | Pontos |
|---|---|
| Informou e-mail | +15 |
| Veio via WhatsApp | +25 |
| Veio via Landing Page | +20 |
| Oferta específica (slug) | +10 |
| Chegou há menos de 5min | +30 |
| Chegou há menos de 15min | +25 |
| Chegou há menos de 1h | +15 |
| Aguardando contato | +10 |

### Classificação
- 🔥 **Quente** (≥70 pts) — Prioridade máxima
- 🟡 **Morno** (40-69 pts) — Atenção moderada
- 🔵 **Frio** (<40 pts) — Pode aguardar

---

## ⏱️ Timer de Primeiro Atendimento

Indicador visual em tempo real no card de cada lead pendente:

- 🟢 **OK** — Menos de 5 minutos esperando
- 🟡 **Alerta** — Entre 5 e 15 minutos
- 🔴 **Crítico** — Mais de 15 minutos (animação pulsante)

O timer atualiza automaticamente a cada 30 segundos, criando senso de urgência para o atendente.

---

## 📊 Fila de Leads

### Visualizações
- **Lista** — Visualização tradicional em cards com ações rápidas
- **Kanban** — Board com drag-and-drop entre colunas

### Funil (Kanban)
| Coluna | Descrição |
|---|---|
| 🟡 Novo | Lead recém-captado, aguardando primeiro contato |
| 🔵 Em Contato | Consultor fez o primeiro contato |
| 🟣 Negociando | Em fase de negociação/proposta |
| 🟢 Fechado | Venda concluída |
| 🔴 Perdido | Lead descartado ou sem interesse |

### Gestão
- Atribuição de leads para consultores/atendentes
- Troca de status com select rápido ou drag-and-drop no Kanban
- Filtro por landing page de origem
- Contadores em tempo real (pendentes, em atendimento, concluídos)

---

## 🚪 Pop-up de Saída (Exit Intent)

Popup inteligente exibido quando o visitante tenta sair da landing page:

- **Desktop:** Detecta movimento do mouse saindo da janela
- **Mobile:** Exibe após 30 segundos de inatividade
- Formulário simplificado (nome + telefone)
- Mensagem de condição especial para incentivar conversão
- Leads captados com origem `exit_popup` para análise
- Exibe apenas uma vez por sessão (não incomoda o visitante)

---

## 🎯 Remarketing List

Exportação de leads frios para criação de audiências customizadas:

- **Filtros:** leads não fechados, nunca contatados, ou marcados como perdidos
- **Período:** configurável (ex: sem atividade há mais de 7 dias)
- **Formatos de exportação:**
  - Meta Ads (Custom Audience) — email, phone, fn
  - Google Ads (Customer Match) — Email, Phone, First Name, Last Name
  - CSV genérico
- Contador de leads em tempo real conforme filtros

---

## 📱 Follow-up Automático via WhatsApp

- Envio automático de mensagem para leads pendentes após X minutos
- Template personalizável com variáveis `{nome}` e `{veiculo}`
- Limite de 50 leads por execução
- Notificação automática ao enviar follow-ups
- Configuração de tempo mínimo e mensagem via painel

## 📞 Integração com Discador 3CPlus

### Montar Mailing
- Exportação de leads no formato CSV compatível com o discador 3CPlus
- Mapeamento automático de colunas: `identifier`, `Nome`, `areacodephone`, `areacode`, `phone`
- Separação automática de DDD e número
- Download do CSV para importação manual

---

## 📈 Central de Ads

### Plataformas Integradas
- **Meta Ads** (Facebook/Instagram) — via SDK oficial
- **Google Ads** — via SDK oficial
- **TikTok Ads** — via SDK oficial

### Métricas Disponíveis
- Investimento por plataforma
- Leads gerados por canal
- Custo por lead (CPL)
- Ranking de campanhas por performance
- Gráficos diários de gastos e leads
- Status de sincronização em tempo real

---

## 💬 Integração WhatsApp Business

- Envio de mensagens via WhatsApp Business API
- CTA direto nas landing pages para WhatsApp
- Follow-up automático para leads não contatados
- Configuração de número, token e Business Account ID
- Webhook para recebimento de mensagens

---

## 🌍 Geolocalização

### Dados Coletados
- Cidade e estado do visitante
- Coordenadas GPS (quando autorizado)
- Fallback via IP (ipapi.co)

### Dashboard Geo
- Mapa interativo com pontos de acesso (Leaflet)
- Ranking de cidades por volume de visitas
- Total de visitas e cobertura geográfica

---

## 👥 Gestão de Atendentes

- Cadastro de consultores/atendentes
- Atribuição de leads por atendente
- Visibilidade de carga de trabalho

---

## 🔔 Notificações em Tempo Real

- Alertas automáticos para novos leads captados
- Sistema de polling com atualização periódica
- Histórico de notificações no dashboard

---

## 📊 Google Analytics

- Integração com Google Analytics 4 (GA4)
- Configuração de Measurement ID
- Suporte a Service Account para dados server-side

---

## 🔐 Sistema de Licenciamento

### Planos
| Recurso | Free | Pro | Pro+ |
|---|:---:|:---:|:---:|
| Dashboard Básico | ✅ | ✅ | ✅ |
| Leads (50/mês) | ✅ | ✅ | ✅ |
| 1 Landing Page | ✅ | ✅ | ✅ |
| Leads Ilimitados | ❌ | ✅ | ✅ |
| Exportar Mailing | ❌ | ✅ | ✅ |
| Central de Ads | ❌ | ✅ | ✅ |
| LPs Ilimitadas | ❌ | ✅ | ✅ |
| Geolocalização | ❌ | ✅ | ✅ |
| WhatsApp | ❌ | ✅ | ✅ |
| Atendentes | ❌ | ✅ | ✅ |
| API para CRM/ERP | ❌ | ❌ | ✅ |
| Webhooks | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ✅ |
| Multi-usuários | ❌ | ❌ | ✅ |

---

## 🔧 Troubleshooting de Licença

### Validação HMAC-SHA256
- A chave é validada via HMAC usando o `LICENSE_SECRET` definido no `.env` do backend
- Formato: `TIER-XXXXXXXX-HMAC` (ex: `PROPLUS-A3F8B2C1-7d2f9a3b1c2e`)
- O frontend envia a chave para `/config/validate-license` e recebe `{ valid, tier }`

### Problemas Comuns
| Sintoma | Causa | Solução |
|---|---|---|
| Chave válida no CLI mas `tier: free` na UI | PM2 não carregou `.env` | `pm2 start src/index.js --node-args="-r dotenv/config"` |
| API retorna `valid: false` | `LICENSE_SECRET` diferente entre CLI e servidor | Verificar variável no processo: `pm2 env <id>` |
| Tier não atualiza após salvar | URL da API não configurada no frontend | Configurar URL em Configurações > API |

### Logs de Diagnóstico
- O frontend emite logs `[License]` no console do navegador durante a ativação
- Verificar: chave enviada, resposta da API, tier final salvo

---

## 🛠️ Arquitetura Técnica

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js/Express + PostgreSQL
- **Mapas:** Leaflet + React-Leaflet
- **Gráficos:** Recharts
- **Animações:** Framer Motion
- **Process Manager:** PM2 (produção)

---

*Última atualização: Março 2026*

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js/Express + PostgreSQL
- **Mapas:** Leaflet + React-Leaflet
- **Gráficos:** Recharts
- **Animações:** Framer Motion

---

*Última atualização: Março 2026*
