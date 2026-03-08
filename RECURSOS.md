# 📋 Recursos da Plataforma sistemaLeads

Documentação dos recursos disponíveis na plataforma, focada em **atendimento, conversão e gestão de leads**.

---

## 🎯 Captação de Leads

### Landing Pages Dinâmicas
- **Dois modelos disponíveis:**
  - **Completa** — Hero com CTA, simulador de parcelas, seção de benefícios e formulário de captura
  - **Simples** — Página direta com imagem do veículo, valor e formulário (ideal para tráfego pago)
- Geração automática de rotas via `/lp/:slug`
- Configuração de marca, modelo, valores de crédito e parcelas
- WhatsApp integrado como CTA secundário
- **Indicadores por LP:** visitas, leads captados e taxa de conversão (%) para comparar efetividade entre modelos

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

### Status do Lead
- **Pendente** — Aguardando primeiro contato
- **Em Atendimento** — Consultor atribuído e em contato
- **Concluído** — Atendimento finalizado

### Gestão
- Atribuição de leads para consultores/atendentes
- Troca de status com select rápido
- Filtro por landing page de origem
- Contadores em tempo real (pendentes, em atendimento, concluídos)

---

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
- Configuração de número, token e Business Account ID

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

## 🛠️ Arquitetura Técnica

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js/Express + PostgreSQL
- **Mapas:** Leaflet + React-Leaflet
- **Gráficos:** Recharts
- **Animações:** Framer Motion

---

*Última atualização: Março 2026*
